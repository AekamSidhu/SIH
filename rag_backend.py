# rag_backend.py
import os
import sqlite3
import requests
import base64
import io
from typing import List, Dict, Optional, Any
from datetime import datetime
import hashlib
import json
from pathlib import Path

# Document processing
import PyPDF2
from PIL import Image
import fitz  # PyMuPDF for better PDF handling
from docx import Document as DocxDocument

# Vector embeddings and similarity
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class DocumentProcessor:
    """Handle document processing for different file types"""
    
    def __init__(self):
        self.supported_formats = {
            '.pdf': self._process_pdf,
            '.docx': self._process_docx,
            '.txt': self._process_txt,
            '.md': self._process_txt,
            '.jpg': self._process_image,
            '.jpeg': self._process_image,
            '.png': self._process_image,
            '.bmp': self._process_image,
            '.tiff': self._process_image
        }
    
    def process_file(self, file_path: str, file_content: bytes = None) -> Dict[str, Any]:
        """Process a file and extract text/metadata"""
        try:
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext not in self.supported_formats:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            processor = self.supported_formats[file_ext]
            
            if file_content:
                return processor(file_content, file_path)
            else:
                with open(file_path, 'rb') as f:
                    return processor(f.read(), file_path)
                    
        except Exception as e:
            print(f"❌ Error processing file {file_path}: {e}")
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'metadata': {}
            }
    
    def _process_pdf(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Extract text from PDF"""
        try:
            # Try with PyMuPDF first (better for complex PDFs)
            doc = fitz.open(stream=content, filetype="pdf")
            text_parts = []
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                text_parts.append(f"--- Page {page_num + 1} ---\n{page.get_text()}")
            
            doc.close()
            text = "\n\n".join(text_parts)
            
            return {
                'success': True,
                'text': text,
                'metadata': {
                    'file_type': 'pdf',
                    'pages': len(text_parts),
                    'file_name': Path(file_path).name
                }
            }
            
        except Exception as e:
            # Fallback to PyPDF2
            try:
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                text_parts = []
                
                for i, page in enumerate(pdf_reader.pages):
                    text_parts.append(f"--- Page {i + 1} ---\n{page.extract_text()}")
                
                text = "\n\n".join(text_parts)
                
                return {
                    'success': True,
                    'text': text,
                    'metadata': {
                        'file_type': 'pdf',
                        'pages': len(text_parts),
                        'file_name': Path(file_path).name
                    }
                }
            except Exception as e2:
                return {
                    'success': False,
                    'error': f"PDF processing failed: {e2}",
                    'text': '',
                    'metadata': {}
                }
    
    def _process_docx(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Extract text from DOCX"""
        try:
            doc = DocxDocument(io.BytesIO(content))
            paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
            text = "\n\n".join(paragraphs)
            
            return {
                'success': True,
                'text': text,
                'metadata': {
                    'file_type': 'docx',
                    'paragraphs': len(paragraphs),
                    'file_name': Path(file_path).name
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'metadata': {}
            }
    
    def _process_txt(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Process text files"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
            
            for encoding in encodings:
                try:
                    text = content.decode(encoding)
                    return {
                        'success': True,
                        'text': text,
                        'metadata': {
                            'file_type': 'text',
                            'encoding': encoding,
                            'file_name': Path(file_path).name
                        }
                    }
                except UnicodeDecodeError:
                    continue
            
            return {
                'success': False,
                'error': 'Could not decode text file',
                'text': '',
                'metadata': {}
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'metadata': {}
            }
    
    def _process_image(self, content: bytes, file_path: str) -> Dict[str, Any]:
        """Process image files - for now just return metadata, later can add OCR"""
        try:
            image = Image.open(io.BytesIO(content))
            
            # Basic image info
            return {
                'success': True,
                'text': f"[IMAGE: {Path(file_path).name} - {image.format} - {image.size[0]}x{image.size[1]}]",
                'metadata': {
                    'file_type': 'image',
                    'format': image.format,
                    'size': image.size,
                    'mode': image.mode,
                    'file_name': Path(file_path).name,
                    'needs_ocr': True  # Flag for future OCR processing
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'metadata': {}
            }

class VectorStore:
    """Simple vector store using TF-IDF for document similarity"""
    
    def __init__(self, persist_path: str = "vector_store.pkl"):
        self.persist_path = persist_path
        self.vectorizer = TfidfVectorizer(
            max_features=10000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.documents = []
        self.vectors = None
        self.load_store()
    
    def add_document(self, doc_id: str, text: str, metadata: Dict = None):
        """Add a document to the vector store"""
        document = {
            'id': doc_id,
            'text': text,
            'metadata': metadata or {},
            'timestamp': datetime.now().isoformat()
        }
        self.documents.append(document)
        self._rebuild_vectors()
        self.save_store()
    
    def _rebuild_vectors(self):
        """Rebuild the vector index"""
        if self.documents:
            texts = [doc['text'] for doc in self.documents]
            self.vectors = self.vectorizer.fit_transform(texts)
    
    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search for similar documents"""
        if not self.documents or self.vectors is None:
            return []
        
        try:
            query_vector = self.vectorizer.transform([query])
            similarities = cosine_similarity(query_vector, self.vectors).flatten()
            
            # Get top-k most similar documents
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            results = []
            for idx in top_indices:
                if similarities[idx] > 0.1:  # Minimum similarity threshold
                    results.append({
                        'document': self.documents[idx],
                        'similarity': float(similarities[idx])
                    })
            
            return results
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []
    
    def save_store(self):
        """Persist the vector store"""
        try:
            store_data = {
                'documents': self.documents,
                'vectorizer': self.vectorizer,
                'vectors': self.vectors
            }
            with open(self.persist_path, 'wb') as f:
                pickle.dump(store_data, f)
        except Exception as e:
            print(f"❌ Error saving vector store: {e}")
    
    def load_store(self):
        """Load persisted vector store"""
        try:
            if os.path.exists(self.persist_path):
                with open(self.persist_path, 'rb') as f:
                    store_data = pickle.load(f)
                    self.documents = store_data.get('documents', [])
                    self.vectorizer = store_data.get('vectorizer', self.vectorizer)
                    self.vectors = store_data.get('vectors', None)
                print(f"📚 Loaded {len(self.documents)} documents from vector store")
        except Exception as e:
            print(f"❌ Error loading vector store: {e}")
            self.documents = []
            self.vectors = None

class RAGDatabase:
    """Enhanced database for RAG system"""
    
    def __init__(self, db_path="rag_chats.db"):
        self.db_path = db_path
        self._init_db()
        print(f"📁 RAG Database initialized: {db_path}")
    
    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            # Original conversations table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    thread_id TEXT NOT NULL,
                    message_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Documents table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    doc_id TEXT UNIQUE NOT NULL,
                    original_filename TEXT NOT NULL,
                    file_type TEXT NOT NULL,
                    file_size INTEGER,
                    upload_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    content_text TEXT,
                    metadata TEXT,
                    status TEXT DEFAULT 'processed'
                )
            """)
            
            # Document-Thread associations
            conn.execute("""
                CREATE TABLE IF NOT EXISTS thread_documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    thread_id TEXT NOT NULL,
                    doc_id TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (doc_id) REFERENCES documents (doc_id)
                )
            """)
            
            # Create indexes
            conn.execute("CREATE INDEX IF NOT EXISTS idx_thread_id ON conversations(thread_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_doc_id ON documents(doc_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_thread_docs ON thread_documents(thread_id)")
            conn.commit()
    
    def save_message(self, thread_id: str, message_type: str, content: str):
        """Save chat message"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO conversations (thread_id, message_type, content) VALUES (?, ?, ?)",
                (thread_id, message_type, content)
            )
            conn.commit()
    
    def save_document(self, doc_id: str, filename: str, file_type: str, 
                     file_size: int, content_text: str, metadata: Dict):
        """Save document information"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO documents 
                (doc_id, original_filename, file_type, file_size, content_text, metadata) 
                VALUES (?, ?, ?, ?, ?, ?)
            """, (doc_id, filename, file_type, file_size, content_text, json.dumps(metadata)))
            conn.commit()
    
    def associate_document_with_thread(self, thread_id: str, doc_id: str):
        """Associate a document with a thread"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO thread_documents (thread_id, doc_id) VALUES (?, ?)",
                (thread_id, doc_id)
            )
            conn.commit()
    
    def get_conversation_history(self, thread_id: str) -> List[BaseMessage]:
        """Get conversation history"""
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
    
    def get_thread_documents(self, thread_id: str) -> List[Dict]:
        """Get documents associated with a thread"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT d.doc_id, d.original_filename, d.file_type, d.metadata, d.upload_timestamp
                FROM documents d
                JOIN thread_documents td ON d.doc_id = td.doc_id
                WHERE td.thread_id = ?
                ORDER BY td.timestamp DESC
            """, (thread_id,))
            
            return [
                {
                    'doc_id': row[0],
                    'filename': row[1],
                    'file_type': row[2],
                    'metadata': json.loads(row[3]) if row[3] else {},
                    'upload_timestamp': row[4]
                }
                for row in cursor.fetchall()
            ]
    
    def get_all_documents(self) -> List[Dict]:
        """Get all documents"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT doc_id, original_filename, file_type, file_size, 
                       upload_timestamp, metadata, status
                FROM documents 
                ORDER BY upload_timestamp DESC
            """)
            
            return [
                {
                    'doc_id': row[0],
                    'filename': row[1],
                    'file_type': row[2],
                    'file_size': row[3],
                    'upload_timestamp': row[4],
                    'metadata': json.loads(row[5]) if row[5] else {},
                    'status': row[6]
                }
                for row in cursor.fetchall()
            ]

class GeminiRAGLLM:
    """Enhanced Gemini LLM for RAG"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    def invoke_with_context(self, messages: List[BaseMessage], context_docs: List[Dict] = None, thread_docs: List[Dict] = None):
        """Invoke with document context"""
        headers = {"Content-Type": "application/json"}
        
        # Build the prompt with context
        prompt_parts = []
        
        # Add system instruction for RAG
        prompt_parts.append("=== SYSTEM INSTRUCTIONS ===")
        prompt_parts.append("You are an AI assistant with access to uploaded documents. When users ask about documents, refer to the provided context below.")
        prompt_parts.append("Always acknowledge what documents are available and use them to answer questions.")
        prompt_parts.append("=== END SYSTEM INSTRUCTIONS ===\n")
        
        # Add thread document list if available
        if thread_docs:
            prompt_parts.append("=== AVAILABLE DOCUMENTS IN THIS CONVERSATION ===")
            for i, doc in enumerate(thread_docs, 1):
                prompt_parts.append(f"{i}. {doc['filename']} (Type: {doc['file_type']})")
            prompt_parts.append("=== END DOCUMENT LIST ===\n")
        
        # Add document context if available from search
        if context_docs:
            prompt_parts.append("=== RELEVANT DOCUMENT CONTENT ===")
            for i, doc_info in enumerate(context_docs[:3], 1):  # Limit to top 3 docs
                doc = doc_info['document']
                similarity = doc_info['similarity']
                prompt_parts.append(f"Document {i} (Relevance: {similarity:.2f}):")
                prompt_parts.append(f"File: {doc['metadata'].get('file_name', 'Unknown')}")
                prompt_parts.append(f"Content: {doc['text'][:2000]}...")  # Limit content
                prompt_parts.append("---")
            prompt_parts.append("=== END RELEVANT CONTENT ===\n")
        
        # Add conversation history
        for msg in messages:
            if hasattr(msg, 'content') and msg.content:
                role_prefix = "Human: " if isinstance(msg, HumanMessage) else "Assistant: "
                prompt_parts.append(f"{role_prefix}{msg.content}")
        
        # Add final instruction
        if thread_docs or context_docs:
            prompt_parts.append("\n[IMPORTANT: Use the document information provided above to answer questions. Be specific about which documents you're referencing.]")
        
        prompt_text = "\n".join(prompt_parts)
        
        payload = {
            "contents": [{"parts": [{"text": prompt_text}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1500,
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
doc_processor = DocumentProcessor()
vector_store = VectorStore()
rag_db = RAGDatabase()
llm = GeminiRAGLLM(api_key=GEMINI_API_KEY)

class RAGChatbot:
    """RAG-enabled chatbot"""
    
    def __init__(self, llm, db, vector_store, doc_processor):
        self.llm = llm
        self.db = db
        self.vector_store = vector_store
        self.doc_processor = doc_processor
    
    def upload_document(self, file_path: str, file_content: bytes, thread_id: str = None) -> Dict:
        """Upload and process a document"""
        try:
            # Generate unique document ID
            file_hash = hashlib.md5(file_content).hexdigest()
            doc_id = f"doc_{file_hash}_{int(datetime.now().timestamp())}"
            
            # Process the document
            result = self.doc_processor.process_file(file_path, file_content)
            
            if not result['success']:
                return {'success': False, 'error': result['error']}
            
            # Save to database
            self.db.save_document(
                doc_id=doc_id,
                filename=Path(file_path).name,
                file_type=result['metadata']['file_type'],
                file_size=len(file_content),
                content_text=result['text'],
                metadata=result['metadata']
            )
            
            # Add to vector store
            self.vector_store.add_document(doc_id, result['text'], result['metadata'])
            
            # Associate with thread if provided
            if thread_id:
                self.db.associate_document_with_thread(thread_id, doc_id)
            
            return {
                'success': True,
                'doc_id': doc_id,
                'filename': Path(file_path).name,
                'file_type': result['metadata']['file_type'],
                'text_length': len(result['text']),
                'metadata': result['metadata']
            }
            
        except Exception as e:
            print(f"❌ Error uploading document: {e}")
            return {'success': False, 'error': str(e)}
    
    def invoke(self, state):
        """Main invoke method with RAG capabilities"""
        try:
            messages = state.get('messages', [])
            thread_id = state.get('thread_id', 'default')
            
            # Find the user message
            user_message = None
            for msg in messages:
                if isinstance(msg, HumanMessage) and hasattr(msg, 'content'):
                    user_message = msg
                    break
            
            if not user_message:
                return {"messages": [AIMessage(content="No user message found.")]}
            
            print(f"🔄 Processing RAG query for thread: {thread_id}")
            print(f"📝 User query: {user_message.content}")
            
            # Get documents associated with this thread
            thread_docs = self.db.get_thread_documents(thread_id)
            print(f"📄 Thread documents: {len(thread_docs)}")
            
            # Search for relevant documents
            relevant_docs = self.vector_store.search(user_message.content, top_k=3)
            print(f"📚 Found {len(relevant_docs)} relevant documents")
            
            # Get conversation history
            history = self.db.get_conversation_history(thread_id)
            recent_history = history[-6:] if len(history) > 6 else history
            context_messages = recent_history + [user_message]
            
            # Generate response with document context
            ai_response = self.llm.invoke_with_context(
                context_messages, 
                relevant_docs, 
                thread_docs  # Pass thread documents too
            )
            
            # Save messages to database
            self.db.save_message(thread_id, "human", user_message.content)
            if hasattr(ai_response, 'content') and ai_response.content:
                self.db.save_message(thread_id, "ai", ai_response.content)
            
            # Add metadata about sources used
            if relevant_docs or thread_docs:
                sources_info = []
                
                # Add thread documents
                if thread_docs:
                    sources_info.append("📁 **Documents in this conversation:**")
                    for doc in thread_docs:
                        sources_info.append(f"  • {doc['filename']}")
                
                # Add relevant search results
                if relevant_docs:
                    sources_info.append("🔍 **Most relevant content from:**")
                    for doc_info in relevant_docs:
                        doc = doc_info['document']
                        sources_info.append(f"  • {doc['metadata'].get('file_name', 'Unknown')} (relevance: {doc_info['similarity']:.2f})")
                
                if sources_info:
                    enhanced_response = ai_response.content + f"\n\n" + "\n".join(sources_info)
                    ai_response = AIMessage(content=enhanced_response)
            
            return {"messages": [ai_response]}
            
        except Exception as e:
            print(f"❌ Error in RAG chatbot invoke: {e}")
            import traceback
            print(f"📍 Full traceback: {traceback.format_exc()}")
            
            error_response = AIMessage(content=f"I encountered an error: {str(e)}")
            return {"messages": [error_response]}

# Create the RAG chatbot instance
rag_chatbot = RAGChatbot(llm, rag_db, vector_store, doc_processor)

print("✅ RAG Chatbot initialized successfully!")
print(f"🔑 Gemini API Key present: {'Yes' if GEMINI_API_KEY else 'No'}")
print(f"📚 Documents in vector store: {len(vector_store.documents)}")