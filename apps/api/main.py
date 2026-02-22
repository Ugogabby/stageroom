from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, UPLOAD_DIR
from database import engine, Base
from routers import auth, plans, attempts, grading, progress

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StageRoom API",
    version="1.0.0",
    description="Performance training platform backend",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads folder for serving media files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(attempts.router)
app.include_router(grading.router)
app.include_router(progress.router)


@app.on_event("startup")
def auto_seed():
    """Auto-seed if no plans exist."""
    from database import SessionLocal
    from models import DailyPlan
    db = SessionLocal()
    try:
        count = db.query(DailyPlan).count()
        if count == 0:
            print("No plans found — running auto-seed...")
            from scripts.seed import seed
            seed()
            print("Auto-seed complete.")
        else:
            print(f"Database has {count} plans — skipping seed.")
    except Exception as e:
        print(f"Auto-seed check failed: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"service": "StageRoom API", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"ok": True}