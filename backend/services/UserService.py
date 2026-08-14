from mega.client import MegaNzClient
from mega.errors import RequestError
from services.KubernetesService import KubernetesService
from fastapi import HTTPException
from cores.Security import security


class UserService:

    @staticmethod
    async def connectCloud(Cemail: str, Cpassword: str, userRepo, currentUser):

        email = currentUser["sub"]

        if not Cemail or not Cpassword:
            raise HTTPException(status_code=400, detail="Cloud email and password are required.")

        try:
            async with MegaNzClient() as mega:
                await mega.login(Cemail, Cpassword)
                await userRepo.saveCloud(email, Cemail, Cpassword)

                filesystem = await mega.get_filesystem()
                data = filesystem.dump()

                files = []

                for file_id, node in data["nodes"].items():
                    if node.get("type") == "file":
                        name = node.get("attributes", {}).get("name")

                        if name:
                            files.append({
                                "fileId": file_id,
                                "fileName": name
                            })

                return files

        except RequestError as exc:
            raise HTTPException(
                status_code=401,
                detail="MEGA login failed. Please check the email and password and try again."
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to connect to cloud storage: {str(exc)}"
            ) from exc

    @staticmethod
    async def getCloudDatasets(currentUser, userRepo):
        email = currentUser["sub"]
        user_doc = await userRepo.getCloud(email)

        if not user_doc or "cloud" not in user_doc:
            raise HTTPException(status_code=400, detail="Cloud storage is not connected. Please connect your MEGA account first in the Cloud Storage page.")

        cloud_data = user_doc["cloud"]
        if "cloudEmail" not in cloud_data or "cloudPassword" not in cloud_data:
            raise HTTPException(status_code=400, detail="Invalid cloud storage credentials. Please reconnect your cloud storage.")

        try:
            async with MegaNzClient() as mega:
                await mega.login(cloud_data["cloudEmail"], cloud_data["cloudPassword"])
                filesystem = await mega.get_filesystem()
                data = filesystem.dump()

                files = []
                for file_id, node in data["nodes"].items():
                    if node.get("type") == "file":
                        name = node.get("attributes", {}).get("name")
                        if name:
                            files.append({
                                "fileId": file_id,
                                "fileName": name
                            })

                return files

        except RequestError as exc:
            raise HTTPException(
                status_code=401,
                detail="MEGA login failed. Please reconnect your cloud storage."
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to refresh datasets: {str(exc)}"
            ) from exc
    
    @staticmethod
    async def process(currentUser, fileId, userRepo):
        userEmail = currentUser["sub"]

        user_doc = await userRepo.getCloud(userEmail)

        if not user_doc or "cloud" not in user_doc:
            raise HTTPException(status_code=400, detail="Cloud storage is not connected. Please connect your MEGA account first in the Cloud Storage page.")

        cloud_data = user_doc["cloud"]
        if "cloudEmail" not in cloud_data or "cloudPassword" not in cloud_data:
            raise HTTPException(status_code=400, detail="Invalid cloud storage credentials. Please reconnect your cloud storage.")

        try:
            kubernetesService = KubernetesService()
            result = kubernetesService.createProcessingJob(
                cloud_data["cloudEmail"],
                cloud_data["cloudPassword"],
                fileId
            )

            return {
                "message": "Dataset processing started",
                "fileId": fileId,
                "jobId": result["jobId"]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start processing job: {str(e)}")