from fastapi import APIRouter, HTTPException
from app.database import db
from app.schemas import SchemeResponse
from typing import List

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("/", response_model=List[SchemeResponse])
async def get_all_schemes():
    """
    Fetch all available Government Schemes.
    """
    schemes = await db.schemes.find().to_list(100)
    results = []
    for scheme in schemes:
        scheme["id"] = str(scheme["_id"])
        results.append(scheme)
    return results

@router.get("/{scheme_id}", response_model=SchemeResponse)
async def get_scheme_by_id(scheme_id: str):
    """
    Fetch a specific scheme by its ID (e.g., SCH-AGRI-001).
    """
    scheme = await db.schemes.find_one({"scheme_id": scheme_id})
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    scheme["id"] = str(scheme["_id"])
    return scheme

