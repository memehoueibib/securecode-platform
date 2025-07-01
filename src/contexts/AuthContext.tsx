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
        console.log('🚀 Initialisation de l\'authentification...');
        
        // Vérifier la configuration Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔍 Configuration Supabase:');
        console.log('- URL présente:', !!supabaseUrl);
        console.log('- Clé présente:', !!supabaseKey);

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Variables d\'environnement Supabase manquantes. Vérifiez votre fichier .env.local');
        }

        // Récupérer la session
        console.log('📡 Récupération de la session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Erreur lors de la récupération de la session:', sessionError);
          if (sessionError.message.includes('Invalid API key')) {
            throw new Error('Clé API Supabase invalide. Vérifiez votre VITE_SUPABASE_ANON_KEY');
          }
          throw sessionError;
        }

        console.log('✅ Session récupérée:', session ? 'Utilisateur connecté' : 'Pas de session');

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('👤 Chargement du profil utilisateur...');
            await loadProfile(session.user.id);
          }
        }

      } catch (err: any) {
        console.error('❌ Erreur d\'initialisation auth:', err);
        
        if (mounted) {
          setError(err.message || 'Erreur de connexion');
        }
      } finally {
        if (mounted) {
          console.log('✅ Initialisation auth terminée');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Changement d\'état auth:', event, session ? 'avec session' : 'sans session');
        
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
      console.log('🧹 Nettoyage AuthProvider');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      console.log('👤 Chargement du profil pour l\'utilisateur:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        
        // Si le profil n'existe pas, on peut le créer
        if (error.code === 'PGRST116') {
          console.log('📝 Création du profil utilisateur...');
          await createProfile(userId);
          return;
        }
        return;
      }

      console.log('✅ Profil chargé:', data);
      setProfile(data);
      setError(null);
    } catch (error) {
      console.error('❌ Erreur profil:', error);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const userData = await supabase.auth.getUser();
      const email = userData.data.user?.email || '';
      const nom = userData.data.user?.user_metadata?.nom || email.split('@')[0];

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          nom: nom,
          email: email,
          niveau: 'Débutant',
          points: 0,
          score_securite: 0
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création profil:', error);
        return;
      }

      console.log('✅ Profil créé:', data);
      setProfile(data);
    } catch (error) {
      console.error('❌ Erreur création profil:', error);
    }
  };

  const signUp = async (email: string, password: string, nom: string) => {
    try {
      console.log('📝 Tentative d\'inscription pour:', email);
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
        console.error('❌ Erreur inscription:', error);
        setError(getErrorMessage(error.message));
      } else {
        console.log('✅ Inscription réussie:', data);
      }

      return { error };
    } catch (error: any) {
      console.error('❌ Erreur inscription (catch):', error);
      const errorMessage = 'Erreur de connexion au serveur';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erreur connexion:', error);
        setError(getErrorMessage(error.message));
      } else {
        console.log('✅ Connexion réussie:', data);
      }

      return { error };
    } catch (error: any) {
      console.error('❌ Erreur connexion (catch):', error);
      const errorMessage = 'Erreur de connexion au serveur';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Déconnexion...');
      setError(null);
      await supabase.auth.signOut();
      setProfile(null);
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      setError('Erreur lors de la déconnexion');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      console.log('📝 Mise à jour du profil:', updates);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        setError('Erreur lors de la mise à jour');
        return;
      }

      console.log('✅ Profil mis à jour:', data);
      setProfile(data);
    } catch (error) {
      console.error('❌ Erreur mise à jour profil (catch):', error);
      setError('Erreur de connexion');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const getErrorMessage = (message: string): string => {
    console.log('🔍 Message d\'erreur reçu:', message);
    
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
    if (message.includes('Email not confirmed')) {
      return 'Veuillez confirmer votre email avant de vous connecter';
    }
    return 'Erreur de connexion';
  };

  const contextValue = {
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
  };

  console.log('🔄 AuthContext render:', {
    user: !!user,
    profile: !!profile,
    loading,
    error: !!error
  });

  return (
    <AuthContext.Provider value={contextValue}>
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