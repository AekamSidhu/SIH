# 🚀 RAG Agri-Chat - AI-Powered Agricultural Assistant

A **Retrieval-Augmented Generation (RAG)** system that allows users to upload documents (PDFs, DOCX, images, text files) and chat with an AI assistant that can analyze and answer questions based on the uploaded content.

## ✨ Features

- 📄 **Multi-format Document Support**: PDF, DOCX, TXT, MD, Images (JPG, PNG, etc.)
- 🧠 **Intelligent Document Analysis**: AI understands and references your uploaded documents
- 💬 **Persistent Chat**: Conversations and documents are saved across sessions
- 🔍 **Vector Search**: Advanced similarity search to find relevant document content
- 🧵 **Thread Management**: Organize conversations with associated documents
- 📊 **Source Attribution**: AI shows which documents were used for answers
- 🌐 **REST API**: Complete FastAPI-based backend with interactive documentation

## 🏗️ Architecture

```
📁 Project Structure
├── rag_backend.py          # Core RAG logic & document processing
├── rag_app.py             # FastAPI web application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables (API keys)
├── uploads/              # Temporary file storage (auto-cleanup)
├── rag_chats.db         # SQLite database (persistent storage)
├── vector_store.pkl     # AI embeddings for document search
└── view_db.py           # Database inspection tool
```

## 🚀 Quick Start

### 1. Prerequisites

- Python 3.8+
- Gemini API key (from Google AI Studio)

### 2. Installation

```bash
# Clone or download the project
git clone <your-repo> # or download files
cd rag-agri-chat

# Create virtual environment (recommended)
python -m venv agri-chat
# Windows:
agri-chat\Scripts\activate
# macOS/Linux:
source agri-chat/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: [Google AI Studio](https://makersuite.google.com/)

### 4. Run the Application

```bash
# Development mode (auto-reload on changes)
uvicorn rag_app:app --reload

# Or direct execution
python rag_app.py

# Production mode
uvicorn rag_app:app --host 0.0.0.0 --port 8000
```

The server will start at: `http://localhost:8000`

### 5. Access API Documentation

Open `http://localhost:8000/docs` in your browser for interactive API documentation.

## 📖 Usage Examples

### Upload a Document

```bash
# Upload to specific conversation thread
curl -X POST "http://localhost:8000/upload/my-agri-research" \
  -F "file=@crop_report_2024.pdf" \
  -F "description=Annual crop yield report"

# General upload (not tied to specific thread)
curl -X POST "http://localhost:8000/upload" \
  -F "file=@agricultural_study.docx"
```

### Chat with Document Context

```bash
# Ask questions about uploaded documents
curl -X POST "http://localhost:8000/chat/my-agri-research?user_input=What are the key findings about crop yields in 2024?"

# Example response:
{
  "thread_id": "my-agri-research",
  "user": "What are the key findings about crop yields in 2024?",
  "assistant": "Based on the crop report 2024, key findings include: 1) Wheat yields increased by 12% compared to 2023, 2) Drought conditions affected corn production in the midwest, reducing yields by 8%...\n\n📁 Documents in this conversation:\n  • crop_report_2024.pdf\n🔍 Most relevant content from:\n  • crop_report_2024.pdf (relevance: 0.89)",
  "documents_in_context": 1,
  "rag_enabled": true,
  "status": "success"
}
```

### Search Documents

```bash
# Search across all uploaded documents
curl -X GET "http://localhost:8000/search/documents?query=irrigation techniques&top_k=3"
```

### Manage Conversations

```bash
# Create new conversation thread
curl -X POST "http://localhost:8000/new_thread"

# List all conversation threads
curl -X GET "http://localhost:8000/threads"

# Get conversation history with document context
curl -X GET "http://localhost:8000/chat/my-agri-research/history"
```

### View Documents

```bash
# List all uploaded documents
curl -X GET "http://localhost:8000/documents"

# Get documents for specific thread
curl -X GET "http://localhost:8000/documents/my-agri-research"
```

## 🗄️ Database Management

### View Database Contents

Use the included database viewer:

```bash
# View entire database summary
python view_db.py

# View specific conversation thread
python view_db.py thread-id-here
```

### Database Schema

The system uses SQLite with three main tables:

- **conversations**: Chat messages and responses
- **documents**: Document metadata and extracted content  
- **thread_documents**: Links documents to conversation threads

## 🔧 API Endpoints

### Document Management
- `POST /upload/{thread_id}` - Upload document to specific thread
- `POST /upload` - Upload document generally
- `GET /documents` - List all documents
- `GET /documents/{thread_id}` - Get thread documents
- `GET /search/documents?query=...` - Search documents

