from fastapi import APIRouter, HTTPException, status
from app.database import db
from app.schemas import (
    VillagerResponse, 
    ContractorResponse, 
    OfficialResponse, 
    ContractorDashboardResponse
)
from typing import List

router = APIRouter(prefix="/users", tags=["User Management"])

# ==========================
# 1. FETCH ALL USERS
# ==========================

@router.get("/villagers", response_model=List[VillagerResponse])
async def get_all_villagers():
    """Fetch all registered villagers with full details"""
    users = await db.villagers.find().to_list(1000)
    for user in users:
        user["id"] = str(user["_id"])
        # Ensure optional list fields exist if DB record is old
        if "complaints_raised" not in user:
            user["complaints_raised"] = []
    return users

@router.get("/contractors", response_model=List[ContractorResponse])
async def get_all_contractors():
    """Fetch all registered contractors"""
    users = await db.contractors.find().to_list(1000)
    for user in users:
        user["id"] = str(user["_id"])
    return users

@router.get("/officials", response_model=List[OfficialResponse])
async def get_all_officials():
    """Fetch all officials with assigned complaints"""
    users = await db.government_officials.find().to_list(1000)
    for user in users:
        user["id"] = str(user["_id"])
        # Ensure optional list fields exist
        if "assigned_complaints" not in user:
            user["assigned_complaints"] = []
    return users

# ==========================
# 2. FETCH SINGLE USER
# ==========================

@router.get("/villagers/{phone_number}", response_model=VillagerResponse)
async def get_villager_by_phone(phone_number: str):
    """Fetch a single villager by Phone Number"""
    user = await db.villagers.find_one({"phone_number": phone_number})
    if not user:
        raise HTTPException(status_code=404, detail="Villager not found")
    
    user["id"] = str(user["_id"])
    if "complaints_raised" not in user:
        user["complaints_raised"] = []
    return user

@router.get("/contractors/{contractor_id}", response_model=ContractorDashboardResponse)
async def get_contractor_by_id(contractor_id: str):
    """
    Fetch contractor profile + dashboard stats + active projects
    """
    # 1. Fetch Contractor Profile
    user = await db.contractors.find_one({"contractor_id": contractor_id})
    if not user:
        raise HTTPException(status_code=404, detail="Contractor not found")
    
    user["id"] = str(user["_id"])

    # 2. Fetch Projects assigned to this Contractor
    cursor = db.projects.find({"contractor_id": contractor_id})
    projects_list = await cursor.to_list(length=1000)

    # 3. Calculate Dashboard Statistics
    total_value = 0.0
    active_count = 0
    completed_count = 0
    active_projects_data = []

    for p in projects_list:
        p_status = p.get("status", "Pending")
        budget = float(p.get("allocated_budget", 0))

        # Sum up total contract value
        total_value += budget

        # Count Active vs Completed
        if p_status == "Completed":
            completed_count += 1
        else:
            active_count += 1
            # Add to the list of active projects
            active_projects_data.append({
                "id": str(p["_id"]),
                "project_name": p.get("project_name", "Untitled Project"),
                "status": p_status,
                "allocated_budget": budget,
                "location": p.get("location", "Unknown"),
                "start_date": p.get("start_date")
            })

    # 4. Construct the Final Response
    response_data = {
        **user,
        "stats": {
            "total_contract_value": total_value,
            "active_projects_count": active_count,
            "projects_completed_count": completed_count,
            "pending_issues_count": 0  # Placeholder
        },
        "active_projects": active_projects_data
    }

    return response_data

@router.get("/officials/{government_id}", response_model=OfficialResponse)
async def get_official_by_id(government_id: str):
    """Fetch a single official by Government ID"""
    user = await db.government_officials.find_one({"government_id": government_id})
    if not user:
        raise HTTPException(status_code=404, detail="Official not found")
    
    user["id"] = str(user["_id"])
    if "assigned_complaints" not in user:
        user["assigned_complaints"] = []
    return user
