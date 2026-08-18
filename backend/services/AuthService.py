import os
from dotenv import load_dotenv
from repositories import UserRepository
from models.UserRequest import GoogleAuthRequest
from fastapi import HTTPException
from cores.Security import security
from cores.Email import emailService
from datetime import datetime,timedelta
from uuid import uuid4
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
load_dotenv()

class AuthService:

    def __init__(self,userRepo:UserRepository):
        self.userRepo=userRepo

    async def register(self,email:str, password:str):

        existing = await self.userRepo.getByEmail(email)

        if existing:
            raise HTTPException(409,'Email already exists.')
        
        hashPassword = security.hashedPassword(password)

        token = security.createVerificationToken({"sub":email})

        user = await self.userRepo.createUser({"email":email,
                                               "password":hashPassword,
                                               "verificationToken":token,
                                               "isVerified":False,
                                                "authProvider": "local",
                                                "googleId" : None })

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
    

    async def login(self,user:dict, response):

        existing = await self.userRepo.getByEmail(user.email)

        if not existing:
            raise HTTPException(status_code = 401, detail = "Invalid Email.")
        
        if not existing["isVerified"]:
            raise HTTPException(status_code = 403, detail = "Please Verify email.")

        if not security.verifyPassword(user.password,existing["password"]):
            raise HTTPException(status_code = 403, detail = "Invalid Password.")

        
        token = security.createAccessToken({"sub":user.email})

        sessionId = str(uuid4())

        refreshDays = (30 if user.rememberMe else 1)

        refreshToken = (security.createRefreshToken({"sub": user.email, "sessionID": sessionId}, refreshDays))

        await self.userRepo.saveRefreshDetails(user.email, sessionId, refreshToken, refreshDays, user.rememberMe)

        response.set_cookie(
            key="refreshToken",
            value=refreshToken,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=(refreshDays * 24 * 60 * 60),
            path="/"
        )

        return {"message":"Login successfully.","accessToken":token}

    async def refresh(self, request, response):

        refreshToken = request.cookies.get("refreshToken")

        if not refreshToken:
            raise HTTPException(status_code = 401, detail = "Refresh Token Missing")

        payload = security.decodeToken(refreshToken)

        if not payload:
            raise HTTPException(status_code = 401, detail = "Invalid refresh Token")

        if payload.get("type") != "refresh":
            raise HTTPException(status_code = 401, detail = "Invalid Token Type")

        userEmail = payload.get("sub")
        sessionId = payload.get("sessionID")

        if not userEmail or not sessionId:
            raise HTTPException(status_code = 401, detail = "Invalid refresh Token")

        session = await self.userRepo.getSession({"email": userEmail, "sessionId" : sessionId, "revoked" : False})

        if not session:
            raise HTTPException(status_code = 401, detail = "Session revoked")

        if session["expiresAt"] < datetime.utcnow():

            await self.userRepo.updateSession({"sessionId":sessionId}, {
                "$set": {
                    "revoked" : True
                }
            })
        accessToken = security.createAccessToken({"sub" : userEmail})

        return {
            "accessToken" : accessToken,
            "tokenType" : "bearer"
        }

    async def logout(self, request, response):

        refreshToken = request.cookies.get("refreshToken")

        if refreshToken:
            payload = security.decodeToken(refreshToken)

            if payload:
                sessionId = payload.get("sessionID")

                if sessionId:
                    await self.userRepo.updateSession({"sessionId": sessionId}, {
                        "$set": {
                            "revoked": True
                        }
                    })

        response.delete_cookie(key="refreshToken", path="/")

        return {"message": "Logged out Successfully"}
    
    async def forgotpassword(self,email:str):

        existing = await self.userRepo.getByEmail(email)

        if not existing :
            raise HTTPException(status_code = 404, detail = "Invalid email.")

        token = security.createResetToken({"sub":email})

        RESET_LINK = os.getenv("RESET_LINK") or "http://localhost:5173/reset-password"

        expiry = datetime.utcnow()+timedelta(minutes=15)

        await self.userRepo.saveResetToken(email,token,expiry)

        await emailService.sendResetPasswordEmail(email,f"{RESET_LINK}?token={token}")

        return {"message":"Email sent successfully."}


    async def resetpassword(self,data:dict):

        payload = security.decodeToken(data["token"])

        if not payload or payload.get("type") != "reset":
            raise HTTPException(status_code = 400, detail = "Invalid or expired token.")

        email = payload["sub"]

        user = await self.userRepo.getByEmail(email)

        if not user:
            raise HTTPException(status_code = 404, detail = "User not found.")
        
        if user["resetToken"]!= data["token"]:
            raise HTTPException(status_code = 403, detail = "Invalid token.")

        if datetime.utcnow() > user["expiry"]:
            raise HTTPException(status_code = 403, detail = "Token expired.")
        
        hashPassword = security.hashedPassword(data["newPassword"])

        await self.userRepo.updatePassword(email,hashPassword)

        return {"message":"Password reset successfully."}

    async def google(self, data: GoogleAuthRequest, response):

        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise HTTPException(status_code=500, detail="Google login is not configured on the server.")

        try:
            payload = id_token.verify_oauth2_token(
                data.idToken,
                google_requests.Request(),
                client_id
            )
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid Google ID token.")

        email = payload.get("email")
        google_id = payload.get("sub")

        if not email or not google_id:
            raise HTTPException(status_code=401, detail="Google token payload is missing required fields.")

        if payload.get("email_verified") is not True:
            raise HTTPException(status_code=403, detail="Google email is not verified.")

        existing = await self.userRepo.getByEmail(email)

        if existing:
            existing_google_id = existing.get("googleId")

            if not existing_google_id:
                await self.userRepo.linkGoogleAccount(email, google_id)
                existing_google_id = google_id

            if existing_google_id and existing_google_id != google_id:
                raise HTTPException(status_code=401, detail="Invalid Google account for this email.")

            user_email = existing["email"]
        else:
            created_user = await self.userRepo.createUser({
                "email": email,
                "password": None,
                "verificationToken": None,
                "isVerified": True,
                "authProvider": "google",
                "googleId": google_id
            })
            user_email = created_user["email"]

        token = security.createAccessToken({"sub": user_email})
        sessionId = str(uuid4())
        refreshDays = 30
        refreshToken = security.createRefreshToken({"sub": user_email, "sessionID": sessionId}, refreshDays)

        await self.userRepo.saveRefreshDetails(user_email, sessionId, refreshToken, refreshDays, True)

        response.set_cookie(
            key="refreshToken",
            value=refreshToken,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=(refreshDays * 24 * 60 * 60),
            path="/"
        )

        return {"message": "Login successfully.", "accessToken": token}
            