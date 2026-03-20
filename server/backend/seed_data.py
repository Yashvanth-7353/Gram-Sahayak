import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

# 1. Setup & Config
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI:
    print("❌ Error: MONGO_URI not found. Check your .env file.")
    exit(1)

# 2. Connect to DB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["proposed_projects"]
print(f"✅ Connected to: {DB_NAME}")

# 3. Dummy Data Generation
# We use the Village Names from your previous seed as 'village_id'
VILLAGE_NAMES = ["Rampur", "Kishanpur", "Madhopur", "Chandpur", "Sultanpur"]

PROPOSALS = [
    "Construction of Community Hall",
    "Repair of Village Pond",
    "Installation of CCTV at Main Gate",
    "New Library Building",
    "Solar Street Lights for Market",
    "Public Toilet near Bus Stand",
    "Playground for Primary School",
    "Rainwater Harvesting System",
    "Veterinary Clinic Setup",
    "Organic Waste Composting Unit"
]

def seed_proposals():
    # --- A. TRUNCATE EXISTING ---
    print("🗑️  Clearing old proposals...")
    collection.delete_many({})
    
    # --- B. PREPARE NEW DATA ---
    print("📝 Generating new proposals...")
    new_proposals = []
    
    for i in range(15):  # Create 15 random proposals
        village = random.choice(VILLAGE_NAMES)
        title = random.choice(PROPOSALS)
        
        proposal = {
            "village_id": village,  # Using Village Name as ID for consistency
            "proposed_project_title": f"{title} - {village}",
            "status": "Pending",    # Default Status
            "created_at": datetime.utcnow()
        }
        new_proposals.append(proposal)

    # --- C. INSERT DATA ---
    if new_proposals:
        result = collection.insert_many(new_proposals)
        print(f"✅ Inserted {len(result.inserted_ids)} new proposals.")

    # --- D. CREATE INDEX ---
    # Create an index on 'village_id' for faster filtering
    collection.create_index("village_id")
    print("✅ Index created on 'village_id'.")
    
    print("\n---------------------------------------------------")
    print("🎉 'proposed_projects' Table Created & Seeded!")
    print("---------------------------------------------------")

if __name__ == "__main__":
    seed_proposals()