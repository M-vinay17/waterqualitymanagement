from fastapi import FastAPI
from app.routes import user, auth
from app.core.database import engine, Base
from app.models import user as user_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth.router)
app.include_router(user.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "✅ Backend is running successfully!"}