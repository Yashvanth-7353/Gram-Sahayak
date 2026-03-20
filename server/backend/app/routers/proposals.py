from fastapi import APIRouter, HTTPException, status, Query
from app.database import db
from app.schemas import ProposedProjectCreate, ProposedProjectResponse
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/proposals", tags=["Proposed Projects"])

# --- HELPER: Verify Official Role ---
async def verify_official(user_id: str):
    """
    Checks if the provided ID belongs to a Government Official.
    Throws 403 error if not.
    """
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid User ID format")

    official = await db.government_officials.find_one({"_id": obj_id})
    
    if not official:
        raise HTTPException(
            status_code=403, 
            detail="Access Denied. Only Government Officials can perform this action."
        )
    return official

# 1. CREATE PROPOSAL (Open to all)
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProposedProjectResponse)
async def create_proposal(proposal: ProposedProjectCreate):
    new_proposal = proposal.dict()
    new_proposal["status"] = "Pending"
    new_proposal["created_at"] = datetime.utcnow()
    
    result = await db.proposed_projects.insert_one(new_proposal)
    
    new_proposal["id"] = str(result.inserted_id)
    return new_proposal

# 2. GET ALL PROPOSALS (Filter by Village)
@router.get("/", response_model=List[ProposedProjectResponse])
async def get_proposals(village_id: str = Query(None, description="Filter by Village ID")):
    query = {}
    if village_id:
        query["village_id"] = village_id
        
    proposals = await db.proposed_projects.find(query).sort("created_at", -1).to_list(100)
    
    results = []
    for p in proposals:
        p["id"] = str(p["_id"])
        results.append(p)
    return results

# 3. APPROVE PROPOSAL (Restricted to Govt Officials)
@router.patch("/{proposal_id}/approve")
async def approve_proposal(
    proposal_id: str,
    official_id: str = Query(..., description="ID of the Government Official approving this")
):
    # A. Verify Role
    await verify_official(official_id)

    # B. Validate Proposal ID
    try:
        obj_id = ObjectId(proposal_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Proposal ID")

    # C. Update Status
    result = await db.proposed_projects.update_one(
        {"_id": obj_id},
        {"$set": {"status": "Approved"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found or already processed")
        
    return {"message": "Project Proposal APPROVED successfully"}

# 4. REJECT PROPOSAL (Restricted to Govt Officials)
@router.patch("/{proposal_id}/reject")
async def reject_proposal(
    proposal_id: str,
    official_id: str = Query(..., description="ID of the Government Official rejecting this")
):
    # A. Verify Role
    await verify_official(official_id)

    # B. Validate Proposal ID
    try:
        obj_id = ObjectId(proposal_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Proposal ID")

    # C. Update Status
    result = await db.proposed_projects.update_one(
        {"_id": obj_id},
        {"$set": {"status": "Rejected"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Proposal not found or already processed")
        
    return {"message": "Project Proposal REJECTED"}
