from fastapi import APIRouter
from app.api.v1 import ingestion, idp, generation, lifecycle, governance, auth

api_router = APIRouter()

api_router.include_router(ingestion.router, tags=["Document Ingestion"])
api_router.include_router(idp.router, tags=['IDP'])
api_router.include_router(auth.router, tags=['Auth'])
api_router.include_router(lifecycle.router)
