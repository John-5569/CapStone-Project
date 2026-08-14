class UserRepository:
    
    def __init__(self, database):
        self.users = database["users"]

    async def createUser(self, data):

        result = await self.users.insert_one(data)

        return await self.users.find_one({"_id":result.inserted_id})

    async def getByEmail(self, email):

        return await self.users.find_one({"email":email})

    async def verifyEmail(self, email):
        await self.users.update_one(
            {"email":email},
            {"$set":{"isVerified":True},"$unset":{"verificationToken":None}}
        )

    async def saveResetToken(self, email, token, expiry ):
        await self.users.update_one({"email":email},{"$set":{"resetToken":token,"expiry":expiry}})

    async def updatePassword(self,email:str,newPassword:str):

        await self.users.update_one({"email":email},{"$set":{"password":newPassword},"$unset":{"resetToken":None,"expiry":None}})

    async def saveCloud(self,email: str, Cemail: str, Cpassword: str):

        await self.users.update_one({"email":email},{"$set":{"cloud": {"provider":"mega", "cloudEmail":Cemail,"cloudPassword":Cpassword}}})

    async def getCloud(self, email: str):
        return await self.users.find_one({"email":email})