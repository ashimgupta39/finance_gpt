from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from datetime import datetime

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        public_paths = ["/auth/callback", "/auth/login","/docs", "/openapi.json"]
        if any(request.url.path.startswith(path) for path in public_paths):
            return await call_next(request)
        
        if "session" not in request.scope:
            print("🚨 Session not found in scope!")  # Debugging
            return JSONResponse({"error": "Session not initialized"}, status_code=500)

        session = request.session
        session_user_id = session.get("username")
        expire_at = session.get("expire_at")

        if not session_user_id:
            print("\n No username found in session!")
            return JSONResponse({"error": "Unauthorized: No username found"}, status_code=401)
        
        if expire_at:
            expire_time = datetime.fromisoformat(expire_at)
            if datetime.utcnow() > expire_time:
                print("\n Session expired!")
                return JSONResponse({"error": "Unauthorized: Session expired"}, status_code=401)

        response = await call_next(request)
        return response

