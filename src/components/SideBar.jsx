import { NavLink, useNavigate } from 'react-router-dom';
import { getUserEmail, getUserRole, logout } from '../services/api';

const menuItems = [
  { name: 'Аналитика', path: '/analytics', icon: '📊', roles: ['admin'] },
  { name: 'Проекты', path: '/', icon: '📁', roles: ['admin', 'projects'] },
  { name: 'Организация', path: '/org', icon: '🏢', roles: ['admin', 'org'] },
  { name: 'Активы', path: '/assets', icon: '📦', roles: ['admin', 'assets'] },
  { name: 'Тикеты', path: '/tickets', icon: '🎫', roles: ['admin', 'tickets'] },
  { name: 'Найм', path: '/hiring', icon: '', roles: ['admin', 'hiring'] },
];

export default function SideBar() {
  const navigate = useNavigate();
  const email = getUserEmail();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    // navigate('/login', { replace: true });
    window.location.href = '/login';
  };

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col sticky top-6">
      {/* Шапка */}
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">PROJECTS</h1>
        <p className="text-xs text-slate-400 mt-1">IT Company Practice</p>
      </div>

      {/* Меню */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Футер */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{email?.split('@')[0]}</p>
            <p className="text-xs text-blue-600 font-medium">Роль: {userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );
}