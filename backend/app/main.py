import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.scheduler import start_scheduler, scheduler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import asyncio
from app.core.camunda import zeebe_worker
import app.workers.document_workers  # Load tasks

@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    # ---- Startup ----
    from app.core.database import engine, Base
    from app import models # ensure all models are imported for metadata
    
    start_scheduler()
    logger.info("FastAPI app started and APScheduler is running.")
    
    if zeebe_worker:
        fastapi_app.state.zeebe_task = asyncio.create_task(zeebe_worker.work())
        logger.info("Zeebe worker started.")
    
    yield  # this is where your app runs
    
    # ---- Shutdown ----
    scheduler.shutdown(wait=False)
    if zeebe_worker and hasattr(fastapi_app.state, 'zeebe_task'):
        fastapi_app.state.zeebe_task.cancel()
    logger.info("APScheduler stopped. FastAPI app shutting down.")

app = FastAPI(title="Document Lifecycle Backend", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

@app.get("/")
async def root():
    return {"message": "Document Lifecycle Management Agent API"}

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL ERROR: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}", "traceback": traceback.format_exc()}
    )

app.include_router(api_router, prefix="/api/v1")
