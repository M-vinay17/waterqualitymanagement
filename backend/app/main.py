from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import user, auth, water
from app.core.database import engine, Base

from app.models import user as user_model
from app.models import water_reading

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(water.router)

# CORS configuration
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

# Root endpoint
@app.get("/")
def home():
    return {"message": "Backend is running successfully!"}