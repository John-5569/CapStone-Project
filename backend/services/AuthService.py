import os
from dotenv import load_dotenv
from repositories import UserRepository
from fastapi import HTTPException
from cores.Security import security
from cores.Email import emailService
from datetime import datetime,timedelta
load_dotenv()

class AuthService:

    def __init__(self,userRepo:UserRepository):
        self.userRepo=userRepo

    async def register(self,email:str, password:str):

        existing = await self.userRepo.getByEmail(email)

        if existing:
            raise HTTPException(404,'Email already exists.')
        
        hashPassword = security.hashedPassword(password)

        token = security.createVerificationToken({"sub":email})

        user = await self.userRepo.createUser({"email":email,"password":hashPassword,"verificationToken":token,"isVerified":False})

        VERIFY_LINK = os.getenv("VERIFY_LINK")

        await emailService.sendVerificationEmail(email,f"{VERIFY_LINK}/{token}")

        return {"message":"User registered successfully, Please Verify email."}


    async def verify(self,token:str):

        payload = security.decodeToken(token)
        
        if not payload or payload.get("type") != "verification":
            raise HTTPException(403,"Invalid token.")

        email = payload["sub"]

        await self.userRepo.verifyEmail(email)

        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="http://localhost:5173/login?verified=true")
    

    async def login(self,user:dict):

        existing = await self.userRepo.getByEmail(user.email)

        if not existing:
            raise HTTPException(401,"Invalid Email.")
        
        if not existing["isVerified"]:
            raise HTTPException(403,"Please Verify email.")
        
        if not security.verifyPassword(user.password,existing["password"]):
            raise HTTPException(403,"Invalid Password.")
        
        token = security.createAccessToken({"sub":user.email})

        return {"message":"Login successfully.","accessToken":token}
    

    async def forgotpassword(self,email:str):

        existing = await self.userRepo.getByEmail(email)

        if not existing :
            raise HTTPException(404,"Invalid email.")

        token = security.createResetToken({"sub":email})

        RESET_LINK = os.getenv("RESET_LINK") or "http://localhost:5173/reset-password"

        expiry = datetime.utcnow()+timedelta(minutes=15)

        await self.userRepo.saveResetToken(email,token,expiry)

        await emailService.sendResetPasswordEmail(email,f"{RESET_LINK}?token={token}")

        return {"message":"Email sent successfully."}


    async def resetpassword(self,data:dict):

        payload = security.decodeToken(data["token"])

        if not payload or payload.get("type") != "reset":
            raise HTTPException(400,"Invalid or expired token.")

        email = payload["sub"]

        user = await self.userRepo.getByEmail(email)

        if not user:
            raise HTTPException(404,"User not found.")
        
        if user["resetToken"]!= data["token"]:
            raise HTTPException(403,"Invalid token.")

        if datetime.utcnow() > user["expiry"]:
            raise HTTPException(403,"Token expired.")
        
        hashPassword = security.hashedPassword(data["newPassword"])

        await self.userRepo.updatePassword(email,hashPassword)

        return {"message":"Password reset successfully."}
