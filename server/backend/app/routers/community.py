from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File, Form
from app.database import db
from app.schemas import DiscussionResponse, CommentCreate
from app.services.llm import ask_openrouter
from app.utils.s3 import upload_file_to_s3
from datetime import datetime, timedelta, timezone
import random
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter(prefix="/community", tags=["Community Discussion"])

# --- CONSTANTS ---
IST = timezone(timedelta(hours=5, minutes=30))

# --- HELPER: Random Anonymizer ---
ADJECTIVES = ["Silent", "Hidden", "Mystery", "Brave", "Calm", "Wandering", "Happy", "Vocal", "Fast", "Wise"]
NOUNS = ["Tiger", "River", "Banyan", "Peacock", "Lotus", "Eagle", "Lion", "Voice", "Horse", "Bear"]

def generate_anonymous_name():
    return f"{random.choice(ADJECTIVES)} {random.choice(NOUNS)}"

async def get_user_details(user_identifier: str):
    """
    UNIVERSAL AUTH LOOKUP:
    1. Checks if it's a valid MongoDB _id.
    2. If not, checks 'government_id' (for Officials).
    3. If not, checks 'username' (for Villagers).
    """
    user = None
    role = None
    
    # --- STRATEGY 1: Lookup by ObjectId (Standard) ---
    if ObjectId.is_valid(user_identifier):
        obj_id = ObjectId(user_identifier)
        
        # Try Villager
        user = await db.villagers.find_one({"_id": obj_id})
        if user:
            return user, "villager", None
            
        # Try Official
        user = await db.government_officials.find_one({"_id": obj_id})
        if user:
            return user, "official", None

    # --- STRATEGY 2: Lookup by String ID (Government ID or Username) ---
    
    # A. Check Officials (using 'government_id')
    user = await db.government_officials.find_one({"government_id": user_identifier})
    if user:
        return user, "official", None

    # B. Check Villagers (using 'username' or 'government_id' if they have one)
    # We check both fields to be safe for all user types.
    user = await db.villagers.find_one({"$or": [{"username": user_identifier}, {"government_id": user_identifier}]})
    if user:
        return user, "villager", None

    return None, None, f"User not found. Could not match '{user_identifier}' to any ID, Government ID, or Username."

# --- 0. CLEAR DATA (Dev Only) ---
@router.delete("/reset", status_code=200)
async def reset_discussions():
    await db.discussions.delete_many({})
    return {"message": "All discussions cleared."}

# --- 1. POST A DISCUSSION ---
@router.post("/discuss", status_code=status.HTTP_201_CREATED)
async def post_discussion(
    content: str = Form(..., description="Content of the discussion"),
    category: str = Form("General", description="Category of the post"),
    image: UploadFile = File(None, description="Optional image upload"),
    user_id: str = Query(..., description="Unique ID: Can be _id, government_id, or username")
):
    user, role, error = await get_user_details(user_id)
    if error:
        raise HTTPException(status_code=404, detail=error)

    village_name = user["village_name"]
    display_name = ""

    if role == "villager":
        if "anonymous_identity" in user and user["anonymous_identity"]:
            display_name = user["anonymous_identity"]
        else:
            display_name = generate_anonymous_name()
            await db.villagers.update_one(
                {"_id": user["_id"]},
                {"$set": {"anonymous_identity": display_name}}
            )
    else:
        display_name = f"Official {user['name']}"

    image_url = None
    if image:
        image_url = upload_file_to_s3(image.file, image.filename, folder="community")

    new_post = {
        "village_name": village_name,
        "user_name": display_name,
        "user_role": role,
        "real_user_id": str(user["_id"]),
        "content": content,
        "category": category,
        "image_url": image_url,
        "status": "Open",
        "replies": [],
        "created_at": datetime.now(IST),
        "upvotes": 0,
        "upvoters": []
    }
    
    result = await db.discussions.insert_one(new_post)
    
    return {
        "message": "Posted successfully", 
        "assigned_identity": display_name, 
        "village": village_name,
        "image_url": image_url,
        "id": str(result.inserted_id)
    }

