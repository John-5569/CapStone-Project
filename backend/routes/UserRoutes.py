from fastapi import APIRouter, Depends, Header
from models.UserRequest import CredentialsRequest
from services.UserService import UserService
from cores.Security import security
from repositories.UserRepository import UserRepository
from cores.Database import database

router = APIRouter(prefix ="/user", tags = ["User operations"])

userRepo = UserRepository(database["users"], database["sessiions"])
def verifyUser(
    authorization: str | None = Header(default=None)
):
    return security.authenticateUser(authorization)

    
@router.post("/connect")
async def connectCloud(request: CredentialsRequest, currentUser: dict = Depends(verifyUser) ):

    return await UserService.connectCloud(request.email, request.password, userRepo, currentUser)


@router.get("/datasets")
async def getDatasets(page: int = 1, limit: int = 10, currentUser: dict = Depends(verifyUser)):

    return await UserService.getCloudDatasets(page, limit, userRepo, currentUser)


@router.post("/process/{fileId}")
async def process(fileId: str, currentUser: dict = Depends(verifyUser)):

    return await UserService.process(currentUser, fileId, userRepo)


@router.get("/job/{jobId}")
async def getProcessingStatus(jobId: str, currentUser: dict = Depends(verifyUser)):

    return await UserService.getProcessingStatus(currentUser, jobId, userRepo)


@router.get("/history")
async def getProcessingHistory(currentUser: dict = Depends(verifyUser)):

    return await UserService.getProcessingHistory(currentUser, userRepo)

@router.post("/connectAlready")
async def connectAlready(currentUser: dict = Depends(verifyUser)):

    return await UserService.connectAlready(userRepo, currentUser)

