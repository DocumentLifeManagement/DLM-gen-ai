from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import boto3
import os
from app.core.database import get_db
from app.models.document import Document, KeyValue, Table, TableCell, TextractJob, TextractRaw
from app.models.document_lifecycle import DocumentLifecycle

s3_client = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    kvs = db.query(KeyValue).filter(KeyValue.document_id == document_id).all()

    # Generate presigned URL for viewing
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': doc.s3_bucket, 
                'Key': doc.s3_key,
                'ResponseContentDisposition': 'inline',
                'ResponseContentType': 'application/pdf'
            },
            ExpiresIn=3600 # 1 hour
        )
    except Exception:
        presigned_url = None

    return {
        "id": doc.id,
        "filename": doc.filename,
        "status": doc.status,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "s3_url": presigned_url, 
        "fields": [
            {
                "id": kv.id,
                "key": kv.key_text,
                "value": kv.value_text,
                "confidence": kv.value_confidence or kv.key_confidence
            } for kv in kvs
        ]
    }

@router.get("/{document_id}/lifecycle")
def get_document_lifecycle(
    document_id: int,
    db: Session = Depends(get_db)
):
    history = (
        db.query(DocumentLifecycle)
        .filter(DocumentLifecycle.document_id == document_id)
        .order_by(DocumentLifecycle.timestamp.asc())
        .all()
    )

    return [
        {
            "from": h.from_state,
            "to": h.to_state,
            "actor_type": h.actor_type,
            "actor_id": h.actor_id,
            "timestamp": h.timestamp.isoformat() if h.timestamp else None,
        }
        for h in history
    ]

@router.get("")
def list_documents(
    status: str | None = None,
    category: str = "active",  # active, bin, archived
    db: Session = Depends(get_db)
):
    query = db.query(Document)

    if category == "bin":
        query = query.filter(Document.deleted_at != None)
    elif category == "archived":
        query = query.filter(Document.archived_at != None)
    else: # active
        query = query.filter(Document.deleted_at == None, Document.archived_at == None)

    if status and status != "ALL":
        query = query.filter(Document.status == status)

    docs = query.order_by(Document.created_at.desc()).all()

    return [
        {
            "id": d.id,
            "filename": d.filename,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "deleted_at": d.deleted_at.isoformat() if d.deleted_at else None,
            "archived_at": d.archived_at.isoformat() if d.archived_at else None,
        }
        for d in docs
    ]

@router.put("/{document_id}/update-fields")
def update_fields(document_id: int, payload: dict, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update granular fields
    for field in payload.get("fields", []):
        kv = db.query(KeyValue).filter(
            KeyValue.document_id == document_id,
            KeyValue.key_text == field["key"]
        ).first()
        if kv:
            kv.value_text = field["value"]

    try:
        db.commit()
        return {"message": "Fields updated successfully", "status": doc.status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{document_id}/restore")
def restore_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.deleted_at = None
    doc.archived_at = None # In case it was restored from archive too, or just to be safe
    db.commit()
    return {"message": "Document restored successfully"}

@router.put("/{document_id}/archive")
def archive_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    from datetime import datetime
    doc.archived_at = datetime.utcnow()
    # doc.status = "ARCHIVED" # Optional: changing status might be good for clarity
    db.commit()
    return {"message": "Document archived successfully"}

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """Soft delete a document (move to Bin)."""
    print(f"🗑️ Soft deleting document ID: {document_id}")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    from datetime import datetime
    doc.deleted_at = datetime.utcnow()
    # We optionally don't change status, or we could set it to "DELETED"
    # Keeping status as is allows restoring to same state.
    
    try:
        db.commit()
        return {"message": "Document moved to bin"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}/purge")
def purge_document(document_id: int, db: Session = Depends(get_db)):
    """Permanently delete a document (from Bin)."""
    print(f"🔥 Attempting to PERMANENTLY purge document ID: {document_id}")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        print(f"❌ Document {document_id} not found in database")
        raise HTTPException(status_code=404, detail="Document not found")

    # 1. DELETE FROM S3
    try:
        print(f"☁️ Deleting from S3: {doc.s3_bucket}/{doc.s3_key}")
        s3_client.delete_object(Bucket=doc.s3_bucket, Key=doc.s3_key)
    except Exception as e:
        print(f"⚠️ S3 Delete Warning (continuing anyway): {e}")

    # 2. DELETE RELATED DATABASE RECORDS (Manual cascade)
    try:
        print(f"🔍 Starting database purge for doc {document_id}")
        
        # A. Cleanup Tables and Cells
        table_count = db.query(Table).filter(Table.document_id == document_id).count()
        if table_count > 0:
            print(f"   - Found {table_count} tables. Cleaning up cells...")
            tables = db.query(Table).filter(Table.document_id == document_id).all()
            for t in tables:
                db.query(TableCell).filter(TableCell.table_id == t.id).delete(synchronize_session=False)
                db.delete(t)
            db.flush() # Ensure tables are removed before jobs if there were any links

        # B. Cleanup KeyValues
        kv_count = db.query(KeyValue).filter(KeyValue.document_id == document_id).delete(synchronize_session=False)
        print(f"   - Purged {kv_count} KeyValue pairs")

        # C. Cleanup Textract Jobs and Raw Data
        job_count = db.query(TextractJob).filter(TextractJob.document_id == document_id).count()
        if job_count > 0:
            print(f"   - Found {job_count} processing jobs. Cleaning up raw data...")
            jobs = db.query(TextractJob).filter(TextractJob.document_id == document_id).all()
            for j in jobs:
                db.query(TextractRaw).filter(TextractRaw.job_id == j.id).delete(synchronize_session=False)
                db.delete(j)
            db.flush()

        # D. Cleanup Lifecycle History
        lc_count = db.query(DocumentLifecycle).filter(DocumentLifecycle.document_id == document_id).delete(synchronize_session=False)
        print(f"   - Purged {lc_count} lifecycle events")
            
        # E. Final Document Removal
        db.delete(doc)
        
        db.commit()
        print(f"✅ Full system purge completed for document {document_id}")
        return {"message": "Document successfully purged from system"}
    except Exception as e:
        db.rollback()
        print(f"❌ DATABASE PURGE FAILED: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database Cleanup Error: {str(e)}")
