from fastapi import FastAPI, Query, HTTPException
from langgraph_backend import chatbot, chat_db
from langchain_core.messages import HumanMessage
import uuid
import traceback

app = FastAPI(title="Agri-Chat API 🚀 (Persistent)")

def generate_thread_id():
    return str(uuid.uuid4())

@app.get("/")
def root():
    return {
        "message": "Agri-Chat API is running!", 
        "storage": "SQLite Database (Persistent)",
        "features": ["Resume conversations", "Cross-session memory", "Thread management"],
        "database": "✅ Connected",
        "version": "2.0"
    }

@app.post("/chat/{thread_id}")
def chat(thread_id: str, user_input: str = Query(..., description="User message")):
    """Send a message to the AI assistant"""
    try:
        print(f"🔵 Received chat request for thread: {thread_id}")
        print(f"📨 User input: {user_input}")
        
        if not user_input.strip():
            raise HTTPException(status_code=400, detail="User input cannot be empty")
        
        # Test if chatbot is available
        if not hasattr(chatbot, 'invoke'):
            raise Exception("Chatbot not properly initialized")
        
        # Invoke the simple chatbot
        response = chatbot.invoke({
            "messages": [HumanMessage(content=user_input.strip())],
            "thread_id": thread_id
        })
        
        print(f"🔄 Chatbot response: {response}")
        
        # Extract the AI response
        ai_message = "No response received"
        if response and "messages" in response and len(response["messages"]) > 0:
            last_message = response["messages"][-1]
            if hasattr(last_message, 'content') and last_message.content:
                ai_message = last_message.content.strip()
            else:
                ai_message = str(last_message)
        
        return {
            "thread_id": thread_id,
            "user": user_input,
            "assistant": ai_message,
            "stored_in_db": True,
            "persistent": True,
            "status": "success"
        }
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        print(f"📍 Traceback: {traceback.format_exc()}")
        
        return {
            "thread_id": thread_id,
            "user": user_input,
            "assistant": f"I apologize, but I encountered an error: {str(e)}",
            "stored_in_db": False,
            "error_details": str(e),
            "status": "error"
        }

@app.post("/new_thread")
def new_thread():
    """Create a new conversation thread"""
    thread_id = generate_thread_id()
    return {
        "thread_id": thread_id,
        "message": "New conversation thread created",
        "status": "success"
    }

@app.get("/threads")
def list_all_threads():
    """List all conversation threads (persistent across sessions)"""
    try:
        threads = chat_db.get_all_threads()
        return {
            "threads": threads,
            "count": len(threads),
            "persistent": True,
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error retrieving threads: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving threads: {str(e)}")

@app.get("/chat/{thread_id}/history")
def get_conversation_history(thread_id: str):
    """Get full conversation history for a thread"""
    try:
        messages = chat_db.get_conversation_history(thread_id)
        
        history = []
        for msg in messages:
            if hasattr(msg, 'content'):
                msg_type = "user" if msg.__class__.__name__ == "HumanMessage" else "assistant"
                history.append({
                    "type": msg_type,
                    "content": msg.content,
                    "timestamp": None  # You could add timestamp tracking if needed
                })
        
        return {
            "thread_id": thread_id,
            "message_count": len(history),
            "history": history,
            "persistent": True,
            "status": "success"
        }
    except Exception as e:
        print(f"❌ Error retrieving history: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@app.delete("/thread/{thread_id}")
def delete_thread(thread_id: str):
    """Permanently delete a conversation thread"""
    try:
        deleted = chat_db.delete_thread(thread_id)
        if deleted:
            return {
                "message": f"Thread {thread_id} permanently deleted", 
                "success": True,
                "thread_id": thread_id,
                "status": "success"
            }
        else:
            return {
                "message": f"Thread {thread_id} not found", 
                "success": False,
                "thread_id": thread_id,
                "status": "not_found"
            }
    except Exception as e:
        print(f"❌ Error deleting thread: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting thread: {str(e)}")

@app.get("/health")
def health_check():
    """Check the health status of the API and database"""
    try:
        # Test database connection
        threads = chat_db.get_all_threads()
        
        # Test Gemini API (you could add a simple test call here if needed)
        
        return {
            "status": "healthy", 
            "service": "Agri-Chat API",
            "storage": "SQLite Persistent",
            "database": "✅ Connected",
            "total_threads": len(threads),
            "version": "2.0"
        }
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return {
            "status": "unhealthy",
            "service": "Agri-Chat API", 
            "database": "❌ Error",
            "error": str(e),
            "version": "2.0"
        }

# Add some helpful endpoints for debugging
@app.get("/debug/thread/{thread_id}")
def debug_thread(thread_id: str):
    """Debug endpoint to see raw thread data"""
    try:
        history = chat_db.get_conversation_history(thread_id)
        return {
            "thread_id": thread_id,
            "raw_messages": [
                {
                    "type": type(msg).__name__,
                    "content": getattr(msg, 'content', 'No content'),
                    "attributes": dir(msg)
                }
                for msg in history
            ],
            "count": len(history)
        }
    except Exception as e:
        return {"error": str(e), "thread_id": thread_id}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Agri-Chat API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)