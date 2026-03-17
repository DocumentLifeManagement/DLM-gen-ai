import asyncio
import logging
import os
import boto3
from app.core.camunda import zeebe_worker
from app.core.database import SessionLocal
from app.models.document import Document
from app.api.v1.idp import start_textract_job, get_textract_job_results, extract_key_value_pairs, extract_lines, extract_tables, S3_BUCKET

logger = logging.getLogger(__name__)

if zeebe_worker:
    @zeebe_worker.task(task_type="extract-document")
    async def extract_document(document_id: int):
        logger.info(f"Worker 'extract-document' processing document {document_id}")
        
        def _get_doc():
            db = SessionLocal()
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                return doc.id, doc.s3_key
            db.close()
            return None, None
            
        doc_info = await asyncio.to_thread(_get_doc)
        if not doc_info[0]:
            raise Exception(f"Document {document_id} not found")
            
        _doc_id, _s3_key = doc_info
        
        logger.info(f"Starting Textract job for document {_doc_id}")
        job = await asyncio.to_thread(start_textract_job, _doc_id, S3_BUCKET, _s3_key)
        
        logger.info(f"Polling Textract job {job.job_id} for completion")
        max_attempts = 120 # 10 minutes total (120 * 5s)
        
        AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
        
        def _get_textract_status():
            textract = boto3.client("textract", region_name=AWS_REGION)
            response = textract.get_document_analysis(JobId=job.job_id)
            return response.get("JobStatus")

        def _process_success():
            db = SessionLocal()
            try:
                blocks = get_textract_job_results(job.job_id)
                kvs = extract_key_value_pairs(blocks)
                lines = extract_lines(blocks)
                tables = extract_tables(blocks)
                
                doc = db.query(Document).filter(Document.id == _doc_id).first()
                if doc:
                    doc.status = "EXTRACTED"
                
                # Note: further save logic for KeyValue and Table models could go here
                db.commit()
            except Exception as e:
                db.rollback()
                raise e
            finally:
                db.close()
                
        def _mark_failed(status="FAILED"):
            db = SessionLocal()
            doc = db.query(Document).filter(Document.id == _doc_id).first()
            if doc:
                doc.status = status
                db.commit()
            db.close()

        for _ in range(max_attempts):
            status = await asyncio.to_thread(_get_textract_status)
            if status == "SUCCEEDED":
                logger.info(f"Textract job {job.job_id} SUCCEEDED. Parsing results...")
                await asyncio.to_thread(_process_success)
                return {"document_id": document_id, "extraction_success": True}
            elif status == "FAILED":
                logger.error(f"Textract job {job.job_id} FAILED.")
                await asyncio.to_thread(_mark_failed)
                raise Exception(f"Textract job {job.job_id} failed.")
            
            await asyncio.sleep(5)
            
        logger.error(f"Textract job {job.job_id} TIMED OUT.")
        await asyncio.to_thread(_mark_failed, "TIMEOUT")
        raise Exception(f"Textract job {job.job_id} timed out.")

    @zeebe_worker.task(task_type="archive-document")
    async def archive_document(document_id: int):
        logger.info(f"Archiving approved document {document_id}")
        def _archive():
            db = SessionLocal()
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = "ARCHIVED"
                db.commit()
            db.close()
        await asyncio.to_thread(_archive)
        return {"document_id": document_id, "archived": True}

    @zeebe_worker.task(task_type="archive-rejected")
    async def archive_rejected(document_id: int):
        logger.info(f"Archiving rejected document {document_id}")
        def _reject():
            db = SessionLocal()
            doc = db.query(Document).filter(Document.id == document_id).first()
            if doc:
                doc.status = "REJECTED"
                db.commit()
            db.close()
        await asyncio.to_thread(_reject)
        return {"document_id": document_id, "archived_rejected": True}
