// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Интерцептор запросов
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  
  // Не добавляем токен к запросу логина (он и так не нужен)
  const isAuthRequest = config.url?.includes('/auth/login');
  
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор ответов — НЕ удаляем токен при каждом 401!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Удаляем токен ТОЛЬКО если это не запрос логина и не 422 (валидация)
    if (
      error.response?.status === 401 && 
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/register')
    ) {
      // Проверяем, не истёк ли токен (а не просто ошибка прав доступа)
      const errorMessage = error.response?.data?.message?.toLowerCase() || '';
      if (errorMessage.includes('unauthenticated') || errorMessage.includes('token')) {
        console.warn('🔒 Токен истёк, выполняем выход...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        // Редирект на логин
        window.location.href = '/login';
      }
      // Если 401 из-за прав доступа (Forbidden) — не чистим токен!
    }
    return Promise.reject(error);
  }
);

// === Auth ===
export const login = async (email, password) => {
  // Логин НЕ требует токена, поэтому делаем запрос напрямую через axios
  const response = await axios.post('/api/auth/login', { email, password }, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: true, // если бэкенд использует куки
  });
  
  // 🎯 ВАЖНО: проверяем структуру ответа твоего API
  // Возможно токен лежит в response.data.access_token или response.data.user.token
  const token = response.data?.token || response.data?.access_token || response.data?.user?.token;
  
  if (token) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    // Определяем роль из email или из ответа сервера
    const role = response.data?.role || email.split('@')[0];
    localStorage.setItem('user_role', role);
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
};

export const isAuthenticated = () => !!localStorage.getItem('auth_token');
export const getUserEmail = () => localStorage.getItem('user_email');
export const getUserRole = () => localStorage.getItem('user_role');

// === Projects CRUD ===
export const getProjects = async (params = {}) => {
  const response = await api.get('/projects', { params });
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export default api;