from fastapi import APIRouter,Query,Form,HTTPException,Request,Depends
from services import supabase
from routers.files import delete_file

router = APIRouter()

@router.get("/allChatHeadings")
async def getAllChatHeadings(username:str = Query(...)):
    try:
        user_id = supabase.table("users").select("id").eq("email",username).execute()
        return supabase.table("chats").select("id,company").eq("user_id",user_id.data[0]["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail = f"not able to get the chat headings: {str(e)}")
    

@router.get("/chatHistory")
async def getChatHistory(request:Request,chat_id:int = Query(...)):
    try:
        session = request.session
        username = session.get("username")
        user_id = supabase.table("users").select("id").eq("email",username).execute()
        chat_history = supabase.table("chats").select("chat_history").eq("id",chat_id).eq("user_id",user_id.data[0]["id"]).execute()
        print("chat history- ",chat_history)
        return chat_history.data[0]["chat_history"]
    except Exception as e:
        raise HTTPException(status_code=400, detail = f"not able to get the chat history: {str(e)}")
    
@router.post("/createChat")
async def createChat(request:Request,company:str = Form(...)):
    try:
        session = request.session
        username = session.get("username")
        user_id = supabase.table("users").select("id").eq("email",username).execute()
        data = {
            "user_id": user_id.data[0]["id"],
            "company": company,
            "chat_history": []
        }
        response = supabase.table("chats").insert(data).execute()
        return supabase.table("chats").select("id,company").eq("user_id",user_id.data[0]["id"]).eq("company", company).eq("chat_history", []).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail = f"not able to create the chat: {str(e)}")
    

@router.delete("/deleteChat")
async def deleteChat(chatID:int = Query(...)):
    try:
        # delete chat files from gcs blob storage and file embeddings from the vector db and files metadata from supabase-
        files_ids = supabase.table("files").select("id").eq("chat_id", chatID).execute()
        for file in files_ids.data:
            await delete_file(file["id"])

        # delete chat history from supabase-
        supabase.table("chats").delete().eq("id", chatID).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail = f"not able to delete the chat: {str(e)}")