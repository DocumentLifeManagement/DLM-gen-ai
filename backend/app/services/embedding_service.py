import os
import logging
from typing import List, Dict, Any
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from app.core.config import settings
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.enabled = False
        
        if not settings.PINECONE_API_KEY:
            logger.warning("PINECONE_API_KEY is not set. EmbeddingService will be disabled.")
            return

        try:
            # Initialize Pinecone
            self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            self.index_name = settings.PINECONE_INDEX_NAME
            
            # Check if index exists, and connect to it
            existing_indexes = [index_info["name"] for index_info in self.pc.list_indexes()]
            if self.index_name not in existing_indexes:
                logger.warning(f"Pinecone index '{self.index_name}' does not exist.")
                self.enabled = False
                return
            
            self.index = self.pc.Index(self.index_name)
            
            # Initialize SentenceTransformer
            # We use all-MiniLM-L6-v2 which creates 384-dimensional embeddings
            logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.enabled = True
            logger.info("EmbeddingService initialized successfully.")
            
        except Exception as e:
            logger.error(f"Failed to initialize EmbeddingService: {e}")
            self.enabled = False

    def chunk_text(self, text: str, max_words: int = 250) -> List[str]:
        """Splits text into smaller chunks for better semantic search."""
        if not text:
            return []
        
        words = text.split()
        chunks = []
        for i in range(0, len(words), max_words):
            chunk = " ".join(words[i : i + max_words])
            chunks.append(chunk)
        return chunks

    def embed_and_store(self, document_id: int, text: str, role_access: List[str], status: str):
        """Generates embeddings for the text chunks and stores them in Pinecone."""
        if not self.enabled:
            logger.warning("Embedding service is disabled. Skipping embed_and_store.")
            return

        chunks = self.chunk_text(text)
        if not chunks:
            return

        # Generate embeddings
        try:
            embeddings = self.model.encode(chunks).tolist()
            
            vectors = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_id = f"doc_{document_id}_chunk_{i}"
                metadata = {
                    "document_id": document_id,
                    "chunk_text": chunk,
                    "role_access": role_access,
                    "status": status
                }
                vectors.append({
                    "id": vector_id, 
                    "values": embedding, 
                    "metadata": metadata
                })

            # Upsert vectors in batches
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i+batch_size]
                self.index.upsert(vectors=batch)
                logger.info(f"Upserted {len(batch)} chunks for document {document_id}")
                
        except Exception as e:
            logger.error(f"Error embedding and storing document {document_id}: {e}")

    def search(self, query: str, user_role: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Searches for relevant chunks using semantic search and role-based filtering."""
        if not self.enabled:
            logger.warning("Embedding service is disabled. Returning empty semantic search results.")
            return []

        try:
            # Generate query embedding
            query_embedding = self.model.encode(query).tolist()
            
            # Search Pinecone with metadata filter
            response = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                filter={
                    "role_access": {"$in": [user_role]}
                }
            )
            
            results = []
            for match in response.get("matches", []):
                results.append({
                    "document_id": match["metadata"]["document_id"],
                    "chunk_text": match["metadata"]["chunk_text"],
                    "score": match["score"],
                    "status": match["metadata"]["status"]
                })
                
            return results
        except Exception as e:
            logger.error(f"Error during semantic search: {e}")
            return []

embedding_service = EmbeddingService()
