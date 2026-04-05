from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    account = Column(String, index=True) # 'work' or 'personal'
    gmail_message_id = Column(String, unique=True, index=True)
    company = Column(String)
    sender_name = Column(String)
    sender_email = Column(String, index=True)
    subject = Column(String)
    snippet = Column(Text)
    body = Column(Text)
    urls = Column(JSON, default=list) # Store list of URLs
    status = Column(String, default="New") # New, Applied, Assessment Pending, Interview Scheduled, Rejected
    is_unread = Column(Boolean, default=True)
    snoozed_until = Column(DateTime(timezone=True), nullable=True)
    received_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OAuthToken(Base):
    __tablename__ = "oauth_tokens"

    id = Column(Integer, primary_key=True, index=True)
    account_label = Column(String, unique=True, index=True) # 'work' or 'personal'
    credentials = Column(JSON) # We'll store the full Google credentials JSON (token, refresh_token, token_uri, client_id, client_secret, scopes)
