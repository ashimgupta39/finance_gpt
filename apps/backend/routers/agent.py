from fastapi import APIRouter, Query, Form, HTTPException, Request, Depends
from services import supabase
from services import agent_processor

router = APIRouter()
agent = agent_processor()


@router.post("/query")
async def get_response(query: str = Form(...), chat_id: int = Form(...)):
    try:
        chat_history = (
            supabase.table("chats")
            .select("chat_history,company")
            .eq("id", chat_id)
            .execute()
        )
        if not chat_history.data:
            raise HTTPException(status_code=404, detail="Chat not found")
        response = agent.run_agent(
            query,
            chat_history.data[0]["chat_history"],
            chat_history.data[0]["company"],
        )
        # update chat history in the database
        new_chat_block = {"user": query, "finance_gpt": response}
        chat_history.data[0]["chat_history"].append(new_chat_block)
        supabase.table("chats").update(
            {"chat_history": chat_history.data[0]["chat_history"]}
        ).eq("id", chat_id).execute()
        return response
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error retrieving chat history: {str(e)}"
        )
