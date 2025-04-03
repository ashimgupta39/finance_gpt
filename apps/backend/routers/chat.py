from fastapi import APIRouter,HTTPException,Request,Depends
from services import supabase

router = APIRouter()

@router.get("/allChatHeadings")
async def getAllChatHeadings(user_id:str):
    try:
        return supabase.table("chats").select("id,company").eq("user_id",user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail = f"not able to get the chat headings: {str(e)}")
    
