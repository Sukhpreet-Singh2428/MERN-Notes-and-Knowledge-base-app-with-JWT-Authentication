import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notesApi from '../api/notesApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hearth_token') || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('hearth_token');
    setToken(null);
    setUser(null);
  }, []);

  // Restore authentication state on mount or validate stored token
  useEffect(() => {
    const storedToken = localStorage.getItem('hearth_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    notesApi
      .getProfile()
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          setUser(res.data);
          setToken(storedToken);
        } else {
          logout();
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Initial session restoration failed:', err.message);
        logout();
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Multi-tab logout listener & Axios 401 dispatch listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'hearth_token' && !e.newValue) {
        logout();
      }
    };

    const handleAuthLogoutEvent = () => {
      logout();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleAuthLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleAuthLogoutEvent);
    };
  }, [logout]);

  const login = async (email, password) => {
    try {
      const res = await notesApi.login({ email, password });
      const userData = res.data?.user;
      const jwtToken = res.data?.token;

      if (!jwtToken || !userData) {
        throw new Error('Malformed response from authentication server.');
      }

      localStorage.setItem('hearth_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      throw err;
    }
  };

  const register = async (displayName, email, password) => {
    try {
      const res = await notesApi.register({ displayName, email, password });
      const userData = res.data?.user;
      const jwtToken = res.data?.token;

      if (!jwtToken || !userData) {
        throw new Error('Malformed response from registration server.');
      }

      localStorage.setItem('hearth_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      throw err;
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

