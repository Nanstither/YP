import { useState } from 'react';
import { login, getUserRole } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Роли, которым разрешён вход в систему
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
      
      // Проверяем роль после успешного входа
      const userRole = getUserRole();
      
      if (!ALLOWED_ROLES.includes(userRole)) {
        // У пользователя нет доступа
        setError(`Доступ запрещён. Ваша роль "${userRole}" не имеет права входа в систему.`);
        // Очищаем данные входа
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        return;
      }
      
      // Всё ок — переходим на главную
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Логотип / Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            PROJECTS
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            IT Company Practice
          </p>
        </div>

        {/* Форма */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`px-4 py-3 rounded-lg text-sm text-center border ${
              error.includes('Доступ запрещён') 
                ? 'bg-orange-50 border-orange-200 text-orange-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1 text-left">
                  <p className="font-semibold mb-1">
                    {error.includes('Доступ запрещён') ? '⛔ Доступ запрещён' : 'Ошибка входа'}
                  </p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {/* Демо-аккаунты */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">
            Демо-аккаунты (пароль: <code className="bg-gray-100 px-1 py-0.5 rounded">password</code>):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@company.test')}
              className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition"
            >
              ✅ admin — все разделы
            </button>
            <button
              type="button"
              onClick={() => fillDemo('projects@company.test')}
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition"
            >
              ✅ projects
            </button>
            <button
              type="button"
              onClick={() => fillDemo('org@company.test')}
              className="px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition"
            >
              ⛔ org — нет доступа
            </button>
            <button
              type="button"
              onClick={() => fillDemo('assets@company.test')}
              className="px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-md transition"
            >
              ⛔ assets — нет доступа
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}