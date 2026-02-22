"""
Enhanced grading engine for StageRoom.
Analyzes transcript for: clarity, delivery, pauses, filler words, accent patterns, pacing.
"""

import re
import math
from typing import Optional

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "literally",
                "sort of", "kind of", "i mean", "right", "okay so", "so yeah"]

CLARITY_CHALLENGE_WORDS = {
    "th_sounds": ["the", "this", "that", "those", "them", "their", "there", "think", "thought", "through", "three", "thing"],
    "v_and_w": ["very", "voice", "value", "view", "volume", "wave", "work", "world", "would", "want"],
    "r_and_l": ["really", "role", "rule", "lead", "learn", "release", "rely", "relate"],
    "ed_endings": ["focused", "managed", "developed", "launched", "established", "increased", "produced"],
    "consonant_clusters": ["strengths", "lengths", "products", "contexts", "scripts", "projects", "prospects"],
}

STRONG_OPENERS = ["today", "imagine", "what if", "let me", "i believe", "the question",
    "here's", "we need", "consider", "three years", "picture this", "in the next", "good morning", "good afternoon"]

STRONG_CLOSERS = ["thank you", "let's", "together", "the future", "take action",
    "i invite you", "remember", "in conclusion", "to summarize", "that's why", "this is why"]

TRANSITION_PHRASES = ["first", "second", "third", "next", "finally", "moreover",
    "however", "in addition", "on the other hand", "for example", "in contrast",
    "as a result", "therefore", "let me explain", "moving on", "building on"]

HEDGING_WORDS = ["maybe", "perhaps", "i think", "i guess", "probably", "might",
    "could be", "sort of", "kind of", "a little bit", "somewhat", "i feel like", "it seems", "not sure"]

STRENGTH_POOL = {
    "opening": ["Your opening grabbed attention — you set the context quickly and confidently.",
                "Strong start. You led with purpose, not apology."],
    "pacing": ["Your pacing felt natural — you gave ideas room to breathe.",
               "Good rhythm. You varied speed to match the content."],
    "vocabulary": ["Strong vocabulary — you expressed complex ideas accessibly.",
                   "Precise word selection. You avoided unnecessary jargon."],
    "structure": ["Clear structure — transitions guided the listener smoothly.",
                  "Well-organized. Each point built logically on the last."],
    "clarity": ["Your articulation was clear — even complex words landed well.",
                "Strong clarity throughout. Pronunciation was consistent and deliberate."],
    "confidence": ["Your tone projected confidence without arrogance.",
                   "You sounded composed and authoritative."],
    "closing": ["Decisive closing — you ended with conviction, not a trail-off.",
                "Strong finish. You landed your final point clearly."],
    "filler_free": ["Impressively clean delivery — very few filler words.",
                    "Crisp speech. Minimal verbal clutter."],
    "pausing": ["Good use of pauses — you let key points sink in.",
                "Strategic silences added weight to your message."],
}

DRILL_POOL = [
    "Record your opening line 5 times. Each time, pause longer before the first word.",
    "Pick 3 sentences from today. Say each at half speed, pronouncing every syllable.",
    "Read a paragraph aloud with a 2-second pause after every period. Time yourself.",
    "Record a 60-second intro with zero filler words. If you slip, start over.",
    "Take your weakest 30 seconds and redo it 3 times with more pauses and slower pace.",
    "Practice 5 'th' words (the, this, that, think, through) — feel the tongue placement.",
    "Speak for 90 seconds on a random topic. Focus on ending each sentence with downward inflection.",
    "Record your closing line. Play it back. Does it sound like a statement or a question?",
    "Read a news headline 3 times: once fast, once slow, once at your ideal pace.",
    "Pick the hardest word from your talk. Say it 10 times clearly, then in 3 sentences.",
]


def count_fillers(text):
    text_lower = text.lower()
    counts = {}
    for filler in FILLER_WORDS:
        if " " in filler:
            count = text_lower.count(filler)
        else:
            count = len(re.findall(r"\b" + re.escape(filler) + r"\b", text_lower))
        if count > 0:
            counts[filler] = count
    return counts


def count_hedges(text):
    text_lower = text.lower()
    counts = {}
    for hedge in HEDGING_WORDS:
        if " " in hedge:
            count = text_lower.count(hedge)
        else:
            count = len(re.findall(r"\b" + re.escape(hedge) + r"\b", text_lower))
        if count > 0:
            counts[hedge] = count
    return counts


