import { useEffect, useMemo, useRef, useState } from 'react';

type ListeningQuestion =
  | {
      id: string;
      type: 'mcq';
      prompt: string;
      options: string[];
      correct: string; // must match one of options exactly
    }
  | {
      id: string;
      type: 'short';
      prompt: string;
      correct: string; // normalization will be applied
    };

type ListeningSection = {
  id: string;
  title: string;
  audioUrl: string; // can be replaced by user
  transcriptUrl?: string; // used for auto question generation
  questions: ListeningQuestion[];
};

type ListeningTest = {
  id: string;
  name: string;
  sections: ListeningSection[];
};

function normalizeShortAnswer(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/[\s]+/g, ' ');
}

function estimateBandFromListeningCorrect(correct: number) {
  // IELTS Listening band conversion for 40 questions (typical table varies slightly by test).
  // Ranges are based on common published conversion tables.
  const mapping: Array<{ min: number; max: number; band: number }> = [
    { min: 39, max: 40, band: 9 },
    { min: 37, max: 38, band: 8.5 },
    { min: 35, max: 36, band: 8 },
    { min: 32, max: 34, band: 7.5 },
    { min: 30, max: 31, band: 7 },
    { min: 26, max: 29, band: 6.5 },
    { min: 23, max: 25, band: 6 },
    { min: 18, max: 22, band: 5.5 },
    { min: 16, max: 17, band: 5 },
    { min: 13, max: 15, band: 4.5 },
    { min: 11, max: 12, band: 4 },
    { min: 6, max: 10, band: 3 },
    { min: 4, max: 5, band: 2.5 },
    { min: 2, max: 3, band: 2 },
    { min: 1, max: 1, band: 1 },
    { min: 0, max: 0, band: 0 },
  ];

  const row = mapping.find((m) => correct >= m.min && correct <= m.max);
  return row ? row.band : 0;
}

function buildAcademicWikimediaListeningTest(): ListeningTest {
  // Open educational media source:
  // - Audio: CC BY 3.0 on Wikimedia Commons
  // - Transcript: English SRT (TimedText) on Wikimedia Commons (available as text)
  // We generate IELTS-like practice questions automatically from the transcript.
  const audioUrl =
    'https://upload.wikimedia.org/wikipedia/commons/1/1c/CAM_Video-_2018_Nobel_Laureate_Donna_Strickland.webm';
  const transcriptUrl =
    '/api/listening/transcript/example';

  const baseSections: ListeningSection[] = [
    { id: 's1', title: 'Section 1 — Academic story (Generated)', audioUrl, transcriptUrl, questions: [] },
    { id: 's2', title: 'Section 2 — Academic story (Generated)', audioUrl, transcriptUrl, questions: [] },
    { id: 's3', title: 'Section 3 — Academic story (Generated)', audioUrl, transcriptUrl, questions: [] },
    { id: 's4', title: 'Section 4 — Academic story (Generated)', audioUrl, transcriptUrl, questions: [] },
  ];

  return {
    id: 'academic-wikimedia-generated',
    name: 'Academic Listening Practice (4 sections / 40 Q, generated from transcript)',
    sections: baseSections,
  };
}

async function fetchText(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

function parseSrtToSegments(srtText: string): string[] {
  const normalized = srtText.replace(/\r/g, '');
  const blocks = normalized.split(/\n\s*\n/);
  const segments: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Remove subtitle index line
    const maybeIndex = lines[0];
    const start = /^\d+$/.test(maybeIndex) ? 1 : 0;

    // Remove time range line
    const maybeTime = lines[start];
    const start2 = maybeTime && maybeTime.includes('-->') ? start + 1 : start;

    const textLines = lines.slice(start2);
    const joined = textLines.join(' ');

    const cleaned = joined
      .replace(/<[^>]*>/g, '') // remove italic tags like <i>
      .replace(/\[[^\]]*\]/g, '') // remove bracketed notes
      .replace(/\s+/g, ' ')
      .trim();

    if (cleaned) segments.push(cleaned);
  }

  return segments;
}

