import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { path: '/transfer', label: 'Transfer', icon: '⇄' },
    { path: '/add-funds', label: 'Add Funds', icon: '＋' },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
              B
            </div>
            <span className="text-white font-bold text-xl tracking-tight group-hover:text-blue-400 transition-colors">BankApp</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${location.pathname === link.path
                    ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-slate-300 text-sm font-medium">{user?.username || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 border border-slate-700/50 hover:border-red-400/30 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-2 pb-3">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                ${location.pathname === link.path
                  ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-slate-800'
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
