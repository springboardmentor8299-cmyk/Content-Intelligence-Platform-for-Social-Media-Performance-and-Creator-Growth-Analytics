
from datetime import date, datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

from app.database import SessionLocal
from app.models.sponsorship import Sponsorship
from app.models.notification import Notification


def check_sponsorship_alerts():
    db = SessionLocal()

    try:
        today = date.today()
        upcoming_limit = today + timedelta(days=7)

        sponsorships = db.query(Sponsorship).all()
        created_count = 0

        for sponsorship in sponsorships:
            status = (sponsorship.payment_status or "").lower()

            if status != "pending":
                continue

            brand = sponsorship.brand_name
            campaign = sponsorship.campaign_name
            amount = sponsorship.amount
            currency = sponsorship.currency or "INR"

            alerts = [
                {
                    "title": f"Payment pending: {campaign}",
                    "message": (
                        f"Payment of {amount} {currency} "
                        f"from {brand} is still pending."
                    ),
                    "notification_type": "pending_payment",
                }
            ]

            if sponsorship.due_date:
                due_date = sponsorship.due_date

                if isinstance(due_date, datetime):
                    due_date = due_date.date()

                if today <= due_date <= upcoming_limit:
                    alerts.append({
                        "title": f"Upcoming due date: {campaign}",
                        "message": (
                            f"Payment from {brand} is due on "
                            f"{due_date.isoformat()}."
                        ),
                        "notification_type": "upcoming_due_date",
                    })

            for alert in alerts:
                exists = db.query(Notification).filter(
                    Notification.creator_id == sponsorship.creator_id,
                    Notification.notification_type
                    == alert["notification_type"],
                    Notification.title == alert["title"],
                ).first()

                if exists:
                    continue

                db.add(Notification(
                    creator_id=sponsorship.creator_id,
                    title=alert["title"],
                    message=alert["message"],
                    notification_type=alert["notification_type"],
                    is_read=0,
                ))
                created_count += 1

        db.commit()
        print(
            f"[CreatorIQ Scheduler] Sponsorship check complete. "
            f"Created {created_count} notification(s)."
        )

    except Exception as exc:
        db.rollback()
        print(f"[CreatorIQ Scheduler] Error: {exc}")

    finally:
        db.close()


scheduler = BackgroundScheduler()



def start_notification_scheduler():
    if not scheduler.running:
        # Run once, 5 seconds after startup
        scheduler.add_job(
            check_sponsorship_alerts,
            trigger="date",
            run_date=datetime.now() + timedelta(seconds=5),
            id="test_sponsorship_alerts",
            replace_existing=True,
        )

        # Then repeat every 6 hours
        scheduler.add_job(
            check_sponsorship_alerts,
            trigger="interval",
            hours=6,
            id="sponsorship_alert_check",
            replace_existing=True,
            max_instances=1,
        )

        scheduler.start()
        print("[CreatorIQ Scheduler] Started.")

def stop_notification_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("[CreatorIQ Scheduler] Stopped.")
