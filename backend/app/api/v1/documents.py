# app/api/v1/documents.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import Document
from app.models.document_lifecycle import DocumentLifecycle

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": doc.id,
        "filename": doc.filename,
        "status": doc.status,
        "created_at": doc.created_at,
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
            "timestamp": h.timestamp,
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
            "created_at": d.created_at,
        }
        for d in docs
    ]
