from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import DailyPlan, User
from auth_utils import get_current_user

router = APIRouter(prefix="/plans", tags=["plans"])


class PlanOut(BaseModel):
    id: int
    date: str
    track: str
    difficulty: str
    steps: list

    class Config:
        from_attributes = True


@router.get("/today", response_model=PlanOut)
def get_today_plan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    # Try user-specific plan first, then global
    plan = (
        db.query(DailyPlan)
        .filter(DailyPlan.date == today, DailyPlan.user_id == user.id)
        .first()
    )
    if not plan:
        plan = (
            db.query(DailyPlan)
            .filter(DailyPlan.date == today, DailyPlan.user_id.is_(None))
            .first()
        )
    if not plan:
        # Fallback: return latest plan available
        plan = db.query(DailyPlan).order_by(DailyPlan.date.desc()).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No plans available. Run seed script.")
    return PlanOut(
        id=plan.id,
        date=str(plan.date),
        track=plan.track,
        difficulty=plan.difficulty,
        steps=plan.steps or [],
    )


@router.get("/", response_model=list[PlanOut])
def list_plans(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plans = db.query(DailyPlan).order_by(DailyPlan.date.desc()).limit(14).all()
    return [
        PlanOut(
            id=p.id,
            date=str(p.date),
            track=p.track,
            difficulty=p.difficulty,
            steps=p.steps or [],
        )
        for p in plans
    ]
