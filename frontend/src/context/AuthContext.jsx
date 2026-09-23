import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authState, setAuthState] = useState(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
    return token ? 'loading' : 'unauthenticated';
  });

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setAuthToken(token);
      api.get('/user')
        .then((res) => {
          if (res.data?.user) {
            setCurrentUser(res.data.user);
            setAuthState('authenticated');
          } else {
            setAuthToken(null);
            setCurrentUser(null);
            setAuthState('unauthenticated');
          }
        })
        .catch(() => {
          // Handles invalid token gracefully as expected by specs/e2e/auth.spec.ts
          setAuthToken(null);
          setCurrentUser(null);
          setAuthState('unauthenticated');
        });
    } else {
      setAuthState('unauthenticated');
    }
  }, []);

  // Expose window.__conduit_debug__ for E2E tests contract
  useEffect(() => {
    window.__conduit_debug__ = {
      getToken: () => localStorage.getItem('jwtToken'),
      getAuthState: () => authState,
      getCurrentUser: () => currentUser,
    };
  }, [authState, currentUser]);

  const login = async (email, password) => {
    const res = await api.post('/users/login', { user: { email, password } });
    const user = res.data.user;
    setAuthToken(user.token);
    setCurrentUser(user);
    setAuthState('authenticated');
    return user;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/users', { user: { username, email, password } });
    const user = res.data.user;
    setAuthToken(user.token);
    setCurrentUser(user);
    setAuthState('authenticated');
    return user;
  };

  const updateUser = async (userData) => {
    const res = await api.put('/user', { user: userData });
    const user = res.data.user;
    if (user.token) {
      setAuthToken(user.token);
    }
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setAuthState('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ currentUser, authState, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
