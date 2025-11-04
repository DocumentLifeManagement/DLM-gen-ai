from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Lifecycle Management Agent"
    DATABASE_URL: str | None = None
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    S3_BUCKET: str | None = None
    AWS_REGION: str | None = "us-east-1"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
