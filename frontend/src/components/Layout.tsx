import { Link, Outlet, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                EnglishApp
              </Link>
              <div className="hidden sm:flex space-x-4">
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
              <span className="text-sm text-gray-600">Hi, {username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-gray-100 px-4 py-2 flex space-x-4">
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
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
    >
      {children}
    </Link>
  );
}
