import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';

interface AuthContextType {
  user: User | StudentProfile | null;
  token: string | null;
  login: (token: string, user: User | StudentProfile) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gouni_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('gouni_user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string, newUser: User | StudentProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('gouni_token', newToken);
    localStorage.setItem('gouni_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gouni_token');
    localStorage.removeItem('gouni_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
