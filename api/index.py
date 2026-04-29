from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    return {"reply": f"Echo: {body.message}", "history": body.history}
