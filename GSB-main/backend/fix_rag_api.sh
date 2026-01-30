#!/bin/bash

echo "🚀 Fixing Hugging Face API URL & Updating RAG Service..."

# ==========================================
# 1. Update Requirements (Bump versions)
# ==========================================
echo "📦 Updating requirements.txt..."

# We ensure 'huggingface-hub' is at least 0.23.0 to handle the new router URL
cat <<'TXT' > requirements.txt
annotated-doc==0.0.4
annotated-types==0.7.0
anyio==4.12.0
click==8.3.1
colorama==0.4.6
dnspython==2.8.0
email-validator==2.1.0.post1
fastapi==0.128.0
h11==0.16.0
httptools==0.7.1
idna==3.11
motor==3.7.1
pydantic==2.12.5
pydantic_core==2.41.5
pymongo==4.15.5
python-dotenv==1.2.1
PyYAML==6.0.3
starlette==0.50.0
typing-inspection==0.4.2
typing_extensions==4.15.0
uvicorn==0.40.0
watchfiles==1.1.1
websockets==15.0.1
passlib==1.7.4
bcrypt>=4.0.1
python-multipart
# --- RAG & AI Dependencies ---
langchain==0.1.20
langchain-community==0.0.38
langchain-core==0.1.52
langchain-huggingface>=0.0.3
chromadb==0.4.22
sentence-transformers==2.7.0
huggingface-hub>=0.23.2
TXT

# ==========================================
# 2. Rewrite RAG Service (Use langchain_huggingface)
# ==========================================
echo "🧠 Rewriting 'app/services/rag_service.py'..."

cat <<'PY' > app/services/rag_service.py
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from app.database import db

load_dotenv()

# --- CONFIGURATION ---
VECTOR_DB_PATH = "./chroma_db"
HF_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# 1. Initialize Embeddings (Runs Locally on CPU - Free)
print("📥 Loading Embedding Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Initialize LLM (Hugging Face Free Inference API)
# We use Zephyr-7b-beta because it is highly reliable on the free tier.
repo_id = "HuggingFaceH4/zephyr-7b-beta"

llm = HuggingFaceEndpoint(
    repo_id=repo_id,
    task="text-generation",
    max_new_tokens=512,
    do_sample=False,
    repetition_penalty=1.03,
    huggingfacehub_api_token=HF_TOKEN
)

async def sync_discussions_to_vector_db():
    """
    Fetches ALL discussions from MongoDB and re-indexes them into ChromaDB.
    """
    print("🔄 Syncing MongoDB to Vector DB...")
    
    # A. Fetch Data
    discussions = await db.discussions.find({}).to_list(1000)
    if not discussions:
        return {"message": "No discussions to index."}

    # B. Prepare Documents
    texts = []
    metadatas = []
    
    for d in discussions:
        # Create a rich context string
        text_content = f"Category: {d.get('category', 'General')}. Content: {d.get('content', '')}. Upvotes: {d.get('upvotes', 0)}"
        texts.append(text_content)
        metadatas.append({
            "source_id": str(d["_id"]),
            "village": d.get("village_name", "Unknown")
        })

    # C. Create/Update Vector Store
    if texts:
        vector_db = Chroma.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas,
            persist_directory=VECTOR_DB_PATH
        )
        vector_db.persist()
        return {"message": f"Successfully indexed {len(texts)} discussions."}
    
    return {"message": "No valid text found to index."}

async def generate_smart_summary(query: str):
    """
    Uses RAG to find relevant discussions and summarize them.
    """
    # 1. Load Vector DB
    vector_db = Chroma(persist_directory=VECTOR_DB_PATH, embedding_function=embeddings)
    
    # 2. Create Retriever
    retriever = vector_db.as_retriever(search_kwargs={"k": 5})

    # 3. Define Prompt
    prompt_template = """
    You are a helpful AI Assistant for a Village Panchayat.
    Use the following pieces of context to answer the question at the end.
    If the answer is not in the context, say "I don't have enough information."
    
    Context:
    {context}
    
    Question: {question}
    
    Answer (Keep it concise, use bullet points):
    """
    
    PROMPT = PromptTemplate(
        template=prompt_template, input_variables=["context", "question"]
    )

    # 4. Run Chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT}
    )

    try:
        result = qa_chain.invoke({"query": query})
        return result["result"]
    except Exception as e:
        return f"Error from Hugging Face API: {str(e)}"
PY

echo "---------------------------------------------------"
echo "✅ Code Updated! Now updating dependencies..."
echo "---------------------------------------------------"

pip install -r requirements.txt

echo "---------------------------------------------------"
echo "🎉 Fix Complete. Restart your server:"
echo "   uvicorn app.main:app --reload"
echo "---------------------------------------------------"
