"""
IELTS-aligned writing scorer.

Produces four sub-band scores (0-9, half-band steps) for:
  • Task Response / Task Achievement
  • Coherence & Cohesion
  • Lexical Resource
  • Grammatical Range & Accuracy

The overall band is the mean of the four sub-bands rounded to the nearest
half band, following the official IELTS marking convention.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Literal

# ---------------------------------------------------------------------------
# Academic Word List (Coxhead AWL - most common 200 head words, lemmatised)
# ---------------------------------------------------------------------------
_AWL: frozenset[str] = frozenset(
    """
    abstract acquire adaptation adequate adjacent adjust administrate affirm
    aggregate aid allocation alter ambiguous analyse approach appropriate
    approximate arbitrary aspect assess assist assume attach attain attribute
    author available aware benefit capacity category cease circumstance
    clarify classic colleague commence community compatible comprehensive
    comprise concentrate conduct conform consent consequent considerable
    constitute context contract contribute controversy convene coordinate
    core cultural decline define demonstrate derive design discriminate
    distinct domestic dominant eliminate empirical equate error establish
    evaluate eventual evident exclude expand expose external facilitate
    finite fluctuate format foundation function generate global grant
    hypothesis identify illustrate impact imply indicate individual
    initiate instance interact interpret involve isolate labour legal
    legislation levy locate logical maintain major mechanism methodology
    minimise mutual negative objective obtain occupy option overall
    paradigm participate perceive persist pose potential primary principal
    prioritise process proportion provision pursue range reinforce require
    research resolve retain revenue role section significant simulate
    specific specify stable strategy subsequent subsidy sufficient summary
    sustain target technique technology tradition transfer transition vary
    volume welfare
    """.split()
)

# ---------------------------------------------------------------------------
# Discourse marker taxonomy (used to score Coherence & Cohesion)
# ---------------------------------------------------------------------------
_DISCOURSE_MARKERS: dict[str, list[str]] = {
    "contrast": [
        "however", "nevertheless", "nonetheless", "on the other hand",
        "on the contrary", "although", "even though", "despite",
        "in spite of", "while", "whereas", "yet",
    ],
    "addition": [
        "furthermore", "moreover", "in addition", "additionally",
        "besides", "not only", "equally important", "what is more",
    ],
    "cause_effect": [
        "therefore", "thus", "hence", "as a result", "consequently",
        "owing to", "due to", "as a consequence", "this leads to",
        "this means that", "this results in",
    ],
    "exemplification": [
        "for example", "for instance", "such as", "to illustrate",
        "namely", "in particular", "to demonstrate", "as shown by",
    ],
    "sequence": [
        "firstly", "first of all", "secondly", "thirdly", "finally",
        "subsequently", "to begin with",
    ],
    "summary": [
        "in conclusion", "to conclude", "in summary", "to summarise",
        "to summarize", "overall", "in brief", "in general", "to sum up",
    ],
}

_ALL_MARKERS: list[str] = [
    m for markers in _DISCOURSE_MARKERS.values() for m in markers
]

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class BandBreakdown:
    task_response: float   # 0-9
    coherence: float       # 0-9
    lexical: float         # 0-9
    grammar: float         # 0-9


@dataclass
class WritingScoreResult:
    band: float            # 0-9, half-band steps
    score: int             # 0-100
    word_count: int
    breakdown: BandBreakdown
    checks: list[dict]     # [{label, ok}]
    strengths: list[str]
    improvements: list[str]


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def _round_half(x: float) -> float:
    """Round to nearest 0.5."""
    return round(x * 2) / 2


def _tokenise(text: str) -> list[str]:
    return [w for w in re.split(r"[^a-zA-Z']+", text.lower()) if len(w) > 1]


def _sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]


def _paragraphs(text: str) -> list[str]:
    return [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]


def _count_markers(lower: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for cat, markers in _DISCOURSE_MARKERS.items():
        cnt = 0
        for m in markers:
            cnt += len(re.findall(rf"\b{re.escape(m)}\b", lower))
        counts[cat] = cnt
    return counts


def _ttr_windowed(words: list[str], window: int = 100) -> float:
    """Mean Segmental TTR over windows of `window` tokens."""
    if not words:
        return 0.0
    if len(words) <= window:
        return len(set(words)) / len(words)
    ttrs = []
    for i in range(0, len(words) - window + 1, window):
        chunk = words[i : i + window]
        ttrs.append(len(set(chunk)) / len(chunk))
    return sum(ttrs) / len(ttrs)


def _academic_ratio(words: list[str]) -> float:
    if not words:
        return 0.0
    return sum(1 for w in words if w in _AWL) / len(words)


def _avg_word_length(words: list[str]) -> float:
    if not words:
        return 0.0
    return sum(len(w) for w in words) / len(words)


def _complex_sentence_ratio(sentences: list[str]) -> float:
    """Fraction of sentences that contain subordinate-clause markers."""
    if not sentences:
        return 0.0
    sub_markers = re.compile(
        r"\b(although|because|since|while|whereas|if|unless|when|whenever|"
        r"after|before|until|as long as|even though|provided that|"
        r"which|who|that|whose|where)\b"
    )
    return sum(1 for s in sentences if sub_markers.search(s.lower())) / len(sentences)


def _passive_voice_count(text: str) -> int:
    return len(re.findall(
        r"\b(is|are|was|were|been|being)\s+\w+ed\b", text.lower()
    ))


def _modal_verb_count(text: str) -> int:
    return len(re.findall(
        r"\b(can|could|may|might|must|shall|should|will|would|need to|have to|ought to)\b",
        text.lower(),
    ))


def _sentence_length_variety(sentences: list[str]) -> float:
    """Standard deviation of sentence lengths normalised 0-1."""
    if len(sentences) < 2:
        return 0.0
    lengths = [len(s.split()) for s in sentences]
    mean = sum(lengths) / len(lengths)
    variance = sum((l - mean) ** 2 for l in lengths) / len(lengths)
    std = variance ** 0.5
    return min(1.0, std / 10.0)


# ---------------------------------------------------------------------------
# Main scoring functions
# ---------------------------------------------------------------------------

def score_task2(
    text: str,
    task_type: str = "opinion",
    topic_keywords: list[str] | None = None,
) -> WritingScoreResult:
    """Score an IELTS Academic Writing Task 2 essay."""

    lower = text.lower()
    words = _tokenise(text)
    word_count = len(words)
    sentences = _sentences(text)
    paragraphs = _paragraphs(text)

    marker_counts = _count_markers(lower)
    total_markers = sum(marker_counts.values())
    marker_variety = sum(1 for v in marker_counts.values() if v > 0)

    ttr = _ttr_windowed(words)
    acad_ratio = _academic_ratio(words)
    avg_wl = _avg_word_length(words)
    complex_ratio = _complex_sentence_ratio(sentences)
    passives = _passive_voice_count(text)
    modals = _modal_verb_count(text)
    sent_variety = _sentence_length_variety(sentences)
    avg_sent_words = word_count / max(len(sentences), 1)

    has_opinion = bool(re.search(
        r"\b(i (strongly )?(agree|disagree)|in my opinion|i believe|i think|"
        r"my view is|i would argue|it is my belief)\b", lower
    ))
    has_conclusion = bool(re.search(
        r"\b(in conclusion|to conclude|overall|in summary|to summarise|to sum up)\b", lower
    ))
    both_views = (
        bool(re.search(r"\bon the one hand\b", lower)) and
        bool(re.search(r"\bon the other hand\b", lower))
    )
    has_examples = marker_counts.get("exemplification", 0) >= 1
    has_adv = bool(re.search(r"\b(advantage|benefit|positive|merit)\b", lower))
    has_dis = bool(re.search(r"\b(disadvantage|drawback|risk|negative|downside)\b", lower))
    has_problems = bool(re.search(r"\b(problem|issue|cause|challenge)\b", lower))
    has_solutions = bool(re.search(r"\b(solution|measure|address|tackle|resolve)\b", lower))

    task_type_lc = task_type.lower()
    requires_opinion = "opinion" in task_type_lc or "agree" in task_type_lc
    requires_both = "both" in task_type_lc or "discuss" in task_type_lc
    requires_adv_dis = "advan" in task_type_lc or "disadvan" in task_type_lc
    requires_problems = "problem" in task_type_lc or "solution" in task_type_lc

    # ---- Task Response (0-9) ----
    tr = 5.0
    if word_count >= 250:
        tr += 1.0
    elif word_count >= 200:
        tr += 0.5
    elif word_count < 150:
        tr -= 2.0
    elif word_count < 200:
        tr -= 1.0

    if requires_opinion and has_opinion:
        tr += 0.5
    if has_conclusion:
        tr += 0.5
    if has_examples:
        tr += 0.5
    if requires_both and both_views:
        tr += 0.5
    elif requires_both and not both_views:
        tr -= 1.0
    if requires_adv_dis:
        if has_adv and has_dis:
            tr += 0.5
        else:
            tr -= 1.0
    if requires_problems:
        if has_problems and has_solutions:
            tr += 0.5
        else:
            tr -= 1.0
    if len(paragraphs) >= 4:
        tr += 0.5

    # Keyword coverage bonus
    if topic_keywords:
        hit = sum(1 for kw in topic_keywords if kw.lower() in lower)
        tr += min(0.5, hit / max(len(topic_keywords), 1) * 0.5)

    # ---- Coherence & Cohesion (0-9) ----
    cc = 5.0
    if len(paragraphs) >= 4:
        cc += 1.0
    elif len(paragraphs) == 3:
        cc += 0.5
    elif len(paragraphs) <= 1:
        cc -= 2.0
    if total_markers >= 6:
        cc += 1.0
    elif total_markers >= 3:
        cc += 0.5
    if marker_variety >= 4:
        cc += 0.5
    if has_conclusion:
        cc += 0.5
    if sent_variety >= 0.5:
        cc += 0.5
    if avg_sent_words < 8 or avg_sent_words > 32:
        cc -= 0.5

    # ---- Lexical Resource (0-9) ----
    lr = 5.0
    if ttr >= 0.65:
        lr += 1.5
    elif ttr >= 0.55:
        lr += 1.0
    elif ttr >= 0.45:
        lr += 0.5
    elif ttr < 0.35 and word_count > 100:
        lr -= 1.5
    if acad_ratio >= 0.08:
        lr += 1.0
    elif acad_ratio >= 0.04:
        lr += 0.5
    if avg_wl >= 5.2:
        lr += 0.5

    # ---- Grammatical Range & Accuracy (0-9) ----
    gr = 5.0
    if complex_ratio >= 0.5:
        gr += 1.0
    elif complex_ratio >= 0.3:
        gr += 0.5
    if sent_variety >= 0.5:
        gr += 0.5
    if passives >= 2:
        gr += 0.5
    if modals >= 2:
        gr += 0.5
    if len(sentences) >= 10:
        gr += 0.5

    too_many_excl = len(re.findall(r"!", text)) >= 3
    too_many_caps = len(re.findall(r"\b[A-Z]{4,}\b", text)) >= 3
    fragment_sentences = sum(1 for s in sentences if len(s.split()) < 4)
    fragment_ratio = fragment_sentences / max(len(sentences), 1)

    if too_many_excl:
        gr -= 1.0
    if too_many_caps:
        gr -= 0.5
    if fragment_ratio >= 0.3:
        gr -= 1.0

    # Clamp all to 0-9 in half steps
    tr = _round_half(_clamp(tr, 0, 9))
    cc = _round_half(_clamp(cc, 0, 9))
    lr = _round_half(_clamp(lr, 0, 9))
    gr = _round_half(_clamp(gr, 0, 9))

    band = _round_half((tr + cc + lr + gr) / 4)
    score = _clamp(round((band / 9) * 100), 0, 100)

    # ---- Checks ----
    checks = [
        {"label": "≥ 250 words", "ok": word_count >= 250},
        {"label": "Clear paragraphing (≥ 4 paragraphs)", "ok": len(paragraphs) >= 4},
        {"label": "Conclusion present", "ok": has_conclusion},
        {"label": "Linking devices used (≥ 3)", "ok": total_markers >= 3},
        {"label": "Academic vocabulary present", "ok": acad_ratio >= 0.04},
        {"label": "Complex sentences used", "ok": complex_ratio >= 0.3},
    ]
    if requires_opinion:
        checks.append({"label": "Clear opinion/position stated", "ok": has_opinion})
    if requires_both:
        checks.append({"label": "Both views discussed", "ok": both_views})
    if requires_adv_dis:
        checks.append({"label": "Advantages & disadvantages covered", "ok": has_adv and has_dis})
    if requires_problems:
        checks.append({"label": "Problems & solutions covered", "ok": has_problems and has_solutions})

    # ---- Strengths & Improvements ----
    strengths: list[str] = []
    improvements: list[str] = []

    if word_count >= 250:
        strengths.append("Meets the 250-word requirement.")
    else:
        improvements.append(f"Only {word_count} words — aim for at least 250 to develop ideas fully.")

    if len(paragraphs) >= 4:
        strengths.append("Well-structured with clear paragraphs (intro, body, conclusion).")
    else:
        improvements.append("Use at least 4 paragraphs: introduction, 2 body paragraphs, and a conclusion.")

    if has_conclusion:
        strengths.append("Clear conclusion that wraps up the argument.")
    else:
        improvements.append("Add a conclusion that restates your position and summarises key points.")

    if marker_variety >= 4:
        strengths.append(f"Good variety of cohesive devices ({total_markers} discourse markers from {marker_variety} categories).")
    elif total_markers >= 3:
        strengths.append("Uses some linking language to connect ideas.")
    else:
        improvements.append("Add more discourse markers (however, therefore, furthermore, for example…).")

    if acad_ratio >= 0.04:
        strengths.append("Academic vocabulary used effectively.")
    else:
        improvements.append("Incorporate more academic vocabulary (e.g., demonstrate, indicate, significant).")

    if complex_ratio >= 0.3:
        strengths.append("Good use of complex sentence structures.")
    else:
        improvements.append("Use more complex sentences with subordinate clauses (although, because, which…).")

    if ttr >= 0.55:
        strengths.append("Strong lexical variety — avoids repetition.")
    else:
        improvements.append("Vary your vocabulary more — avoid repeating the same words; use synonyms.")

    if requires_opinion and not has_opinion:
        improvements.append("State your opinion clearly in the introduction (e.g., 'I believe that…').")

    if too_many_excl:
        improvements.append("Avoid exclamation marks — maintain a formal academic tone throughout.")

    if fragment_ratio >= 0.3:
        improvements.append("Some sentences are very short (fragments) — develop ideas more fully.")

    return WritingScoreResult(
        band=band,
        score=score,
        word_count=word_count,
        breakdown=BandBreakdown(
            task_response=tr,
            coherence=cc,
            lexical=lr,
            grammar=gr,
        ),
        checks=checks,
        strengths=strengths[:4],
        improvements=improvements[:4],
    )


def score_task1(text: str) -> WritingScoreResult:
    """Score an IELTS Academic Writing Task 1 report."""

    lower = text.lower()
    words = _tokenise(text)
    word_count = len(words)
    sentences = _sentences(text)
    paragraphs = _paragraphs(text)

    marker_counts = _count_markers(lower)
    total_markers = sum(marker_counts.values())
    marker_variety = sum(1 for v in marker_counts.values() if v > 0)

    ttr = _ttr_windowed(words)
    acad_ratio = _academic_ratio(words)
    avg_wl = _avg_word_length(words)
    complex_ratio = _complex_sentence_ratio(sentences)
    sent_variety = _sentence_length_variety(sentences)
    avg_sent_words = word_count / max(len(sentences), 1)

    has_overview = bool(re.search(
        r"\b(overall|in general|in summary|to summarise|to summarize)\b", lower
    ))
    has_trends = bool(re.search(
        r"\b(increased?|decreased?|rose|fell|dropped?|remained?|steady|grew|growth|"
        r"decline|trend|fluctuated?|peaked?|reached|surged?|plummeted?)\b", lower
    ))
    has_comparisons = bool(re.search(
        r"\b(higher|lower|more|less|largest?|smallest?|greatest?|whereas|while|"
        r"compared (to|with)|in contrast|by contrast)\b", lower
    ))
    has_data_reference = bool(re.search(
        r"\b(\d{1,3}(\.\d+)?%?|\d{4}|\d+,\d+|approximately|roughly|nearly|"
        r"around|about \d)\b", lower
    ))

    # ---- Task Achievement (0-9) ----
    ta = 5.0
    if word_count >= 150:
        ta += 1.0
    elif word_count >= 120:
        ta += 0.5
    elif word_count < 100:
        ta -= 2.0
    elif word_count < 120:
        ta -= 1.0

    if has_overview:
        ta += 1.0
    else:
        ta -= 1.0
    if has_trends:
        ta += 0.5
    if has_comparisons:
        ta += 0.5
    if has_data_reference:
        ta += 0.5
    if len(paragraphs) >= 3:
        ta += 0.5

    # ---- Coherence & Cohesion (0-9) ----
    cc = 5.0
    if len(paragraphs) >= 3:
        cc += 1.0
    elif len(paragraphs) == 2:
        cc += 0.5
    elif len(paragraphs) <= 1:
        cc -= 1.5
    if total_markers >= 5:
        cc += 1.0
    elif total_markers >= 3:
        cc += 0.5
    if marker_variety >= 3:
        cc += 0.5
    if sent_variety >= 0.4:
        cc += 0.5
    if avg_sent_words < 8 or avg_sent_words > 32:
        cc -= 0.5

    # ---- Lexical Resource (0-9) ----
    lr = 5.0
    if ttr >= 0.65:
        lr += 1.5
    elif ttr >= 0.55:
        lr += 1.0
    elif ttr >= 0.45:
        lr += 0.5
    elif ttr < 0.35 and word_count > 60:
        lr -= 1.5
    if acad_ratio >= 0.06:
        lr += 1.0
    elif acad_ratio >= 0.03:
        lr += 0.5
    if avg_wl >= 5.0:
        lr += 0.5

    # ---- Grammatical Range & Accuracy (0-9) ----
    gr = 5.0
    if complex_ratio >= 0.4:
        gr += 1.0
    elif complex_ratio >= 0.25:
        gr += 0.5
    if sent_variety >= 0.4:
        gr += 0.5
    if len(sentences) >= 7:
        gr += 0.5

    too_many_excl = len(re.findall(r"!", text)) >= 3
    fragment_ratio = (
        sum(1 for s in sentences if len(s.split()) < 4) / max(len(sentences), 1)
    )
    if too_many_excl:
        gr -= 1.0
    if fragment_ratio >= 0.3:
        gr -= 1.0

    ta = _round_half(_clamp(ta, 0, 9))
    cc = _round_half(_clamp(cc, 0, 9))
    lr = _round_half(_clamp(lr, 0, 9))
    gr = _round_half(_clamp(gr, 0, 9))

    band = _round_half((ta + cc + lr + gr) / 4)
    score = _clamp(round((band / 9) * 100), 0, 100)

    # ---- Checks ----
    checks = [
        {"label": "≥ 150 words", "ok": word_count >= 150},
        {"label": "Overview present", "ok": has_overview},
        {"label": "Describes key trends / features", "ok": has_trends},
        {"label": "Makes comparisons", "ok": has_comparisons},
        {"label": "References specific data", "ok": has_data_reference},
        {"label": "Clear paragraph structure (≥ 2 paragraphs)", "ok": len(paragraphs) >= 2},
        {"label": "Uses linking language", "ok": total_markers >= 3},
    ]

    # ---- Strengths & Improvements ----
    strengths: list[str] = []
    improvements: list[str] = []

    if word_count >= 150:
        strengths.append("Meets the 150-word minimum requirement.")
    else:
        improvements.append(f"Only {word_count} words — aim for at least 150 to cover all key features.")

    if has_overview:
        strengths.append("Includes a clear overview of the main trends/features.")
    else:
        improvements.append("Add an overview paragraph identifying the most striking feature(s) without specific data.")

    if has_comparisons:
        strengths.append("Makes effective comparisons between data points.")
    else:
        improvements.append("Compare categories or time periods explicitly (whereas, in contrast, compared to).")

    if has_data_reference:
        strengths.append("Supports descriptions with specific figures.")
    else:
        improvements.append("Include specific data values (percentages, figures, years) to support your description.")

    if ttr >= 0.55:
        strengths.append("Good lexical variety — avoids repetition.")
    else:
        improvements.append("Vary your vocabulary more — use synonyms for key chart verbs (rise → increase → grow).")

    if total_markers >= 3:
        strengths.append("Uses linking language to connect ideas.")
    else:
        improvements.append("Add more cohesive devices (overall, while, whereas, in contrast…).")

    if complex_ratio >= 0.3:
        strengths.append("Uses complex sentence structures effectively.")
    else:
        improvements.append("Include more complex sentences (e.g., 'Although X increased, Y remained stable…').")

    return WritingScoreResult(
        band=band,
        score=score,
        word_count=word_count,
        breakdown=BandBreakdown(
            task_response=ta,
            coherence=cc,
            lexical=lr,
            grammar=gr,
        ),
        checks=checks,
        strengths=strengths[:4],
        improvements=improvements[:4],
    )
