import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Attempt, User
from auth_utils import get_current_user
from config import UPLOAD_DIR

router = APIRouter(prefix="/attempts", tags=["attempts"])


class AttemptOut(BaseModel):
    id: int
    track: str
    transcript: Optional[str] = None
    media_path: Optional[str] = None
    duration_seconds: Optional[int] = None
    metrics: Optional[dict] = None
    feedback: Optional[dict] = None
    created_at: str

    class Config:
        from_attributes = True


@router.post("/", response_model=AttemptOut)
async def create_attempt(
    track: str = Form(...),
    transcript: Optional[str] = Form(None),
    duration_seconds: Optional[int] = Form(None),
    daily_plan_id: Optional[int] = Form(None),
    media: Optional[UploadFile] = File(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    media_path = None
    if media and media.filename:
        ext = os.path.splitext(media.filename)[1] or ".webm"
        filename = f"{user.id}_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        content = await media.read()
        with open(filepath, "wb") as f:
            f.write(content)
        media_path = f"/uploads/{filename}"

    attempt = Attempt(
        user_id=user.id,
        daily_plan_id=daily_plan_id,
        track=track,
        transcript=transcript,
        media_path=media_path,
        duration_seconds=duration_seconds,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return AttemptOut(
        id=attempt.id,
        track=attempt.track,
        transcript=attempt.transcript,
        media_path=attempt.media_path,
        duration_seconds=attempt.duration_seconds,
        metrics=attempt.metrics,
        feedback=attempt.feedback,
        created_at=str(attempt.created_at),
    )


@router.get("/", response_model=list[AttemptOut])
def list_attempts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attempts = (
        db.query(Attempt)
        .filter(Attempt.user_id == user.id)
        .order_by(Attempt.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        AttemptOut(
            id=a.id,
            track=a.track,
            transcript=a.transcript,
            media_path=a.media_path,
            duration_seconds=a.duration_seconds,
            metrics=a.metrics,
            feedback=a.feedback,
            created_at=str(a.created_at),
        )
        for a in attempts
    ]
