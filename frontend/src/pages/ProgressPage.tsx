import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  getProgressSummary,
  getProgressHistory,
  getQuizHistory,
  getOralPracticeHistory,
} from '../services/api';
import type { ProgressSummary, DailyProgress, QuizResult, OralPracticeAttempt } from '../types';
import { normalizeProgressHistory } from '../utils/progressHistory';

const HISTORY_DAYS = 30;

const ORAL_CATEGORY_LABELS: Record<string, string> = {
  cs: 'CS',
  mechanical: 'Mechanical',
  civil: 'Civil',
  transportation: 'Transportation',
  math: 'Math',
};

export default function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<DailyProgress[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [oralHistory, setOralHistory] = useState<OralPracticeAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const chartHistory = useMemo(
    () => normalizeProgressHistory(history, HISTORY_DAYS),
    [history],
  );

  useEffect(() => {
    Promise.all([
      getProgressSummary(),
      getProgressHistory(HISTORY_DAYS),
      getQuizHistory(),
      getOralPracticeHistory(40),
    ])
      .then(([s, h, q, o]) => {
        setSummary(s.data);
        setHistory(h.data);
        setQuizHistory(q.data);
        setOralHistory(o.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading progress...</div>;
  }

  const stats = summary ?? {
    total_words: 0,
    words_learned: 0,
    words_mastered: 0,
    total_quizzes: 0,
    average_score: 0,
    current_streak: 0,
    reviews_today: 0,
    total_oral_attempts: 0,
    oral_attempts_today: 0,
  };

  const learnedPct = stats.total_words > 0 ? Math.round((stats.words_learned / stats.total_words) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">DIICSU Growth Tracker</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Progress Center</h1>
        <p className="text-slate-600 mt-1">See your momentum week by week and celebrate every improvement.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard label="Vocabulary Coverage" value={`${learnedPct}%`} sub={`${stats.words_learned} / ${stats.total_words}`} />
        <SummaryCard label="Words Mastered" value={String(stats.words_mastered)} />
        <SummaryCard label="Total Quizzes" value={String(stats.total_quizzes)} />
        <SummaryCard label="Average Score" value={`${stats.average_score}%`} />
        <SummaryCard label="Oral Attempts" value={String(stats.total_oral_attempts)} sub="All time" />
        <SummaryCard label="Oral Today" value={String(stats.oral_attempts_today)} sub="This UTC day" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 part-box p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Daily Activity (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={20}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="reviews" name="Reviews" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="quizzes" name="Quizzes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="oral_practice" name="Oral practice" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>

        <div className="xl:col-span-2 part-box p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quiz Accuracy Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={20}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="accuracy"
              name="Accuracy %"
              stroke="#10b981"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (cx == null || cy == null || !payload || payload.quizzes === 0) {
                  return null;
                }
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth={1}
                  />
                );
              }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Quiz history table */}
      <div className="part-box p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Quizzes</h2>
        {quizHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">No quizzes taken yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Questions</th>
                  <th className="pb-3 font-medium">Correct</th>
                  <th className="pb-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {quizHistory.map((q) => (
                  <tr key={q.id} className="border-b border-gray-50">
                    <td className="py-3 text-gray-700">
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-gray-700 capitalize">{q.quiz_type.replace('_', ' ')}</td>
                    <td className="py-3 text-gray-700">{q.total_questions}</td>
                    <td className="py-3 text-gray-700">{q.correct_answers}</td>
                    <td className="py-3">
                      <span className={`font-medium ${
                        q.score >= 70 ? 'text-emerald-600' : q.score >= 40 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {q.score.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="part-box p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Oral Practice</h2>
        {oralHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">No oral practice attempts yet. Complete a recording on Oral Practice to see history here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Difficulty</th>
                  <th className="pb-3 font-medium">Question #</th>
                </tr>
              </thead>
              <tbody>
                {oralHistory.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50">
                    <td className="py-3 text-gray-700">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-700">
                      {ORAL_CATEGORY_LABELS[row.category] ?? row.category}
                    </td>
                    <td className="py-3 text-gray-700 capitalize">{row.difficulty}</td>
                    <td className="py-3 text-gray-700">{row.question_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="part-box p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}
