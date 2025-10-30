from fastapi import APIRouter, UploadFile, File, HTTPException, status
import boto3
import uuid, os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
S3_BUCKET = os.getenv("S3_BUCKET_NAME", "be-project-documents-bucket")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

router = APIRouter()

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(file: UploadFile = File(...)):
    if file.content_type not in ["application/pdf", "image/png", "image/jpeg"]:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    file_extension = file.filename.split('.')[-1]
    key = f"uploads/{str(uuid.uuid4())}.{file_extension}"
    try:
        s3_client.upload_fileobj(file.file, S3_BUCKET, key)
        s3_url = f"s3://{S3_BUCKET}/{key}"
        return {"bucket": S3_BUCKET, "key": key, "s3_url": s3_url, "message": "Upload successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {e}")
