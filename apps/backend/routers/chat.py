from fastapi import APIRouter,Query,HTTPException,Request,Depends
from services import supabase

router = APIRouter()

@router.get("/allChatHeadings")
async def getAllChatHeadings(username:str = Query(...)):
    try:
        user_id = supabase.table("users").select("id").eq("email",username).execute()
        return supabase.table("chats").select("id,company").eq("user_id",user_id.data[0]["id"]).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail = f"not able to get the chat headings: {str(e)}")
    
