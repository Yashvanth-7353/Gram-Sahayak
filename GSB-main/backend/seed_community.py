import asyncio
import os
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

# Word banks for random discussions
TOPICS = ["Water Supply", "Roads", "Electricity", "School", "Hospital", "Market", "Panchayat"]
PROBLEMS = ["is broken", "needs repair", "is very dirty", "not working", "is dangerous", "has no light"]
ADJECTIVES = ["Silent", "Hidden", "Mystery", "Brave", "Calm", "Wandering", "Happy", "Vocal"]
NOUNS = ["Tiger", "River", "Banyan", "Peacock", "Lotus", "Eagle", "Lion", "Voice"]

async def seed_discussions():
    if not MONGO_URI:
        print("❌ MONGO_URI missing.")
        return

    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    print("🗑️  Clearing old discussions...")
    await db.discussions.delete_many({})

    # Fetch a real villager to link (optional, for 'real_user_id')
    villager = await db.villagers.find_one({})
    real_id = str(villager["_id"]) if villager else str(ObjectId())

    print("🌱 Generating 50 dummy discussions...")
    posts = []
    for i in range(50):
        topic = random.choice(TOPICS)
        problem = random.choice(PROBLEMS)
        anon_name = f"{random.choice(ADJECTIVES)} {random.choice(NOUNS)}"
        
        # Random time in the last 7 days
        time_offset = random.randint(0, 10000)
        created_at = datetime.utcnow() - timedelta(minutes=time_offset)

        post = {
            "user_name": anon_name,
            "real_user_id": real_id,
            "content": f"The {topic} near Ward {random.randint(1,10)} {problem}. Please help!",
            "category": topic,
            "status": random.choice(["Open", "Resolved", "Open"]),
            "created_at": created_at,
            "upvotes": random.randint(0, 50)
        }
        posts.append(post)

    await db.discussions.insert_many(posts)
    print("✅ Successfully seeded 50 discussions.")
    print("🚀 You can now test GET /community/feed")

if __name__ == "__main__":
    asyncio.run(seed_discussions())
