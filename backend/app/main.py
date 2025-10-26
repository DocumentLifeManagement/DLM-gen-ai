from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(title="Document Lifecycle Backend", version="1.0")

@app.get("/")
async def root():
    return {"message": "Document Lifecycle Management Agent API"}

app.include_router(api_router, prefix="/api/v1")
