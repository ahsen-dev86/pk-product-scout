import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home, TrendingUp, Clock, User, Settings, LogOut,
  Sun, Moon, ShoppingBag, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: Home,       label: 'Home'          },
  { to: '/trending',  icon: TrendingUp, label: 'Trending & Deals' },
  { to: '/history',   icon: Clock,      label: 'Search History' },
  { to: '/profile',   icon: User,       label: 'Profile'       },
];

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <aside className="sidebar w-64 shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-wide">PK Scout</p>
          <p className="text-slate-500 text-[10px] font-medium tracking-wider uppercase">AI Shopping</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-blue-400/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-white/5 space-y-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all text-sm font-medium"
        >
          <span className="flex items-center gap-3">
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-400" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
          <div className={`w-9 h-5 rounded-full relative transition-all duration-300 ${isDark ? 'bg-amber-400/80' : 'bg-slate-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isDark ? 'left-4' : 'left-0.5'}`} />
          </div>
        </button>

        {/* User Avatar + Logout */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-xs font-semibold truncate">{user?.name || 'My Account'}</p>
            <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
