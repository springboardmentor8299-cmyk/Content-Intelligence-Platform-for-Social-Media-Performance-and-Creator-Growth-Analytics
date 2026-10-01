import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('creatoriq_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const savedUser = localStorage.getItem('creatoriq_user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('creatoriq_user');
      }
    }

    if (token) {
      setLoading(true);
      client.get('/api/v1/auth/me')
        .then((res) => {
          if (ignore) return;
          setUser(res.data);
          localStorage.setItem('creatoriq_user', JSON.stringify(res.data));
        })
        .catch(() => {
          if (ignore) return;
          localStorage.removeItem('creatoriq_token');
          localStorage.removeItem('creatoriq_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    } else {
      localStorage.removeItem('creatoriq_user');
      setUser(null);
      setLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await client.post('/api/v1/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('creatoriq_token', access_token);
    localStorage.setItem('creatoriq_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, fullName, role = 'Creator') => {
    const res = await client.post('/api/v1/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('creatoriq_token', access_token);
    localStorage.setItem('creatoriq_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('creatoriq_token');
    localStorage.removeItem('creatoriq_user');
    setToken(null);
    setUser(null);
  };

  const switchRoleDemo = async (targetEmail) => {
    return login(targetEmail, 'password123');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRoleDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
