from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.scheduler import start_scheduler, scheduler
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- Startup ----
    from app.core.database import engine, Base
    from sqlalchemy import text
    import app.models # ensure all models are imported for metadata
    # Base.metadata.create_all(bind=engine) # Manual migration removed as per instruction
    
    
    start_scheduler()
    print("🚀 FastAPI app started and APScheduler is running.")
    
    yield  # 👈 this is where your app runs
    
    # ---- Shutdown ----
    scheduler.shutdown(wait=False)
    print("🛑 APScheduler stopped. FastAPI app shutting down.")

app = FastAPI(title="Document Lifecycle Backend", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Document Lifecycle Management Agent API"}

app.include_router(api_router, prefix="/api/v1")
