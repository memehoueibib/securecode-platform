import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, nom: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur session:', error);
          setError('Erreur de connexion');
        } else {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await loadProfile(session.user.id);
            }
          }
        }
      } catch (err) {
        console.error('Erreur d\'initialisation:', err);
        setError('Impossible de se connecter');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur profil:', error);
        return;
      }

      setProfile(data);
      setError(null);
    } catch (error) {
      console.error('Erreur profil:', error);
    }
  };

  const signUp = async (email: string, password: string, nom: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom: nom
          }
        }
      });

      if (error) {
        setError(getErrorMessage(error.message));
      }

      return { error };
    } catch (error: any) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(getErrorMessage(error.message));
      }

      return { error };
    } catch (error: any) {
      const errorMessage = 'Erreur de connexion';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      setError('Erreur lors de la déconnexion');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur mise à jour profil:', error);
        setError('Erreur lors de la mise à jour');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setError('Erreur de connexion');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getErrorMessage = (message: string): string => {
    if (message.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect';
    }
    if (message.includes('User already registered')) {
      return 'Un compte existe déjà avec cet email';
    }
    if (message.includes('Password should be at least')) {
      return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (message.includes('Unable to validate email address')) {
      return 'Adresse email invalide';
    }
    return 'Erreur de connexion';
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      updateProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}