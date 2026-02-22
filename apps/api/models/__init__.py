from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Date, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DailyPlan(Base):
    __tablename__ = "daily_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null = global
    date = Column(Date, nullable=False, index=True)
    track = Column(String(100), nullable=False)
    difficulty = Column(String(20), nullable=False, default="medium")
    steps = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    daily_plan_id = Column(Integer, ForeignKey("daily_plans.id"), nullable=True)
    track = Column(String(100), nullable=False)
    transcript = Column(Text, nullable=True)
    media_path = Column(String(500), nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    metrics = Column(JSON, nullable=True)
    feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConversationScript(Base):
    __tablename__ = "conversation_scripts"

    id = Column(Integer, primary_key=True, index=True)
    scenario = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    turns = Column(JSON, nullable=False)  # list of {role, content}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
