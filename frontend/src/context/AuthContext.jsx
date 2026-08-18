import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSessionFromAccessToken = (token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    sessionStorage.setItem('token', token);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.sub });
    } catch (e) {
      setUser({ email: 'user@example.com' });
    }
  };

  const hydrateUserFromToken = () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.sub });
    } catch (e) {
      setUser({ email: 'user@example.com' });
    }
  };

  const refreshSession = async () => {
    try {
      const data = await authService.refresh();
      const token = data.accessToken || data.access_token || data.token;
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (token) {
        sessionStorage.setItem('token', token);
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      }
      hydrateUserFromToken();
      return data;
    } catch (error) {
      sessionStorage.removeItem('token');
      if (localStorage.getItem('rememberMe') !== 'true') {
        localStorage.removeItem('token');
        setUser(null);
      }
      throw error;
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (token) {
        hydrateUserFromToken();
      }

      if (token || rememberMe) {
        try {
          await refreshSession();
        } catch (error) {
          console.warn('Session refresh failed:', error);
        }
      }

      setLoading(false);
    };

    bootstrapAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const data = await authService.login(email, password, rememberMe);
    const token = data.accessToken || data.access_token || data.token || data;
    setSessionFromAccessToken(token, rememberMe);
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
  };

  const loginWithGoogle = async (idToken) => {
    const data = await authService.googleLogin(idToken);
    const token = data.accessToken || data.access_token || data.token || data;
    setSessionFromAccessToken(token, true);
    localStorage.setItem('rememberMe', 'true');
  };

  const register = async (email, password) => {
    await authService.register(email, password);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout request failed, clearing local session anyway:', error);
    } finally {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
