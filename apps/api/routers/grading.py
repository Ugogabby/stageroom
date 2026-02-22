from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Attempt, User
from auth_utils import get_current_user
from services.grading_engine import grade_transcript

router = APIRouter(prefix="/grading", tags=["grading"])


class GradeRequest(BaseModel):
    attempt_id: Optional[int] = None
    transcript: Optional[str] = None
    duration_seconds: Optional[int] = None


class GradeResponse(BaseModel):
    score: int
    metrics: dict
    feedback: dict


@router.post("/grade", response_model=GradeResponse)
def grade(
    body: GradeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transcript = body.transcript

    # If attempt_id provided, pull transcript from DB
    if body.attempt_id:
        attempt = db.query(Attempt).filter(
            Attempt.id == body.attempt_id, Attempt.user_id == user.id
        ).first()
        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found")
        transcript = transcript or attempt.transcript
        duration = body.duration_seconds or attempt.duration_seconds
    else:
        duration = body.duration_seconds

    if not transcript:
        raise HTTPException(status_code=400, detail="No transcript provided")

    result = grade_transcript(transcript, duration)

    # Save metrics + feedback back to attempt if applicable
    if body.attempt_id:
        attempt.metrics = result["metrics"]
        attempt.feedback = result["feedback"]
        db.commit()

    return GradeResponse(
        score=result.get("score", 75),
        metrics=result["metrics"],
        feedback=result["feedback"],
    )
