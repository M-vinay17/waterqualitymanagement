from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Routers
from app.routes import (
    user,
    auth,
    water,
    search,
    water_station,
    report,
    alert,
    websocket,
    predictive_alerts,
    collaboration,
    ngo_stations,
    station_readings
)

# Services
from app.services.ws_manager import ws_manager

# Database
from app.core.database import engine, Base

# Models (register with SQLAlchemy)
from app.models import (
    user as user_model,
    water_reading,
    water_station as water_station_model,
    station_readings as station_readings_model,
    search as search_model,
    report as report_model,
    alert as alert_model,
    collaboration as collaboration_model,
    ngo_station as ngo_station_model,
)

# FastAPI App
app = FastAPI(
    title="AquaWatch API",
    description="Water Quality Monitoring System Backend API",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change in production
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
app.include_router(alert.router, prefix="/alerts", tags=["Alerts"])

# Collaboration & NGO related routes
app.include_router(collaboration.router, tags=["Collaborations"])
app.include_router(ngo_stations.router, tags=["NGO Stations"])
app.include_router(station_readings.router, tags=["Station Readings"])

# Websocket & Predictive Alerts
app.include_router(websocket.router, tags=["WebSocket"])
app.include_router(predictive_alerts.router, prefix="/api/v1", tags=["Predictive Alerts"])

# Home Route
@app.get("/")
def home():
    return {"message": "AquaWatch Backend is running successfully!"}


# Health Check
@app.get("/health")
def health():
    return {"status": "healthy"}