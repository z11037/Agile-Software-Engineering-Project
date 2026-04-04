import { useEffect, useState } from 'react';
import { Link, NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { changePassword, getMe, updateMe } from '../services/api';
import type { ChangePasswordRequest, User, UserUpdate } from '../types';

export default function Layout() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [meLoading, setMeLoading] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const [infoDraft, setInfoDraft] = useState<UserUpdate>({});
  const [infoSaving, setInfoSaving] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState<ChangePasswordRequest>({
    old_password: '',
    new_password: '',
  });
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeStudentModal = () => setStudentModalOpen(false);

  useEffect(() => {
    if (!studentModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeStudentModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [studentModalOpen]);

  useEffect(() => {
    if (!studentModalOpen) return;
    if (!username) return;
    let cancelled = false;
    setModalError(null);
    setModalSuccess(null);
    setMeLoading(true);
    getMe()
      .then((res) => {
        if (cancelled) return;
        setMe(res.data);
        setInfoDraft({ username: res.data.username, email: res.data.email });
        setPasswordDraft({ old_password: '', new_password: '' });
        setPasswordConfirm('');
      })
      .catch(() => {
        if (cancelled) return;
        setModalError('Failed to load student profile. Please try again.');
      })
      .finally(() => {
        if (cancelled) return;
        setMeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentModalOpen, username]);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/60 to-sky-100/60">
      <nav className="border-b border-white/90 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 py-3 flex justify-between items-center gap-4">
            <div className="flex items-center space-x-8">
              <Link to="/" className="leading-tight">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">CSU - Dundee International Institute</p>
                <p className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-fuchsia-600 bg-clip-text text-transparent">
                  DIICSU English Hub
                </p>
              </Link>
              <div className="hidden sm:flex items-center gap-1 rounded-full bg-slate-100/80 p-1">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/review">Review</NavLink>
                <NavLink to="/listening" prominent note="Offline resources included">
                  Listening
                </NavLink>
                <NavLink to="/quiz">Quiz</NavLink>
                <NavLink to="/image-quiz">Picture Guess</NavLink>
                <NavLink to="/practice">Practice Test</NavLink>
                <NavLink to="/progress">Progress</NavLink>
                <NavLink to="/oral-practice">Oral Practice</NavLink>
                <ExternalNavLink href="https://dii.csu.edu.cn">Student Life</ExternalNavLink>
                <ExternalNavLink href="https://my.dundee.ac.uk">Mydundee</ExternalNavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setStudentModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-800 hover:bg-indigo-50 transition shadow-sm"
                title="Open Student Center"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {username?.slice(0, 1).toUpperCase() ?? 'S'}
                </span>
                <span>
                  Student: <span className="font-semibold text-slate-800">{username}</span>
                </span>
                <span className="text-slate-400">▾</span>
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-indigo-100 px-4 py-2 flex flex-wrap gap-2">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/review">Review</NavLink>
          <NavLink to="/quiz">Quiz</NavLink>
          <NavLink to="/image-quiz">Picture</NavLink>
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/oral-practice">Oral</NavLink>
          <NavLink to="/listening" prominent note="Offline resources included">
            Listening
          </NavLink>
          <ExternalNavLink href="https://dii.csu.edu.cn">Student Life</ExternalNavLink>
          <ExternalNavLink href="https://my.dundee.ac.uk">Mydundee</ExternalNavLink>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="app-surface p-4 sm:p-6">
          <Outlet />
        </div>
      </main>

      {/* Student Center Modal */}
      {studentModalOpen && username && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            // Click outside to close
            if (e.target === e.currentTarget) closeStudentModal();
          }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white/95 backdrop-blur-sm border border-white/60 shadow-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Student Center</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Welcome, {username}</h3>
                <p className="text-sm text-slate-600 mt-1">Manage your account information.</p>
              </div>
              <button
                type="button"
                onClick={closeStudentModal}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            {meLoading && <div className="mt-4 text-sm text-slate-500">Loading profile...</div>}

            {!meLoading && (
              <>
                {modalError && (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    {modalSuccess}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="part-box p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Basic Information</div>
                        <div className="text-xs text-slate-500 mt-1">ID: {me?.id ?? '-'}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
                        <input
                          value={infoDraft.username ?? ''}
                          onChange={(e) => setInfoDraft((p) => ({ ...p, username: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={infoDraft.email ?? ''}
                          onChange={(e) => setInfoDraft((p) => ({ ...p, email: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setModalError(null);
                            setModalSuccess(null);
                            setInfoSaving(true);
                            try {
                              const res = await updateMe({
                                username: (infoDraft.username ?? '').trim(),
                                email: (infoDraft.email ?? '').trim(),
                              });
                              setMe(res.data);
                              localStorage.setItem('username', res.data.username);
                              setModalSuccess('Profile updated.');
                              // Keep UI consistent with AuthProvider (it reads localStorage only at mount).
                              setTimeout(() => window.location.reload(), 600);
                            } catch (e) {
                              const msg =
                                (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                                'Failed to update profile.';
                              setModalError(msg);
                            } finally {
                              setInfoSaving(false);
                            }
                          }}
                          disabled={infoSaving}
                          className="flex-1 px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {infoSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalError(null);
                            setModalSuccess(null);
                            setInfoDraft({ username: me?.username ?? '', email: me?.email ?? '' });
                          }}
                          className="px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="part-box p-4">
                    <div className="text-sm font-semibold text-slate-900">Change Password</div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Old Password</label>
                        <input
                          type="password"
                          value={passwordDraft.old_password}
                          onChange={(e) => setPasswordDraft((p) => ({ ...p, old_password: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                        <input
                          type="password"
                          value={passwordDraft.new_password}
                          onChange={(e) => setPasswordDraft((p) => ({ ...p, new_password: e.target.value }))}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={passwordSaving}
                        onClick={async () => {
                          setModalError(null);
                          setModalSuccess(null);
                          if (!passwordDraft.old_password || !passwordDraft.new_password) {
                            setModalError('Please fill in all password fields.');
                            return;
                          }
                          if (passwordDraft.new_password !== passwordConfirm) {
                            setModalError('New password and confirmation do not match.');
                            return;
                          }
                          setPasswordSaving(true);
                          try {
                            await changePassword({
                              old_password: passwordDraft.old_password,
                              new_password: passwordDraft.new_password,
                            });
                            setModalSuccess('Password updated. Please login again if needed.');
                            setPasswordDraft({ old_password: '', new_password: '' });
                            setPasswordConfirm('');
                          } catch (e) {
                            const msg =
                              (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                              'Failed to update password.';
                            setModalError(msg);
                          } finally {
                            setPasswordSaving(false);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {passwordSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="mt-4 text-xs text-slate-500">
              Tip: press <span className="font-medium">Esc</span> or click outside to close.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({
  to,
  children,
  prominent,
  note,
}: {
  to: string;
  children: React.ReactNode;
  prominent?: boolean;
  note?: string;
}) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
          isActive
            ? prominent
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-indigo-700 shadow-sm'
            : prominent
              ? 'text-indigo-700 hover:bg-white/80 bg-white/70 border border-indigo-200'
              : 'text-slate-700 hover:text-indigo-700 hover:bg-white/70'
        }`
      }
    >
      <span className="inline-flex items-center gap-2">
        <span>{children}</span>
        {note ? (
          <span className="hidden lg:inline text-[11px] font-semibold tracking-wide uppercase text-indigo-700/80">
            {note}
          </span>
        ) : null}
      </span>
    </RouterNavLink>
  );
}

function ExternalNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors text-slate-700 hover:text-indigo-700 hover:bg-white/70"
    >
      {children}
    </a>
  );
}
