import { supabase } from '../lib/supabase';

export interface SecurityLog {
  id: string;
  user_id: string;
  type: 'login' | 'login_failed' | 'password_change' | 'mfa_enabled' | 'mfa_disabled';
  ip_address: string;
  user_agent: string;
  details: any;
  timestamp: string;
}

export class SecurityService {
  // Récupérer les logs de sécurité d'un utilisateur
  static async getSecurityLogs(userId: string): Promise<SecurityLog[]> {
    try {
      // Simuler des logs de sécurité pour la démonstration
      // Dans une implémentation réelle, ces données viendraient de Supabase
      const mockLogs: SecurityLog[] = [
        {
          id: '1',
          user_id: userId,
          type: 'login',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          details: { location: 'Paris, France' },
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 heure avant
        },
        {
          id: '2',
          user_id: userId,
          type: 'login_failed',
          ip_address: '203.0.113.1',
          user_agent: 'Mozilla/5.0 (Linux; Android 10)',
          details: { reason: 'Mot de passe incorrect', attempts: 1 },
          timestamp: new Date(Date.now() - 86400000).toISOString() // 1 jour avant
        },
        {
          id: '3',
          user_id: userId,
          type: 'password_change',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          details: {},
          timestamp: new Date(Date.now() - 604800000).toISOString() // 1 semaine avant
        },
        {
          id: '4',
          user_id: userId,
          type: 'mfa_enabled',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          details: { method: 'totp' },
          timestamp: new Date(Date.now() - 1209600000).toISOString() // 2 semaines avant
        }
      ];
      
      return mockLogs;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs de sécurité:', error);
      return [];
    }
  }

  // Enregistrer un événement de sécurité
  static async logSecurityEvent(
    userId: string,
    type: 'login' | 'login_failed' | 'password_change' | 'mfa_enabled' | 'mfa_disabled',
    details: any = {}
  ): Promise<boolean> {
    try {
      // Dans une implémentation réelle, on enregistrerait l'événement dans Supabase
      console.log('Événement de sécurité enregistré:', {
        user_id: userId,
        type,
        details,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement de sécurité:', error);
      return false;
    }
  }

  // Vérifier les tentatives de connexion échouées récentes
  static async checkFailedLoginAttempts(userId: string): Promise<{ count: number, locked: boolean }> {
    try {
      // Dans une implémentation réelle, on interrogerait Supabase
      // Simuler un résultat pour la démonstration
      return {
        count: 0,
        locked: false
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des tentatives de connexion:', error);
      return { count: 0, locked: false };
    }
  }

  // Vérifier si un mot de passe respecte la politique de sécurité
  static validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 12) {
      return { 
        valid: false, 
        message: 'Le mot de passe doit contenir au moins 12 caractères' 
      };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return { 
        valid: false, 
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' 
      };
    }
    
    return { valid: true, message: 'Mot de passe valide' };
  }
  
  // Vérifier l'état MFA d'un utilisateur
  static async checkMFAStatus(userId: string): Promise<boolean> {
    try {
      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Erreur lors de la vérification du statut MFA:', error);
        return false;
      }
      
      return factors.totp.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut MFA:', error);
      return false;
    }
  }
  
  // Persister l'état MFA dans le localStorage
  static persistMFAState(enabled: boolean, factorId?: string): void {
    try {
      localStorage.setItem('mfaEnabled', enabled.toString());
      if (factorId) {
        localStorage.setItem('mfaFactorId', factorId);
      }
    } catch (error) {
      console.error('Erreur lors de la persistance de l\'état MFA:', error);
    }
  }
  
  // Récupérer l'état MFA persisté
  static getPersistedMFAState(): { enabled: boolean; factorId: string | null } {
    try {
      const enabled = localStorage.getItem('mfaEnabled') === 'true';
      const factorId = localStorage.getItem('mfaFactorId');
      return { enabled, factorId };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état MFA persisté:', error);
      return { enabled: false, factorId: null };
    }
  }
  
  // Effacer l'état MFA persisté
  static clearPersistedMFAState(): void {
    try {
      localStorage.removeItem('mfaEnabled');
      localStorage.removeItem('mfaFactorId');
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'état MFA persisté:', error);
    }
  }
}