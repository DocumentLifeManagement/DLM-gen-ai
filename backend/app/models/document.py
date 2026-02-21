from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Enum, Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    s3_bucket = Column(String, nullable=False)
    s3_key = Column(String, nullable=False, index=True)
    filename = Column(String, nullable=False)
    mime_type = Column(String)
    pages = Column(Integer)
    status = Column(String, default="INGESTED")
    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, default=None)   # soft-delete: non-null = in bin
    archived_at = Column(DateTime, nullable=True, default=None)  # archive: non-null = archived
    tag = Column(String, nullable=True)                          # document classification tag
    
    # New Review/Approval fields
    reviewer_notes = Column(Text, nullable=True)
    approver_notes = Column(Text, nullable=True)
    uploader_notes = Column(Text, nullable=True)  # notes from the document uploader
    uploader_message = Column(Text, nullable=True)  # feedback message for the document uploader
    risk_score = Column(Float, default=0.0)
    risk_indicators = Column(JSON, nullable=True) # List of strings or Objects
    digitally_signed_by = Column(String, nullable=True)
    digitally_signed_at = Column(DateTime, nullable=True)

    jobs = relationship("TextractJob", back_populates="document")

class TextractJob(Base):
    __tablename__ = "textract_jobs"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    job_id = Column(String, unique=True, index=True, nullable=False)
    feature_types = Column(String)  # e.g., "FORMS,TABLES"
    status = Column(String, default="IN_PROGRESS", index=True)  # IN_PROGRESS, SUCCEEDED, FAILED
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    error = Column(Text)

    document = relationship("Document", back_populates="jobs")
    raw = relationship("TextractRaw", back_populates="job", uselist=False)

class KeyValue(Base):
    __tablename__ = "key_values"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), index=True, nullable=False)
    job_id = Column(Integer, ForeignKey("textract_jobs.id"), index=True, nullable=False)
    page = Column(Integer)
    key_text = Column(Text)
    value_text = Column(Text)
    key_confidence = Column(Float)
    value_confidence = Column(Float)
    key_bbox = Column(JSON)   # store Geometry.BoundingBox
    value_bbox = Column(JSON) # optional

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), index=True, nullable=False)
    job_id = Column(Integer, ForeignKey("textract_jobs.id"), index=True, nullable=False)
    page = Column(Integer)
    title = Column(Text)
    footer = Column(Text)

    cells = relationship("TableCell", back_populates="table")

class TableCell(Base):
    __tablename__ = "table_cells"
    id = Column(Integer, primary_key=True)
    table_id = Column(Integer, ForeignKey("tables.id"), index=True, nullable=False)
    row_index = Column(Integer)
    col_index = Column(Integer)
    row_span = Column(Integer, default=1)
    col_span = Column(Integer, default=1)
    text = Column(Text)
    confidence = Column(Float)

    table = relationship("Table", back_populates="cells")

class TextractRaw(Base):
    __tablename__ = "textract_raw"
    id = Column(Integer, primary_key=True)
    job_id = Column(Integer, ForeignKey("textract_jobs.id"), unique=True, nullable=False)
    payload_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("TextractJob", back_populates="raw")
