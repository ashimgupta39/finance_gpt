from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from google.cloud import storage
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv
from services import supabase,gcs_processor

load_dotenv()
router = APIRouter()
gcs_processor = gcs_processor()

@router.post("/uploadPdfFile")
async def upload_pdf_file(file: UploadFile = File(...),date_associated: str = Form(...), chat_id: str = Form(...)):
    try:
        datetime.strptime(date_associated, "%m-%d-%Y")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use MM-DD-YYYY.")

    file_id = str(uuid.uuid4())
    filename = f"{file.filename}_{file_id}"

    gcs_url=gcs_processor.upload_file(file, filename)

    if not gcs_url:
        raise HTTPException(status_code=500, detail="Failed to upload file to GCS.")
    
    data = {
        "id": file_id,
        "chat_id": chat_id,
        "file_type": "PDF",
        "file_name": filename,
        "gcs_url": gcs_url,
        "date_associated": date_associated
    }
    response = supabase.table("files").insert(data).execute()
    return JSONResponse(content={"message": "File uploaded successfully", "file_id": file_id}, status_code=201)






