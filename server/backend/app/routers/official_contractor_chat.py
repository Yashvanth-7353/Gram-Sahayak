from fastapi import APIRouter, HTTPException, status, Query
from app.database import db
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/official-contractor-chat", tags=["Official-Contractor Discussion"])

# --- CONSTANTS ---
IST = timezone(timedelta(hours=5, minutes=30))

# --- Models ---
class DiscussionMessage(BaseModel):
    sender_id: str
    receiver_id: str
    content: str

class DiscussionResponse(BaseModel):
    id: str
    sender_id: str
    sender_role: str
    receiver_id: str
    receiver_role: str
    content: str
    village_name: str
    timestamp: datetime

# --- Helper: Resolve Identity & Context ---
async def resolve_user(user_id: str):
    """
    Returns (role, data_dict) for a given user ID.
    """
    try:
        oid = ObjectId(user_id)
    except:
        return None, None

    # Check Official
    off = await db.government_officials.find_one({"_id": oid})
    if off:
        return "government_official", off

    # Check Contractor
    con = await db.contractors.find_one({"_id": oid})
    if con:
        return "contractor", con

    return None, None

# --- API Endpoints ---

@router.post("/send", response_model=DiscussionResponse, status_code=status.HTTP_201_CREATED)
async def send_discussion_message(msg: DiscussionMessage):
    """
    Initiate/Reply to a discussion between an Official and a Contractor.
    RESTRICTION: The Contractor must have at least one project in the Official's village.
    """
    # 1. Resolve Sender & Receiver
    role1, user1 = await resolve_user(msg.sender_id)
    role2, user2 = await resolve_user(msg.receiver_id)

    if not role1 or not role2:
        raise HTTPException(status_code=404, detail="Sender or Receiver not found.")

    # 2. Enforce One Official / One Contractor
    roles = {role1, role2}
    if roles != {"government_official", "contractor"}:
        raise HTTPException(
            status_code=403, 
            detail="Discussions are restricted to one Government Official and one Contractor."
        )

    # 3. Identify who is who
    if role1 == "government_official":
        official, contractor = user1, user2
    else:
        official, contractor = user2, user1

    # 4. Enforce 'Same Village' Logic
    # Since Contractors work in multiple places, they 'belong' to the village if they have a project there.
    village_target = official["village_name"]
    contractor_id = contractor["contractor_id"]

    # Check for ANY project linking this contractor to this village
    project_link = await db.projects.find_one({
        "contractor_id": contractor_id,
        "village_name": village_target
    })

    if not project_link:
        raise HTTPException(
            status_code=403, 
            detail=f"Access Denied: Contractor {contractor['name']} has no projects in {village_target}."
        )

    # 5. Save Message
    doc = {
        "sender_id": msg.sender_id,
        "sender_role": role1,
        "receiver_id": msg.receiver_id,
        "receiver_role": role2,
        "content": msg.content,
        "village_name": village_target,
        "timestamp": datetime.now(IST) # <--- IST TIMESTAMP
    }
    
    result = await db.official_contractor_chats.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    
    return doc

@router.get("/history", response_model=List[DiscussionResponse])
async def get_discussion_history(
    user1: str = Query(..., description="ID of User 1"),
    user2: str = Query(..., description="ID of User 2")
):
    """
    Fetch the discussion history between two users.
    """
    cursor = db.official_contractor_chats.find({
        "$or": [
            {"sender_id": user1, "receiver_id": user2},
            {"sender_id": user2, "receiver_id": user1}
        ]
    }).sort("timestamp", 1)
    
    messages = await cursor.to_list(1000)
    
    results = []
    for m in messages:
        m["id"] = str(m["_id"])
        results.append(m)
    return results
