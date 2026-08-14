from passlib.context import CryptContext
import os 
from jose import JWTError,jwt
from dotenv import load_dotenv
from datetime import datetime,timedelta
from fastapi import HTTPException
load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM="HS256"
ACCESS_MINUTES=int(os.getenv("ACCESS_MINUTES"))
class Security:

    def __init__(self):

        self.pwdContext = CryptContext(schemes=["bcrypt"])

    def hashedPassword(self,password:str)->str:
        return self.pwdContext.hash(password)

    def verifyPassword(self,plainPassword:str,hashPassword:str)->bool:
        return self.pwdContext.verify(plainPassword,hashPassword)

    def createAccessToken(self,data:dict)->str:
        
        payload = data.copy()

        payload["exp"] = (datetime.utcnow()+timedelta(minutes=ACCESS_MINUTES))

        payload["type"] = "access"

        return  jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)

    def decodeToken(self,token:str):
        try:
            return jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        
        except JWTError:
            return None
        
    def createVerificationToken(self,data:dict)->str:
        
        payload = data.copy()

        payload["type"] = "verification"

        return  jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)

    def createResetToken(self,data:dict):
        
        payload = data.copy()

        payload["exp"] = (datetime.utcnow()+timedelta(minutes=ACCESS_MINUTES))

        payload["type"] = "reset"

        return  jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)


    def authenticateUser(self,authorization:str):    

        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(401,"Invalid acess.")
        
        token=authorization.split(" ")[1]

        return self.decodeToken(token)

security = Security()