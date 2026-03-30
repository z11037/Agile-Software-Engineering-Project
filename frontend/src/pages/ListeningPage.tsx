import { useCallback, useEffect, useRef, useState } from 'react';

type ListeningQuestion =
  | {
      id: string;
      type: 'mcq';
      prompt: string;
      options: string[];
      correct: string;
    }
  | {
      id: string;
      type: 'short';
      prompt: string;
      correct: string;
    };

type ListeningSection = {
  id: string;
  title: string;
  audioUrl: string;
  questions: ListeningQuestion[];
};

type PracticeApiResponse = {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lecture_title: string;
  attribution: string;
  license_note: string;
  source_url: string;
  clip_start_sec: number;
  clip_end_sec: number;
  clip_note: string;
  sections: Array<{
    id: string;
    title: string;
    audio_url: string;
    questions: ListeningQuestion[];
  }>;
};

function normalizeShortAnswer(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/g, '')
    .replace(/[\s]+/g, ' ');
}

function estimateBandFromListeningCorrect(correct: number) {
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

function formatClipTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function mapPracticePayload(data: PracticeApiResponse): {
  meta: Omit<PracticeApiResponse, 'sections'>;
  sections: ListeningSection[];
} {
  return {
    meta: {
      id: data.id,
      name: data.name,
      difficulty: data.difficulty,
      lecture_title: data.lecture_title,
      attribution: data.attribution,
      license_note: data.license_note,
      source_url: data.source_url,
      clip_start_sec: data.clip_start_sec,
      clip_end_sec: data.clip_end_sec,
      clip_note: data.clip_note,
    },
    sections: data.sections.map((s) => ({
      id: s.id,
      title: s.title,
      audioUrl: s.audio_url,
      questions: s.questions,
    })),
  };
}

export default function ListeningPage() {
  const [phase, setPhase] = useState<'pick' | 'loading' | 'practice'>('pick');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [practiceMeta, setPracticeMeta] = useState<Omit<PracticeApiResponse, 'sections'> | null>(null);
  const [sections, setSections] = useState<ListeningSection[]>([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSectionResult, setShowSectionResult] = useState(false);
  const [sectionResults, setSectionResults] = useState<
    Record<string, { correct: number; total: number; band: number }>
  >({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeSection = sections[sectionIndex];

  const clipEndSec = practiceMeta?.clip_end_sec ?? null;

  const startPractice = useCallback(async (difficulty: 'easy' | 'medium' | 'hard') => {
    setPhase('loading');
    setLoadError(null);
    try {
      const res = await fetch(`/api/listening/practice?difficulty=${difficulty}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed to load practice (${res.status})`);
      }
      const data = (await res.json()) as PracticeApiResponse;
      const { meta, sections: secs } = mapPracticePayload(data);
      setPracticeMeta(meta);
      setSections(secs);
      setSectionIndex(0);
      setAnswers({});
      setFinished(false);
      setShowSectionResult(false);
      setSectionResults({});
      setSubmitError(null);
      setPhase('practice');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load listening practice.';
      setLoadError(msg);
      setPhase('pick');
    }
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || clipEndSec == null) return;

    const onLoaded = () => {
      if (practiceMeta && el.currentTime < practiceMeta.clip_start_sec) {
        el.currentTime = practiceMeta.clip_start_sec;
      }
    };

    const onTimeUpdate = () => {
      if (el.currentTime >= clipEndSec) {
        el.pause();
        el.currentTime = clipEndSec;
      }
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [clipEndSec, practiceMeta, sectionIndex, activeSection?.audioUrl]);

  const scoreQuestion = (q: ListeningQuestion) => {
    const user = answers[q.id] ?? '';
    if (q.type === 'mcq') return normalizeShortAnswer(user) === normalizeShortAnswer(q.correct);
    return normalizeShortAnswer(user) === normalizeShortAnswer(q.correct);
  };

  const sectionQuestions = activeSection?.questions ?? [];

  const computeSectionScore = (sec: ListeningSection) => {
    let correct = 0;
    const total = sec.questions.length;
    for (const q of sec.questions) {
      if (scoreQuestion(q)) correct += 1;
    }
    const scaledCorrect = Math.round((correct / Math.max(1, total)) * 40);
    const band = estimateBandFromListeningCorrect(scaledCorrect);
    return { correct, total, band };
  };

  const submitSection = () => {
    if (!activeSection) return;
    setSubmitError(null);
    const allAnswered = sectionQuestions.every((q) => (answers[q.id] ?? '').trim().length > 0);
    if (!allAnswered) {
      setSubmitError('Please answer all questions in this section before submitting.');
      return;
    }
    const secScore = computeSectionScore(activeSection);
    setSectionResults((prev) => ({ ...prev, [activeSection.id]: secScore }));
    setShowSectionResult(true);
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

  const backToDifficulty = () => {
    if (phase === 'practice' && Object.keys(answers).length > 0) {
      const ok = window.confirm('Leave this practice? Your answers on this set will be cleared.');
      if (!ok) return;
    }
    setPhase('pick');
    setPracticeMeta(null);
    setSections([]);
    setAnswers({});
    setFinished(false);
    setShowSectionResult(false);
    setSectionResults({});
    setLoadError(null);
    setSubmitError(null);
    setSectionIndex(0);
  };

  if (phase === 'pick' || phase === 'loading') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listening — public lecture</h1>
          <p className="text-gray-500 mt-1">
            One open lecture from Wikimedia Commons (CC BY 3.0). This session uses about{' '}
            <span className="font-medium text-gray-700">5–8 minutes</span> of audio (clipped to the first ~7
            minutes). Choose a difficulty; each level has a different auto-generated question set (4 sections × 10
            questions).
          </p>
        </div>

        {loadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">{loadError}</div>
        )}

        <div className="grid sm:grid-cols-3 gap-4">
          {(
            [
              {
                key: 'easy' as const,
                title: 'Easy',
                desc: 'Earlier transcript focus, longer keywords, more multiple choice.',
              },
              {
                key: 'medium' as const,
                title: 'Medium',
                desc: 'Full clip vocabulary mix; balanced MCQ and short answers.',
              },
              {
                key: 'hard' as const,
                title: 'Hard',
                desc: 'Later / denser parts, shorter keywords, more short-answer items.',
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={phase === 'loading'}
              onClick={() => startPractice(opt.key)}
              className="text-left rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/40 transition disabled:opacity-60"
            >
              <p className="text-lg font-semibold text-gray-900">{opt.title}</p>
              <p className="text-sm text-gray-600 mt-2">{opt.desc}</p>
              {phase === 'loading' ? (
                <p className="text-xs text-indigo-600 mt-3">Loading…</p>
              ) : (
                <p className="text-xs text-indigo-600 mt-3 font-medium">Start →</p>
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          Source: Institute of Physics — Newton Medal (2012) interview with Professor Martin Rees, on Wikimedia Commons.
        </p>
      </div>
    );
  }

  if (!activeSection || !practiceMeta) {
    return (
      <div className="text-sm text-gray-500">
        Nothing loaded.{' '}
        <button type="button" className="text-indigo-600 underline" onClick={backToDifficulty}>
          Choose difficulty
        </button>
      </div>
    );
  }

  if (finished) {
    const total = computeTotal();
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listening practice — results</h1>
            <p className="text-gray-500 mt-1">
              {practiceMeta.name} · {total.correct} / {total.total} correct
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            onClick={backToDifficulty}
          >
            New difficulty
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Estimated IELTS band (Listening)</p>
              <p className="text-4xl font-bold text-indigo-600 mt-1">{total.band}</p>
            </div>
            <div className="text-sm text-gray-600">
              Automated practice score only. Official IELTS marking uses examiner criteria.
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
              sectionResults[sec.id]?.band ??
              estimateBandFromListeningCorrect(Math.round((secCorrect / secTotal) * 40));
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
          <h1 className="text-2xl font-bold text-gray-900">Section {sectionIndex + 1} — result</h1>
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
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{submitError}</div>
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
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{practiceMeta.name}</h1>
          <p className="text-gray-500 mt-1">{practiceMeta.lecture_title}</p>
          <p className="text-sm text-gray-500 mt-2">{practiceMeta.clip_note}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            onClick={backToDifficulty}
          >
            Change difficulty
          </button>
          <a
            href={practiceMeta.source_url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Source on Commons
          </a>
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3">
        <p>
          <span className="font-medium text-gray-700">Attribution:</span> {practiceMeta.attribution}
        </p>
        <p className="mt-1">{practiceMeta.license_note}</p>
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
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Section {sectionIndex + 1}: {activeSection.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Playback stops at {formatClipTime(practiceMeta.clip_end_sec)} (practice window). Use the same audio for
            all four sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <audio key={activeSection.audioUrl} ref={audioRef} controls src={activeSection.audioUrl} className="w-full" />
        </div>

        <div className="space-y-4">
          {sectionQuestions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Q{idx + 1}</p>
                  <p className="text-sm text-gray-700 mt-1">{q.prompt}</p>
                </div>
                <div className="text-xs text-gray-400">Type: {q.type === 'mcq' ? 'MCQ' : 'Short'}</div>
              </div>

              {q.type === 'mcq' ? (
                <div className="mt-3 space-y-2">
                  {q.options.map((opt) => {
                    const selected = normalizeShortAnswer(answers[q.id] ?? '') === normalizeShortAnswer(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                          selected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-white hover:bg-gray-50'
                        }`}
                      >
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
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{submitError}</div>
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
