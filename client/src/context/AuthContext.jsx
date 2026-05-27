import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    const userInfo = { email: credentials.email, username: data.username };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    const userInfo = { email: userData.email, username: userData.username };
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUser(userInfo);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
