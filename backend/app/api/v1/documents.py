from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import boto3
import os
from app.core.database import get_db
from app.models.document import Document, KeyValue
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
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if status:
        query = query.filter(Document.status == status)

    docs = query.order_by(Document.created_at.desc()).all()

    return [
        {
            "id": d.id,
            "filename": d.filename,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
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
