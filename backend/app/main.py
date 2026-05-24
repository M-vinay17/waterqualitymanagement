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
from app.services.ws_manager import manager as ws_manager
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

# ── Routers ───────────────────────────────────────────────────────────────────
# NOTE: Routers that already define prefix= in their file → NO prefix here
#       Routers with no prefix in their file → prefix added here

app.include_router(auth.router)                                                 # prefix="/auth"        defined in router
app.include_router(user.router)                                                 # prefix="/users"       defined in router
app.include_router(water.router)                                                # prefix="/water"       defined in router
app.include_router(search.router)                                               # prefix="/search"      defined in router
app.include_router(water_station.router)                                        # prefix="/water-stations" defined in router
app.include_router(report.router)                                               # prefix="/reports"     defined in router
app.include_router(collaboration.router)                                        # prefix="/api/v1/collaborations" defined in router
app.include_router(station_readings.router)                                     # prefix="/api/v1/stations/readings" defined in router

# Routers with NO prefix in their file → add prefix here
app.include_router(alert.router,             prefix="/alerts",                  tags=["Alerts"])

app.include_router(websocket.router,         prefix="/ws",                      tags=["WebSocket"])

app.include_router(ngo_stations.router,      tags=["NGO Stations"])
app.include_router(predictive_alerts.router, tags=["Predictive Alerts"])

# ── Home & Health ─────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "AquaWatch Backend is running successfully!"}


@app.get("/health")
def health():
    return {"status": "healthy"}