import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getProgressSummary } from '../services/api';
import type { ProgressSummary } from '../types';

const ENCOURAGEMENT_TIPS = [
  'Small progress every day becomes big progress every semester.',
  'You do not need perfect study sessions, just consistent ones.',
  'A 15-minute review now is better than a 2-hour panic later.',
  'Confidence grows from repetition. Keep showing up.',
  'Every quiz is feedback, not judgment.',
];

const CULTURE_TIPS = [
  'DIICSU tip: combine English practice with your major vocabulary for faster gains.',
  'Campus rhythm tip: review words between classes to use fragmented time well.',
  'Cross-cultural tip: keep one phrase notebook for formal classroom communication.',
  'Study culture tip: discuss one new term with a classmate each day.',
  'Global mindset tip: explain one concept in both Chinese and English to deepen understanding.',
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { username } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 'review', label: 'Complete 10 reviews', done: false },
    { id: 'quiz', label: 'Finish 1 quiz', done: false },
    { id: 'focus', label: 'Do 1 Listening or Writing session', done: false },
  ]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [encouragementTip, setEncouragementTip] = useState('');
  const [cultureTip, setCultureTip] = useState('');

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
  const masteryRate = stats.words_learned > 0 ? Math.round((stats.words_mastered / stats.words_learned) * 100) : 0;
  const needsQuizBoost = stats.total_quizzes < 3 || stats.average_score < 65;
  const dailyTarget = 10;
  const reviewProgress = Math.min(100, Math.round((stats.reviews_today / dailyTarget) * 100));
  const heroLine = stats.current_streak < 3 ? 'Keep a short daily rhythm.' : `${stats.current_streak}-day streak, keep going.`;
  const levelLabel = stats.average_score >= 80 ? 'Strong' : stats.average_score >= 65 ? 'Steady' : 'Building';
  const completedTasks = tasks.filter((t) => t.done).length;
  const taskProgress = Math.round((completedTasks / tasks.length) * 100);

  useEffect(() => {
    const key = `dashboard_tasks_${username}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as typeof tasks;
        setTasks(parsed);
      } catch {
        // ignore invalid local data
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    const key = `dashboard_tasks_${username}`;
    localStorage.setItem(key, JSON.stringify(tasks));
  }, [tasks, username]);

  const quickInsights = useMemo(
    () => [
      { label: 'Coverage', value: `${coverage}%`, tone: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
      { label: 'Mastery', value: `${masteryRate}%`, tone: 'bg-orange-50 text-orange-700 border-orange-100' },
      { label: 'Avg Score', value: `${Math.round(stats.average_score)}%`, tone: 'bg-slate-100 text-slate-700 border-slate-200' },
    ],
    [coverage, masteryRate, stats.average_score]
  );

  const shuffleTips = () => {
    const quote = ENCOURAGEMENT_TIPS[Math.floor(Math.random() * ENCOURAGEMENT_TIPS.length)];
    const culture = CULTURE_TIPS[Math.floor(Math.random() * CULTURE_TIPS.length)];
    setEncouragementTip(quote);
    setCultureTip(culture);
  };

  const startEditingTask = (taskId: string, currentLabel: string) => {
    setEditingTaskId(taskId);
    setEditingText(currentLabel);
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const saveEditingTask = () => {
    const text = editingText.trim();
    if (!editingTaskId || !text) return;
    setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? { ...t, label: text } : t)));
    cancelEditingTask();
  };

  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    const newTask = {
      id: `custom-${Date.now()}`,
      label: text,
      done: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskText('');
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (editingTaskId === taskId) {
      cancelEditingTask();
    }
  };

  useEffect(() => {
    shuffleTips();
  }, []);

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

      <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-amber-100 text-sm">Current Study Streak</p>
            <p className="text-4xl font-bold mt-1">{stats.current_streak} day{stats.current_streak !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-100 text-sm">Reviews Completed Today</p>
            <p className="text-4xl font-bold mt-1">{stats.reviews_today}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-100 text-sm">Learning Status</p>
            <p className="text-3xl font-bold mt-1">{levelLabel}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="part-box p-5">
          <h2 className="text-lg font-semibold text-slate-900">Continue Learning</h2>
          <p className="text-sm text-slate-600 mt-2">
            {needsQuizBoost
              ? 'Do one short quiz after review.'
              : 'Continue review and keep your rhythm.'}
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              to={needsQuizBoost ? '/quiz' : '/review'}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
            >
              {needsQuizBoost ? 'Start a quick quiz' : 'Continue review'}
            </Link>
            <Link
              to="/progress"
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
            >
              View full progress
            </Link>
          </div>
        </div>
        <div className="part-box p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Today Checklist</h2>
            <span className="text-xs text-slate-500">{completedTasks}/{tasks.length} done</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${taskProgress}%` }} />
          </div>
          <div className="mt-3 space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() =>
                    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))
                  }
                  className="h-4 w-4 accent-indigo-600"
                />
                {editingTaskId === task.id ? (
                  <>
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={saveEditingTask}
                      className="px-2 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditingTask}
                      className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{task.label}</span>
                    <button
                      type="button"
                      onClick={() => startEditingTask(task.id, task.label)}
                      className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="px-2 py-1 text-xs rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a custom task..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={addTask}
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickInsights.map((item) => (
          <div key={item.label} className={`rounded-xl border px-4 py-3 ${item.tone}`}>
            <p className="text-xs">{item.label}</p>
            <p className="text-xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="part-box p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-slate-900">Daily Inspiration</h2>
          <button
            type="button"
            onClick={shuffleTips}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Show another
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
            <p className="text-xs text-indigo-700 uppercase tracking-wide">Encouragement</p>
            <p className="mt-1 text-sm text-slate-800">{encouragementTip}</p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4">
            <p className="text-xs text-orange-700 uppercase tracking-wide">Culture Highlight</p>
            <p className="mt-1 text-sm text-slate-800">{cultureTip}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickAction
          to="/review"
          title="Review Words"
          description="Daily practice"
          color="bg-indigo-500"
          icon="🧠"
        />
        <QuickAction
          to="/quiz"
          title="Take a Quiz"
          description="Quick check"
          color="bg-orange-500"
          icon="⚡"
        />
        <QuickAction
          to="/progress"
          title="View Progress"
          description="See trends"
          color="bg-slate-500"
          icon="📈"
        />
      </section>

    </div>
  );
}

function QuickAction({
  to,
  title,
  description,
  color,
  icon,
}: {
  to: string;
  title: string;
  description: string;
  color: string;
  icon: string;
}) {
  return (
    <Link
      to={to}
      className="block part-box p-5 hover:shadow-md hover:-translate-y-0.5 transition group"
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 ${color} rounded-lg mb-3 group-hover:scale-110 transition-transform`} />
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
    </Link>
  );
}

