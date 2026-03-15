from fastapi import FastAPI
from app.core.database import Base, engine

# Import models once so they are registered
import app.models.user
import app.models.station

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

# Routers
from app.routes import user
app.include_router(user.router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "Backend is running"}
