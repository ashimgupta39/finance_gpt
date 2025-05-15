from fastapi import UploadFile, HTTPException
from google.cloud import storage
import os

class gcs_processor:
    def __init__(self):
        BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
        self.BUCKET_NAME = BUCKET_NAME
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.bucket(BUCKET_NAME)

    def upload_file(self, file: UploadFile, destination_blob_name: str) -> str:
        try:
            blob = self.bucket.blob(destination_blob_name)
            blob.upload_from_file(file.file, content_type=file.content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GCS Upload Error: {str(e)}")
    
    def delete_file(self, file_name: str) -> None:
        try:
            blob = self.bucket.blob(file_name)
            blob.delete()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GCS Delete Error: {str(e)}")