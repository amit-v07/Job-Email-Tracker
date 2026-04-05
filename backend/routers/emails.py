from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from models import Email
from services import gmail_fetcher

router = APIRouter()

class EmailUpdate(BaseModel):
    status: Optional[str] = None
    is_unread: Optional[bool] = None
    snoozed_until: Optional[datetime] = None

@router.get("/")
def get_emails(
    account: Optional[str] = None,
    status: Optional[str] = None,
    is_unread: Optional[bool] = None,
    has_links: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Email)
    
    # Do not return snoozed emails that haven't expired
    now = datetime.now(timezone.utc)
    query = query.filter((Email.snoozed_until == None) | (Email.snoozed_until <= now))

    if account and account != 'All':
        # To handle lowercasing on frontend/backend matching
        query = query.filter(Email.account == account.lower())
    if status and status != 'All':
        query = query.filter(Email.status == status)
    if is_unread is not None:
        query = query.filter(Email.is_unread == is_unread)
    
    # We soft delete by setting status to 'Dismissed'
    query = query.filter(Email.status != 'Dismissed')
    
    emails = query.order_by(Email.received_at.desc()).all()

    if has_links:
        emails = [e for e in emails if len(e.urls) > 0]
        
    return emails

@router.get("/snoozed")
def get_snoozed_emails(db: Session = Depends(get_db)):
    emails = db.query(Email).filter(Email.snoozed_until > datetime.now(timezone.utc)).all()
    return emails

@router.patch("/{email_id}")
def update_email(email_id: int, payload: EmailUpdate, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    if payload.status is not None:
        email.status = payload.status
    if payload.is_unread is not None:
        email.is_unread = payload.is_unread
    if payload.snoozed_until is not None:
        email.snoozed_until = payload.snoozed_until
        
    db.commit()
    db.refresh(email)
    return email

@router.delete("/{email_id}")
def dismiss_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    email.status = 'Dismissed'
    db.commit()
    return {"message": "Email dismissed"}

@router.post("/fetch")
def fetch_emails(db: Session = Depends(get_db)):
    try:
        new_work = gmail_fetcher.fetch_new_emails(db, 'work')
        new_personal = gmail_fetcher.fetch_new_emails(db, 'personal')
        return {"fetched": new_work + new_personal}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
