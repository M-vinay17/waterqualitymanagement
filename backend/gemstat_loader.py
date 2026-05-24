"""
gemstat_loader.py
-----------------
Loads selected GEMS/Water quality CSV files into PostgreSQL.

Usage:
    python gemstat_loader.py

Requirements:
    pip install pandas sqlalchemy psycopg2-binary python-dotenv tqdm

.env file:
    DATABASE_URL=postgresql://username:password@localhost:5432/your_db_name

Folder path: Update DATA_DIR below to match your extracted folder path.
"""

import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

# ---------------------------------------------------------------------------
# Config — update this path
# ---------------------------------------------------------------------------
DATA_DIR = r"C:\Users\mvina\OneDrive\Documents\GFQA_v3"

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/water_quality_db")

# ---------------------------------------------------------------------------
# CSV files to load — nee project ki relevant ones only
# ---------------------------------------------------------------------------
PARAMETER_FILES = [
    "pH",
    "Temperature",
    "Dissolved_Gas",
    "Oxygen_Demand",
    "Electrical_Conductance",
    "Alkalinity",
    "Hardness",
    "Optical",               # Turbidity ikkade untundi
    "Iron",
    "Lead",
    "Arsenic",
    "Fluoride",
    "Manganese",
    "Copper",
    "Zinc",
    "Oxidized_Nitrogen",     # Nitrate, Nitrite
    "Other_Nitrogen",        # Ammonia
    "Phosphorus",
    "Indicator_Organism",    # E.Coli, Coliform
    "Water",                 # TDS, Salinity
]

METADATA_FILES = [
    "GEMStat_station_metadata",
    "GEMStat_parameter_metadata",
    "GEMStat_methods_metadata",
]

# ---------------------------------------------------------------------------
# DB Setup
# ---------------------------------------------------------------------------
def get_engine():
    engine = create_engine(DATABASE_URL)
    return engine


def create_tables(engine):
    """Create tables if they don't exist."""
    with engine.connect() as conn:
        # Station metadata table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS gemstat_stations (
                station_id      VARCHAR(50) PRIMARY KEY,
                station_name    TEXT,
                country         TEXT,
                latitude        DOUBLE PRECISION,
                longitude       DOUBLE PRECISION,
                water_body      TEXT,
                water_body_type TEXT
            )
        """))

        # Parameter metadata table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS gemstat_parameters (
                parameter_code  VARCHAR(50) PRIMARY KEY,
                parameter_name  TEXT,
                unit            TEXT,
                category        TEXT
            )
        """))

        # Main measurements table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS gemstat_measurements (
                id              SERIAL PRIMARY KEY,
                station_id      VARCHAR(50),
                parameter_code  VARCHAR(50),
                parameter_name  TEXT,
                sample_date     DATE,
                value           DOUBLE PRECISION,
                unit            TEXT,
                data_quality    TEXT,
                source_file     TEXT
            )
        """))

        # Index for fast queries
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_measurements_station
            ON gemstat_measurements(station_id)
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_measurements_parameter
            ON gemstat_measurements(parameter_code)
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_measurements_date
            ON gemstat_measurements(sample_date)
        """))

        conn.commit()
    print("✅ Tables created successfully.")


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------
def load_station_metadata(engine):
    filepath = os.path.join(DATA_DIR, "GEMStat_station_metadata.csv")
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return

    df = pd.read_csv(filepath, encoding="latin-1", low_memory=False)

    # Rename actual CSV columns to standard names
    df = df.rename(columns={
        "GEMS Station Number":  "station_id",
        "Station Identifier":   "station_name",
        "Country Name":         "country",
        "Latitude":             "latitude",
        "Longitude":            "longitude",
        "Water Body Name":      "water_body",
        "Water Type":           "water_body_type",
    })

    # Keep only relevant columns
    keep = ["station_id", "station_name", "country", "latitude", "longitude", "water_body", "water_body_type"]
    keep = [c for c in keep if c in df.columns]
    df = df[keep].drop_duplicates(subset=["station_id"])

    df.to_sql("gemstat_stations", engine, if_exists="replace", index=False)
    print(f"✅ Stations loaded: {len(df)} rows")


def load_parameter_metadata(engine):
    filepath = os.path.join(DATA_DIR, "GEMStat_parameter_metadata.csv")
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return

    df = pd.read_csv(filepath, encoding="latin-1", low_memory=False)
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
    df.to_sql("gemstat_parameters", engine, if_exists="replace", index=False)
    print(f"✅ Parameters metadata loaded: {len(df)} rows")


def load_measurement_file(engine, filename):
    """Load a single parameter CSV into gemstat_measurements table."""
    filepath = os.path.join(DATA_DIR, f"{filename}.csv")
    if not os.path.exists(filepath):
        print(f"⚠️  Skipping (not found): {filename}.csv")
        return 0

    try:
        df = pd.read_csv(filepath, encoding="latin-1", low_memory=False)
        df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

        # Flexible column mapping for measurement files
        col_map = {
            "station_id":      ["station_id", "stationid", "site_id"],
            "parameter_code":  ["parameter_code", "parametercode", "param_code", "code"],
            "parameter_name":  ["parameter_name", "parametername", "param_name", "parameter"],
            "sample_date":     ["sample_date", "sampledate", "date", "analysis_date"],
            "value":           ["value", "result", "measurement", "concentration"],
            "unit":            ["unit", "units", "unit_of_measure"],
            "data_quality":    ["data_quality", "quality", "quality_flag", "flag"],
        }

        renamed = {}
        for standard, candidates in col_map.items():
            for c in candidates:
                if c in df.columns:
                    renamed[c] = standard
                    break

        df = df.rename(columns=renamed)
        df["source_file"] = filename

        # Keep only known columns
        keep = [c for c in col_map.keys() if c in df.columns] + ["source_file"]
        df = df[keep]

        # Parse date
        if "sample_date" in df.columns:
            df["sample_date"] = pd.to_datetime(df["sample_date"], errors="coerce").dt.date

        # Parse value as numeric
        if "value" in df.columns:
            df["value"] = pd.to_numeric(df["value"], errors="coerce")

        # Drop rows with no value
        df = df.dropna(subset=["value"])

        # Load in chunks to avoid memory issues (dataset is large)
        chunk_size = 50_000
        total = 0
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i:i + chunk_size]
            chunk.to_sql(
                "gemstat_measurements",
                engine,
                if_exists="append",
                index=False,
                method="multi"
            )
            total += len(chunk)

        return total

    except Exception as e:
        print(f"❌ Error loading {filename}: {e}")
        return 0


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("  GEMS/Water Quality Data Loader")
    print("=" * 60)

    engine = get_engine()

    # Test DB connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connected successfully.\n")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Check your DATABASE_URL in .env file.")
        return

    # Create tables
    create_tables(engine)

    # Load metadata
    print("\n📋 Loading metadata files...")
    load_station_metadata(engine)
    load_parameter_metadata(engine)

    # Load measurement files
    print(f"\n📊 Loading {len(PARAMETER_FILES)} parameter files...")
    total_rows = 0
    for filename in tqdm(PARAMETER_FILES, desc="Loading CSVs"):
        rows = load_measurement_file(engine, filename)
        if rows:
            print(f"   ✅ {filename}: {rows:,} rows")
            total_rows += rows

    print(f"\n{'=' * 60}")
    print(f"  ✅ Done! Total measurements loaded: {total_rows:,}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()