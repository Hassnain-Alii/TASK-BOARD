import { createContext, useState, useEffect } from 'react';
import api from '../api/taskApi';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (localStorage.getItem('token')) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // [ENHANCEMENT]: Silent session refresh and activity monitoring.
  // This keeps the session alive for 15 minutes and refreshes it periodically (every 10m) 
  // as long as the user is "doing their work" (active).
  useEffect(() => {
    if (!user) return;

    let activityTimeout;
    const REFRESH_INTERVAL = 10 * 60 * 1000; // Refresh every 10 minutes
    const SESSION_EXPIRY   = 15 * 60 * 1000; // Inactivity limit

    const refreshSession = async () => {
      try {
        const res = await api.get('/auth/refresh');
        localStorage.setItem('token', res.data.token);
        console.log('Session refreshed');
      } catch (err) {
        console.error('Failed to refresh session:', err);
        logout();
      }
    };

    // Set an interval for periodic refresh if user remains active
    const interval = setInterval(() => {
      refreshSession();
    }, REFRESH_INTERVAL);

    // Refresh immediately to sync the expiration window upon reload/login
    refreshSession();

    // Auto-logout if user is inactive for 15 minutes
    const resetInactivityTimer = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        console.warn('Session expired due to inactivity');
        logout();
      }, SESSION_EXPIRY);
    };

    // Listen for common activity events
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetInactivityTimer));
    
    // Initial timer
    resetInactivityTimer();

    return () => {
      clearInterval(interval);
      clearTimeout(activityTimeout);
      events.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const signup = async (userData) => {
    const res = await api.post('/auth/signup', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
