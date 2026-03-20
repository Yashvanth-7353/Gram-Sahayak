from fastapi import APIRouter, HTTPException, status, Form, UploadFile, File, Query, Body
from app.database import db
from app.schemas import ComplaintResponse, ReopenRequest
from app.utils.s3 import upload_file_to_s3
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/complaints", tags=["Complaints & Grievances"])

# --- Helper: Calculate Days, Escalation & Tier ---
def process_complaint_status(complaint: dict) -> dict:
    """
    Computes 'resolution_tier' and handles status logic.
    """
    created_at = complaint.get("created_at")
    current_status = complaint.get("status", "Pending")
    
    days_pending = 0
    is_escalated = False
    
    # 1. Check Explicit Escalation
    if current_status == "Migrated to Higher Officials":
        is_escalated = True

    # 2. Time-Based Calculation (14 Days)
    if created_at:
        try:
            if isinstance(created_at, str):
                try:
                    created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                except:
                    created_at = None

            if created_at:
                if created_at.tzinfo is None:
                    created_at = created_at.replace(tzinfo=timezone.utc)
                
                now_aware = datetime.now(timezone.utc)
                delta = now_aware - created_at
                days_pending = delta.days
                
                # 14 DAYS RULE
                if current_status == "Pending" and days_pending > 14:
                    is_escalated = True
                    complaint["status"] = "Migrated to Higher Officials"
                    
        except Exception as e:
            print(f"⚠️ Error calculating date for complaint {complaint.get('_id')}: {e}")

    # 3. Calculate Resolution Tier
    reopen_count = complaint.get("reopen_count", 0)
    
    tier_label = "First Attempt"
    if is_escalated:
        tier_label = "Escalated"
    elif reopen_count == 1:
        tier_label = "Second Attempt"
    elif reopen_count >= 2:
        tier_label = "Escalated"
        is_escalated = True
        
    # 4. Fill Fields
    complaint["id"] = str(complaint["_id"])
    complaint["days_pending"] = days_pending
    complaint["is_escalated"] = is_escalated
    complaint["reopen_count"] = reopen_count
    complaint["resolution_tier"] = tier_label
    
    complaint.setdefault("attachments", [])
    complaint.setdefault("resolution_attachments", [])
    complaint.setdefault("resolution_notes", None)
    complaint.setdefault("resolved_by", None)
    complaint.setdefault("resolved_at", None)
    
    return complaint

# 1. RAISE COMPLAINT
@router.post("/raise", status_code=status.HTTP_201_CREATED, response_model=ComplaintResponse)
async def raise_complaint(
    phone_number: str = Form(..., description="Registered Phone Number"),
    complaint_name: str = Form(..., description="Title"),
    complaint_desc: str = Form(..., description="Description"),
    location: str = Form(..., description="Location"),
    files: List[UploadFile] = File(default=None, description="Optional files to upload")
):
    villager = await db.villagers.find_one({"phone_number": phone_number})
    if not villager:
        raise HTTPException(status_code=404, detail="Villager not found.")
    
    village_name = villager["village_name"]

    uploaded_urls = []
    if files:
        for file in files:
            if file.filename:
                url = upload_file_to_s3(file.file, file.filename, folder="complaints")
                if url: uploaded_urls.append(url)

    new_complaint = {
        "complaint_name": complaint_name,
        "complaint_desc": complaint_desc,
        "location": location,
        "villager_id": str(villager["_id"]),
        "villager_name": villager["name"],
        "villager_phone": phone_number,
        "village_name": village_name,
        "attachments": uploaded_urls,
        "status": "Pending",
        "created_at": datetime.now(timezone.utc),
        "resolution_notes": None,
        "resolution_attachments": [],
        "resolved_by": None,
        "resolved_at": None,
        "reopen_count": 0
    }

    result = await db.complaints.insert_one(new_complaint)
    complaint_id = result.inserted_id

    await db.government_officials.update_many(
        {"village_name": village_name},
        {"$push": {"assigned_complaints": str(complaint_id)}}
    )
    await db.villagers.update_one(
        {"_id": villager["_id"]},
        {"$push": {"complaints_raised": str(complaint_id)}}
    )

    new_complaint["_id"] = complaint_id
    return process_complaint_status(new_complaint)

