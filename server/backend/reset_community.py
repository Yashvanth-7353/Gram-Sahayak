import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

async def reset_db():
    if not MONGO_URI:
        print("❌ Error: MONGO_URI not found.")
        return

    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    
    print("🔥 Deleting ALL existing discussions...")
    await db.discussions.delete_many({})
    print("✅ Discussions collection is now empty and ready for new schema.")

if __name__ == "__main__":
    asyncio.run(reset_db())
