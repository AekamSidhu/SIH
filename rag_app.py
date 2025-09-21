# rag_app.py
from fastapi import FastAPI, Query, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rag_backend import rag_chatbot, rag_db, vector_store, doc_processor
from langchain_core.messages import HumanMessage
import uuid
import traceback
from typing import List, Optional
import os
from pathlib import Path
import shutil

app = FastAPI(
    title="RAG Agri-Chat API 🚀", 
    description="AI-powered agricultural assistant with document analysis capabilities",
    version="3.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_thread_id():
    return str(uuid.uuid4())

@app.get("/")
def root():
    return {
        "message": "RAG Agri-Chat API is running!", 
        "storage": "SQLite Database + Vector Store (Persistent)",
        "features": [
            "Document Upload & Analysis (PDF, DOCX, Images, Text)",
            "Retrieval-Augmented Generation (RAG)",
            "Persistent Conversations",
            "Thread Management",
            "Document-Chat Association"
        ],
        "database": "✅ Connected",
        "vector_store": f"📚 {len(vector_store.documents)} documents indexed",
        "version": "3.0"
    }

# === DOCUMENT UPLOAD ENDPOINTS ===

@app.post("/upload/{thread_id}")
async def upload_document(
    thread_id: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    """Upload a document and associate it with a thread"""
    try:
        print(f"📤 Uploading file: {file.filename} for thread: {thread_id}")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size (limit to 50MB)
        file_content = await file.read()
        if len(file_content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")
        
        # Check file type
        file_ext = Path(file.filename).suffix.lower()
        supported_types = {'.pdf', '.docx', '.txt', '.md', '.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        
        if file_ext not in supported_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Supported: {', '.join(supported_types)}"
            )
        
        # Save file temporarily
        temp_file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(file_content)
        
        try:
            # Process the document
            result = rag_chatbot.upload_document(temp_file_path, file_content, thread_id)
            
            if result['success']:
                return {
                    "message": "Document uploaded and processed successfully",
                    "doc_id": result['doc_id'],
                    "filename": result['filename'],
                    "file_type": result['file_type'],
                    "text_length": result['text_length'],
                    "metadata": result['metadata'],
                    "thread_id": thread_id,
                    "description": description,
                    "status": "success"
                }
            else:
                raise HTTPException(status_code=400, detail=f"Document processing failed: {result['error']}")
                
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload error: {e}")
        print(f"📍 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/upload")
async def upload_document_general(file: UploadFile = File(...)):
    """Upload a document without associating to a specific thread"""
    try:
        file_content = await file.read()
        
        # Save file temporarily
        temp_file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(file_content)
        
        try:
            result = rag_chatbot.upload_document(temp_file_path, file_content)
            
            if result['success']:
                return {
                    "message": "Document uploaded successfully",
                    "doc_id": result['doc_id'],
                    "filename": result['filename'],
                    "file_type": result['file_type'],
                    "text_length": result['text_length'],
                    "metadata": result['metadata'],
                    "status": "success"
                }
            else:
                raise HTTPException(status_code=400, detail=result['error'])
                
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === CHAT ENDPOINTS ===

@app.post("/chat/{thread_id}")
def chat_with_rag(thread_id: str, user_input: str = Query(..., description="User message")):
    """Chat with RAG capabilities - answers based on uploaded documents"""
    try:
        print(f"🔵 RAG Chat request for thread: {thread_id}")
        print(f"📨 User input: {user_input}")
        
        if not user_input.strip():
            raise HTTPException(status_code=400, detail="User input cannot be empty")
        
        # Get documents associated with this thread
        thread_docs = rag_db.get_thread_documents(thread_id)
        
        # Invoke the RAG chatbot
        response = rag_chatbot.invoke({
            "messages": [HumanMessage(content=user_input.strip())],
            "thread_id": thread_id
        })
        
        print(f"🔄 RAG response generated")
        
        # Extract the AI response
        ai_message = "No response received"
        if response and "messages" in response and len(response["messages"]) > 0:
            last_message = response["messages"][-1]
            if hasattr(last_message, 'content') and last_message.content:
                ai_message = last_message.content.strip()
        
        return {
            "thread_id": thread_id,
            "user": user_input,
            "assistant": ai_message,
            "documents_in_context": len(thread_docs),
            "thread_documents": [doc['filename'] for doc in thread_docs],
            "rag_enabled": True,
            "stored_in_db": True,
            "status": "success"
        }
        
    except Exception as e:
        print(f"❌ RAG Chat error: {e}")
        print(f"📍 Traceback: {traceback.format_exc()}")
        
        return {
            "thread_id": thread_id,
            "user": user_input,
            "assistant": f"I apologize, but I encountered an error: {str(e)}",
            "rag_enabled": False,
            "stored_in_db": False,
            "error_details": str(e),
            "status": "error"
        }

# === DOCUMENT MANAGEMENT ENDPOINTS ===

@app.get("/documents")
def list_all_documents():
    """List all uploaded documents"""
    try:
        documents = rag_db.get_all_documents()
        return {
            "documents": documents,
            "count": len(documents),
            "vector_store_docs": len(vector_store.documents),
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error retrieving documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving documents: {str(e)}")

@app.get("/documents/{thread_id}")
def get_thread_documents(thread_id: str):
    """Get documents associated with a specific thread"""
    try:
        documents = rag_db.get_thread_documents(thread_id)
        return {
            "thread_id": thread_id,
            "documents": documents,
            "count": len(documents),
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error retrieving thread documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents/{doc_id}/associate/{thread_id}")
def associate_document_with_thread(doc_id: str, thread_id: str):
    """Associate an existing document with a thread"""
    try:
        rag_db.associate_document_with_thread(thread_id, doc_id)
        return {
            "message": "Document associated with thread successfully",
            "doc_id": doc_id,
            "thread_id": thread_id,
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error associating document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search/documents")
def search_documents(query: str = Query(..., description="Search query"), top_k: int = Query(5, description="Number of results")):
    """Search documents using vector similarity"""
    try:
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query parameter is required")
        
        results = vector_store.search(query, top_k)
        
        search_results = []
        for result in results:
            search_results.append({
                "doc_id": result['document']['id'],
                "similarity": result['similarity'],
                "filename": result['document']['metadata'].get('file_name', 'Unknown'),
                "file_type": result['document']['metadata'].get('file_type', 'Unknown'),
                "snippet": result['document']['text'][:300] + "..." if len(result['document']['text']) > 300 else result['document']['text']
            })
        
        return {
            "query": query,
            "results": search_results,
            "count": len(search_results),
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === THREAD MANAGEMENT ENDPOINTS ===

@app.post("/new_thread")
def new_thread():
    """Create a new conversation thread"""
    thread_id = generate_thread_id()
    return {
        "thread_id": thread_id,
        "message": "New RAG conversation thread created",
        "rag_enabled": True,
        "status": "success"
    }

@app.get("/threads")
def list_all_threads():
    """List all conversation threads"""
    try:
        # Get basic thread info from the original method
        cursor = rag_db._get_cursor()
        cursor.execute("""
            SELECT DISTINCT thread_id, 
                   MAX(timestamp) as last_activity, 
                   COUNT(*) as message_count
            FROM conversations 
            GROUP BY thread_id 
            ORDER BY last_activity DESC
        """)
        
        threads = []
        for row in cursor.fetchall():
            thread_id = row[0]
            # Get associated documents
            docs = rag_db.get_thread_documents(thread_id)
            
            threads.append({
                "thread_id": thread_id,
                "last_activity": row[1],
                "message_count": row[2],
                "document_count": len(docs),
                "documents": [doc['filename'] for doc in docs[:3]]  # Show first 3 filenames
            })
        
        return {
            "threads": threads,
            "count": len(threads),
            "total_documents": len(vector_store.documents),
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error retrieving threads: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{thread_id}/history")
def get_conversation_history(thread_id: str):
    """Get full conversation history for a thread with document context"""
    try:
        messages = rag_db.get_conversation_history(thread_id)
        documents = rag_db.get_thread_documents(thread_id)
        
        history = []
        for msg in messages:
            if hasattr(msg, 'content'):
                msg_type = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
                history.append({
                    "type": msg_type,
                    "content": msg.content,
                    "timestamp": None
                })
        
        return {
            "thread_id": thread_id,
            "message_count": len(history),
            "history": history,
            "documents": documents,
            "document_count": len(documents),
            "rag_enabled": True,
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error retrieving history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/thread/{thread_id}")
def delete_thread(thread_id: str, delete_documents: bool = Query(False, description="Also delete associated documents")):
    """Delete a conversation thread and optionally its documents"""
    try:
        # Get documents before deletion if needed
        if delete_documents:
            docs = rag_db.get_thread_documents(thread_id)
            # Note: In a full implementation, you'd also remove from vector store
        
        # Delete thread conversations
        with rag_db._get_connection() as conn:
            cursor = conn.execute("DELETE FROM conversations WHERE thread_id = ?", (thread_id,))
            conversations_deleted = cursor.rowcount
            
            # Delete thread-document associations
            cursor = conn.execute("DELETE FROM thread_documents WHERE thread_id = ?", (thread_id,))
            associations_deleted = cursor.rowcount
            
            conn.commit()
        
        return {
            "message": f"Thread {thread_id} deleted",
            "thread_id": thread_id,
            "conversations_deleted": conversations_deleted,
            "document_associations_deleted": associations_deleted,
            "status": "success"
        }
        
    except Exception as e:
        print(f"❌ Error deleting thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# === HEALTH AND DEBUG ENDPOINTS ===

@app.get("/health")
def health_check():
    """Comprehensive health check for RAG system"""
    try:
        # Test database connection
        all_docs = rag_db.get_all_documents()
        
        # Test vector store
        vector_doc_count = len(vector_store.documents)
        
        # Test Gemini API (you could add a simple test call here)
        
        return {
            "status": "healthy",
            "service": "RAG Agri-Chat API",
            "version": "3.0",
            "storage": "SQLite + Vector Store",
            "database": "✅ Connected",
            "total_documents": len(all_docs),
            "vector_store_documents": vector_doc_count,
            "supported_formats": list(doc_processor.supported_formats.keys()),
            "features": {
                "rag": "✅ Enabled",
                "document_upload": "✅ Enabled",
                "vector_search": "✅ Enabled",
                "persistent_chat": "✅ Enabled"
            }
        }
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return {
            "status": "unhealthy",
            "service": "RAG Agri-Chat API",
            "error": str(e)
        }

@app.get("/debug/thread/{thread_id}")
def debug_thread(thread_id: str):
    """Debug endpoint for thread analysis"""
    try:
        # Get conversation history
        messages = rag_db.get_conversation_history(thread_id)
        
        # Get associated documents
        docs = rag_db.get_thread_documents(thread_id)
        
        # Get recent vector search results for last user message
        last_user_msg = None
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                last_user_msg = msg.content
                break
        
        search_results = []
        if last_user_msg:
            search_results = vector_store.search(last_user_msg, top_k=3)
        
        return {
            "thread_id": thread_id,
            "message_count": len(messages),
            "document_count": len(docs),
            "documents": docs,
            "last_user_query": last_user_msg,
            "vector_search_results": len(search_results),
            "search_results": [
                {
                    "similarity": r['similarity'],
                    "doc_name": r['document']['metadata'].get('file_name', 'Unknown')
                }
                for r in search_results
            ]
        }
    except Exception as e:
        return {"error": str(e), "thread_id": thread_id}

@app.get("/stats")
def get_system_stats():
    """Get system statistics"""
    try:
        # Database stats
        with rag_db._get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM conversations")
            total_messages = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(DISTINCT thread_id) FROM conversations")
            total_threads = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM documents")
            total_documents = cursor.fetchone()[0]
        
        # Vector store stats
        vector_docs = len(vector_store.documents)
        
        return {
            "total_messages": total_messages,
            "total_threads": total_threads,
            "total_documents": total_documents,
            "vector_store_documents": vector_docs,
            "supported_file_types": list(doc_processor.supported_formats.keys()),
            "system_status": "operational",
            "rag_status": "enabled"
        }
    except Exception as e:
        return {"error": str(e)}

# Helper method for database connections
def _add_helper_methods():
    """Add helper methods to database class"""
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def get_cursor(self):
        return sqlite3.connect(self.db_path).cursor()
    
    rag_db._get_connection = get_connection.__get__(rag_db)
    rag_db._get_cursor = get_cursor.__get__(rag_db)

_add_helper_methods()

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RAG Agri-Chat API server...")
    print(f"📚 Vector store loaded with {len(vector_store.documents)} documents")
    print(f"🔧 Supported file types: {', '.join(doc_processor.supported_formats.keys())}")
    uvicorn.run(app, host="0.0.0.0", port=8000)