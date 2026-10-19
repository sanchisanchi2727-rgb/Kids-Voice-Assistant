from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow your frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "KODA backend is working!"
    }


@app.post("/chat")
async def chat(audio: UploadFile = File(...)):
    return {
        "message": "Audio received successfully!",
        "filename": audio.filename
    }