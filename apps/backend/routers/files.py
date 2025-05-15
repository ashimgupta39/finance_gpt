from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from google.cloud import storage
from datetime import datetime
import uuid
from io import BytesIO
# from starlette.datastructures import UploadFile as StarletteUploadFile
import os
from dotenv import load_dotenv
from services import supabase,gcs_processor,embeddings_processor

load_dotenv()
router = APIRouter()
gcs_processor = gcs_processor()
embeddings_processor = embeddings_processor()

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
    try:
        embeddings_processor.insert_embedding(file,date_associated,chat_id,file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing embeddings: {str(e)}")
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

@router.post("/uploadTextFile")
async def upload_text_file(text: str = Form(...),file_name: str = Form(...), date_associated: str = Form(...), chat_id: str = Form(...)):
    try:
        datetime.strptime(date_associated, "%m-%d-%Y")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use MM-DD-YYYY.")

    file_id = str(uuid.uuid4())
    filename = f"{file_name}_{file_id}.txt"
    file_bytes = BytesIO(text.encode("utf-8"))
    upload_file = UploadFile(filename=filename, file=file_bytes)
    gcs_url=gcs_processor.upload_file(upload_file, filename)
    if not gcs_url:
        raise HTTPException(status_code=500, detail="Failed to upload file to GCS.")
    try:
        embeddings_processor.insert_embedding(text,date_associated,chat_id,file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing embeddings: {str(e)}")
    data = {
        "id": file_id,
        "chat_id": chat_id,
        "file_type": "TEXT",
        "file_name": filename,
        "gcs_url": gcs_url,
        "date_associated": date_associated
    }
    response = supabase.table("files").insert(data).execute()
    return JSONResponse(content={"message": "Text File uploaded successfully", "file_id": file_id}, status_code=201)

@router.get("/getFiles")
async def get_files(chatID: str = Query(...)):
    files = supabase.table("files").select("*").eq("chat_id", chatID).execute()
    print("files data: ", files)
    return files.data

@router.delete("/deleteFile")
async def delete_file(fileID: str = Query(...)):
    file_details = supabase.table("files").select("*").eq("id", fileID).execute()
    if not file_details.data:
        raise HTTPException(status_code=404, detail="File not found.")
    file_details = file_details.data[0]
    file_name = file_details["file_name"]
    gcs_processor.delete_file(file_name)
    embeddings_processor.delete_embedding(fileID)
    supabase.table("files").delete().eq("id", fileID).execute()







