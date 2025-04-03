from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from routers import auth_router,chat_router
from services import AuthMiddleware
import os
from dotenv import load_dotenv 
load_dotenv()

app = FastAPI()

app.add_middleware(AuthMiddleware)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "supersecretkey"),
    session_cookie="session_id",
    max_age=3600,
)



print("Middlewares added successfully.")
app.include_router(auth_router, prefix="/auth")
app.include_router(chat_router, prefix="/chat")


