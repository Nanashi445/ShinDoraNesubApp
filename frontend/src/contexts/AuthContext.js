import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await axios.post(`${API}/auth/login`, { username, password });
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    return userData;
  };

  const register = async (username, password, email) => {
    const response = await axios.post(`${API}/auth/register`, { username, password, email });
    const { token: newToken, user: userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (data) => {
    const response = await axios.put(`${API}/auth/profile`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(response.data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};
