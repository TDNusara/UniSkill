import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('uniskill_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('uniskill_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('uniskill_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('uniskill_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('[Auth] Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password, portal) => {
    const res = await authAPI.login({ email, password, portal });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('uniskill_token', newToken);
      localStorage.setItem('uniskill_user', JSON.stringify(newUser));
      return newUser;
    }
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('uniskill_token', newToken);
      localStorage.setItem('uniskill_user', JSON.stringify(newUser));
      return newUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('uniskill_token');
    localStorage.removeItem('uniskill_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('uniskill_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
