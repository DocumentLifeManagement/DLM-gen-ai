from fastapi import FastAPI
from app.api.router import api_router
from app.core.scheduler import start_scheduler, scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- Startup ----
    start_scheduler()
    print("🚀 FastAPI app started and APScheduler is running.")
    
    yield  # 👈 this is where your app runs
    
    # ---- Shutdown ----
    scheduler.shutdown(wait=False)
    print("🛑 APScheduler stopped. FastAPI app shutting down.")

app = FastAPI(title="Document Lifecycle Backend", lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Document Lifecycle Management Agent API"}

app.include_router(api_router, prefix="/api/v1")
