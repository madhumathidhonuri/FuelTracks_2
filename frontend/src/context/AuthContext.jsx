import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ft_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('ft_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('ft_refresh'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!accessToken && !!user;
  const role = user?.role || null;

  const login = useCallback((access, refresh, userData) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
    localStorage.setItem('ft_token', access);
    localStorage.setItem('ft_refresh', refresh);
    localStorage.setItem('ft_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_refresh');
    localStorage.removeItem('ft_user');
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('ft_user', JSON.stringify(updatedUser));
  }, [user]);

  // Auto refresh token 1 minute before expiry
  useEffect(() => {
    if (!refreshToken) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(refreshToken);
      if (!decoded || !decoded.exp) {
        setLoading(false);
        return;
      }

      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const refreshIn = expiryTime - now - 60000;

      if (refreshIn <= 0) {
        logout();
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.accessToken) {
              login(data.data.accessToken, data.data.refreshToken, user);
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }, refreshIn);

      setLoading(false);
      return () => clearTimeout(timer);
    } catch {
      setLoading(false);
    }
  }, [refreshToken, user, login, logout]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      role,
      loading,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};