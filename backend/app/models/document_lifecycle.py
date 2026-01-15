# app/models/document_lifecycle.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base
from app.models.document import *

class DocumentLifecycle(Base):
    __tablename__ = "document_lifecycle"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    from_state = Column(String, nullable=False)
    to_state = Column(String, nullable=False)
    actor_type = Column(String)   # USER / SYSTEM / SERVICE
    actor_id = Column(String)     # user_id or service_name
    timestamp = Column(DateTime, default=datetime.utcnow)
