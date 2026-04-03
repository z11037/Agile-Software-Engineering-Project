import { useCallback, useEffect, useRef, useState } from 'react';
import { getReviewWords, submitReview } from '../services/api';
import { Alert } from '../components/Alert';
import type { ReviewWord } from '../types';

export default function ReviewPage() {
  const [words, setWords] = useState<ReviewWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ knew: 0, didntKnow: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSaveError = (message: string) => {
    setSaveError(message);
    if (saveErrorTimerRef.current) clearTimeout(saveErrorTimerRef.current);
    saveErrorTimerRef.current = setTimeout(() => setSaveError(null), 5000);
  };

  useEffect(() => {
    return () => {
      if (saveErrorTimerRef.current) clearTimeout(saveErrorTimerRef.current);
    };
  }, []);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setFinished(false);
    setCurrentIndex(0);
    setFlipped(false);
    setStats({ knew: 0, didntKnow: 0 });
    setWords([]);
    try {
      const res = await getReviewWords(10);
      setWords(res.data);
      if (res.data.length === 0) setFinished(true);
    } catch {
      setWords([]);
      setLoadError('Failed to load review words. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const currentWord = words[currentIndex];

  const handleAnswer = async (knew: boolean) => {
    if (!currentWord) return;

    try {
      await submitReview(currentWord.id, knew);
    } catch {
      showSaveError('Progress not saved — your answer was recorded locally but could not be synced. Please check your connection.');
    }

    setStats((s) => ({
      knew: s.knew + (knew ? 1 : 0),
      didntKnow: s.didntKnow + (knew ? 0 : 1),
    }));

    setFlipped(false);
    if (currentIndex + 1 >= words.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading words...</div>;
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto py-16 space-y-4">
        <Alert variant="error" title="Could not load review session">
          {loadError}
        </Alert>
        <div className="text-center">
          <button
            type="button"
            onClick={() => void loadSession()}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-5xl mb-4">&#127881;</div>
        <h2 className="text-2xl font-bold text-gray-900">Session Complete!</h2>
        <p className="text-gray-500 mt-2">
          {words.length === 0
            ? 'No words due for review right now. Great job!'
            : `You reviewed ${words.length} word${words.length !== 1 ? 's' : ''}.`}
        </p>
        {words.length > 0 && (
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.knew}</p>
              <p className="text-sm text-gray-500">Knew</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{stats.didntKnow}</p>
              <p className="text-sm text-gray-500">Didn't know</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => void loadSession()}
          className="mt-8 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
        >
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Vocabulary Review</h1>
        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / words.length) * 100}%` }}
        />
      </div>

      {/* Save error toast */}
      {saveError && (
        <Alert variant="error" title="Progress not saved">
          <div className="flex items-start justify-between gap-2">
            <span>{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="shrink-0 text-red-500 hover:text-red-700 font-bold leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </Alert>
      )}

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative part-box p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none hover:shadow-md transition-shadow"
      >
        {!flipped ? (
          <>
            <span className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              {currentWord.part_of_speech} &middot; {currentWord.category}
            </span>
            <h2 className="text-4xl font-bold text-gray-900">{currentWord.english}</h2>
            <p className="text-sm text-gray-400 mt-6">Tap to reveal translation</p>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400 uppercase tracking-wide mb-2">Translation</span>
            <h2 className="text-4xl font-bold text-indigo-600">{currentWord.chinese}</h2>
            {currentWord.example_sentence && (
              <p className="text-gray-500 mt-4 text-center italic">"{currentWord.example_sentence}"</p>
            )}
          </>
        )}

        {/* Difficulty badge */}
        <span className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-medium ${
          currentWord.difficulty_level === 1
            ? 'bg-green-100 text-green-700'
            : currentWord.difficulty_level === 2
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {currentWord.difficulty_level === 1 ? 'Easy' : currentWord.difficulty_level === 2 ? 'Medium' : 'Hard'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition cursor-pointer"
        >
          Don't Know
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition cursor-pointer"
        >
          I Know This
        </button>
      </div>
    </div>
  );
}
