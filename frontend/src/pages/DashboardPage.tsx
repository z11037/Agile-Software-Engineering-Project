import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProgressSummary } from '../services/api';
import type { ProgressSummary } from '../types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgressSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  const stats = summary ?? {
    total_words: 0,
    words_learned: 0,
    words_mastered: 0,
    total_quizzes: 0,
    average_score: 0,
    current_streak: 0,
    reviews_today: 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your learning overview at a glance</p>
      </div>

      {/* Streak banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm">Current Streak</p>
            <p className="text-4xl font-bold mt-1">{stats.current_streak} day{stats.current_streak !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-100 text-sm">Reviews Today</p>
            <p className="text-4xl font-bold mt-1">{stats.reviews_today}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Words Learned" value={stats.words_learned} sub={`of ${stats.total_words}`} />
        <StatCard label="Words Mastered" value={stats.words_mastered} sub="familiarity 4+" />
        <StatCard label="Quizzes Taken" value={stats.total_quizzes} />
        <StatCard label="Avg Score" value={`${stats.average_score}%`} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          to="/review"
          title="Review Words"
          description="Practice vocabulary with flashcards"
          color="bg-emerald-500"
        />
        <QuickAction
          to="/quiz"
          title="Take a Quiz"
          description="Test your knowledge"
          color="bg-amber-500"
        />
        <QuickAction
          to="/progress"
          title="View Progress"
          description="See your learning analytics"
          color="bg-blue-500"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function QuickAction({ to, title, description, color }: { to: string; title: string; description: string; color: string }) {
  return (
    <Link
      to={to}
      className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group"
    >
      <div className={`w-10 h-10 ${color} rounded-lg mb-3 group-hover:scale-110 transition-transform`} />
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
