import os
import re
from datetime import datetime, timezone
import dateutil.parser

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from models import OAuthToken, Email

KEYWORDS = ['interview', 'assessment', 'recruiter', 'hiring', 'opportunity', 
            'job offer', 'shortlisted', 'application received', 'next steps', 'offer letter']

def get_gmail_service(db: Session, account: str):
    token_entry = db.query(OAuthToken).filter(OAuthToken.account_label == account).first()
    if not token_entry or not token_entry.credentials:
        return None
    creds = Credentials(**token_entry.credentials)
    service = build('gmail', 'v1', credentials=creds)
    return service

def parse_company(sender_email: str) -> str:
    # Basic rule: recruiting@google.com -> Google
    match = re.search(r'@([a-zA-Z0-9.-]+)\.', sender_email)
    if match:
        domain = match.group(1)
        if domain.lower() in ['gmail', 'yahoo', 'outlook', 'hotmail']:
            return "Unknown"
        return domain.capitalize()
    return "Unknown"

def extract_urls(text: str):
    # Very basic URL extraction
    urls = re.findall(r'(https?://[^\s]+)', text)
    return list(set(urls)) # Remove duplicates

def fetch_new_emails(db: Session, account: str) -> int:
    service = get_gmail_service(db, account)
    if not service:
        print(f"[{account}] Not authenticated.")
        return 0

    query = " OR ".join([f'"{kw}"' for kw in KEYWORDS])
    # Fetch today's emails matching query
    try:
        results = service.users().messages().list(userId='me', q=query, maxResults=10).execute()
        messages = results.get('messages', [])
        new_count = 0

        for msg in messages:
            msg_id = msg['id']
            # Check if we already have it
            if db.query(Email).filter(Email.gmail_message_id == msg_id).first():
                continue

            msg_data = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
            payload = msg_data.get('payload', {})
            headers = payload.get('headers', [])

            subject = "No Subject"
            sender_full = "Unknown"
            date_str = ""

            for header in headers:
                if header['name'] == 'Subject':
                    subject = header['value']
                elif header['name'] == 'From':
                    sender_full = header['value']
                elif header['name'] == 'Date':
                    date_str = header['value']

            sender_name = sender_full
            sender_email = sender_full
            match = re.search(r'(.*)<(.*)>', sender_full)
            if match:
                sender_name = match.group(1).strip()
                sender_email = match.group(2).strip()

            snippet = msg_data.get('snippet', '')
            
            # Simple body extraction (ignores deeply nested multipart for brevity, assumes top level body or parts)
            body = ""
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        import base64
                        data = part['body'].get('data')
                        if data:
                            body = base64.urlsafe_b64decode(data).decode('utf-8')
                            break
            else:
                data = payload.get('body', {}).get('data')
                if data:
                    import base64
                    body = base64.urlsafe_b64decode(data).decode('utf-8')

            company = parse_company(sender_email)
            urls = extract_urls(body)
            
            try:
                received_at = dateutil.parser.parse(date_str)
            except:
                received_at = datetime.now(timezone.utc)

            new_email = Email(
                account=account,
                gmail_message_id=msg_id,
                company=company,
                sender_name=sender_name,
                sender_email=sender_email,
                subject=subject,
                snippet=snippet,
                body=body,
                urls=urls,
                received_at=received_at
            )
            db.add(new_email)
            db.commit()
            new_count += 1
            
        return new_count
    except Exception as e:
        print(f"Error fetching emails for {account}: {e}")
        return 0
