from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import logging

from app.core.database import get_db
from app.models.document import Document, KeyValue

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/generate-summary", tags=["AI Generation"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


@router.post("/{document_id}")
def generate_summary(document_id: int, db: Session = Depends(get_db)):
    """Generate an AI summary of a document using Groq LLM."""

    # 1. Fetch document
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Fetch extracted key-value pairs
    kvs = db.query(KeyValue).filter(KeyValue.document_id == document_id).all()
    if not kvs:
        raise HTTPException(
            status_code=400,
            detail="No extracted data available for this document. Cannot generate summary.",
        )

    # 3. Build structured data string from key-value pairs
    structured_lines = [f"- {kv.key_text}: {kv.value_text}" for kv in kvs]
    structured_data = "\n".join(structured_lines)

    # 4. Construct prompt
    prompt = (
        "Identify the type of document and provide a concise, professional summary. "
        "Extract the most significant pieces of information found in the data, including primary entities, "
        "dates, and the core purpose or action required.\n\n"
        f"Document Data:\n{structured_data}"
    )

    # 5. Call Groq API
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not configured on the server.",
        )

    try:
        from groq import Groq

        client = Groq(api_key=GROQ_API_KEY)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes documents in few very brief lines, no bold texts and no bullet points",
                },
                {"role": "user", "content": prompt},
            ],
        )

        summary = response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}",
        )

    # 6. Return summary
    return {"summary": summary}
