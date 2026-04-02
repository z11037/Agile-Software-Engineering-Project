"""
IELTS-style *estimated* band scoring for writing (Task 2) and speaking (transcript-based).

These are rubric-driven approximations — not official IELTS marking. Pronunciation for speaking
cannot be assessed from text alone; we estimate a proxy from other dimensions and label it clearly.
"""

from __future__ import annotations

import re
from typing import Any


def _clamp(n: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, n))


def round_to_half(n: float) -> float:
    return round(n * 2) / 2


def evaluate_writing_task2(topic: str, task: str, text: str) -> dict[str, Any]:
    """Mirror the former frontend heuristic as a structured IELTS Writing Task 2 estimate."""
    trimmed = text.strip()
    words = trimmed.split() if trimmed else []
    word_count = len(words)

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", trimmed) if p.strip()] if trimmed else []
    paragraph_count = len(paragraphs)

    lower = trimmed.lower()
    sentences = [s.strip() for s in re.split(r"[.!?]+", trimmed) if s.strip()] if trimmed else []
    avg_sentence_words = (
        word_count / len(sentences) if sentences else (word_count if word_count > 0 else 0)
    )

    unique_word_ratio = (
        len({w.lower() for w in words}) / word_count if word_count else 0.0
    )
    has_clear_opinion = bool(
        re.search(
            r"\bi (strongly )?(agree|disagree)\b|\bin my opinion\b|\bi believe\b|\bi think\b",
            lower,
        )
    )
    connectors_count = len(
        re.findall(
            r"\b(however|therefore|moreover|furthermore|in addition|on the other hand|for example|for instance|as a result)\b",
            lower,
        )
    )
    examples_count = len(re.findall(r"\b(for example|for instance)\b", lower))

    task_lower = f"{topic} {task}".lower()
    requires_both_views = bool(re.search(r"\bboth views\b|others\b", task_lower))
    requires_opinion = bool(
        re.search(r"\byour own opinion\b|give your opinion\b", task_lower)
    )
    requires_adv_disadv = bool(
        re.search(r"\badvantages\b.*\bdisadvantages\b|\badvantages\b|\bdisadvantages\b", task_lower)
    )
    requires_problems_solutions = bool(
        re.search(r"\bproblems?\b.*\bsolutions?\b|\bsuggest\b.*\bsolutions?\b", task_lower)
    )

    mentions_both_views = bool(
        re.search(r"\bon the one hand\b", lower) and re.search(r"\bon the other hand\b", lower)
    )
    mentions_adv = bool(re.search(r"\badvantage|benefit|positive\b", lower))
    mentions_dis = bool(re.search(r"\bdisadvantage|drawback|risk|negative\b", lower))
    mentions_problems = bool(re.search(r"\bproblem|issue|cause\b", lower))
    mentions_solutions = bool(re.search(r"\bsolution|measure|should\b", lower))
    has_conclusion = paragraph_count >= 2 and bool(
        re.search(r"\bin conclusion\b|\bto conclude\b|\boverall\b", lower)
    )

    checks: list[dict[str, bool]] = [
        {"label": ">= 250 words", "ok": word_count >= 250},
        {"label": "Clear paragraphing", "ok": paragraph_count >= 4},
        {
            "label": "Clear position/opinion",
            "ok": (not requires_opinion) or has_clear_opinion,
        },
        {"label": "Conclusion present", "ok": has_conclusion},
    ]
    if requires_both_views:
        checks.append({"label": "Addresses both views", "ok": mentions_both_views})
    if requires_adv_disadv:
        checks.append(
            {
                "label": "Covers advantages & disadvantages",
                "ok": mentions_adv and mentions_dis,
            }
        )
    if requires_problems_solutions:
        checks.append(
            {
                "label": "Covers problems & solutions",
                "ok": mentions_problems and mentions_solutions,
            }
        )

    task_response = 6.0
    if word_count >= 250:
        task_response += 1
    if word_count >= 320:
        task_response += 0.5
    if (not requires_opinion) or has_clear_opinion:
        task_response += 0.5
    if requires_both_views and mentions_both_views:
        task_response += 0.5
    if requires_adv_disadv and mentions_adv and mentions_dis:
        task_response += 0.5
    if requires_problems_solutions and mentions_problems and mentions_solutions:
        task_response += 0.5
    if examples_count >= 1:
        task_response += 0.5
    if word_count < 200:
        task_response -= 2
    if word_count < 120:
        task_response -= 3
    if requires_both_views and not mentions_both_views:
        task_response -= 1.5
    if requires_adv_disadv and not (mentions_adv and mentions_dis):
        task_response -= 1.5
    if requires_problems_solutions and not (mentions_problems and mentions_solutions):
        task_response -= 1.5

    coherence = 6.0
    if paragraph_count >= 4:
        coherence += 1
    if connectors_count >= 3:
        coherence += 0.5
    if paragraph_count <= 1:
        coherence -= 2
    if sentences and 6 <= len(sentences) and 10 <= avg_sentence_words <= 25:
        coherence += 0.5
    if has_conclusion:
        coherence += 0.5

    lexical = 6.0
    if unique_word_ratio >= 0.55:
        lexical += 1
    if unique_word_ratio >= 0.65:
        lexical += 0.5
    if unique_word_ratio < 0.4 and word_count > 80:
        lexical -= 1.5

    grammar = 6.0
    too_many_exclamations = trimmed.count("!") >= 3
    too_many_all_caps = len(re.findall(r"\b[A-Z]{4,}\b", trimmed)) >= 3
    if len(sentences) >= 6:
        grammar += 0.5
    if 8 <= avg_sentence_words <= 28:
        grammar += 0.5
    if too_many_exclamations:
        grammar -= 1
    if too_many_all_caps:
        grammar -= 1

    tr = round_to_half(_clamp(task_response, 0, 9))
    cc = round_to_half(_clamp(coherence, 0, 9))
    lr = round_to_half(_clamp(lexical, 0, 9))
    gra = round_to_half(_clamp(grammar, 0, 9))

    band = round_to_half((tr + cc + lr + gra) / 4)
    score = int(round(_clamp((band / 9) * 100, 0, 100)))

    strengths: list[str] = []
    improvements: list[str] = []

    if word_count >= 250:
        strengths.append("Meets the 250-word requirement.")
    else:
        improvements.append("Aim for at least 250 words to fully develop ideas.")

    if paragraph_count >= 4:
        strengths.append("Good paragraph structure (introduction, body, conclusion).")
    else:
        improvements.append("Use clearer paragraphing (intro + 2 body paragraphs + conclusion).")

    if (not requires_opinion) or has_clear_opinion:
        strengths.append("Your position/opinion is clear.")
    else:
        improvements.append(
            "State your opinion clearly (especially in the introduction/conclusion)."
        )

    if has_conclusion:
        strengths.append("Has a clear conclusion.")
    else:
        improvements.append(
            "Add a short conclusion that summarises your main points and restates your position."
        )

    if requires_both_views:
        if mentions_both_views:
            strengths.append("Discusses both views (balanced coverage).")
        else:
            improvements.append(
                'Explicitly discuss both views (e.g., "On the one hand… On the other hand…").'
            )
    if requires_adv_disadv:
        if mentions_adv and mentions_dis:
            strengths.append("Covers both advantages and disadvantages.")
        else:
            improvements.append(
                "Make sure you cover both advantages and disadvantages before giving your opinion."
            )
    if requires_problems_solutions:
        if mentions_problems and mentions_solutions:
            strengths.append("Covers both problems and solutions.")
        else:
            improvements.append("Include both the problems and concrete solutions/measures.")

    if connectors_count >= 3:
        strengths.append("Uses linking words to connect ideas.")
    else:
        improvements.append("Add more cohesive devices (however, therefore, for example, etc.).")

    if unique_word_ratio >= 0.55:
        strengths.append("Good vocabulary variety.")
    else:
        improvements.append(
            "Try to avoid repeating the same words; use synonyms and precise terms."
        )

    if too_many_exclamations:
        improvements.append("Avoid excessive exclamation marks in formal writing.")
    if too_many_all_caps:
        improvements.append("Avoid ALL CAPS; keep a formal tone.")

    disclaimer = (
        "Estimated IELTS Writing Task 2 band (practice only). Official IELTS uses trained examiners."
    )

    return {
        "score": score,
        "band": band,
        "word_count": word_count,
        "breakdown": {
            "task_response": tr,
            "coherence": cc,
            "lexical": lr,
            "grammar": gra,
        },
        "checks": checks,
        "strengths": strengths[:4],
        "improvements": improvements[:4],
        "disclaimer": disclaimer,
    }


