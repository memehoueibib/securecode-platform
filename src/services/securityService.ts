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

export interface BlockedIP {
  ip: string;
  reason: string;
  timestamp: string;
  attempts: number;
  country?: string;
  expires?: string;
  status: 'active' | 'expired';
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

  // Récupérer la liste des IP bloquées
  static async getBlockedIPs(): Promise<BlockedIP[]> {
    try {
      // Simuler des IP bloquées pour la démonstration
      // Dans une implémentation réelle, ces données viendraient de Supabase
      const mockBlockedIPs: BlockedIP[] = [
        {
          ip: '192.168.1.10',
          reason: 'scan detected',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          attempts: 12,
          country: 'Russie',
          expires: new Date(Date.now() + 86400000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.11',
          reason: 'brute force attempt',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          attempts: 8,
          country: 'Chine',
          expires: new Date(Date.now() + 172800000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.12',
          reason: 'malware traffic',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          attempts: 5,
          country: 'Corée du Nord',
          expires: new Date(Date.now() + 604800000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.13',
          reason: 'suspicious activity',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          attempts: 3,
          country: 'Iran',
          expires: new Date(Date.now() + 259200000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.14',
          reason: 'port scanning',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          attempts: 15,
          country: 'Russie',
          expires: new Date(Date.now() - 86400000).toISOString(),
          status: 'expired'
        },
        {
          ip: '192.168.1.15',
          reason: 'ddos attempt',
          timestamp: new Date(Date.now() - 345600000).toISOString(),
          attempts: 100,
          country: 'Chine',
          expires: new Date(Date.now() - 172800000).toISOString(),
          status: 'expired'
        },
        {
          ip: '192.168.1.16',
          reason: 'unauthorized access',
          timestamp: new Date(Date.now() - 432000000).toISOString(),
          attempts: 7,
          country: 'Russie',
          expires: null,
          status: 'active'
        },
        {
          ip: '192.168.1.17',
          reason: 'suspicious login',
          timestamp: new Date(Date.now() - 518400000).toISOString(),
          attempts: 4,
          country: 'Ukraine',
          expires: new Date(Date.now() + 1209600000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.18',
          reason: 'sql injection',
          timestamp: new Date(Date.now() - 604800000).toISOString(),
          attempts: 6,
          country: 'Brésil',
          expires: new Date(Date.now() + 2592000000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.19',
          reason: 'xss attack',
          timestamp: new Date(Date.now() - 691200000).toISOString(),
          attempts: 3,
          country: 'Inde',
          expires: new Date(Date.now() + 1209600000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.20',
          reason: 'exploit attempt',
          timestamp: new Date(Date.now() - 777600000).toISOString(),
          attempts: 9,
          country: 'Chine',
          expires: null,
          status: 'active'
        },
        {
          ip: '192.168.1.21',
          reason: 'ransomware',
          timestamp: new Date(Date.now() - 864000000).toISOString(),
          attempts: 2,
          country: 'Russie',
          expires: new Date(Date.now() + 2592000000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.22',
          reason: 'botnet traffic',
          timestamp: new Date(Date.now() - 950400000).toISOString(),
          attempts: 18,
          country: 'Chine',
          expires: new Date(Date.now() + 1209600000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.23',
          reason: 'phishing',
          timestamp: new Date(Date.now() - 1036800000).toISOString(),
          attempts: 5,
          country: 'Nigeria',
          expires: new Date(Date.now() + 2592000000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.24',
          reason: 'credential stuffing',
          timestamp: new Date(Date.now() - 1123200000).toISOString(),
          attempts: 11,
          country: 'Russie',
          expires: new Date(Date.now() + 1209600000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.25',
          reason: 'malicious payload',
          timestamp: new Date(Date.now() - 1209600000).toISOString(),
          attempts: 3,
          country: 'Iran',
          expires: new Date(Date.now() + 2592000000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.26',
          reason: 'data exfiltration',
          timestamp: new Date(Date.now() - 1296000000).toISOString(),
          attempts: 4,
          country: 'Chine',
          expires: new Date(Date.now() + 1209600000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.27',
          reason: 'backdoor access',
          timestamp: new Date(Date.now() - 1382400000).toISOString(),
          attempts: 2,
          country: 'Corée du Nord',
          expires: new Date(Date.now() + 2592000000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.28',
          reason: 'trojan detected',
          timestamp: new Date(Date.now() - 1468800000).toISOString(),
          attempts: 1,
          country: 'Russie',
          expires: new Date(Date.now() + 1209600000).toISOString(),
          status: 'active'
        },
        {
          ip: '192.168.1.29',
          reason: 'spam',
          timestamp: new Date(Date.now() - 1555200000).toISOString(),
          attempts: 7,
          country: 'Chine',
          expires: new Date(Date.now() + 604800000).toISOString(),
          status: 'active'
        }
      ];
      
      return mockBlockedIPs;
    } catch (error) {
      console.error('Erreur lors de la récupération des IP bloquées:', error);
      return [];
    }
  }

  // Bloquer une adresse IP
  static async blockIP(ip: string, reason: string, duration: number): Promise<boolean> {
    try {
      console.log(`Blocage de l'IP ${ip} pour la raison: ${reason}, durée: ${duration} heures`);
      // Dans une implémentation réelle, on enregistrerait le blocage dans Supabase
      
      return true;
    } catch (error) {
      console.error('Erreur lors du blocage de l\'IP:', error);
      return false;
    }
  }

  // Débloquer une adresse IP
  static async unblockIP(ip: string): Promise<boolean> {
    try {
      console.log(`Déblocage de l'IP ${ip}`);
      // Dans une implémentation réelle, on supprimerait le blocage dans Supabase
      
      return true;
    } catch (error) {
      console.error('Erreur lors du déblocage de l\'IP:', error);
      return false;
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