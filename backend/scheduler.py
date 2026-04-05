from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
from database import SessionLocal
from models import Email
from services import gmail_fetcher

scheduler = BackgroundScheduler()

def poll_emails_job():
    print(f"[{datetime.now().isoformat()}] Running background job: poll_emails_job")
    db = SessionLocal()
    try:
        gmail_fetcher.fetch_new_emails(db, 'work')
        gmail_fetcher.fetch_new_emails(db, 'personal')
    finally:
        db.close()

def check_snoozed_emails_job():
    print(f"[{datetime.now().isoformat()}] Running background job: check_snoozed_emails_job")
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        expired_emails = db.query(Email).filter(
            Email.snoozed_until.isnot(None),
            Email.snoozed_until <= now
        ).all()
        for email in expired_emails:
            email.snoozed_until = None
            email.status = "New"
            email.is_unread = True
        if expired_emails:
            db.commit()
            print(f"Un-snoozed {len(expired_emails)} emails.")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(
        poll_emails_job,
        trigger=IntervalTrigger(minutes=5),
        id="poll_emails",
        name="Poll Gmail every 5 minutes",
        replace_existing=True,
    )
    scheduler.add_job(
        check_snoozed_emails_job,
        trigger=IntervalTrigger(minutes=1),
        id="check_snoozed",
        name="Check expired snoozes every minute",
        replace_existing=True,
    )
    scheduler.start()

def shutdown_scheduler():
    scheduler.shutdown()