def evaluate_speaking_transcript(
    transcript: str,
    question_text: str,
    *,
    difficulty: str = "medium",
    duration_seconds: float | None = None,
) -> dict[str, Any]:
    """
    Estimated IELTS Speaking bands from a text transcript (and optional duration).
    Pronunciation is a *proxy* only — real assessment needs audio or human examiner.
    """
    trimmed = transcript.strip()
    words = trimmed.split() if trimmed else []
    wc = len(words)
    lower = trimmed.lower()
    sentences = [s.strip() for s in re.split(r"[.!?]+", trimmed) if s.strip()] if trimmed else []

    unique_ratio = len({w.lower() for w in words}) / wc if wc else 0.0
    q_words = {w.lower() for w in re.findall(r"[A-Za-z]+", question_text)}
    overlap = sum(1 for w in words if w.lower() in q_words and len(w) > 2)
    relevance_bonus = _clamp(overlap / max(len(q_words), 1) * 2, 0, 1.0)

    # Difficulty ceiling soft cap (engineering-topic practice, not full IELTS)
    diff_cap = {"easy": 7.0, "medium": 8.0, "hard": 9.0}.get(difficulty.lower(), 8.0)

    connectors = len(
        re.findall(
            r"\b(because|although|however|therefore|for example|such as|in addition|also|first|second|finally)\b",
            lower,
        )
    )

    # Fluency & coherence (FC)
    fc = 5.0
    if wc >= 40:
        fc += 1.0
    if wc >= 80:
        fc += 0.5
    if wc >= 120:
        fc += 0.5
    if len(sentences) >= 3:
        fc += 0.5
    if connectors >= 2:
        fc += 0.5
    if connectors >= 5:
        fc += 0.5
    if duration_seconds is not None:
        if duration_seconds < 15:
            fc -= 1.5
        elif duration_seconds < 25:
            fc -= 0.5
        elif duration_seconds >= 45:
            fc += 0.5
    if wc < 20:
        fc -= 2.0
    fc = round_to_half(_clamp(fc + relevance_bonus * 0.5, 0, diff_cap))

    # Lexical resource (LR)
    lr = 5.0
    if unique_ratio >= 0.6:
        lr += 1.0
    elif unique_ratio >= 0.45:
        lr += 0.5
    if wc >= 60:
        lr += 0.5
    lr = round_to_half(_clamp(lr, 0, diff_cap))

    # Grammatical range & accuracy (GRA) — light heuristics
    gra = 5.0
    if len(sentences) >= 4:
        gra += 0.5
    avg_len = wc / len(sentences) if sentences else 0.0
    if 8 <= avg_len <= 22:
        gra += 0.5
    frag = len(re.findall(r"^\s*[a-z][^.!?]*$", trimmed, re.MULTILINE))
    if frag >= 3:
        gra -= 0.5
    gra = round_to_half(_clamp(gra, 0, diff_cap))

    # Pronunciation proxy (no audio): tie to clarity proxies, slightly below average of others
    base_p = (fc + lr + gra) / 3
    pronunciation = round_to_half(_clamp(base_p - 0.5, 0, diff_cap))

    overall = round_to_half((fc + lr + gra + pronunciation) / 4)
    score = int(round(_clamp((overall / 9) * 100, 0, 100)))

    strengths: list[str] = []
    improvements: list[str] = []
    if wc >= 40:
        strengths.append("Your answer has enough content to assess development.")
    else:
        improvements.append("Try to speak longer (aim for roughly 40+ words in a transcript).")
    if connectors >= 2:
        strengths.append("You use some linking devices for coherence.")
    else:
        improvements.append("Use connectors (because, although, for example) to link ideas.")
    if unique_ratio >= 0.5:
        strengths.append("Reasonable vocabulary variety for the topic.")
    else:
        improvements.append("Paraphrase key ideas instead of repeating the same words.")

    disclaimer = (
        "Estimated IELTS Speaking band from transcript only. Pronunciation is a proxy; "
        "official IELTS uses audio and examiner judgement."
    )

    return {
        "score": score,
        "band": overall,
        "word_count": wc,
        "duration_seconds": duration_seconds,
        "breakdown": {
            "fluency_coherence": fc,
            "lexical": lr,
            "grammar": gra,
            "pronunciation_proxy": pronunciation,
        },
        "strengths": strengths[:4],
        "improvements": improvements[:4],
        "disclaimer": disclaimer,
    }
