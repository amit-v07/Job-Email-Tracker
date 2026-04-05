from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import Email, OAuthToken
from routers import auth, emails
import scheduler

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Email Tracker API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(emails.router, prefix="/emails", tags=["Emails"])

@app.on_event("startup")
def startup_event():
    scheduler.start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown_scheduler()

@app.get("/")
def root():
    return {"message": "Job Tracker API is running."}
