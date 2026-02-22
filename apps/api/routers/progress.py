from datetime import date, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Attempt, User
from auth_utils import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


class WeeklySummary(BaseModel):
    total_attempts: int
    avg_score: float
    total_words: int
    total_fillers: int
    streak_days: int
    daily_scores: list[dict]


@router.get("/weekly", response_model=WeeklySummary)
def weekly_summary(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    week_ago = today - timedelta(days=7)

    attempts = (
        db.query(Attempt)
        .filter(
            Attempt.user_id == user.id,
            Attempt.created_at >= str(week_ago),
        )
        .order_by(Attempt.created_at.asc())
        .all()
    )

    total_attempts = len(attempts)
    scores = []
    total_words = 0
    total_fillers = 0
    days_with_attempts = set()
    daily_scores = []

    for a in attempts:
        m = a.metrics or {}
        total_words += m.get("word_count", 0)
        total_fillers += m.get("filler_count", 0)
        if a.feedback and "score" in (a.metrics or {}):
            pass
        # Check if there's a score stored
        day_str = str(a.created_at)[:10] if a.created_at else str(today)
        days_with_attempts.add(day_str)

        score = 75  # default
        if a.metrics and "word_count" in a.metrics:
            # Re-derive score simply
            wc = a.metrics.get("word_count", 0)
            fc = a.metrics.get("filler_count", 0)
            score = max(20, min(100, 80 - (fc * 2) + min(wc // 20, 10)))
        scores.append(score)
        daily_scores.append({"date": day_str, "score": score, "track": a.track})

    # Streak: consecutive days back from today
    streak = 0
    check = today
    while str(check) in days_with_attempts:
        streak += 1
        check -= timedelta(days=1)

    avg_score = round(sum(scores) / max(len(scores), 1), 1)

    return WeeklySummary(
        total_attempts=total_attempts,
        avg_score=avg_score,
        total_words=total_words,
        total_fillers=total_fillers,
        streak_days=streak,
        daily_scores=daily_scores,
    )