### Chat & Threads
- `POST /chat/{thread_id}?user_input=...` - Chat with RAG
- `POST /new_thread` - Create new conversation
- `GET /threads` - List all threads
- `GET /chat/{thread_id}/history` - Get conversation history
- `DELETE /thread/{thread_id}` - Delete thread

### System
- `GET /` - API status and info
- `GET /health` - Health check
- `GET /stats` - System statistics
- `GET /debug/thread/{thread_id}` - Debug thread info

## 🔍 Supported File Types

| Format | Extensions | Features |
|--------|------------|----------|
| PDF | `.pdf` | Text extraction, multi-page support |
| Word | `.docx` | Full document text extraction |
| Text | `.txt`, `.md` | Direct text processing |
| Images | `.jpg`, `.jpeg`, `.png`, `.bmp`, `.tiff` | Metadata extraction (OCR ready) |

## ⚙️ Configuration

### Environment Variables

```bash
# .env file
GEMINI_API_KEY=your_api_key_here          # Required: Gemini API key
```

### Customization Options

Edit `rag_backend.py` to customize:

```python
# Vector search settings
vectorizer = TfidfVectorizer(
    max_features=10000,        # Vocabulary size
    stop_words='english',      # Language
    ngram_range=(1, 2)        # N-gram range
)

# Document processing limits
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
CONTEXT_LENGTH = 2000              # Characters per document
TOP_DOCUMENTS = 3                  # Max docs in context
```

## 🚨 Troubleshooting

### Common Issues

**1. Missing Dependencies**
```bash
pip install -r requirements.txt
```

**2. Gemini API Errors**
- Verify API key in `.env` file
- Check API quota limits
- Ensure internet connectivity

**3. Database Issues**
```bash
# Check database
python view_db.py

# Reset database (warning: deletes all data)
rm rag_chats.db vector_store.pkl
```

**4. File Upload Issues**
- Check file size (max 50MB)
- Verify supported file format
- Ensure write permissions in project directory

### Debug Commands

```bash
# Check system health
curl -X GET "http://localhost:8000/health"

# View system statistics
curl -X GET "http://localhost:8000/stats"

# Debug specific thread
curl -X GET "http://localhost:8000/debug/thread/your-thread-id"

# Test document search
curl -X GET "http://localhost:8000/search/documents?query=test&top_k=1"
```

## 🧪 Testing

### Manual Testing

```bash
# 1. Start server
uvicorn rag_app:app --reload

# 2. Test health
curl -X GET "http://localhost:8000/health"

# 3. Create thread
curl -X POST "http://localhost:8000/new_thread"

# 4. Upload document
curl -X POST "http://localhost:8000/upload/test-thread" \
  -F "file=@test_document.pdf"

# 5. Chat with document
curl -X POST "http://localhost:8000/chat/test-thread?user_input=What is this document about?"
```

### Using the Web Interface

Visit `http://localhost:8000/docs` for Swagger UI where you can:
- Upload files through the web interface
- Test all API endpoints
- View request/response schemas
- Try different parameters

## 📊 Performance Notes

- **File Size Limit**: 50MB per file
- **Context Window**: ~2000 characters per document in AI context
- **Vector Storage**: Uses TF-IDF for fast similarity search
- **Database**: SQLite for simplicity and portability
- **Concurrency**: FastAPI supports async operations

## 🔮 Future Enhancements

- [ ] **OCR Support**: Extract text from images using Tesseract
- [ ] **Better Embeddings**: Use sentence-transformers for improved similarity
- [ ] **Document Chunking**: Split large documents into smaller relevant sections
- [ ] **Web Frontend**: React/Vue.js interface for easier interaction
- [ ] **User Authentication**: Multi-user support with permissions
- [ ] **Cloud Storage**: Integration with AWS S3, Google Cloud Storage
- [ ] **Advanced Search**: Filters by date, file type, similarity threshold
- [ ] **Export Features**: Export conversations and analysis reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Look at server logs for error details
3. Use debug endpoints to inspect system state
4. Create an issue with:
   - Error messages
   - Steps to reproduce
   - System information
   - Sample files (if applicable)

## 🙏 Acknowledgments

- **Google Gemini AI** for the language model
- **FastAPI** for the web framework
- **scikit-learn** for vector operations
- **PyMuPDF & PyPDF2** for PDF processing

---

**Made with ❤️ for agricultural research and document analysis**

*Happy farming! 🌾🚜*
