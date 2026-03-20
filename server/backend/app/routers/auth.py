from fastapi import APIRouter, HTTPException, status, Body
from app.database import db
from app.schemas import VillagerSignup, VillagerLogin, ContractorLogin, OfficialLogin
from app.security import get_password_hash, verify_password

# This router handles all authentication related paths
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ==========================================
# 1. VILLAGER AUTHENTICATION
# ==========================================

@router.post("/signup/villager", status_code=status.HTTP_201_CREATED)
async def signup_villager(villager: VillagerSignup):
    """
    Registers a new Villager.
    Checks if phone number is unique before inserting.
    """
    # 1. Check if phone number already exists
    existing_user = await db.villagers.find_one({"phone_number": villager.phone_number})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A villager with this phone number already exists."
        )

    # 2. Hash the password (NEVER store plain text passwords)
    villager_data = villager.model_dump()
    villager_data["password"] = get_password_hash(villager.password)

    # 3. Save to MongoDB
    new_user = await db.villagers.insert_one(villager_data)
    
    return {
        "message": "Villager account created successfully", 
        "user_id": str(new_user.inserted_id),
        "name": villager.name
    }

@router.post("/login/villager")
async def login_villager(credentials: VillagerLogin):
    """
    Villager Login: Uses Phone Number + Password
    """
    # 1. Find user by Phone Number
    user = await db.villagers.find_one({"phone_number": credentials.phone_number})
    
    # 2. Verify User and Password
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid phone number or password"
        )
    
    # 3. Return Success (In a real app, you would return a JWT Token here)
    return {
        "message": "Login successful", 
        "role": "villager", 
        "name": user["name"],
        "id": str(user["_id"])
    }

# ==========================================
# 2. CONTRACTOR AUTHENTICATION
# ==========================================

@router.post("/login/contractor")
async def login_contractor(credentials: ContractorLogin):
    """
    Contractor Login: Uses Contractor ID + Password
    """
    # 1. Find user by Contractor ID
    user = await db.contractors.find_one({"contractor_id": credentials.contractor_id})
    
    # 2. Verify User and Password
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid Contractor ID or password"
        )
    
    return {
        "message": "Login successful", 
        "role": "contractor", 
        "name": user["name"],
        "id": str(user["_id"])
    }

# ==========================================
# 3. GOVERNMENT OFFICIAL AUTHENTICATION
# ==========================================

@router.post("/login/official")
async def login_official(credentials: OfficialLogin):
    """
    Official Login: Uses Government ID + Password
    """
    # 1. Find user by Government ID
    user = await db.government_officials.find_one({"government_id": credentials.government_id})
    
    # 2. Verify User and Password
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid Government ID or password"
        )
    
    return {
        "message": "Login successful", 
        "role": "government_official", 
        "name": user["name"],
        "id": str(user["_id"])
    }