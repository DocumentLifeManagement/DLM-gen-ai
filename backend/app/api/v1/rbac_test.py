from fastapi import APIRouter, Depends
from app.core.rbac import require_role

router = APIRouter(prefix="/rbac-test", tags=["RBAC Test"])

@router.get("/review-only")
def review_only(
    user=Depends(require_role(["REVIEWER"]))
):
    return {"message": "Reviewer access granted"}
