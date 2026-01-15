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
        actor_id: str
    ):
        # 1️⃣ Fetch document
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        from_state = document.status

        # 2️⃣ Validate transition
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
        )

        db.add(lifecycle_entry)
        db.commit()
        db.refresh(document)

        return document
