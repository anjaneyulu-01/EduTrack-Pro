import { useState } from 'react';
import { Menu, Sun, Moon, Search, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick, isStudent = false }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!isStudent && search.trim()) { navigate(`/students?search=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const avatarGradient = isStudent
    ? 'from-emerald-400 to-teal-500'
    : 'from-primary-400 to-violet-500';

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden btn-ghost">
          <Menu className="w-5 h-5" />
        </button>
        {!isStudent && (
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 w-60 transition-all"
            />
          </form>
        )}
        {isStudent && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Student Portal</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="btn-ghost" title="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
        </button>
        <button className="btn-ghost relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-gray-700 ml-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-bold`}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">{user?.name}</p>
            <p className={`text-xs capitalize ${isStudent ? 'text-emerald-500' : 'text-gray-400'}`}>{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
