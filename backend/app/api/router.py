from fastapi import APIRouter
from app.api.v1 import ingestion, idp, generation, workflow, governance, auth, rbac_test

api_router = APIRouter()

api_router.include_router(ingestion.router, tags=["Document Ingestion"])
api_router.include_router(idp.router, tags=['IDP'])
api_router.include_router(auth.router, tags=['Auth'])
api_router.include_router(rbac_test.router)
