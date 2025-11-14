import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [customTheme, setCustomTheme] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    applyCustomTheme();
  }, [theme, customTheme]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      if (response.data.theme) {
        setCustomTheme(response.data.theme);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const applyCustomTheme = () => {
    if (!customTheme) return;
    
    const root = document.documentElement;
    root.style.setProperty('--primary-color', customTheme.primaryColor);
    root.style.setProperty('--dark-bg', customTheme.darkBg);
    root.style.setProperty('--light-bg', customTheme.lightBg);
    root.style.setProperty('--text-color', customTheme.textColor);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, customTheme, settings, fetchSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};
