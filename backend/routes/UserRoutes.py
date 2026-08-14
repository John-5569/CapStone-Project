from fastapi import APIRouter, Depends, Header
from models.UserRequest import CredentialsRequest
from services.UserService import UserService
from cores.Security import security
from repositories.UserRepository import UserRepository
from cores.Database import database

router = APIRouter(prefix ="/user", tags = ["User operations"])

userRepo = UserRepository(database["users"])
def verifyUser(
    authorization: str | None = Header(default=None)
):
    return security.authenticateUser(authorization)

    
@router.post("/connect")
async def connectCloud(request: CredentialsRequest, currentUser: dict = Depends(verifyUser) ):

    return await UserService.connectCloud(request.email, request.password, userRepo, currentUser)


@router.get("/datasets")
async def getDatasets(currentUser: dict = Depends(verifyUser)):

    return await UserService.getCloudDatasets(currentUser, userRepo)


@router.post("/process/{fileId}")
async def process(fileId: str, currentUser: dict = Depends(verifyUser)):

    return await UserService.process(currentUser, fileId, userRepo)