from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.document import Document
from app.services.embedding_service import embedding_service
from typing import List, Dict, Any

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("")
def hybrid_search(
    query: str = Query(..., min_length=1, description="Search query"),
    role: str = Query(..., description="Role of the user searching (e.g., REVIEWER, APPROVER)"),
    top_k: int = Query(5, description="Number of top results to return"),
    db: Session = Depends(get_db)
):
    """
    Performs a Hybrid Search (Semantic + Keyword) for documents.
    """
    # 1. Semantic Search (Pinecone)
    semantic_results = embedding_service.search(query=query, user_role=role, top_k=top_k)
    semantic_map = {res["document_id"]: res for res in semantic_results}
    
    # 2. Keyword Search (PostgreSQL ILIKE)
    keyword_docs = db.query(Document).filter(
        Document.full_text.ilike(f"%{query}%")
    ).limit(top_k).all()
    
    keyword_map = {doc.id: doc for doc in keyword_docs}
    
    # 3. Merge Results
    # Simple scoring: vector score for semantic, default boost (0.5) for keyword match
    doc_ids = set(list(semantic_map.keys()) + list(keyword_map.keys()))
    
    merged_results = []
    
    for doc_id in doc_ids:
        score = 0
        chunk_text = ""
        doc = db.query(Document).filter(Document.id == doc_id).first()
        
        if not doc:
            continue
            
        # Add semantic score
        if doc_id in semantic_map:
            score += semantic_map[doc_id]["score"]
            chunk_text = semantic_map[doc_id]["chunk_text"]
            
        # Add keyword score boost
        if doc_id in keyword_map:
            score += 0.5 # keyword match boost
            if not chunk_text:
                # If only keyword matched, extract a snippet around the query
                full_text = doc.full_text or ""
                idx = full_text.lower().find(query.lower())
                if idx != -1:
                    start = max(0, idx - 100)
                    end = min(len(full_text), idx + 100)
                    chunk_text = "... " + full_text[start:end].replace("\n", " ") + " ..."
                else:
                    chunk_text = "Match found in document."

        merged_results.append({
            "document_id": doc.id,
            "filename": doc.filename,
            "status": doc.status,
            "relevance_score": score,
            "matched_text": chunk_text
        })
        
    # Sort by relevance score descending
    merged_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    # Return top K
    return merged_results[:top_k]
