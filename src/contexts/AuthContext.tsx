import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { SecurityService } from '../services/securityService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  mfaEnabled: boolean;
  signUp: (email: string, password: string, nom: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresMFA?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearError: () => void;
  setupMFA: () => Promise<{ qrCode: string; secret: string } | null>;
  verifyMFA: (token: string) => Promise<boolean>;
  disableMFA: () => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Timeout de sécurité pour éviter le loading infini
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Timeout de sécurité déclenché pour éviter le loading infini');
        setLoading(false);
      }
    }, 5000);

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        // Nettoyage immédiat lors de la déconnexion
        console.log('🧹 Nettoyage après déconnexion Supabase');
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setError(null);
        setMfaEnabled(false);
        
        // Effacer l'état MFA persisté
        SecurityService.clearPersistedMFAState();
      } else if (session) {
        console.log('👤 Utilisateur connecté:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        try {
          await loadProfile(session.user);
          
          // Vérifier si MFA est activé
          const mfaStatus = await SecurityService.checkMFAStatus(session.user.id);
          setMfaEnabled(mfaStatus);
          
          // Persister l'état MFA
          if (mfaStatus) {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            if (factors.totp.length > 0) {
              SecurityService.persistMFAState(true, factors.totp[0].id);
            }
          }
        } catch (err) {
          console.error('Erreur lors du chargement du profil ou du statut MFA:', err);
        }
      }
      
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const initAuth = async () => {
    try {
      console.log('🔍 Initialisation de l\'authentification...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ Session trouvée, utilisateur déjà connecté:', session.user.email);
        setSession(session);
        setUser(session.user);
        
        try {
          await loadProfile(session.user);
          
          // Vérifier si MFA est activé
          const mfaStatus = await SecurityService.checkMFAStatus(session.user.id);
          setMfaEnabled(mfaStatus);
          
          // Persister l'état MFA
          if (mfaStatus) {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            if (factors.totp.length > 0) {
              SecurityService.persistMFAState(true, factors.totp[0].id);
            }
          }
        } catch (err) {
          console.error('Erreur lors du chargement du profil ou du statut MFA:', err);
        }
      } else {
        console.log('⚠️ Aucune session trouvée, utilisateur non connecté');
        // Récupérer l'état MFA persisté si disponible
        const { enabled } = SecurityService.getPersistedMFAState();
        if (enabled) {
          setMfaEnabled(enabled);
        }
      }
    } catch (error) {
      console.error('❌ Erreur auth:', error);
      setError('Erreur de connexion');
    } finally {
      console.log('🏁 Initialisation de l\'authentification terminée');
      setLoading(false);
      setAuthInitialized(true);
    }
  };

  const loadProfile = async (user: User) => {
    try {
      console.log('🔍 Chargement du profil pour:', user.email);
      
      // Vérifier si c'est un admin AVANT de charger le profil
      const adminEmails = [
        'admin@securecode.fr',
        'admin@techcorp.com',
        'testadmin@securecode.fr',
        'admin@example.com',
        'administrator@securecode.fr'
      ];
      
      const userIsAdmin = adminEmails.includes(user.email || '');
      setIsAdmin(userIsAdmin);

      // Charger ou créer le profil
      let { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('⚠️ Profil non trouvé, création d\'un nouveau profil');
          // Créer le profil s'il n'existe pas
          const newProfile = {
            id: user.id,
            nom: user.email?.split('@')[0] || 'Utilisateur',
            email: user.email || '',
            niveau: userIsAdmin ? 'Expert' : 'Débutant',
            points: userIsAdmin ? 1000 : 0,
            score_securite: userIsAdmin ? 95 : 0
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('❌ Erreur création profil:', createError);
            throw createError;
          }

          profileData = createdProfile;
          console.log('✅ Nouveau profil créé:', profileData);
        } else {
          console.error('❌ Erreur chargement profil:', error);
          throw error;
        }
      }

      if (profileData) {
        console.log('✅ Profil chargé avec succès');
        setProfile(profileData);
      } else {
        console.error('❌ Aucun profil trouvé ou créé');
        throw new Error('Aucun profil trouvé ou créé');
      }
    } catch (error) {
      console.error('❌ Erreur profil:', error);
      // Créer un profil minimal en cas d'erreur
      const fallbackProfile = {
        id: user.id,
        nom: user.email?.split('@')[0] || 'Utilisateur',
        email: user.email || '',
        niveau: 'Débutant',
        points: 0,
        score_securite: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('⚠️ Utilisation d\'un profil de secours:', fallbackProfile);
      setProfile(fallbackProfile);
    }
  };

  const signUp = async (email: string, password: string, nom: string) => {
    try {
      setError(null);
      
      // Vérifier que le mot de passe respecte la politique de sécurité
      const passwordValidation = SecurityService.validatePassword(password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        return { error: passwordValidation.message };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nom } }
      });

      if (error) {
        setError(getErrorMessage(error.message));
      }

      return { error };
    } catch (error: any) {
      setError('Erreur de connexion');
      return { error };
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
        // Enregistrer la tentative de connexion échouée
        if (data?.user) {
          await SecurityService.logSecurityEvent(
            data.user.id,
            'login_failed',
            { reason: error.message }
          );
        }
        return { error };
      }

      // Enregistrer la connexion réussie
      if (data?.user) {
        await SecurityService.logSecurityEvent(
          data.user.id,
          'login',
          { method: 'password' }
        );
      }

      // Vérifier si l'utilisateur a la 2FA activée
      if (data?.user) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasMFA = factors.totp.length > 0;
        setMfaEnabled(hasMFA);
        
        // Persister l'état MFA
        if (hasMFA && factors.totp[0]?.id) {
          SecurityService.persistMFAState(true, factors.totp[0].id);
          return { error: null, requiresMFA: true };
        }
      }

      return { error: null };
    } catch (error: any) {
      setError('Erreur de connexion');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Début de la déconnexion...');
      
      // Enregistrer l'événement de déconnexion
      if (user) {
        await SecurityService.logSecurityEvent(
          user.id,
          'login',
          { action: 'logout' }
        );
      }
      
      // 1. Nettoyage immédiat de l'état local
      console.log('🧹 Nettoyage de l\'état local...');
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setError(null);
      setMfaEnabled(false);
      
      // 2. Déconnexion Supabase (en arrière-plan)
      console.log('📡 Déconnexion Supabase...');
      await supabase.auth.signOut();
      
      // Effacer l'état MFA persisté
      SecurityService.clearPersistedMFAState();
      
      console.log('✅ Déconnexion terminée');
      
    } catch (error) {
      console.error('⚠️ Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, on force le nettoyage local
    } finally {
      // 3. Redirection forcée
      console.log('🔄 Redirection vers /connexion');
      window.location.href = '/connexion';
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    }
  };

  const clearError = () => setError(null);

  const getErrorMessage = (message: string): string => {
    if (message.includes('Invalid login credentials')) {
      return 'Invalid login credentials';
    }
    if (message.includes('User already registered')) {
      return 'Un compte existe déjà avec cet email';
    }
    if (message.includes('Password should be at least')) {
      return 'Le mot de passe doit contenir au moins 12 caractères';
    }
    return 'Erreur de connexion';
  };

  // Configuration MFA
  const setupMFA = async () => {
    try {
      // Générer un nouveau facteur TOTP
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) {
        console.error('Erreur lors de la configuration MFA:', error);
        setError('Erreur lors de la configuration MFA');
        return null;
      }
      
      // Stocker l'ID du facteur pour l'utiliser lors de la vérification
      if (data.id) {
        SecurityService.persistMFAState(false, data.id);
      }
      
      // Retourner le QR code et le secret pour l'affichage
      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret
      };
    } catch (error) {
      console.error('Erreur lors de la configuration MFA:', error);
      setError('Erreur lors de la configuration MFA');
      return null;
    }
  };

  // Vérification du code MFA
  const verifyMFA = async (token: string) => {
    try {
      // Récupérer l'ID du facteur stocké
      const { factorId } = SecurityService.getPersistedMFAState();
      
      if (!factorId) {
        console.error('ID du facteur MFA non trouvé');
        setError('Erreur de configuration MFA');
        return false;
      }
      
      // Vérifier le code avec l'ID du facteur correct
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
        code: token
      });
      
      if (error) {
        console.error('Erreur lors de la vérification MFA:', error);
        setError('Code MFA invalide');
        return false;
      }
      
      // Vérifier la réponse du challenge
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code: token
      });
      
      if (verifyError) {
        console.error('Erreur lors de la vérification MFA:', verifyError);
        setError('Code MFA invalide');
        return false;
      }
      
      // Mettre à jour l'état MFA
      setMfaEnabled(true);
      SecurityService.persistMFAState(true, factorId);
      
      // Enregistrer l'événement
      if (user) {
        await SecurityService.logSecurityEvent(
          user.id,
          'mfa_enabled',
          { method: 'totp' }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification MFA:', error);
      setError('Erreur lors de la vérification MFA');
      return false;
    }
  };

  // Désactiver MFA
  const disableMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors.totp.length === 0) {
        return true; // Déjà désactivé
      }
      
      const factorId = factors.totp[0].id;
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (error) {
        console.error('Erreur lors de la désactivation MFA:', error);
        setError('Erreur lors de la désactivation MFA');
        return false;
      }
      
      // Effacer l'état MFA persisté
      SecurityService.clearPersistedMFAState();
      
      // Mettre à jour l'état
      setMfaEnabled(false);
      
      // Enregistrer l'événement
      if (user) {
        await SecurityService.logSecurityEvent(
          user.id,
          'mfa_disabled',
          {}
        );
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation MFA:', error);
      setError('Erreur lors de la désactivation MFA');
      return false;
    }
  };

  // Changer le mot de passe
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        setError('Utilisateur non connecté');
        return false;
      }

      // Vérifier que le nouveau mot de passe respecte la politique de sécurité
      const passwordValidation = SecurityService.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        return false;
      }

      // Vérifier le mot de passe actuel en essayant de se reconnecter
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword
      });

      if (signInError) {
        setError('Mot de passe actuel incorrect');
        return false;
      }

      // Changer le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError('Erreur lors du changement de mot de passe');
        return false;
      }

      // Enregistrer l'événement de sécurité
      await SecurityService.logSecurityEvent(
        user.id,
        'password_change',
        { timestamp: new Date().toISOString() }
      );

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setError('Erreur lors du changement de mot de passe');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      error,
      isAdmin,
      mfaEnabled,
      signUp,
      signIn,
      signOut,
      updateProfile,
      clearError,
      setupMFA,
      verifyMFA,
      disableMFA,
      changePassword
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