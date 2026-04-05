import os
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from database import get_db
from models import OAuthToken

router = APIRouter()

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")

CLIENT_SECRETS = {
    "web": {
        "client_id": os.environ.get("GMAIL_CLIENT_ID", ""),
        "client_secret": os.environ.get("GMAIL_CLIENT_SECRET", ""),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token"
    }
}
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# This must EXACTLY match what you add in Google Cloud Console
REDIRECT_URI = f"{BACKEND_URL}/auth/callback"

def get_flow():
    return Flow.from_client_config(
        CLIENT_SECRETS,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

@router.get("/gmail/{account}")
def start_auth(account: str):
    if account not in ["work", "personal"]:
        raise HTTPException(status_code=400, detail="Invalid account. Use 'work' or 'personal'.")
    
    import secrets
    # Generate a random state token, then embed the account in it
    random_state = secrets.token_urlsafe(16)
    state_with_account = f"{random_state}::{account}"
    
    flow = get_flow()
    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        state=state_with_account
    )
    return RedirectResponse(authorization_url)


@router.get("/callback")
def auth_callback(code: str, state: str, db: Session = Depends(get_db)):
    try:
        # Extract account from appended state
        parts = state.split("::")
        account = parts[-1] if len(parts) > 1 else 'work'

        flow = get_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        creds_data = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': list(credentials.scopes) if credentials.scopes else []
        }

        token_entry = db.query(OAuthToken).filter(OAuthToken.account_label == account).first()
        if token_entry:
            token_entry.credentials = creds_data
        else:
            token_entry = OAuthToken(account_label=account, credentials=creds_data)
            db.add(token_entry)
        db.commit()

        return {"message": f"✅ Authentication successful for '{account}' account! You can close this tab and return to the dashboard."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
