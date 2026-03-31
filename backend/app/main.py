from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Routers
# Routers — add this import at the top with the others
from app.routes import user, auth, water, search, water_station, report, alert, websocket, predictive_alerts

#services
from app.services.ws_manager import ws_manager

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
from app.routes import collaboration
from app.routes import station_readings


# FastAPI App
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
app.include_router(websocket.router, tags=["WebSocket"])    
app.include_router(predictive_alerts.router, prefix="/api/v1", tags=["Predictive Alerts"])
app.include_router(collaboration.router)
app.include_router(station_readings.router)

# Root Endpoint
@app.get("/")
def home():
    return {"message": "Backend is running successfully!"}

# Health Check
@app.get("/health")
def health():
    return {"status": "healthy"}