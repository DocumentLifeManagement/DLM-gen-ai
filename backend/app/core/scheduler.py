# app/core/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import boto3
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.document import TextractJob, Document, Table, TableCell, KeyValue, TextractRaw
from app.services.textract_result_handler import handle_completed_textract_job
from app.models.document_lifecycle import DocumentLifecycle

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

            if status == "SUCCEEDED" and job.status != "COMPLETED":
                handle_completed_textract_job(job)
                job.status = "COMPLETED"
                job.completed_at = datetime.utcnow()
                job.document.status = "REVIEW_PENDING"
                print(f"[SUCCESS] Job {job.job_id} completed for document {job.document_id}")

            elif status == "FAILED":
                job.status = "FAILED"
                job.error = response.get("StatusMessage", "Unknown error")
                print(f"[REJECTED] Job {job.job_id} failed: {job.error}")

            db.commit()
        except Exception as e:
            print(f"[WARNING] Error checking job {job.job_id}: {e}")

    db.close()

def purge_expired_bin_documents():
    """Hard-delete documents that have been in the bin for more than 30 days."""
    expiry_threshold = datetime.utcnow() - timedelta(days=30)
    db = SessionLocal()
    try:
        expired_docs = (
            db.query(Document)
            .filter(Document.deleted_at != None, Document.deleted_at <= expiry_threshold)
            .all()
        )
        print(f"[{datetime.now()}] [BIN] Auto-purging {len(expired_docs)} expired bin document(s)...")
        s3 = boto3.client(
            's3',
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        for doc in expired_docs:
            try:
                s3.delete_object(Bucket=doc.s3_bucket, Key=doc.s3_key)
            except Exception as e:
                print(f"  [WARNING] S3 delete warning for doc {doc.id}: {e}")
            try:
                tables = db.query(Table).filter(Table.document_id == doc.id).all()
                for t in tables:
                    db.query(TableCell).filter(TableCell.table_id == t.id).delete(synchronize_session=False)
                    db.delete(t)
                db.flush()
                db.query(KeyValue).filter(KeyValue.document_id == doc.id).delete(synchronize_session=False)
                jobs = db.query(TextractJob).filter(TextractJob.document_id == doc.id).all()
                for j in jobs:
                    db.query(TextractRaw).filter(TextractRaw.job_id == j.id).delete(synchronize_session=False)
                    db.delete(j)
                db.flush()
                db.query(DocumentLifecycle).filter(DocumentLifecycle.document_id == doc.id).delete(synchronize_session=False)
                db.delete(doc)
                db.commit()
                print(f"  [SUCCESS] Permanently purged document {doc.id}")
            except Exception as e:
                db.rollback()
                print(f"  [ERROR] Failed to purge document {doc.id}: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(check_textract_jobs, "interval", minutes=0.5, id="textract_job_checker")
    # Run bin auto-purge once per day
    scheduler.add_job(purge_expired_bin_documents, "interval", hours=24, id="bin_purge")
    scheduler.start()
    print("[INFO] APScheduler started: checking textract every 30s, bin purge every 24h.")
