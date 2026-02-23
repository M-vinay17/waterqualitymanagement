from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routes.user import router as user_router

app = FastAPI(title="Water Quality Monitor API")

# ────────────────────── ADD / UPDATE THIS BLOCK ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user_router, prefix="/users")

@app.get("/")
def root():
    return {"message": "Backend is running"}