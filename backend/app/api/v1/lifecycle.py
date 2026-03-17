from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import require_role
from app.services.lifecycle_service import LifecycleService
from app.core.camunda import zeebe_client

router = APIRouter(prefix="/documents", tags=["Lifecycle"])


async def _publish(message_name: str, document_id: int, variables: dict = {}):
    """Publish a Zeebe message to unblock the corresponding Receive Task."""
    if zeebe_client is None:
        raise HTTPException(status_code=500, detail="Zeebe client not initialised")
    try:
        await zeebe_client.publish_message(
            name=message_name,
            correlation_key=str(document_id),
            variables=variables,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to publish Zeebe message: {e}")


# Reviewer Only
@router.post("/{document_id}/review")
async def review_document(
    document_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    user=Depends(require_role(["REVIEWER", "ADMIN"]))
):
    result = LifecycleService.transition(
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
    # Unblock the "Review Extracted Data" Receive Task
    await _publish("Message_Review_Done", document_id)
    return result


# Approver Only
@router.post("/{document_id}/approve")
async def approve_document(
    document_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    user=Depends(require_role(["APPROVER", "ADMIN"]))
):
    result = LifecycleService.transition(
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
    # Unblock the "Approve/Reject" Receive Task with approved=true for the gateway
    await _publish("Message_Approval_Done", document_id, variables={"approved": True})
    return result


@router.post("/{document_id}/reject")
async def reject_document(
    document_id: int,
    payload: dict = Body(default={}),
    db: Session = Depends(get_db),
    user=Depends(require_role(["APPROVER", "REVIEWER", "ADMIN"]))
):
    role = user.get("role")
    to_state = payload.get("to_state", "REJECTED")
    
    result = LifecycleService.transition(
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
    
    # Unblock the appropriate Zeebe task based on role
    if role == "REVIEWER":
        await _publish("Message_Review_Done", document_id, variables={"approved": False})
    else:
        # For APPROVER or ADMIN rejecting/returning
        await _publish("Message_Approval_Done", document_id, variables={"approved": False})
        
    return result
