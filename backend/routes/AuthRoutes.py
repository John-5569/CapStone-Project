from fastapi import APIRouter, Depends
from models.UserRequest import UserRequest, UserEmail, PasswordReset
from repositories.UserRepository import UserRepository
from services.AuthService import AuthService
from cores.Database import database



router = APIRouter(prefix = "/auth", tags = ["Authentication"])

def authDependency():
    userRepo = UserRepository(database["users"])
    return AuthService(userRepo)
    

@router.post("/register")
async def register(user:UserRequest, authService = Depends(authDependency)):

    return await authService.register(user.email,user.password)

@router.get("/verify/{token}")
@router.get("/verify-email/{token}")
async def verify(token:str, authService = Depends(authDependency)):

    return await authService.verify(token)

@router.post("/login")
async def login(user:UserRequest, authService = Depends(authDependency)):
   
   return await authService.login(user)


@router.post("/forgotpassword")
async def forgotpassword(user:UserEmail, authService = Depends(authDependency)):

    return  await authService.forgotpassword(user.email)

@router.post("/resetpassword/{token}")
async def resetpassword(token:str,password:PasswordReset, authService = Depends(authDependency)):

    data={"token":token,"newPassword":password.newPassword}

    return await authService.resetpassword(data)



    
    