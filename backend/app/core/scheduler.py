# app/core/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import boto3
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.document import TextractJob, Document

scheduler = BackgroundScheduler()

def check_textract_jobs():
    print(f"[{datetime.now()}] Checking Textract job statuses...")

    textract = boto3.client(
        'textract',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )

    db = SessionLocal()
    in_progress_jobs = db.query(TextractJob).filter(TextractJob.status == "IN_PROGRESS").all()

    for job in in_progress_jobs:
        try:
            response = textract.get_document_analysis(JobId=job.job_id)
            status = response["JobStatus"]

            if status == "SUCCEEDED":
                job.status = "COMPLETED"
                job.completed_at = datetime.utcnow()
                job.document.status = "PROCESSED"
                print(f"✅ Job {job.job_id} completed for document {job.document_id}")

            elif status == "FAILED":
                job.status = "FAILED"
                job.error = response.get("StatusMessage", "Unknown error")
                print(f"❌ Job {job.job_id} failed: {job.error}")

            db.commit()
        except Exception as e:
            print(f"⚠️ Error checking job {job.job_id}: {e}")

    db.close()

def start_scheduler():
    scheduler.add_job(check_textract_jobs, "interval", minutes=1, id="textract_job_checker")
    scheduler.start()
    print("🕓 APScheduler started: checking every 1 minutes.")
