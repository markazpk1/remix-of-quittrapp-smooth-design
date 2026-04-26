import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phone: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setUser(parsedSession.user);
      } catch (e) {
        console.error('Failed to parse stored session');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.error) {
      throw new Error(response.error);
    }
    setSession(response.session);
    setUser(response.user);
    localStorage.setItem('session', JSON.stringify(response.session));
  };

  const signInWithPhone = async (phone: string, password: string) => {
    // For now, treat phone as email
    const response = await api.login(phone, password);
    if (response.error) {
      throw new Error(response.error);
    }
    setSession(response.session);
    setUser(response.user);
    localStorage.setItem('session', JSON.stringify(response.session));
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const response = await api.register({
      email,
      password,
      full_name: metadata.full_name,
      city: metadata.city,
      madhab: metadata.madhab,
      age_confirmed: metadata.age_confirmed,
      shariah_rules_agreed: metadata.shariah_rules_agreed,
    });
    if (response.error) {
      throw new Error(response.error);
    }
    setSession(response.session);
    setUser(response.user);
    localStorage.setItem('session', JSON.stringify(response.session));
  };

  const signOut = async () => {
    if (session?.access_token) {
      await api.logout(session.access_token);
    }
    setSession(null);
    setUser(null);
    localStorage.removeItem('session');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signInWithPhone, signUp, signOut }}>
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
