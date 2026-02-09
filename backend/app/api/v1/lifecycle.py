from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import require_role
from app.services.lifecycle_service import LifecycleService

router = APIRouter(prefix="/documents", tags=["Lifecycle"])

# Reviewer Only
@router.post("/{document_id}/review")
def review_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["REVIEWER"]))
):
    return LifecycleService.transition(
        db=db,
        document_id=document_id,
        to_state="APPROVAL_PENDING",
        actor_type="USER",
        actor_id=user["sub"]
    )


# Approver Only 
@router.post("/{document_id}/approve")
def approve_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["APPROVER"]))
):
    return LifecycleService.transition(
        db=db,
        document_id=document_id,
        to_state="APPROVED",
        actor_type="USER",
        actor_id=user["sub"]
    )

@router.post("/{document_id}/reject")
def reject_document(
    document_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role(["APPROVER"]))
):
    return LifecycleService.transition(
        db=db,
        document_id=document_id,
        to_state="REJECTED",
        actor_type="USER",
        actor_id=user["sub"]
    )
