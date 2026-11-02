import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');

  // Synchronize theme class on root element
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load user session on boot
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        setUser(parsed);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.theme) setTheme(parsed.theme);
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Configure Axios defaults & token attachment
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        } catch (e) {}
      }
      return config;
    });

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });
      setUser(data);
      if (data.currency) setCurrency(data.currency);
      if (data.theme) setTheme(data.theme);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify your credentials.',
      };
    }
  };

  const register = async (name, email, password, userCurrency = 'USD') => {
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register`, {
        name,
        email,
        password,
        currency: userCurrency,
        theme,
      });
      setUser(data);
      if (data.currency) setCurrency(data.currency);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { data } = await axios.put(`${API_BASE}/auth/profile`, updates);
      const updated = { ...user, ...data };
      setUser(updated);
      if (data.currency) setCurrency(data.currency);
      if (data.theme) setTheme(data.theme);
      localStorage.setItem('userInfo', JSON.stringify(updated));
      return { success: true, user: updated };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile settings.',
      };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put(`${API_BASE}/auth/password`, { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed.',
      };
    }
  };

  const deleteAccount = async () => {
    try {
      await axios.delete(`${API_BASE}/auth/account`);
      logout();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      updateProfile({ theme: nextTheme });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        currency,
        setCurrency,
        toggleTheme,
        login,
        register,
        updateProfile,
        updatePassword,
        deleteAccount,
        logout,
        apiBase: API_BASE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;