import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, BarChart3,
  FileText, Calendar, Settings, LogOut, GraduationCap,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/exams', icon: ClipboardList, label: 'Exams' },
  { to: '/grades', icon: BarChart3, label: 'Grades' },
  { to: '/submissions', icon: FileText, label: 'Submissions' },
  { to: '/attendance', icon: Calendar, label: 'Attendance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className={`
      fixed top-0 left-0 h-full z-30 flex flex-col
      bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
      transition-all duration-300 shadow-xl lg:shadow-none
      ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">EduManage</h1>
              <p className="text-xs text-gray-400 mt-0.5">v2.0</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
        )}
        <button onClick={onClose} className="lg:hidden btn-ghost p-1">
          <X className="w-5 h-5" />
        </button>
        <button onClick={onToggleCollapse} className="hidden lg:flex btn-ghost p-1.5">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : undefined}
            onClick={onClose}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-gray-100 dark:border-gray-800`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize truncate">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="btn-ghost p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={handleLogout} className="mt-2 w-full btn-ghost justify-center text-rose-400 hover:text-rose-500" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
