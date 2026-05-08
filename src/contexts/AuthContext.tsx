import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    city?: string;
    madhab?: string;
    role?: string;
    [key: string]: any;
  };
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
  signInWithOAuth: (provider: 'google') => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for active session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession as any);
          setUser(initialSession.user as any);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession as any);
      setUser(currentSession?.user as any);
      setLoading(false);

      if (event === 'SIGNED_IN' && currentSession) {
        // If we're on the login page, register page, or root, go to dashboard
        const authPaths = ['/login', '/register', '/'];
        if (authPaths.includes(location.pathname)) {
          navigate('/dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithPhone = async (phone: string, password: string) => {
    // Supabase usually expects phone numbers in E.164 format
    const { data, error } = await supabase.auth.signInWithPassword({ 
      phone: phone.startsWith('+') ? phone : `+${phone}`, 
      password 
    });
    if (error) throw error;
  };

  const signInWithOAuth = async (provider: 'google') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/app',
      }
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          city: metadata.city,
          madhab: metadata.madhab,
          age_confirmed: metadata.age_confirmed,
          shariah_rules_agreed: metadata.shariah_rules_agreed,
          role: 'user'
        }
      }
    });
    
    if (error) throw error;
    
    if (data.session) {
      setSession(data.session as any);
      setUser(data.user as any);
    } else {
      // Handle cases where email confirmation is required
      toast.info("Please check your email to confirm your account.");
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signInWithPhone, signInWithOAuth, signUp, signOut }}>
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
