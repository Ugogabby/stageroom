"""
Seed script: populates 7 days of daily plans and 5 conversation scripts.
Run from apps/api directory:  python scripts/seed.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import date, timedelta
from database import engine, SessionLocal, Base
from models import DailyPlan, ConversationScript

Base.metadata.create_all(bind=engine)


PLANS = [
    {
        "track": "Business Pitch",
        "difficulty": "medium",
        "steps": [
            {"type": "warmup", "duration_min": 5, "prompt": "Introduce yourself and your role in 60 seconds. Focus on clarity, not speed."},
            {"type": "main", "duration_min": 15, "prompt": "Pitch a product or service you believe in. You have 3 minutes per attempt — record at least 3 takes. Focus on opening strength and closing conviction."},
            {"type": "cooldown", "duration_min": 5, "prompt": "Reflect: which take felt most natural? What word or phrase do you want to drop tomorrow?"},
            {"type": "drill", "duration_min": 5, "prompt": "Say your closing line 5 times. Each time, pause longer before the final word."},
        ],
    },
    {
        "track": "Academic Talk",
        "difficulty": "medium",
        "steps": [
            {"type": "warmup", "duration_min": 5, "prompt": "Explain your area of study/work to a curious 12-year-old. Keep it under 90 seconds."},
            {"type": "main", "duration_min": 15, "prompt": "Deliver a 5-minute conference-style talk on a recent project or paper. Imagine an audience of 30 peers."},
            {"type": "cooldown", "duration_min": 5, "prompt": "Note 2 moments where you felt uncertain. What could make those smoother?"},
            {"type": "drill", "duration_min": 5, "prompt": "Pick the most complex sentence from your talk. Simplify it. Say the simpler version 3 times."},
        ],
    },
    {
        "track": "Table Topics",
        "difficulty": "easy",
        "steps": [
            {"type": "warmup", "duration_min": 3, "prompt": "Deep breath. Stand up. Roll your shoulders. Say 'I am here and I am ready.' aloud 3 times."},
            {"type": "main", "duration_min": 18, "prompt": "Impromptu prompts — speak for 1–2 minutes each:\n1) 'The most important lesson I learned this year.'\n2) 'Why I chose my career path.'\n3) 'A technology that excites me and why.'\n4) 'If I could fix one thing about my industry…'"},
            {"type": "cooldown", "duration_min": 4, "prompt": "Which topic surprised you? Where did filler words creep in?"},
            {"type": "drill", "duration_min": 5, "prompt": "Repeat your weakest response. This time, pause before every new idea."},
        ],
    },
    {
        "track": "Hard Q&A",
        "difficulty": "hard",
        "steps": [
            {"type": "warmup", "duration_min": 5, "prompt": "Practice saying 'That's a great question — let me think about that.' and actually pausing for 3 full seconds."},
            {"type": "main", "duration_min": 15, "prompt": "Answer these tough questions (2 min each):\n1) 'Why should we invest in your team when results haven't shown yet?'\n2) 'What's the biggest mistake you've made professionally?'\n3) 'How do you handle criticism from your peers?'"},
            {"type": "cooldown", "duration_min": 5, "prompt": "Score yourself: did you stay calm? Did you bridge to your key message?"},
            {"type": "drill", "duration_min": 5, "prompt": "Pick the hardest question. Answer it again — but start with your conclusion, then explain."},
        ],
    },
    {
        "track": "Casual Conversation",
        "difficulty": "easy",
        "steps": [
            {"type": "warmup", "duration_min": 3, "prompt": "Smile. Literally. Then say 'Hey, great to meet you — I'm [name]' in 3 different tones: warm, confident, curious."},
            {"type": "main", "duration_min": 18, "prompt": "Simulate these mini-conversations (speak both parts or pause to imagine the other):\n1) Meeting someone at a networking event.\n2) Coffee chat with a new colleague.\n3) Running into your CEO at the elevator.\n4) Catching up with an old university friend."},
            {"type": "cooldown", "duration_min": 4, "prompt": "Which felt most natural? Which felt performative?"},
            {"type": "drill", "duration_min": 5, "prompt": "Practice your 'exit line' — how you end a conversation gracefully. Try 3 versions."},
        ],
    },
    {
        "track": "Business Pitch",
        "difficulty": "hard",
        "steps": [
            {"type": "warmup", "duration_min": 5, "prompt": "Power pose for 30 seconds. Then state your company's mission in one sentence — no filler."},
            {"type": "main", "duration_min": 15, "prompt": "You're pitching to a skeptical investor panel. Deliver a 5-minute pitch, then immediately handle 2 tough objections you invent yourself."},
            {"type": "cooldown", "duration_min": 5, "prompt": "Where did your confidence dip? Mark that section for tomorrow's warmup."},
            {"type": "drill", "duration_min": 5, "prompt": "Your weakest 30 seconds — redo it 3 times, each time with more pauses."},
        ],
    },
    {
        "track": "Academic Talk",
        "difficulty": "easy",
        "steps": [
            {"type": "warmup", "duration_min": 5, "prompt": "Read one paragraph from a paper aloud. Focus on pronouncing every word fully — no swallowing endings."},
            {"type": "main", "duration_min": 15, "prompt": "Give a 3-minute 'elevator talk' about your research to a non-expert. Record twice — which version was clearer?"},
            {"type": "cooldown", "duration_min": 5, "prompt": "Write down 3 jargon words you used. Find simpler alternatives."},
            {"type": "drill", "duration_min": 5, "prompt": "Take your opening sentence. Say it 5 times, each time cutting one unnecessary word."},
        ],
    },
]

CONVERSATIONS = [
    {
        "scenario": "Networking Event",
        "description": "You've just arrived at a tech industry mixer. Someone approaches you.",
        "turns": [
            {"role": "partner", "content": "Hey! I don't think we've met — I'm Jordan. I work in product at a fintech startup. What brings you here?"},
            {"role": "user", "content": "(Your turn — introduce yourself naturally)"},
            {"role": "partner", "content": "Oh interesting! What does your day-to-day actually look like?"},
            {"role": "user", "content": "(Describe your work without jargon)"},
            {"role": "partner", "content": "That's cool. We're actually looking for someone with that kind of background. Mind if I grab your LinkedIn?"},
            {"role": "user", "content": "(Close the conversation gracefully)"},
        ],
    },
    {
        "scenario": "Coffee Chat with Manager",
        "description": "Your skip-level manager invited you for a casual 15-minute coffee.",
        "turns": [
            {"role": "partner", "content": "Thanks for making time! I've been wanting to hear — how are things going on your team?"},
            {"role": "user", "content": "(Share honestly but diplomatically)"},
            {"role": "partner", "content": "Good to hear. Is there anything you think we should be doing differently?"},
            {"role": "user", "content": "(Offer constructive feedback)"},
            {"role": "partner", "content": "I appreciate the candor. Where do you see yourself in a year?"},
            {"role": "user", "content": "(Share your growth goals)"},
        ],
    },
    {
        "scenario": "Investor Call",
        "description": "A VC partner has 10 minutes for you on a Zoom call.",
        "turns": [
            {"role": "partner", "content": "I've got about 10 minutes — give me the quick version. What are you building and why now?"},
            {"role": "user", "content": "(Deliver your concise pitch)"},
            {"role": "partner", "content": "Interesting. What's your traction look like?"},
            {"role": "user", "content": "(Share metrics confidently)"},
            {"role": "partner", "content": "And what's stopping a bigger player from just doing this?"},
            {"role": "user", "content": "(Handle the moat question)"},
            {"role": "partner", "content": "Send me the deck. I want to share this with my partner."},
            {"role": "user", "content": "(Close strong)"},
        ],
    },
    {
        "scenario": "Conflict Resolution",
        "description": "A colleague disagrees with your project direction in a team meeting.",
        "turns": [
            {"role": "partner", "content": "Honestly, I don't think this approach is going to work. We tried something similar last year and it failed."},
            {"role": "user", "content": "(Acknowledge their concern without being defensive)"},
            {"role": "partner", "content": "I hear you, but the data doesn't support it. What's your evidence?"},
            {"role": "user", "content": "(Present your case calmly with evidence)"},
            {"role": "partner", "content": "Okay, I see your point on that. But the timeline still worries me."},
            {"role": "user", "content": "(Find common ground and propose next steps)"},
        ],
    },
    {
        "scenario": "Small Talk at Conference",
        "description": "You're standing in the lunch line at a 3-day conference.",
        "turns": [
            {"role": "partner", "content": "These lines, right? So — which talk are you most looking forward to this afternoon?"},
            {"role": "user", "content": "(Engage with genuine interest)"},
            {"role": "partner", "content": "Oh I went to that speaker's workshop last year — really good. What field are you in?"},
            {"role": "user", "content": "(Describe your work conversationally)"},
            {"role": "partner", "content": "Small world — we might actually have some overlap. What's the best way to stay in touch?"},
            {"role": "user", "content": "(Exchange contacts smoothly)"},
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        # Clear old seed data
        db.query(DailyPlan).filter(DailyPlan.user_id.is_(None)).delete()
        db.query(ConversationScript).delete()
        db.commit()

        today = date.today()
        for i, plan_data in enumerate(PLANS):
            plan = DailyPlan(
                user_id=None,  # global
                date=today + timedelta(days=i),
                track=plan_data["track"],
                difficulty=plan_data["difficulty"],
                steps=plan_data["steps"],
            )
            db.add(plan)

        for conv_data in CONVERSATIONS:
            conv = ConversationScript(
                scenario=conv_data["scenario"],
                description=conv_data["description"],
                turns=conv_data["turns"],
            )
            db.add(conv)

        db.commit()
        print(f"✅ Seeded {len(PLANS)} daily plans (starting {today})")
        print(f"✅ Seeded {len(CONVERSATIONS)} conversation scripts")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
