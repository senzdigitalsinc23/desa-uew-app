import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('desa_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('desa_user');
      }
    }
    setLoading(false);
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem('desa_user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('desa_user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
