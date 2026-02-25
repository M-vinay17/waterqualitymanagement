from fastapi import FastAPI
from app.routes import user
from app.core.database import engine, Base
from app.models import user as user_model

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(user.router)