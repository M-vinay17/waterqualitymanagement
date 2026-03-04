from fastapi import FastAPI
from app.routes import user, auth, water
from app.core.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

# Import models so tables are registered
from app.models.user import User
# ... other imports ...
from app.models.water_station import WaterStation
from app.models.station_readings import StationReading

# Your existing code...

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(water.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "✅ Backend is running successfully!"}