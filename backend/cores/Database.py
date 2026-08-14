from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")


class DatabaseManager:

    def __init__(self):
        self.client = AsyncIOMotorClient(MONGO_URL)
        self.db = self.client[DATABASE_NAME]

    def __getitem__(self, collection_name: str):
        return self.db[collection_name]

    async def connect(self):
        await self.client.admin.command("ping")
        print("✅ MongoDB Connected")

    async def close(self):
        self.client.close()
        print("❌ MongoDB Connection Closed")


database = DatabaseManager()