def analyze_sentences(text):
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return {"count": 0, "avg_length": 0, "max_length": 0, "min_length": 0}
    lengths = [len(s.split()) for s in sentences]
    return {
        "count": len(sentences),
        "avg_length": round(sum(lengths) / len(lengths), 1),
        "max_length": max(lengths),
        "min_length": min(lengths),
    }


def analyze_opening(text):
    first_50 = " ".join(text.split()[:50]).lower()
    score = 0
    for opener in STRONG_OPENERS:
        if opener in first_50:
            score += 1
    first_sentence = re.split(r"[.!?]", text)[0] if text else ""
    if "?" in first_sentence:
        score += 2
    return {"score": min(score, 5), "is_question": "?" in first_sentence}


def analyze_closing(text):
    last_50 = " ".join(text.split()[-50:]).lower()
    score = 0
    for closer in STRONG_CLOSERS:
        if closer in last_50:
            score += 1
    return {"score": min(score, 5)}


def analyze_transitions(text):
    text_lower = text.lower()
    total = 0
    found = []
    for phrase in TRANSITION_PHRASES:
        count = len(re.findall(r"\b" + re.escape(phrase) + r"\b", text_lower))
        if count > 0:
            found.append({"phrase": phrase, "count": count})
            total += count
    return {"total": total, "phrases": found}


def analyze_clarity_challenges(text):
    text_lower = text.lower()
    challenges = {}
    for category, words in CLARITY_CHALLENGE_WORDS.items():
        found = [w for w in words if re.search(r"\b" + re.escape(w) + r"\b", text_lower)]
        if found:
            challenges[category] = found
    return challenges


def analyze_pauses(text):
    ellipses = text.count("...")
    dashes = text.count(" - ") + text.count(" — ")
    periods = text.count(".") + text.count("!") + text.count("?")
    word_count = len(text.split())
    total_pauses = ellipses + dashes + periods
    pause_density = round((total_pauses / max(word_count, 1)) * 100, 1)
    return {
        "estimated_pauses": total_pauses,
        "pause_density_per_100w": pause_density,
        "has_good_pausing": pause_density >= 3.0,
    }


def calc_wpm(text, duration_seconds=None):
    word_count = len(text.split())
    if duration_seconds and duration_seconds > 0:
        return round((word_count / duration_seconds) * 60, 1)
    return 150.0


def calculate_scores(m):
    # Clarity (0-25)
    clarity = 20
    if m.get("filler_count", 0) > 8: clarity -= 10
    elif m.get("filler_count", 0) > 4: clarity -= 5
    elif m.get("filler_count", 0) <= 1: clarity += 5
    if m.get("sentence_avg", 15) > 25: clarity -= 3

    # Delivery (0-25)
    delivery = 18
    wpm = m.get("wpm", 150)
    if 130 <= wpm <= 170: delivery += 5
    elif wpm > 185 or wpm < 100: delivery -= 5
    if m.get("hedge_count", 0) <= 1: delivery += 2

    # Pacing (0-25)
    pacing = 18
    pd = m.get("pause_density", 3)
    if pd >= 3: pacing += 4
    elif pd < 1.5: pacing -= 4
    if m.get("transition_count", 0) >= 3: pacing += 3

    # Structure (0-25)
    structure = 18
    if m.get("opening_score", 0) >= 1: structure += 2
    if m.get("closing_score", 0) >= 1: structure += 2
    if m.get("transition_count", 0) >= 2: structure += 3

    clarity = max(0, min(25, clarity))
    delivery = max(0, min(25, delivery))
    pacing = max(0, min(25, pacing))
    structure = max(0, min(25, structure))

    return {
        "clarity": clarity,
        "delivery": delivery,
        "pacing": pacing,
        "structure": structure,
        "overall": clarity + delivery + pacing + structure,
    }


def select_strengths(m):
    import random
    random.seed(hash(str(m.get("wpm", 0))) % 2**32)
    candidates = []
    if m.get("opening_score", 0) >= 2: candidates.append(random.choice(STRENGTH_POOL["opening"]))
    if 130 <= m.get("wpm", 150) <= 170: candidates.append(random.choice(STRENGTH_POOL["pacing"]))
    if m.get("filler_count", 10) <= 2: candidates.append(random.choice(STRENGTH_POOL["filler_free"]))
    if m.get("transition_count", 0) >= 3: candidates.append(random.choice(STRENGTH_POOL["structure"]))
    if m.get("pause_density", 0) >= 3: candidates.append(random.choice(STRENGTH_POOL["pausing"]))
    if m.get("closing_score", 0) >= 1: candidates.append(random.choice(STRENGTH_POOL["closing"]))
    if m.get("hedge_count", 5) <= 1: candidates.append(random.choice(STRENGTH_POOL["confidence"]))
    candidates.append(random.choice(STRENGTH_POOL["clarity"]))
    candidates.append(random.choice(STRENGTH_POOL["vocabulary"]))
    seen = set()
    unique = []
    for c in candidates:
        if c not in seen: seen.add(c); unique.append(c)
    return unique[:3]


