from datetime import datetime, timedelta

class UserRepository:
    
    def __init__(self, users, sessions):
        self.users = users
        self.sessions = sessions

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

    async def saveRefreshDetails(self, email: str, sessionId: str, token: str, refreshDays: int, rememberMe: bool):

        await self.sessions.insert_one({"email": email,
                                         "sessionId" : sessionId,
                                           "token" : token,
                                             "expiresAt": (datetime.utcnow() + timedelta(days = refreshDays)),
                                               "revoked" : False,
                                                 "rememberMe" : rememberMe})


    async def getSession(self, data):

        return await self.sessions.find_one(data)

    async def updateSession(self, query, update):

        return await self.sessions.update_one(query, update)

    async def linkGoogleAccount(self, email: str, googleId: str):

        await self.users.update_one(
            {"email": email},
            {
                "$set": {
                    "googleId": googleId,
                    "isVerified": True
                }
            }
        )

    async def addProcessingJob(self, email: str, job: dict):

        await self.users.update_one(
            {"email": email},
            {"$push": {"processingJobs": job}}
        )

    async def getProcessingJob(self, email: str, jobId: str):

        user = await self.users.find_one(
            {"email": email},
            {"processingJobs": 1, "_id": 0}
        )

        if not user:
            return None

        for job in user.get("processingJobs", []):
            if job.get("jobId") == jobId:
                return job

        return None

    async def getProcessingHistory(self, email: str):

        user = await self.users.find_one(
            {"email": email},
            {"processingJobs": 1, "_id": 0}
        )

        if not user:
            return []

        return user.get("processingJobs", [])

    async def updateProcessingJob(self, email: str, jobId: str, updates: dict):

        set_fields = {f"processingJobs.$.{key}": value for key, value in updates.items()}

        return await self.users.update_one(
            {"email": email, "processingJobs.jobId": jobId},
            {"$set": set_fields}
        )
    