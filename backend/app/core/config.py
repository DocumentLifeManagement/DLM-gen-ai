from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Lifecycle Management Agent"
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/documentdb"
    SECRET_KEY: str = "yoursecretkey"
    
    class Config:
        env_file = ".env"

settings = Settings()
