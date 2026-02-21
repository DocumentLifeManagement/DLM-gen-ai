from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import require_role
from app.services.lifecycle_service import LifecycleService

router = APIRouter(prefix="/documents", tags=["Lifecycle"])

# Reviewer Only
@router.post("/{document_id}/review")
def review_document(
    document_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    user=Depends(require_role(["REVIEWER", "ADMIN"]))
):
    return LifecycleService.transition(
        db=db,
        document_id=document_id,
        to_state="APPROVAL_PENDING",
        actor_type="USER",
        actor_id=user["sub"],
        actor_name=user.get("name"),
        actor_email=user["sub"],
        reviewer_notes=payload.get("notes"),
        uploader_message=payload.get("uploader_message") or None,
        bypass_rules=user.get("role") == "ADMIN"
    )


# Approver Only 
@router.post("/{document_id}/approve")
def approve_document(
    document_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    user=Depends(require_role(["APPROVER", "ADMIN"]))
):
    return LifecycleService.transition(
        db=db,
        document_id=document_id,
        to_state="APPROVED",
        actor_type="USER",
        actor_id=user["sub"],
        actor_name=user.get("name"),
        actor_email=user["sub"],
        approver_notes=payload.get("notes"),
        digitally_signed=payload.get("digitally_signed", False),
        bypass_rules=user.get("role") == "ADMIN"
    )

@router.post("/{document_id}/reject")
def reject_document(
    document_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    user=Depends(require_role(["APPROVER", "REVIEWER", "ADMIN"]))
):
    to_state = payload.get("to_state", "REJECTED")
    role = user.get("role")

    return LifecycleService.transition(
        db=db,
        document_id=document_id,
        to_state=to_state,
        actor_type="USER",
        actor_id=user["sub"],
        actor_name=user.get("name"),
        actor_email=user["sub"],
        approver_notes=payload.get("notes") if role in ("APPROVER", "ADMIN") else None,
        reviewer_notes=payload.get("notes") if role == "REVIEWER" else None,
        bypass_rules=role == "ADMIN"
    )
