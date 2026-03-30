from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Routers
from app.routes import user, auth, water, search, water_station, report, alert, collaboration, ngo_stations

# Database
from app.core.database import engine, Base

# Models (imported to register with SQLAlchemy)
from app.models import user as user_model
from app.models import water_reading
from app.models import water_station as water_station_model
from app.models import station_readings
from app.models import search as search_model
from app.models import report as report_model
from app.models import alert as alert_model   # ✅ FIXED (renamed)

from app.models import collaboration as collaboration_model# FastAPI App
from app.models import ngo_station as ngo_station
app = FastAPI(
    title="AquaWatch API",
    description="Water Quality Monitoring System Backend API",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files (Uploads)
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Create DB Tables
Base.metadata.create_all(bind=engine)

# Include Routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(user.router, tags=["Users"])
app.include_router(water.router, tags=["Water"])
app.include_router(search.router, tags=["Search"])
app.include_router(water_station.router, tags=["Water Stations"])
app.include_router(report.router, tags=["Reports"])
app.include_router(alert.router, prefix="/alerts", tags=["Alerts"])  # ✅ now works
app.include_router(collaboration.router, tags=["Collaborations"])
app.include_router(ngo_stations.router) 


def home():
    return {"message": "Backend is running successfully!"}

# Health Check
@app.get("/health")
def health():
    return {"status": "healthy"}
 