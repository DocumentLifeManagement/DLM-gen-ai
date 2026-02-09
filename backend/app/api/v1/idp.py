from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
import boto3
import uuid
import os
from ...utils.text_parser import *
from dotenv import load_dotenv
from app.models.document import Document, TextractJob
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

load_dotenv()

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
async def upload_and_analyze(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate file type
    if file.content_type not in ["application/pdf", "image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    
    # Upload file to S3
    file_extension = file.filename.split(".")[-1]
    key = f"documents/{str(uuid.uuid4())}.{file_extension}"
    s3_client.upload_fileobj(file.file, S3_BUCKET, key)

    doc = Document(
        s3_bucket=S3_BUCKET,
        s3_key=key,
        filename=file.filename,
        mime_type=file.content_type,
        status="INGESTED"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    job = start_textract_job(doc.id, S3_BUCKET, key)
    
    return {"document_id": doc.id, "job_id": job.job_id}

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
