import { NavLink, useNavigate } from 'react-router-dom';
import { getUserEmail, getUserRole, logout } from '../services/api';
import { BarChart3, FolderKanban, Building2, Package, Ticket, Users, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Аналитика', path: '/analytics', icon: BarChart3, roles: ['admin', 'projects'] },
  { name: 'Проекты', path: '/', icon: FolderKanban, roles: ['admin', 'projects'] },
  { name: 'Организация', path: '/org', icon: Building2, roles: ['admin', 'org'] },
  { name: 'Активы', path: '/assets', icon: Package, roles: ['admin', 'assets'] },
  { name: 'Тикеты', path: '/tickets', icon: Ticket, roles: ['admin', 'tickets'] },
  { name: 'Найм', path: '/hiring', icon: Users, roles: ['admin', 'hiring'] },
];

export default function SideBar() {
  const navigate = useNavigate();
  const email = getUserEmail();
  const userRole = getUserRole();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200  overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">PROJECTS</h1>
        <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">IT Company Practice</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-purple-50 border-1 border-purple-100 rounded-lg mb-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 truncate">{email}</p> 
            {/* email?.split('@')[0] */}
            <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-wide">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Выйти
        </button>
      </div>
    </div>
  );
}