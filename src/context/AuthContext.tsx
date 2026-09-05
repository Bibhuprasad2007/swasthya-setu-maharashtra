import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthState, LoginCredentials, PortalType, UserProfile } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  setSelectedPortal: (portal: PortalType) => void;
  login: (credentials: LoginCredentials) => Promise<UserProfile>;
  logout: (reason?: string) => Promise<void>;
  clearError: () => void;
  sessionTimeoutWarning: boolean;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PORTAL_STORAGE_KEY = 'swasthya_selected_portal';
const USER_SESSION_KEY = 'swasthya_user_session';
const SESSION_EXPIRY_KEY = 'swasthya_session_expiry';

// Session duration: 20 minutes (in ms)
const SESSION_DURATION_MS = 20 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Preserve only selected portal during page refresh (default: hospital)
  const [selectedPortal, setSelectedPortalState] = useState<PortalType>(() => {
    try {
      const saved = sessionStorage.getItem(PORTAL_STORAGE_KEY) as PortalType;
      if (saved && ['hospital', 'laboratory', 'pharmacy', 'admin'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'hospital';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedSession = sessionStorage.getItem(USER_SESSION_KEY);
      const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
      if (savedSession && expiry && Date.now() < parseInt(expiry, 10)) {
        return JSON.parse(savedSession);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState<boolean>(false);
  const [sessionExpiryTime, setSessionExpiryTime] = useState<number | null>(() => {
    try {
      const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch {
      return null;
    }
  });

  const setSelectedPortal = (portal: PortalType) => {
    setSelectedPortalState(portal);
    setError(null);
    try {
      sessionStorage.setItem(PORTAL_STORAGE_KEY, portal);
    } catch {
      // ignore
    }
  };

  const clearError = () => setError(null);

  const refreshSession = () => {
    if (user) {
      const newExpiry = Date.now() + SESSION_DURATION_MS;
      setSessionExpiryTime(newExpiry);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, newExpiry.toString());
      setSessionTimeoutWarning(false);
    }
  };

  const logout = async (reason?: string) => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setSessionExpiryTime(null);
      setSessionTimeoutWarning(false);
      try {
        sessionStorage.removeItem(USER_SESSION_KEY);
        sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      } catch {
        // ignore
      }
      if (reason) {
        setError(reason);
      }
    }
  };

  const login = async (credentials: LoginCredentials): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      const authenticatedUser = response.user;
      
      const expiryTime = Date.now() + SESSION_DURATION_MS;
      setUser(authenticatedUser);
      setSessionExpiryTime(expiryTime);

      // Store authenticated user and expiry in sessionStorage (never storing passwords)
      try {
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(authenticatedUser));
        sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      } catch {
        // ignore
      }

      return authenticatedUser;
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Automatic Session Expiry Checker
  useEffect(() => {
    if (!user || !sessionExpiryTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = sessionExpiryTime - now;

      if (timeLeft <= 0) {
        logout('Your session has expired for security reasons. Please log in again.');
      } else if (timeLeft <= 2 * 60 * 1000 && !sessionTimeoutWarning) {
        setSessionTimeoutWarning(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, sessionExpiryTime, sessionTimeoutWarning]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    selectedPortal,
    sessionExpiryTime,
    setSelectedPortal,
    login,
    logout,
    clearError,
    sessionTimeoutWarning,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
