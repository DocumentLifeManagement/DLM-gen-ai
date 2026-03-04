from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.document import Document
from app.models.document_lifecycle import DocumentLifecycle
from app.services.lifecycle_rules import ALLOWED_TRANSITIONS

class LifecycleService:

    @staticmethod
    def transition(
        *,
        db: Session,
        document_id: int,
        to_state: str,
        actor_type: str,   # USER | SYSTEM | SERVICE
        actor_id: str,
        actor_name: str | None = None,
        actor_email: str | None = None,
        reviewer_notes: str | None = None,
        approver_notes: str | None = None,
        uploader_message: str | None = None,
        digitally_signed: bool = False,
        bypass_rules: bool = False
    ):
        # 1️⃣ Fetch document
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Update notes if provided
        if reviewer_notes is not None:
            document.reviewer_notes = reviewer_notes
        if approver_notes is not None:
            document.approver_notes = approver_notes
        if uploader_message is not None:
            document.uploader_message = uploader_message
        
        # Handle digital signature
        if digitally_signed:
            from datetime import datetime
            document.digitally_signed_by = actor_id
            document.digitally_signed_at = datetime.utcnow()

        from_state = document.status

        # 2️⃣ Validate transition
        if not bypass_rules:
            allowed = ALLOWED_TRANSITIONS.get(from_state, [])
            if to_state not in allowed:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid transition: {from_state} → {to_state}"
                )

        # 3️⃣ Update document state
        document.status = to_state

        # 4️⃣ Write lifecycle entry
        lifecycle_entry = DocumentLifecycle(
            document_id=document.id,
            from_state=from_state,
            to_state=to_state,
            actor_type=actor_type,
            actor_id=actor_id,
            actor_name=actor_name,
            actor_email=actor_email,
            notes=reviewer_notes or approver_notes
        )

        db.add(lifecycle_entry)
        db.commit()
        db.refresh(document)

        return document