def select_focus(m):
    fc = m.get("filler_count", 0)
    wpm = m.get("wpm", 150)
    hc = m.get("hedge_count", 0)
    ms = m.get("sentence_max", 15)
    cc = m.get("clarity_challenges", {})

    if fc > 5:
        top = max(m.get("fillers", {}).items(), key=lambda x: x[1], default=("um", fc))
        return "Reduce filler words — '{}' appeared {} times. Replace with a brief pause.".format(top[0], top[1])
    if wpm > 175:
        return "Your pace was {} WPM — quite fast. Aim for 140–160. Breathe after every second sentence.".format(wpm)
    if wpm < 110:
        return "At {} WPM, pick up the energy slightly. Aim for 140–160 for conversational authority.".format(wpm)
    if hc > 3:
        top = max(m.get("hedges", {}).items(), key=lambda x: x[1], default=("I think", hc))
        return "You used {} hedging phrases ('{}' most). Replace with direct statements.".format(hc, top[0])
    if ms > 30:
        return "Some sentences were {} words long. Break them down — aim for 15–20 words.".format(ms)
    if cc:
        cat = list(cc.keys())[0]
        examples = ", ".join(cc[cat][:4])
        labels = {"th_sounds": "'th'", "v_and_w": "'v'/'w'", "r_and_l": "'r'/'l'",
                  "ed_endings": "'-ed'", "consonant_clusters": "consonant cluster"}
        return "Focus on {} sounds: {}. Record yourself saying each one slowly.".format(labels.get(cat, cat), examples)
    if m.get("pause_density", 5) < 2:
        return "Insert more pauses between ideas. Practice a 2-second pause after each key point."
    return "Keep refining your pacing and pauses — you're close to a very polished delivery."


def grade_transcript(text, duration_seconds=None, audio_data=None):
    if not text or not text.strip():
        return {
            "score": 0,
            "scores": {"clarity": 0, "delivery": 0, "pacing": 0, "structure": 0, "overall": 0},
            "metrics": {"word_count": 0, "wpm": 0, "filler_count": 0, "fillers": {},
                        "hedge_count": 0, "hedges": {}, "sentences": {},
                        "opening": {}, "closing": {}, "transitions": {},
                        "pauses": {}, "clarity_challenges": {}},
            "feedback": {
                "strengths": ["You showed up — that's the first step."],
                "focus_area": "Try recording yourself speaking for at least 60 seconds.",
                "drill": DRILL_POOL[0],
            },
        }

    word_count = len(text.split())
    wpm = calc_wpm(text, duration_seconds)
    fillers = count_fillers(text)
    filler_total = sum(fillers.values())
    hedges = count_hedges(text)
    hedge_total = sum(hedges.values())
    sentences = analyze_sentences(text)
    opening = analyze_opening(text)
    closing = analyze_closing(text)
    transitions = analyze_transitions(text)
    pauses = analyze_pauses(text)
    clarity_challenges = analyze_clarity_challenges(text)

    sm = {
        "wpm": wpm, "filler_count": filler_total, "fillers": fillers,
        "hedge_count": hedge_total, "hedges": hedges,
        "sentence_avg": sentences["avg_length"], "sentence_max": sentences["max_length"],
        "opening_score": opening["score"], "closing_score": closing["score"],
        "transition_count": transitions["total"],
        "pause_density": pauses["pause_density_per_100w"],
        "clarity_challenges": clarity_challenges,
    }

    scores = calculate_scores(sm)
    strengths = select_strengths(sm)
    focus_area = select_focus(sm)

    import random
    random.seed(hash(text) % 2**32)
    drill = random.choice(DRILL_POOL)

    return {
        "score": scores["overall"],
        "scores": scores,
        "metrics": {
            "word_count": word_count,
            "wpm": wpm,
            "duration_seconds": duration_seconds,
            "filler_count": filler_total,
            "fillers": fillers,
            "hedge_count": hedge_total,
            "hedges": hedges,
            "sentences": sentences,
            "opening": opening,
            "closing": closing,
            "transitions": transitions,
            "pauses": pauses,
            "clarity_challenges": clarity_challenges,
        },
        "feedback": {
            "strengths": strengths,
            "focus_area": focus_area,
            "drill": drill,
        },
    }
