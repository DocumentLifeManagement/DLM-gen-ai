from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
import boto3
import logging
import uuid
import os
from app.utils.text_parser import extract_key_value_pairs, extract_lines, extract_tables
from dotenv import load_dotenv
from app.models.document import Document, TextractJob
from app.models.document_lifecycle import DocumentLifecycle
from app.core.database import get_db, SessionLocal
from sqlalchemy.orm import Session
from app.core.rbac import require_role

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter()

S3_BUCKET = os.getenv("S3_BUCKET_NAME", "be-project-documents-bucket")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID=os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=os.getenv("AWS_SECRET_ACCESS_KEY")
s3_client = boto3.client("s3", region_name=AWS_REGION)
textract = boto3.client("textract", region_name=AWS_REGION)

def start_textract_job(document_id: int, s3_bucket: str, s3_key: str):
    textract = boto3.client(
        'textract',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )

    response = textract.start_document_analysis(
        DocumentLocation={'S3Object': {'Bucket': s3_bucket, 'Name': s3_key}},
        FeatureTypes=['FORMS', 'TABLES']
    )

    job_id = response['JobId']

    db = SessionLocal()
    job = TextractJob(
    document_id=document_id,
    job_id=job_id,
    status="IN_PROGRESS",
    feature_types="FORMS,TABLES"
)
    db.add(job)
    db.commit()
    db.refresh(job)
    db.close()
    
    return job

def get_textract_job_results(job_id, max_pages=1000):
    pages = 0
    response = textract.get_document_analysis(JobId=job_id)
    blocks = response.get("Blocks", [])
    while 'NextToken' in response and pages < max_pages:
        pages += 1
        response = textract.get_document_analysis(JobId=job_id, NextToken=response['NextToken'])
        blocks.extend(response['Blocks'])
    return blocks

@router.post("/upload-and-analyze", status_code=status.HTTP_202_ACCEPTED)
async def upload_and_analyze(
    file: UploadFile = File(...), 
    notes: str = Form(None),
    custom_filename: str = Form(None),
    tag: str = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role(["UPLOADER"]))
):
    try:
        # Validate file type
        allowed_types = ["application/pdf", "image/png", "image/jpeg", "application/zip", "application/x-zip-compressed"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
        
        # Upload file to S3
        file_extension = file.filename.split(".")[-1]
        key = f"documents/{str(uuid.uuid4())}.{file_extension}"
        s3_client.upload_fileobj(
            file.file, 
            S3_BUCKET, 
            key,
            ExtraArgs={"ContentType": file.content_type}
        )

        doc = Document(
            s3_bucket=S3_BUCKET,
            s3_key=key,
            filename=custom_filename or file.filename,
            mime_type=file.content_type,
            uploader_notes=notes,
            tag=tag,
            status="INGESTED"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        # Record initial lifecycle event
        lifecycle = DocumentLifecycle(
            document_id=doc.id,
            from_state="NONE",
            to_state="UPLOADED",
            actor_type="USER",
            actor_id=current_user["sub"],
            actor_name=current_user.get("name"),
            actor_email=current_user["sub"],
            notes=notes
        )
        db.add(lifecycle)
        db.commit()
        
        # If it's a zip, for now we just mark success. 
        # But Textract doesn't support ZIP, so we only start textract if NOT a zip.
        if file.content_type not in ["application/zip", "application/x-zip-compressed"]:
            job = start_textract_job(doc.id, S3_BUCKET, key)
            doc.status = "PROCESSING"
            db.commit()
        else:
            doc.status = "UPLOADED" # ZIP files wait at reviewer end
            db.commit()
            return {
                "id": doc.id,
                "filename": doc.filename,
                "status": doc.status,
                "created_at": doc.created_at.isoformat() + "Z",
                "tag": doc.tag,
                "message": "ZIP file uploaded for decompression"
            }
        
        return {
            "id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "created_at": doc.created_at.isoformat() + "Z",
            "tag": doc.tag,
            "job_id": job.job_id
        }
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")

@router.get("/results/{job_id}")
def get_results(job_id: str):
    # Poll Textract job status and retrieve results
    response = textract.get_document_analysis(JobId=job_id)
    status = response.get("JobStatus")
    
    if status == "IN_PROGRESS":
        return {"status": status, "message": "Job still in progress."}
    elif status == "FAILED":
        return {"status": status, "message": "Job failed."}
    elif status == "SUCCEEDED":
        blocks = get_textract_job_results(job_id)
        kvs = extract_key_value_pairs(blocks)
        lines = extract_lines(blocks)
        tables = extract_tables(blocks)
        return {"status": "SUCCEEDED", "kvs": kvs, "lines": lines, "tables": tables}
