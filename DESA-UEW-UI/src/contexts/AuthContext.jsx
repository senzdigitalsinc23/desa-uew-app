import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const isApiMode = import.meta.env.VITE_DATA_SOURCE === 'api_access';

  useEffect(() => {
    const stored = localStorage.getItem('desa_user');
    const storedToken = localStorage.getItem('desa_token');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('desa_user');
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  function login(userData, authToken = null) {
    setUser(userData);
    localStorage.setItem('desa_user', JSON.stringify(userData));
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('desa_token', authToken);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('desa_user');
    localStorage.removeItem('desa_token');
  }

  function getAuthHeader() {
    const t = token || localStorage.getItem('desa_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, getAuthHeader, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function useRequireAuth(redirectPath = '/login') {
  const { user, loading } = useAuth();
  return { user, loading, isAuthenticated: !!user, redirectPath };
}
