import { useState } from 'react';
import { login, getUserRole } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, CheckCircle2 } from 'lucide-react';

const ALLOWED_ROLES = ['admin', 'projects'];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const userRole = getUserRole();
      if (!ALLOWED_ROLES.includes(userRole)) {
        setError(`Доступ запрещён. Роль "${userRole}" не имеет прав.`);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">PROJECTS</h1>
          <p className="text-xs text-slate-500 mt-1">IT Company Practice</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs border relative ${
              error.includes('Доступ запрещён')
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 absolute top-5" />
              <div className='w-full realtive'>
                <p className="font-semibold">{error.includes('Доступ запрещён') ? 'Доступ запрещён' : 'Ошибка'}</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:bg-slate-50"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                disabled={loading}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition disabled:bg-slate-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-70"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center mb-2 uppercase tracking-wider font-medium">Демо аккаунты</p>
          <div className="grid grid-cols-2 gap-2">
            {['admin@company.test', 'projects@company.test'].map((demo) => (
              <button key={demo} type="button" onClick={() => fillDemo(demo)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition">
                <CheckCircle2 className="w-3 h-3" />
                {demo.split('@')[0]}
              </button>
            ))}
            {['org@company.test', 'assets@company.test'].map((demo) => (
              <button key={demo} type="button" onClick={() => fillDemo(demo)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition opacity-60 hover:opacity-100">
                <AlertCircle className="w-3 h-3" />
                {demo.split('@')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}