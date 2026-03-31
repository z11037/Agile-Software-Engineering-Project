import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgressSummary } from '../services/api';
import type { ProgressSummary } from '../types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { username } = useAuth();

  useEffect(() => {
    getProgressSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = summary ?? {
    total_words: 0,
    words_learned: 0,
    words_mastered: 0,
    total_quizzes: 0,
    average_score: 0,
    current_streak: 0,
    reviews_today: 0,
  };

  const coverage = stats.total_words > 0 ? Math.round((stats.words_learned / stats.total_words) * 100) : 0;
  const dailyTarget = 10;
  const reviewProgress = Math.min(100, Math.round((stats.reviews_today / dailyTarget) * 100));
  const heroLine = stats.current_streak < 3 ? 'Keep a short daily rhythm.' : `${stats.current_streak}-day streak, keep going.`;
  const levelLabel = stats.average_score >= 80 ? 'Strong' : stats.average_score >= 65 ? 'Steady' : 'Building';

  const openExternal = (label: string, url: string) => {
    const ok = window.confirm(`You are about to open ${label}:\n${url}`);
    if (!ok) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-stone-700 via-slate-700 to-indigo-700 p-7 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-200">DIICSU Freshman Hub</p>
          <h1 className="text-3xl font-bold mt-2">Welcome back, {username}</h1>
          <p className="text-slate-200 mt-3 max-w-2xl">{heroLine}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openExternal('Student Life', 'https://dii.csu.edu.cn')}
              className="text-sm font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              Student Life
            </button>
            <button
              type="button"
              onClick={() => openExternal('My Dundee', 'https://my.dundee.ac.uk')}
              className="text-sm font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              My Dundee
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full">Coverage {coverage}%</span>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full">Streak {stats.current_streak}d</span>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full">Level {levelLabel}</span>
          </div>
        </div>
        <div className="part-box p-6">
          <p className="text-sm font-medium text-slate-500">Today Goal</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.reviews_today} reviews</p>
          <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${reviewProgress}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{reviewProgress}% of daily target</p>
          <Link
            to="/review"
            className="inline-flex mt-5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            Start now
          </Link>
        </div>
      </section>

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
