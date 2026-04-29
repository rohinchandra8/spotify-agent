from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from server.agent import chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://open.spotify.com", "http://localhost:*", "*"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/api/chat")
async def handle_chat(body: ChatRequest):
    try:
        reply, updated_history = chat(body.message, body.history)
        return {"reply": reply, "history": updated_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
