from typing import TypedDict, Annotated, List, Dict
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
import os
import requests
import sqlite3
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class PersistentChatDB:
    def __init__(self, db_path="persistent_chats.db"):
        self.db_path = db_path
        self._init_db()
        print(f"📁 Database initialized: {db_path}")
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    thread_id TEXT NOT NULL,
                    message_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_thread_id ON conversations(thread_id)")
            conn.commit()
    
    def save_message(self, thread_id: str, message_type: str, content: str):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO conversations (thread_id, message_type, content) VALUES (?, ?, ?)",
                (thread_id, message_type, content)
            )
            conn.commit()
    
    def get_conversation_history(self, thread_id: str) -> List[BaseMessage]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT message_type, content FROM conversations 
                WHERE thread_id = ? 
                ORDER BY timestamp ASC
            """, (thread_id,))
            
            messages = []
            for msg_type, content in cursor.fetchall():
                if msg_type == "human":
                    messages.append(HumanMessage(content=content))
                elif msg_type == "ai":
                    messages.append(AIMessage(content=content))
            return messages
    
    def get_all_threads(self) -> List[Dict]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT thread_id, MAX(timestamp) as last_activity, COUNT(*) as message_count
                FROM conversations 
                GROUP BY thread_id 
                ORDER BY last_activity DESC
            """)
            return [
                {
                    "thread_id": row[0], 
                    "last_activity": row[1], 
                    "message_count": row[2]
                } 
                for row in cursor.fetchall()
            ]
    
    def delete_thread(self, thread_id: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM conversations WHERE thread_id = ?", (thread_id,))
            conn.commit()
            return cursor.rowcount > 0

class GeminiLLM:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"

    def invoke(self, messages):
        headers = {"Content-Type": "application/json"}
        
        # Better message handling
        prompt_parts = []
        for msg in messages:
            if hasattr(msg, 'content') and msg.content:
                role_prefix = "Human: " if isinstance(msg, HumanMessage) else "Assistant: "
                prompt_parts.append(f"{role_prefix}{msg.content}")
        
        prompt_text = "\n".join(prompt_parts)
        if not prompt_text.strip():
            return AIMessage(content="I didn't receive any message to respond to.")
        
        payload = {
            "contents": [{"parts": [{"text": prompt_text}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000,
                "topP": 0.8,
                "topK": 10
            }
        }
        
        try:
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if 'candidates' in data and len(data['candidates']) > 0:
                content = data['candidates'][0]['content']['parts'][0]['text']
                return AIMessage(content=content)
            else:
                return AIMessage(content="No response from Gemini API")
        except requests.RequestException as e:
            print(f"Gemini API Error: {e}")
            return AIMessage(content=f"Error communicating with AI service: {e}")

# Initialize components
llm = GeminiLLM(api_key=GEMINI_API_KEY)
chat_db = PersistentChatDB()

class SimpleChatbot:
    """Simple chatbot without LangGraph - directly handling the flow"""
    
    def __init__(self, llm, db):
        self.llm = llm
        self.db = db
    
    def invoke(self, state):
        """Main invoke method that processes the chat"""
        try:
            messages = state.get('messages', [])
            thread_id = state.get('thread_id', 'default')
            
            print(f"🔄 Processing chat for thread: {thread_id}")
            
            # Find the user message
            user_message = None
            for msg in messages:
                if isinstance(msg, HumanMessage) and hasattr(msg, 'content'):
                    user_message = msg
                    break
            
            if not user_message:
                return {"messages": [AIMessage(content="No user message found.")]}
            
            print(f"📝 User message: {user_message.content}")
            
            # Get conversation history
            history = self.db.get_conversation_history(thread_id)
            print(f"📚 Retrieved {len(history)} historical messages")
            
            # Prepare context (limit to avoid token issues)
            recent_history = history[-8:] if len(history) > 8 else history
            context_messages = recent_history + [user_message]
            
            print(f"🤖 Sending {len(context_messages)} messages to Gemini")
            
            # Get AI response
            ai_response = self.llm.invoke(context_messages)
            
            # Save messages to database
            self.db.save_message(thread_id, "human", user_message.content)
            print(f"💾 Saved user message to DB")
            
            if hasattr(ai_response, 'content') and ai_response.content:
                self.db.save_message(thread_id, "ai", ai_response.content)
                print(f"💾 Saved AI response to DB")
            
            return {"messages": [ai_response]}
            
        except Exception as e:
            print(f"❌ Error in chatbot invoke: {e}")
            import traceback
            print(f"📍 Full traceback: {traceback.format_exc()}")
            
            error_response = AIMessage(content=f"I encountered an error: {str(e)}")
            return {"messages": [error_response]}

# Create the simple chatbot instance
chatbot = SimpleChatbot(llm, chat_db)

print("✅ Simple persistent chatbot initialized successfully!")
print(f"🔑 Gemini API Key present: {'Yes' if GEMINI_API_KEY else 'No'}")