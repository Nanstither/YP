import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Login from './pages/Login';
import Layout from './components/Layout';
import Projects from './pages/Projects';
import { isAuthenticated } from './services/api';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate(); // 👈 хук внутри роутера
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);
  
  return isAuthenticated() ? children : null;
};

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  // ✅ useCallback предотвращает пересоздание функции на каждом рендере
  const handleStorageChange = useCallback(() => {
    const newAuth = isAuthenticated();
    if (newAuth !== isAuth) {
      setIsAuth(newAuth);
    }
  }, [isAuth]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleStorageChange]); // 👈 стабильная зависимость

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Projects />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuth ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;