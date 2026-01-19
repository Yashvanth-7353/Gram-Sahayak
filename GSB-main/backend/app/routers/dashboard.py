from fastapi import APIRouter, Query, HTTPException
from app.database import db
from app.schemas import DashboardStats
from bson import ObjectId

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    villager_id: str = Query(..., description="ID of the logged-in user")
):
    """
    Calculates Dashboard Metrics.
    Automatically fetches the village name from the user's profile.
    """
    
    # 1. Fetch User Profile to get Village Name
    try:
        user_obj_id = ObjectId(villager_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid User ID format")

    user = await db.villagers.find_one({"_id": user_obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="Villager not found")
        
    village_name = user["village_name"] # <--- Auto-detected from DB
    
    # 2. CARD: Budget Used (Sum of 'In Progress' projects in THIS village)
    pipeline = [
        {"$match": {"village_name": village_name, "status": "In Progress"}},
        {"$group": {"_id": None, "total": {"$sum": "$allocated_budget"}}}
    ]
    budget_result = await db.projects.aggregate(pipeline).to_list(1)
    budget_used = budget_result[0]["total"] if budget_result else 0.0

    # 3. CARD: Issues Resolved 
    # (For MVP, we count global resolved. In V2, we can filter by village too)
    issues_resolved = await db.discussions.count_documents({"status": "Resolved"})

    # 4. CARD: Village Mood (AI Sentiment)
    last_insight = await db.insights.find_one(sort=[("generated_at", -1)])
    sentiment = last_insight["sentiment_score"] if last_insight else 0
    
    if sentiment > 0.3: mood = "Happy 🙂"
    elif sentiment < -0.3: mood = "Angry 😡"
    else: mood = "Neutral 😐"

    # 5. CARD: Personal Impact (The User's Contribution)
    personal_impact = await db.discussions.count_documents({
        "real_user_id": villager_id,
        "status": "Resolved"
    })

    return DashboardStats(
        budget_used=budget_used,
        issues_resolved=issues_resolved,
        village_mood=mood,
        personal_impact=personal_impact,
        next_meeting="Jan 24, 10 AM"
    )
