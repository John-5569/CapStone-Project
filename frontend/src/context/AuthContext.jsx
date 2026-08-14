import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Backend does not currently have a /auth/me endpoint.
      // We will assume token presence means authenticated for now.
      // In a real app, you'd decode the JWT or fetch user details.
      try {
        // Decode JWT manually (basic decoding without validation, just for UI)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.sub });
      } catch (e) {
        setUser({ email: 'user@example.com' });
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const token = data.accessToken || data.access_token || data.token || data;
    localStorage.setItem('token', token);
    setUser({ email });
  };

  const register = async (email, password) => {
    await authService.register(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('datasets');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