# 2. FETCH COMPLAINTS (Villager)
@router.get("/villager/{phone_number}", response_model=List[ComplaintResponse])
async def get_complaints_by_villager(phone_number: str):
    clean_phone = phone_number.strip()
    query = {"villager_phone": {"$regex": f"^\s*{clean_phone}\s*$", "$options": "i"}}
    complaints = await db.complaints.find(query).sort("created_at", -1).to_list(100)
    
    results = []
    for c in complaints:
        try:
            results.append(process_complaint_status(c))
        except:
            pass
    return results

# 3. FETCH COMPLAINTS (Official)
@router.get("/official/{government_id}", response_model=List[ComplaintResponse])
async def get_complaints_for_official(government_id: str):
    official = await db.government_officials.find_one({"government_id": government_id})
    if not official:
        raise HTTPException(status_code=404, detail="Official not found")

    assigned_village = official["village_name"]
    complaints = await db.complaints.find({"village_name": assigned_village}).sort("created_at", -1).to_list(100)
    return [process_complaint_status(c) for c in complaints]

# 4. RESOLVE COMPLAINT (Form Data - Allows File Uploads)
@router.patch("/{complaint_id}/resolve", response_model=ComplaintResponse)
async def resolve_complaint(
    complaint_id: str,
    official_id: str = Form(..., description="Government ID of Official"),
    resolution_notes: str = Form(None, description="Remarks or notes on resolution"),
    files: List[UploadFile] = File(default=None, description="Proof of resolution (Images/Docs)")
):
    official = await db.government_officials.find_one({"government_id": official_id})
    if not official:
        raise HTTPException(status_code=404, detail="Official not found")

    try:
        comp_oid = ObjectId(complaint_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Complaint ID format")

    complaint = await db.complaints.find_one({"_id": comp_oid})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if complaint["village_name"] != official["village_name"]:
        raise HTTPException(status_code=403, detail="Access Denied: You cannot manage complaints from other villages.")

    created_at = complaint.get("created_at")
    if created_at:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        delta = datetime.now(timezone.utc) - created_at
        if delta.days > 14:
             raise HTTPException(
                 status_code=403, 
                 detail="Action Forbidden: Complaint has exceeded 14 days and is migrated to higher officials."
             )

    resolution_urls = []
    if files:
        for file in files:
            if file.filename:
                url = upload_file_to_s3(file.file, file.filename, folder="resolutions")
                if url: resolution_urls.append(url)

    update_data = {
        "status": "Resolved",
        "resolution_notes": resolution_notes,
        "resolution_attachments": resolution_urls,
        "resolved_by": official["name"],
        "resolved_at": datetime.now(timezone.utc)
    }

    await db.complaints.update_one({"_id": comp_oid}, {"$set": update_data})
    updated_complaint = await db.complaints.find_one({"_id": comp_oid})
    return process_complaint_status(updated_complaint)

# 5. REOPEN COMPLAINT (JSON Data - "Not Resolved" Button)
@router.patch("/{complaint_id}/reopen", response_model=ComplaintResponse)
async def reopen_complaint(
    complaint_id: str,
    request: ReopenRequest
):
    """
    Villager Marks Complaint as 'Not Resolved'.
    Accepts JSON body: {"phone_number": "..."}
    """
    try:
        comp_oid = ObjectId(complaint_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Complaint ID")

    complaint = await db.complaints.find_one({"_id": comp_oid})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Verify Phone Number from JSON body
    if complaint["villager_phone"] != request.phone_number:
         raise HTTPException(status_code=403, detail="Access Denied: You can only reopen your own complaints.")

    if complaint.get("status") != "Resolved":
         raise HTTPException(status_code=400, detail="Only 'Resolved' complaints can be reopened.")

    current_reopens = complaint.get("reopen_count", 0)
    new_reopens = current_reopens + 1
    
    update_data = {
        "reopen_count": new_reopens
    }

    if new_reopens == 1:
        # First Reopen -> Second Attempt
        update_data["status"] = "Pending"
        update_data["created_at"] = datetime.now(timezone.utc) # RESET TIMER
        
    elif new_reopens >= 2:
        # Second Reopen -> Escalated
        update_data["status"] = "Migrated to Higher Officials"

    await db.complaints.update_one({"_id": comp_oid}, {"$set": update_data})
    
    updated_complaint = await db.complaints.find_one({"_id": comp_oid})
    return process_complaint_status(updated_complaint)
