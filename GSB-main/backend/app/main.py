from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import db
from app.routers import (
    official_contractor_chat,
    auth, 
    community, 
    users, 
    projects, 
    dashboard, 
    schemes, 
    proposals, 
    complaints,
)
import pymongo

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Create Indexes for Performance ---
    print("⚡ Creating Database Indexes...")
    
    # Unique Constraints
    await db.villagers.create_index([("phone_number", pymongo.ASCENDING)], unique=True)
    await db.contractors.create_index([("contractor_id", pymongo.ASCENDING)], unique=True)
    await db.government_officials.create_index([("government_id", pymongo.ASCENDING)], unique=True)
    await db.schemes.create_index([("scheme_id", pymongo.ASCENDING)], unique=True)
    
    # Rapid Feed Fetching (Descending Order on Time)
    await db.discussions.create_index([("created_at", pymongo.DESCENDING)])
    print("✅ 'discussions' index created (Fast Feed Enabled).")
    
    yield

app = FastAPI(title="Gram-Sahayak API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(community.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(schemes.router)
app.include_router(proposals.router)
app.include_router(complaints.router)
app.include_router(official_contractor_chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Gram-Sahayak Backend Intelligence"}

@app.get("/health")
async def health_check():
    try:
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