# --- 2. UPVOTE ---
@router.patch("/{discussion_id}/upvote")
async def upvote_discussion(
    discussion_id: str,
    user_id: str = Query(..., description="Unique ID: Can be _id, government_id, or username")
):
    user, role, error = await get_user_details(user_id)
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    try:
        oid = ObjectId(discussion_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Discussion ID")

    discussion = await db.discussions.find_one({"_id": oid})
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    if discussion["village_name"] != user["village_name"]:
         raise HTTPException(status_code=403, detail="You can only upvote discussions in your own village")

    user_oid = str(user["_id"])
    upvoters = discussion.get("upvoters", [])

    if user_oid in upvoters:
        await db.discussions.update_one(
            {"_id": oid},
            {"$inc": {"upvotes": -1}, "$pull": {"upvoters": user_oid}}
        )
        new_count = discussion.get("upvotes", 0) - 1
        return {"message": "Upvote removed", "upvotes": max(0, new_count)}
    
    else:
        await db.discussions.update_one(
            {"_id": oid},
            {"$inc": {"upvotes": 1}, "$push": {"upvoters": user_oid}}
        )
        return {"message": "Upvoted successfully", "upvotes": discussion.get("upvotes", 0) + 1}

# --- 3. COMMENT ---
@router.post("/{discussion_id}/comment", status_code=status.HTTP_201_CREATED)
async def add_comment(
    discussion_id: str,
    comment: CommentCreate,
    user_id: str = Query(..., description="Unique ID: Can be _id, government_id, or username")
):
    user, role, error = await get_user_details(user_id)
    if error:
        raise HTTPException(status_code=404, detail=error)

    display_name = ""
    if role == "villager":
        if "anonymous_identity" in user and user["anonymous_identity"]:
            display_name = user["anonymous_identity"]
        else:
            display_name = generate_anonymous_name()
            await db.villagers.update_one(
                {"_id": user["_id"]},
                {"$set": {"anonymous_identity": display_name}}
            )
    else:
        display_name = f"Official {user['name']}"

    reply_obj = {
        "user_name": display_name,
        "user_role": role,
        "content": comment.content,
        "created_at": datetime.now(IST)
    }

    try:
        disc_oid = ObjectId(discussion_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Discussion ID")

    result = await db.discussions.update_one(
        {"_id": disc_oid},
        {"$push": {"replies": reply_obj}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Discussion not found")

    return {"message": "Comment added", "identity": display_name}

# --- 4. FEED ---
@router.get("/feed", response_model=list[DiscussionResponse])
async def get_feed(
    user_id: str = Query(..., description="Unique ID: Can be _id, government_id, or username"),
    limit: int = 50
):
    user, role, error = await get_user_details(user_id)
    if error:
        raise HTTPException(status_code=404, detail=error)
        
    village_name = user["village_name"]

    discussions = await db.discussions.find(
        {"village_name": village_name}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    results = []
    for d in discussions:
        results.append(DiscussionResponse(
            id=str(d["_id"]),
            village_name=d["village_name"],
            user_name=d["user_name"],
            user_role=d["user_role"],
            content=d["content"],
            category=d["category"],
            created_at=d["created_at"],
            upvotes=d.get("upvotes", 0),
            replies=d.get("replies", []),
            image_url=d.get("image_url")
        ))
    return results

# --- 5. AI Q&A (OpenRouter) ---
class OfficialQuery(BaseModel):
    query: str

@router.post("/official/ask", tags=["AI Assistance"])
async def ask_official_query(
    request: OfficialQuery,
    user_id: str = Query(..., description="Enter your Government ID (e.g. nikhil) OR Database ID")
):
    """
    AI Endpoint for Officials.
    Authentication: Accepts 'government_id' OR '_id'.
    """
    # 1. Verify User
    user, role, error = await get_user_details(user_id)
    if error:
        raise HTTPException(status_code=403, detail=f"Authentication Failed: {error}")
        
    if role != "official":
        raise HTTPException(status_code=403, detail="Access Denied. Only Officials can use this AI tool.")

    village_name = user["village_name"]

    # 2. Fetch Context
    discussions = await db.discussions.find(
        {"village_name": village_name}
    ).sort("created_at", -1).limit(50).to_list(50)

    if not discussions:
        return {"answer": "No discussions found for this village yet."}

    # 3. Format Context
    context_text = ""
    for d in discussions:
        context_text += f"- [{d['category']}] {d['user_name']}: {d['content']} (Upvotes: {d.get('upvotes',0)})\n"

    # 4. Ask LLM
    answer = await ask_openrouter(context_text, request.query)
    
    return {"answer": answer}
