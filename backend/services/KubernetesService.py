from kubernetes import client, config
from kubernetes.client.exceptions import ApiException
from fastapi import HTTPException
import re
import os
import sys
import subprocess


class KubernetesService:

    def __init__(self):
        self.k8s_available = False
        try:
            # Used when FastAPI runs inside Kubernetes
            config.load_incluster_config()
            self.k8s_available = True
        except Exception:
            try:
                # Used when FastAPI runs locally with active kube-config
                config.load_kube_config()
                self.k8s_available = True
            except Exception as e:
                print(f"[KubernetesService] Warning: Could not load kube-config ({e}). Running in local fallback mode.")
                self.k8s_available = False

        if self.k8s_available:
            try:
                self.batch_api = client.BatchV1Api()
                self.core_api = client.CoreV1Api()
            except Exception:
                self.k8s_available = False


    def createProcessingJob(
        self,
        email: str,
        password: str,
        fileId: str
    ):

        # RFC 1123 compliant naming (lowercase alphanumeric and hyphens only)
        clean_file_id = re.sub(r'[^a-z0-9-]', '', str(fileId).lower())
        if not clean_file_id:
            clean_file_id = "dataset"

        job_name = f"processing-{clean_file_id}"[:63].rstrip('-')
        secret_name = f"cloud-{clean_file_id}"[:63].rstrip('-')

        if self.k8s_available:
            # ------------------------------------------------
            # 1. Create Kubernetes Secret
            # ------------------------------------------------
            secret = client.V1Secret(
                metadata=client.V1ObjectMeta(name=secret_name),
                type="Opaque",
                string_data={
                    "email": email,
                    "password": password
                }
            )

            try:
                self.core_api.create_namespaced_secret(
                    namespace="default",
                    body=secret
                )
            except ApiException as e:
                if e.status == 409:
                    try:
                        self.core_api.replace_namespaced_secret(
                            name=secret_name,
                            namespace="default",
                            body=secret
                        )
                    except Exception as ex:
                        print(f"[KubernetesService] Replace secret warning: {ex}")
                else:
                    print(f"[KubernetesService] Secret creation warning: {e}")
            except Exception as e:
                print(f"[KubernetesService] Secret creation connection error: {e}")

            # ------------------------------------------------
            # 2. Container
            # ------------------------------------------------
            container = client.V1Container(
                name="dataset-processor",
                image="johnsudhakar/dataset-processor:latest",
                image_pull_policy="Always",
                env=[
                    client.V1EnvVar(name="FILE_ID", value=str(fileId)),
                    client.V1EnvVar(
                        name="CLOUD_EMAIL",
                        value_from=client.V1EnvVarSource(
                            secret_key_ref=client.V1SecretKeySelector(
                                name=secret_name,
                                key="email"
                            )
                        )
                    ),
                    client.V1EnvVar(
                        name="CLOUD_PASSWORD",
                        value_from=client.V1EnvVarSource(
                            secret_key_ref=client.V1SecretKeySelector(
                                name=secret_name,
                                key="password"
                            )
                        )
                    )
                ]
            )

            # ------------------------------------------------
            # 3. Pod & Job Spec
            # ------------------------------------------------
            pod_spec = client.V1PodSpec(
                restart_policy="Never",
                containers=[container]
            )

            job = client.V1Job(
                metadata=client.V1ObjectMeta(name=job_name),
                spec=client.V1JobSpec(
                    backoff_limit=2,
                    ttl_seconds_after_finished=3600,
                    template=client.V1PodTemplateSpec(
                        metadata=client.V1ObjectMeta(
                            labels={
                                "app": "dataset-processor",
                                "file-id": str(fileId)
                            }
                        ),
                        spec=pod_spec
                    )
                )
            )

            # ------------------------------------------------
            # 4. Create Job on Kubernetes
            # ------------------------------------------------
            try:
                response = self.batch_api.create_namespaced_job(
                    namespace="default",
                    body=job
                )
                return {
                    "jobId": response.metadata.name,
                    "fileId": fileId,
                    "status": "processing"
                }
            except Exception as e:
                print(f"[KubernetesService] K8s cluster job creation error: {e}. Falling back to direct python processor execution.")

        # ----------------------------------------------------
        # Fallback: Run processor.py directly in Python
        # when Kubernetes cluster is offline locally
        # ----------------------------------------------------
        try:
            env = os.environ.copy()
            env["FILE_ID"] = str(fileId)
            env["CLOUD_EMAIL"] = str(email)
            env["CLOUD_PASSWORD"] = str(password)

            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            processor_script = os.path.join(backend_dir, "dataset-processor", "processor.py")

            if os.path.exists(processor_script):
                print(f"[KubernetesService] Launching background processor script: {processor_script}")
                subprocess.Popen([sys.executable, processor_script], env=env)
            else:
                print(f"[KubernetesService] Processor script not found at {processor_script}")
        except Exception as ex:
            print(f"[KubernetesService] Error launching local fallback processor: {ex}")

        return {
            "jobId": job_name,
            "fileId": fileId,
            "status": "processing"
        }

    def getProcessingJobStatus(self, jobId: str):

        if not self.k8s_available:
            return None

        try:
            job = self.batch_api.read_namespaced_job_status(
                name=jobId,
                namespace="default"
            )
            status = job.status

            if status.succeeded and status.succeeded > 0:
                return {"status": "COMPLETED", "progress": 100}

            if status.failed and status.failed > 0:
                return {"status": "FAILED", "progress": 100}

            if status.active and status.active > 0:
                return {"status": "RUNNING", "progress": 50}

            return {"status": "PENDING", "progress": 0}
        except ApiException:
            return None
        except Exception:
            return None