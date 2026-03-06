import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ── Cache keys ────────────────────────────────────────────────────────────────
const CACHE_USER_KEY    = 'ym_offline_user';
const CACHE_SESSION_KEY = 'ym_offline_session';

function saveToCache(user: User | null, session: Session | null) {
  try {
    if (user && session) {
      localStorage.setItem(CACHE_USER_KEY,    JSON.stringify(user));
      localStorage.setItem(CACHE_SESSION_KEY, JSON.stringify(session));
    }
  } catch { /* storage cheio ou indisponível */ }
}

function loadFromCache(): { user: User | null; session: Session | null } {
  try {
    const rawUser    = localStorage.getItem(CACHE_USER_KEY);
    const rawSession = localStorage.getItem(CACHE_SESSION_KEY);
    if (!rawUser || !rawSession) return { user: null, session: null };

    const session: Session = JSON.parse(rawSession);

    // Verificar se o token de acesso ainda não expirou
    const expiresAt = session.expires_at ?? 0; // Unix timestamp (segundos)
    const nowSec    = Math.floor(Date.now() / 1000);
    if (expiresAt > 0 && expiresAt < nowSec) {
      // Token expirado — limpar cache
      localStorage.removeItem(CACHE_USER_KEY);
      localStorage.removeItem(CACHE_SESSION_KEY);
      return { user: null, session: null };
    }

    return { user: JSON.parse(rawUser), session };
  } catch {
    return { user: null, session: null };
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_USER_KEY);
  localStorage.removeItem(CACHE_SESSION_KEY);
}
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isOffline: boolean
  signUp: (email: string, password: string, meta?: Record<string, string>) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null)
  const [session,   setSession]   = useState<Session | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline  = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          // Sem rede ou sem sessão → tentar cache
          const cached = loadFromCache();
          if (cached.user && cached.session) {
            setUser(cached.user);
            setSession(cached.session);
            setIsOffline(!navigator.onLine);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          saveToCache(session.user, session);
        }
      } catch {
        // Falha de rede — usar cache
        const cached = loadFromCache();
        setUser(cached.user);
        setSession(cached.session);
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session) {
          saveToCache(session.user, session);
        }
        if (event === 'SIGNED_OUT') {
          clearCache();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, meta?: Record<string, string>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      saveToCache(data.user, data.session);
    }
    return { data, error };
  };

  const signOut = async () => {
    clearCache();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isOffline, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
