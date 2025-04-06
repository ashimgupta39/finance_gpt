from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime, timedelta
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
from supabase import create_client, Client
from dotenv import load_dotenv
from services import supabase
import os
from urllib.parse import urlencode
from fastapi.responses import RedirectResponse
load_dotenv()
router = APIRouter()

# Configure OAuth
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params={"prompt": "consent", "access_type": "offline"},
    access_token_url="https://oauth2.googleapis.com/token",
    access_token_params=None,
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/login")
async def login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="GOOGLE_REDIRECT_URI is not set")

    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")

        email = user_info.get("email")
        name = user_info.get("name")
        pic_url = user_info.get("picture")

        request.session["username"] = email
        request.session["expire_at"] = (datetime.now() + timedelta(hours=1)).isoformat()
        # Check if the user already exists in the Supabase DB
        response = supabase.table("users").select("*").eq("email", email).execute()
        existing_users = response.data if response.data else []

        if not existing_users:
            # Insert the new user into the database
            data = {
                "email": email,
                "name": name,
                "profile_pic_url":pic_url
            }
            insert_response = supabase.table("users").insert(data).execute()

        # Build frontend redirect URL
        frontend_url = os.getenv("FRONTEND_REDIRECT_URL")
        params = urlencode({
            "token": token["access_token"],
            "name": name,
            "email": email,
            "pic": pic_url,
        })
        redirect_url = f"{frontend_url}?{params}"

        return RedirectResponse(url=redirect_url)
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth callback failed: {str(e)}")
