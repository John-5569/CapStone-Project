from mega.client import MegaNzClient
from mega.errors import RequestError
from services.KubernetesService import KubernetesService
from fastapi import HTTPException, Query
from datetime import datetime, timezone



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
    async def getCloudDatasets(page: int,limit:int, userRepo, currentUser):
        email = currentUser["sub"]

        user_doc = await userRepo.getCloud(email)

        if not user_doc or "cloud" not in user_doc:
            raise HTTPException(
                status_code=400,
                detail="Cloud storage is not connected. Please connect your MEGA account first in the Cloud Storage page."
            )

        cloud_data = user_doc["cloud"]

        if "cloudEmail" not in cloud_data or "cloudPassword" not in cloud_data:
            raise HTTPException(
                status_code=400,
                detail="Invalid cloud storage credentials. Please reconnect your cloud storage."
            )

        if page < 1:
            raise HTTPException(
                status_code=400,
                detail="Page must be greater than or equal to 1."
            )

        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=400,
                detail="Limit must be between 1 and 100."
            )

        try:
            async with MegaNzClient() as mega:

                await mega.login(
                    cloud_data["cloudEmail"],
                    cloud_data["cloudPassword"]
                )

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

                # Pagination
                total = len(files)

                start = (page - 1) * limit
                end = start + limit

                paginated_files = files[start:end]

                total_pages = (total + limit - 1) // limit

                return {
                    "data": paginated_files,
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total": total,
                        "totalPages": total_pages,
                        "hasNext": page < total_pages,
                        "hasPrevious": page > 1
                    }
                }

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

            job_record = {
                "jobId": result["jobId"],
                "fileId": fileId,
                "fileName": fileId,
                "status": "PENDING",
                "progress": 0,
                "started": datetime.now(timezone.utc).isoformat(),
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }

            await userRepo.addProcessingJob(userEmail, job_record)

            return {
                "message": "Dataset processing started",
                "fileId": fileId,
                "jobId": result["jobId"]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start processing job: {str(e)}")

    @staticmethod
    async def getProcessingStatus(currentUser, jobId, userRepo):

        userEmail = currentUser["sub"]
        job = await userRepo.getProcessingJob(userEmail, jobId)

        if not job:
            raise HTTPException(status_code=404, detail="Processing job not found.")

        if job.get("status") in ["COMPLETED", "FAILED"]:
            return {
                "jobId": jobId,
                "status": job.get("status", "PENDING"),
                "progress": job.get("progress", 0)
            }

        kubernetesService = KubernetesService()
        latest = kubernetesService.getProcessingJobStatus(jobId)

        if latest is None:
            started_str = job.get("started")
            progress = job.get("progress", 0)

            if started_str:
                try:
                    started_at = datetime.fromisoformat(started_str.replace("Z", "+00:00"))
                    elapsed_seconds = max(0, int((datetime.now(timezone.utc) - started_at).total_seconds()))
                    progress = min(100, elapsed_seconds * 10)
                except Exception:
                    progress = max(progress, 25)

            latest = {
                "status": "COMPLETED" if progress >= 100 else "RUNNING",
                "progress": 100 if progress >= 100 else progress
            }

        await userRepo.updateProcessingJob(
            userEmail,
            jobId,
            {
                "status": latest["status"],
                "progress": latest["progress"],
                "updatedAt": datetime.now(timezone.utc).isoformat()
            }
        )

        return {
            "jobId": jobId,
            "status": latest["status"],
            "progress": latest["progress"]
        }

    @staticmethod
    async def getProcessingHistory(currentUser, userRepo):

        userEmail = currentUser["sub"]
        history = await userRepo.getProcessingHistory(userEmail)

        return sorted(
            history,
            key=lambda job: job.get("started", ""),
            reverse=True
        )

    @staticmethod
    async def connectAlready(userRepo, currentUser):

        email = currentUser["sub"]

        user_doc = await userRepo.getCloud(email)

        if not user_doc or "cloud" not in user_doc:
            raise HTTPException(
                status_code=400,
                detail="Cloud storage is not connected. Please connect your MEGA account first in the Cloud Storage page."
            )

        cloud_data = user_doc["cloud"]

        if "cloudEmail" not in cloud_data or "cloudPassword" not in cloud_data:
            raise HTTPException(
                status_code=400,
                detail="Invalid cloud storage credentials. Please reconnect your cloud storage."
            )
            
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
                detail="MEGA login failed. Please check the email and password and try again."
            ) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to connect to cloud storage: {str(exc)}"
            ) from exc
