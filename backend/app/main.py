from fastapi import FastAPI
from app.routes import user
from app.core.database import engine, Base
from app.models import user as user_model
from app.models import report as report_model
from app.models import water_station as water_station_model
from app.routes import water_station, report

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Include routes
app.include_router(user.router)
app.include_router(water_station.router)
app.include_router(report.router)