'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CognitoUser {
  username: string;
  email: string;
  name: string;
  sub: string;
}

interface AuthContextType {
  user: CognitoUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (username: string, password: string, newPassword?: string, session?: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username: string) => Promise<void>;
  confirmSignup: (username: string, confirmationCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      const userInfo = verifyToken(storedAccessToken);
      if (userInfo) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, newPassword?: string, session?: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, newPassword, session }),
    });

    const data = await response.json();

    if (data.challenge === 'NEW_PASSWORD_REQUIRED') {
      throw { message: 'NEW_PASSWORD_REQUIRED', session: data.session, challenge: data.challenge };
    }

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const signup = async (email: string, password: string, name: string, username: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    return data;
  };

  const confirmSignup = async (username: string, confirmationCode: string) => {
    const response = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, confirmationCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Confirmation failed');
    }

    return await response.json();
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      refreshToken: refreshTokenValue,
      isLoading,
      login,
      signup,
      confirmSignup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function verifyToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      username: payload['cognito:username'],
      email: payload.email,
      sub: payload.sub,
    };
  } catch {
    return null;
  }
}