function extractKeywordCandidates(text: string) {
  const stop = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'to',
    'of',
    'in',
    'on',
    'at',
    'for',
    'with',
    'as',
    'by',
    'from',
    'that',
    'this',
    'it',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'but',
    'so',
    'because',
    'just',
    'not',
    'we',
    'i',
    'you',
    'they',
    'she',
    'he',
    'their',
    'my',
    'our',
    'your',
    'me',
    'him',
    'her',
    'them',
    'will',
    'would',
    'can',
    'could',
    'should',
    'may',
    'might',
    'there',
    'here',
    'up',
    'down',
    'into',
    'out',
    'about',
    'over',
    'under',
    'only',
    'also',
    'like',
    'when',
    'then',
    'than',
    'there’s',
    'theres',
    'myself',
  ]);

  const matches = text
    .toLowerCase()
    .match(/[a-z]{3,}(?:'[a-z]+)?/g);

  if (!matches) return [];

  // Keep unique keywords in first-seen order but filter by stopwords.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of matches) {
    const w = m.replace(/'+/g, '');
    if (stop.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
  }
  return out;
}

function makeBlankedSentence(segment: string, keyword: string) {
  // Use a loose replacement; IELTS practice is approximate (we score exact keyword match).
  const re = new RegExp(keyword, 'i');
  return segment.replace(re, '____');
}

function generateQuestionsFromSegments(segments: string[], totalQuestions = 40) {
  const fullText = segments.join(' ');
  const keywords = extractKeywordCandidates(fullText);

  // If transcript is short and keywords are insufficient, allow more words by reducing filters.
  const safeKeywords = keywords.length ? keywords : ['science'];

  const qList: ListeningQuestion[] = [];
  const mcqEvery = 2; // ~50% MCQ

  for (let i = 0; i < totalQuestions; i++) {
    const keyword = safeKeywords[i % safeKeywords.length] ?? '';
    const segment =
      segments.find((s) => new RegExp(keyword, 'i').test(s)) ?? segments[i % segments.length] ?? '';

    const blanked = makeBlankedSentence(segment, keyword);
    const sectionType: 'mcq' | 'short' = i % mcqEvery === 0 ? 'mcq' : 'short';

    if (!keyword || !segment) {
      qList.push({
        id: `q-${i}`,
        type: 'short',
        prompt: 'Listen and type the missing word.',
        correct: '',
      });
      continue;
    }

    if (sectionType === 'mcq') {
      // Deterministic distractors.
      const distractorA = safeKeywords[(i + 1) % safeKeywords.length];
      const distractorB = safeKeywords[(i + 2) % safeKeywords.length];
      const distractorC = safeKeywords[(i + 3) % safeKeywords.length];
      const optionsRaw = [keyword, distractorA, distractorB, distractorC].filter(Boolean);
      const uniqueOptions = Array.from(new Set(optionsRaw));
      const options = uniqueOptions.slice(0, 4);

      qList.push({
        id: `q-${i}`,
        type: 'mcq',
        prompt: `Choose the missing word: "${blanked}"`,
        options,
        correct: keyword,
      });
    } else {
      qList.push({
        id: `q-${i}`,
        type: 'short',
        prompt: `Type the missing word: "${blanked}"`,
        correct: keyword,
      });
    }
  }

  return qList;
}

export default function ListeningPage() {
  const initialTest = useMemo(() => buildAcademicWikimediaListeningTest(), []);

  // Working copy so the user can paste audio URLs without changing code.
  const [sections, setSections] = useState<ListeningSection[]>(initialTest.sections);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSectionResult, setShowSectionResult] = useState(false);
  const [sectionResults, setSectionResults] = useState<
    Record<string, { correct: number; total: number; band: number }>
  >({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeSection = sections[sectionIndex];

  const setAudioUrlForSection = (idx: number, url: string) => {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        return { ...s, audioUrl: url };
      }),
    );
  };

  const sectionQuestions = activeSection.questions;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setGenerating(true);
        setGenerateError(null);
        const transcriptUrl = initialTest.sections[0]?.transcriptUrl;
        if (!transcriptUrl) {
          setGenerateError('Missing transcript URL.');
          return;
        }

        const srtText = await fetchText(transcriptUrl);
        const segments = parseSrtToSegments(srtText);
        if (cancelled) return;

        const qList = generateQuestionsFromSegments(segments, 40);
        setSections((prev) =>
          prev.map((sec, secIdx) => {
            const slice = qList
              .slice(secIdx * 10, secIdx * 10 + 10)
              .map((q, qIdx) => ({ ...q, id: `${sec.id}-q${qIdx + 1}` }));
            return { ...sec, questions: slice };
          }),
        );
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Failed to generate listening questions.';
        setGenerateError(msg);
      } finally {
        if (!cancelled) setGenerating(false);
      }
    };

    // Generate only once for initial load.
    if (sections[0]?.questions.length > 0) {
      setGenerating(false);
      return;
    }
    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTest]);

  if (generating) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IELTS Listening Practice</h1>
          <p className="text-gray-500 mt-1">Generating questions from open academic audio transcript…</p>
        </div>
        <div className="text-sm text-gray-500">Please wait a moment.</div>
      </div>
    );
  }

  if (generateError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IELTS Listening Practice</h1>
          <p className="text-gray-500 mt-1">Failed to generate questions.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          {generateError}
        </div>
      </div>
    );
  }

  const computeSectionScore = (sec: ListeningSection) => {
    let correct = 0;
    let total = sec.questions.length;
    for (const q of sec.questions) {
      if (scoreQuestion(q)) correct += 1;
    }
    // IELTS band expects 40 answers; we approximate by scaling section score to 40.
    const scaledCorrect = Math.round((correct / Math.max(1, total)) * 40);
    const band = estimateBandFromListeningCorrect(scaledCorrect);
    return { correct, total, band };
  };

  const submitSection = () => {
    setSubmitError(null);
    // No hard enforcement: user can press even if audioUrl is empty.
    const allAnswered = sectionQuestions.every((q) => (answers[q.id] ?? '').trim().length > 0);
    if (!allAnswered) {
      setSubmitError('Please answer all questions in this section before submitting.');
      return;
    }

    const secScore = computeSectionScore(activeSection);
    setSectionResults((prev) => ({ ...prev, [activeSection.id]: secScore }));
    setShowSectionResult(true);
  };

  const scoreQuestion = (q: ListeningQuestion) => {
    const user = answers[q.id] ?? '';
    if (q.type === 'mcq') return normalizeShortAnswer(user) === normalizeShortAnswer(q.correct);
    return normalizeShortAnswer(user) === normalizeShortAnswer(q.correct);
  };

  const computeTotal = () => {
    let correct = 0;
    let total = 0;
    for (const sec of sections) {
      for (const q of sec.questions) {
        total += 1;
        if (scoreQuestion(q)) correct += 1;
      }
    }
    const band = estimateBandFromListeningCorrect(correct);
    return { correct, total, band };
  };

  if (finished) {
    const total = computeTotal();
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listening Practice Results</h1>
          <p className="text-gray-500 mt-1">
            Correct: <span className="font-medium text-gray-800">{total.correct}</span> / {total.total}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Estimated IELTS band (Listening)</p>
              <p className="text-4xl font-bold text-indigo-600 mt-1">{total.band}</p>
            </div>
            <div className="text-sm text-gray-600">
              Tips: This is an automated practice score. For official marking, IELTS answers are evaluated by specific criteria.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((sec, idx) => {
            const secTotal = sec.questions.length;
            const secCorrect =
              sectionResults[sec.id]?.correct ??
              sec.questions.reduce((acc, q) => acc + (scoreQuestion(q) ? 1 : 0), 0);
            const secBand =
              sectionResults[sec.id]?.band ?? estimateBandFromListeningCorrect(Math.round((secCorrect / secTotal) * 40));
            return (
              <div key={sec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {idx + 1}. {sec.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {secCorrect} / {secTotal}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Band ~ {secBand.toFixed(1)}</p>
                  </div>
                  <button
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                    onClick={() => {
                      // Allow "review" by going back to that section.
                      setFinished(false);
                      setShowSectionResult(false);
                      setSectionIndex(idx);
                    }}
                  >
                    Review
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (showSectionResult) {
    const secScore = sectionResults[activeSection.id] ?? computeSectionScore(activeSection);
    const isLast = sectionIndex >= sections.length - 1;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listening — Section {sectionIndex + 1} result</h1>
          <p className="text-gray-500 mt-1">{activeSection.title}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Correct</p>
              <p className="text-4xl font-bold text-indigo-600 mt-1">
                {secScore.correct} <span className="text-gray-400">/ {secScore.total}</span>
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Estimated band (scaled): <span className="font-medium text-gray-900">~ {secScore.band.toFixed(1)}</span>
            </div>
          </div>
          {submitError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {submitError}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            onClick={() => {
              setShowSectionResult(false);
              setSubmitError(null);
            }}
          >
            Back to answers
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            onClick={() => {
              setSubmitError(null);
              if (!isLast) {
                setShowSectionResult(false);
                setSectionIndex((i) => i + 1);
              } else {
                setFinished(true);
              }
            }}
          >
            {isLast ? 'Finish & see all results' : 'Next section'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">IELTS Listening Practice</h1>
        <p className="text-gray-500 mt-1">
          Four-section practice (40 questions). You can paste academic audio URLs below. Then answer each section and submit.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map((sec, idx) => {
          const isActive = idx === sectionIndex;
          return (
            <button
              key={sec.id}
              onClick={() => {
                if (showSectionResult) return;
                setSectionIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
              type="button"
            >
              Section {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Section {sectionIndex + 1}: {activeSection.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Audio is required for best practice. Scoring is based on the question keys.</p>
          </div>
          <div className="w-full sm:w-96">
            <label className="block text-xs font-medium text-gray-500 mb-1">Paste audio URL</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={activeSection.audioUrl}
              onChange={(e) => setAudioUrlForSection(sectionIndex, e.target.value)}
              placeholder="https://... (academic IELTS-like audio)"
            />
          </div>
        </div>

        {activeSection.audioUrl ? (
          <div className="flex items-center gap-3">
            <audio ref={audioRef} controls src={activeSection.audioUrl} className="w-full" />
          </div>
        ) : (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Audio URL is empty. You can paste an academic audio URL above to practice.
          </div>
        )}

        <div className="space-y-4">
          {sectionQuestions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Q{idx + 1}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{q.prompt}</p>
                </div>
                <div className="text-xs text-gray-400">Answer type: {q.type === 'mcq' ? 'MCQ' : 'Short'}</div>
              </div>

              {q.type === 'mcq' ? (
                <div className="mt-3 space-y-2">
                  {q.options.map((opt) => {
                    const selected = normalizeShortAnswer(answers[q.id] ?? '') === normalizeShortAnswer(opt);
                    return (
                      <label key={opt} className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                        selected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={selected}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                        />
                        <span className="text-sm text-gray-800">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={answers[q.id] ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Type your answer..."
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {submitError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {submitError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
            onClick={() => {
              if (sectionIndex === 0) return;
              setSectionIndex((i) => i - 1);
            }}
          >
            Back
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            onClick={submitSection}
          >
            {sectionIndex < sections.length - 1 ? 'Submit section' : 'Finish & see results'}
          </button>
        </div>
      </div>
    </div>
  );
}

