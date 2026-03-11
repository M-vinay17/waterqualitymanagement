from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import user, auth, water, search
from app.core.database import engine, Base

# Import models so tables are created
from app.models import user as user_model
from app.models import water_reading
from app.models import water_station
from app.models import station_readings
from app.models import search as search_model
from app.models import report as report_model

# Import routes
from app.routes import water_station, report

app = FastAPI(
    title="AquaWatch API",
    description="Water Quality Monitoring System Backend API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(water.router)
app.include_router(search.router)
app.include_router(water_station.router)
app.include_router(report.router)

# Root endpoints
@app.get("/")
def home():
    return {"message": "Backend is running successfully!"}

@app.get("/health")
def health():
    return {"status": "healthy"}