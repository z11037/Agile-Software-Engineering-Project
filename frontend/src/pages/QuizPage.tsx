import { useEffect, useState } from 'react';
import { generateQuiz, submitQuiz, getCategories } from '../services/api';
import type { Quiz, QuizSubmitResult } from '../types';

type Phase = 'setup' | 'playing' | 'result';

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await generateQuiz({
        category: selectedCategory || undefined,
        count: questionCount,
      });
      setQuiz(res.data);
      setCurrentQ(0);
      setAnswers({});
      setPhase('playing');
    } catch {
      alert('Could not generate quiz. Make sure there are enough words.');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setLoading(true);
    try {
      const answerList = quiz.questions.map((q) => ({
        question_id: q.id,
        user_answer: answers[q.id] ?? '',
      }));
      const res = await submitQuiz(quiz.id, answerList);
      setResult(res.data);
      setPhase('result');
    } catch {
      alert('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  // SETUP phase
  if (phase === 'setup') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Take a Quiz</h1>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
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
            {loading ? 'Generating...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  // PLAYING phase
  if (phase === 'playing' && quiz) {
    const question = quiz.questions[currentQ];
    const totalQ = quiz.questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz</h1>
          <span className="text-sm text-gray-400">
            {currentQ + 1} / {totalQ}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-400 mb-2">What does this word mean?</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{question.english}</h2>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => selectAnswer(question.id, option)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium cursor-pointer ${
                  answers[question.id] === option
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ((i) => Math.max(0, i - 1))}
            disabled={currentQ === 0}
            className="px-5 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 transition cursor-pointer"
          >
            Previous
          </button>

          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQ((i) => i + 1)}
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
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULT phase
  if (phase === 'result' && result) {
    const pct = result.score;
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center py-8">
          <div className={`text-6xl font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
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
              className={`p-4 rounded-xl border-2 ${
                r.is_correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs font-medium ${r.is_correct ? 'text-emerald-600' : 'text-red-600'}`}>
                    {r.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                  <p className="font-medium text-gray-900 mt-1">Your answer: {r.user_answer || '(no answer)'}</p>
                  {!r.is_correct && (
                    <p className="text-sm text-gray-500">Correct answer: {r.correct_answer}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setPhase('setup');
            setQuiz(null);
            setResult(null);
          }}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  return null;
}
