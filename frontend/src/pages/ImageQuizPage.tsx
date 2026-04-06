import { useEffect, useState, useMemo, useRef } from 'react';
import { generateImageQuiz, submitImageQuiz, getImageCategories } from '../services/api';
import type { ImageQuiz, ImageQuizSubmitResult } from '../types';
import { Alert } from '../components/Alert';

type Phase = 'setup' | 'playing' | 'result';
type AnswerMode = 'multiple_choice' | 'free_input';

const CATEGORY_LABELS: Record<string, string> = {
  emoji: 'Emotions',
  object: 'Objects',
  scene: 'Scenes',
  meme: 'Actions & Memes',
};

function formatCategory(key: string): string {
  return CATEGORY_LABELS[key] ?? key.replace(/_/g, ' ');
}

export default function ImageQuizPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [questionCount, setQuestionCount] = useState(10);
  const [answerMode, setAnswerMode] = useState<AnswerMode>(() => {
    const saved = localStorage.getItem('image_quiz_mode');
    return saved === 'free_input' ? 'free_input' : 'multiple_choice';
  });
  const [quiz, setQuiz] = useState<ImageQuiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<ImageQuizSubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getImageCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const sortedCategories = useMemo(() => {
    const order = ['emoji', 'object', 'scene', 'meme'];
    const orderSet = new Set(order);
    const primary = order.filter((k) => categories.includes(k));
    const rest = categories.filter((k) => !orderSet.has(k)).sort();
    return [...primary, ...rest];
  }, [categories]);

  const handleModeChange = (mode: AnswerMode) => {
    setAnswerMode(mode);
    localStorage.setItem('image_quiz_mode', mode);
  };

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await generateImageQuiz({
        category: selectedCategory || undefined,
        count: questionCount,
        difficulty: selectedDifficulty || undefined,
        mode: answerMode,
      });
      setQuiz(res.data);
      setCurrentQ(0);
      setAnswers({});
      setPhase('playing');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not generate quiz. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToQuestion = (idx: number) => {
    setCurrentQ(idx);
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setLoading(true);
    setError('');
    try {
      const answerList = quiz.questions.map((q) => ({
        question_id: q.id,
        user_answer: answers[q.id] ?? '',
      }));
      const res = await submitImageQuiz(quiz.id, answerList);
      setResult(res.data);
      setPhase('result');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to submit quiz. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── SETUP ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Picture Guess</h1>
        <p className="text-sm text-gray-500">
          Look at the image and guess the English word or phrase it represents.
        </p>

        <div className="part-box p-6 space-y-5">
          {error && <Alert variant="warning">{error}</Alert>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All categories</option>
              {sortedCategories.map((c) => (
                <option key={c} value={c}>{formatCategory(c)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value={0}>All levels</option>
              <option value={1}>Easy</option>
              <option value={2}>Medium</option>
              <option value={3}>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Answer Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleModeChange('multiple_choice')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition cursor-pointer ${
                  answerMode === 'multiple_choice'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('free_input')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition cursor-pointer ${
                  answerMode === 'free_input'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Free Input
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {questionCount}
            </label>
            <input
              type="range"
              min={5}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Generating...' : 'Start Picture Guess'}
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────
  if (phase === 'playing' && quiz) {
    const question = quiz.questions[currentQ];
    const totalQ = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-lg mx-auto space-y-6">
        {error && <Alert variant="warning">{error}</Alert>}

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Picture Guess</h1>
          <span className="text-sm text-gray-400">
            {currentQ + 1} / {totalQ}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
          />
        </div>

        {/* Image card */}
        <div className="part-box p-6 text-center">
          <p className="text-sm text-gray-400 mb-4">
            What does this picture represent in English?
          </p>

          {/* Emoji display */}
          <div className="flex items-center justify-center w-36 h-36 mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 shadow-inner mb-6">
            <span className="text-7xl leading-none select-none">{question.image_url}</span>
          </div>

          {/* Hint */}
          {question.hint && (
            <div className="mb-5">
              {showHint ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                  Hint: {question.hint}
                </p>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-sm text-indigo-500 hover:text-indigo-700 transition cursor-pointer"
                >
                  Show hint
                </button>
              )}
            </div>
          )}

          {/* Answer area */}
          {answerMode === 'multiple_choice' && question.options.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => selectAnswer(question.id, option)}
                  className={`px-4 py-3 rounded-lg border-2 transition font-medium cursor-pointer text-center ${
                    answers[question.id] === option
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-xs mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={answers[question.id] ?? ''}
                onChange={(e) => selectAnswer(question.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentQ < totalQ - 1) goToQuestion(currentQ + 1);
                }}
                placeholder="Type the English word..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => goToQuestion(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-5 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition cursor-pointer"
          >
            Previous
          </button>

          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => goToQuestion(currentQ + 1)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalQ || loading}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const pct = result.score;
    return (
      <div className="max-w-lg mx-auto space-y-6">
        {error && <Alert variant="warning">{error}</Alert>}

        <div className="text-center py-8">
          <div
            className={`text-6xl font-bold ${
              pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500'
            }`}
          >
            {pct.toFixed(0)}%
          </div>
          <p className="text-gray-500 mt-2">
            {result.correct_answers} of {result.total_questions} correct
          </p>
        </div>

        {/* Detailed results */}
        <div className="space-y-3">
          {result.results.map((r) => (
            <div
              key={r.question_id}
              className={`p-4 rounded-xl border-2 flex items-center gap-4 ${
                r.is_correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-white/80 border border-gray-100 shadow-sm">
                <span className="text-3xl leading-none">{r.image_url}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-xs font-medium ${
                    r.is_correct ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {r.is_correct ? 'Correct' : 'Incorrect'}
                </span>
                <p className="text-lg font-bold text-gray-900 mt-0.5 truncate">
                  {r.correct_answer}
                </p>
                {!r.is_correct && (
                  <p className="text-sm text-gray-500">
                    Your answer: {r.user_answer || '(no answer)'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setPhase('setup');
            setQuiz(null);
            setResult(null);
            setShowHint(false);
          }}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
        >
          Play Again
        </button>
      </div>
    );
  }

  return null;
}
