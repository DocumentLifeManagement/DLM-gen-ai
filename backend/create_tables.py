from app.core.database import engine, Base
import app.models  # Importing the package registers all models onto Base

print("Tables detected:", list(Base.metadata.tables.keys()))

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")