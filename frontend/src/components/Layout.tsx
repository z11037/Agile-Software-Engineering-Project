import { Link, NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
                <NavLink to="/quiz">Quiz</NavLink>
                <NavLink to="/practice">Practice Test</NavLink>
                <NavLink to="/progress">Progress</NavLink>
                <NavLink to="/oral-practice">Oral Practice</NavLink>
                <NavLink to="/listening">Listening</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Student: <span className="font-semibold text-slate-800">{username}</span>
              </span>
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
          <NavLink to="/practice">Practice</NavLink>
          <NavLink to="/progress">Progress</NavLink>
          <NavLink to="/oral-practice">Oral</NavLink>
          <NavLink to="/listening">Listening</NavLink>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="app-surface p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
          isActive
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-slate-700 hover:text-indigo-700 hover:bg-white/70'
        }`
      }
    >
      {children}
    </RouterNavLink>
  );
}
