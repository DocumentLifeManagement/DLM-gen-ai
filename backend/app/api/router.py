from fastapi import APIRouter
from app.api.v1 import ingestion, idp, generation, lifecycle, governance, auth, documents, users, search

api_router = APIRouter()

api_router.include_router(ingestion.router, tags=["Document Ingestion"])
api_router.include_router(idp.router, tags=['IDP'])
api_router.include_router(auth.router, tags=['Auth'])
api_router.include_router(lifecycle.router)
api_router.include_router(documents.router)
api_router.include_router(generation.router)
api_router.include_router(users.router)
api_router.include_router(search.router)
