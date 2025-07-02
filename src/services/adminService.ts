import { supabase } from '../lib/supabase';
import { AdminUser, AdminStats, AdminAnalysis, Department, Team, OrganizationMember, LearningModule, SecurityRule } from '../types/admin';

export class AdminService {
  // Récupérer tous les utilisateurs avec leurs statistiques
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('🔍 AdminService: Chargement des utilisateurs...');
      
      // Récupérer directement depuis la table profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        return [];
      }

      console.log('✅ Utilisateurs récupérés:', data?.length || 0);

      if (!data || data.length === 0) {
        console.warn('⚠️ Aucun utilisateur trouvé dans la base de données');
        console.warn('💡 Créez les utilisateurs de démonstration dans Supabase Dashboard');
        return [];
      }

      // Transformer les données pour l'interface admin
      return data.map(user => ({
        id: user.id,
        email: user.email,
        nom: user.nom,
        role: this.determineUserRole(user.email, user.niveau),
        status: this.determineUserStatus(user.updated_at),
        last_login: user.updated_at,
        created_at: user.created_at,
        permissions: [],
        niveau: user.niveau,
        points: user.points,
        score_securite: user.score_securite
      }));
    } catch (error) {
      console.error('❌ Erreur AdminService.getAllUsers:', error);
      return [];
    }
  }

  // Récupérer les statistiques globales
  static async getAdminStats(): Promise<AdminStats> {
    try {
      console.log('📊 AdminService: Chargement des statistiques...');

      // Compter les utilisateurs
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('❌ Erreur comptage utilisateurs:', usersError);
      }

      // Compter les utilisateurs actifs (connectés dans les 30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeError) {
        console.error('❌ Erreur comptage utilisateurs actifs:', activeError);
      }

      // Compter les analyses
      const { count: totalAnalyses, error: analysesError } = await supabase
        .from('code_analyses')
        .select('*', { count: 'exact', head: true });

      if (analysesError) {
        console.error('❌ Erreur comptage analyses:', analysesError);
      }

      // Compter les vulnérabilités
      const { count: totalVulnerabilities, error: vulnError } = await supabase
        .from('vulnerabilities')
        .select('*', { count: 'exact', head: true });

      if (vulnError) {
        console.error('❌ Erreur comptage vulnérabilités:', vulnError);
      }

      // Calculer le score moyen de sécurité
      const { data: avgScore, error: scoreError } = await supabase
        .from('profiles')
        .select('score_securite')
        .not('score_securite', 'is', null);

      if (scoreError) {
        console.error('❌ Erreur calcul score moyen:', scoreError);
      }

      const averageSecurityScore = avgScore && avgScore.length > 0
        ? Math.round(avgScore.reduce((sum, user) => sum + (user.score_securite || 0), 0) / avgScore.length)
        : 0;

      // Calculer la tendance mensuelle
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString());

      const monthlyTrend = lastMonthUsers ? `+${lastMonthUsers}` : '+0';

      const stats = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalAnalyses: totalAnalyses || 0,
        totalVulnerabilities: totalVulnerabilities || 0,
        averageSecurityScore,
        monthlyTrend
      };

      console.log('✅ Statistiques calculées:', stats);

      // Avertissement si pas de données
      if (stats.totalUsers === 0) {
        console.warn('⚠️ AUCUNE DONNÉE TROUVÉE !');
        console.warn('💡 Solution: Créez les utilisateurs admin@securecode.fr et demo@securecode.fr dans Supabase Dashboard');
      }

      return stats;
    } catch (error) {
      console.error('❌ Erreur AdminService.getAdminStats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalAnalyses: 0,
        totalVulnerabilities: 0,
        averageSecurityScore: 0,
        monthlyTrend: '+0'
      };
    }
  }

  // Récupérer les analyses récentes
  static async getRecentAnalyses(limit: number = 10): Promise<AdminAnalysis[]> {
    try {
      console.log('📈 AdminService: Chargement des analyses récentes...');

      const { data, error } = await supabase
        .from('code_analyses')
        .select(`
          id,
          user_id,
          nom_fichier,
          nombre_vulnerabilites,
          score_analyse,
          language,
          ai_analysis_used,
          created_at,
          profiles(nom)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erreur lors de la récupération des analyses:', error);
        return [];
      }

      console.log('✅ Analyses récupérées:', data?.length || 0);

      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune analyse trouvée');
        return [];
      }

      return data.map(analysis => ({
        id: analysis.id,
        user_id: analysis.user_id,
        user_name: analysis.profiles?.nom || 'Utilisateur',
        nom_fichier: analysis.nom_fichier,
        nombre_vulnerabilites: analysis.nombre_vulnerabilites,
        score_analyse: analysis.score_analyse,
        language: analysis.language,
        ai_analysis_used: analysis.ai_analysis_used,
        created_at: analysis.created_at
      }));
    } catch (error) {
      console.error('❌ Erreur AdminService.getRecentAnalyses:', error);
      return [];
    }
  }

  // Créer un nouvel utilisateur
  static async createUser(userData: {
    nom: string;
    email: string;
    password: string;
    role: string;
  }): Promise<boolean> {
    try {
      console.log('👤 AdminService: Création utilisateur:', userData.email);

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nom: userData.nom
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur création utilisateur auth:', authError);
        return false;
      }

      // Créer le profil utilisateur
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            nom: userData.nom,
            email: userData.email,
            niveau: this.getRoleLevel(userData.role),
            points: 0,
            score_securite: 0
          });

        if (profileError) {
          console.error('❌ Erreur création profil:', profileError);
          return false;
        }
      }

      console.log('✅ Utilisateur créé avec succès:', userData.email);
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminService.createUser:', error);
      return false;
    }
  }

  // Supprimer un utilisateur
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      console.log('🗑️ AdminService: Suppression utilisateur:', userId);

      // Supprimer le profil (la suppression en cascade supprimera les autres données)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('❌ Erreur suppression utilisateur:', error);
        return false;
      }

      console.log('✅ Utilisateur supprimé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminService.deleteUser:', error);
      return false;
    }
  }

  // Mettre à jour le statut d'un utilisateur
  static async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<boolean> {
    try {
      console.log('🔄 AdminService: Mise à jour statut:', userId, status);

      // Pour l'instant, on met à jour le niveau dans le profil
      const niveau = status === 'active' ? 'Actif' : 'Inactif';
      
      const { error } = await supabase
        .from('profiles')
        .update({ niveau })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erreur mise à jour statut:', error);
        return false;
      }

      console.log('✅ Statut mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminService.updateUserStatus:', error);
      return false;
    }
  }

  // Récupérer tous les départements
  static async getAllDepartments(): Promise<Department[]> {
    try {
      // Simuler des départements pour l'instant
      return [
        { id: 'dept-dev', name: 'Développement', description: 'Équipe de développement logiciel' },
        { id: 'dept-security', name: 'Sécurité', description: 'Équipe cybersécurité' },
        { id: 'dept-qa', name: 'Qualité', description: 'Assurance qualité et tests' }
      ];
    } catch (error) {
      console.error('❌ Erreur AdminService.getAllDepartments:', error);
      return [];
    }
  }

  // Récupérer toutes les équipes
  static async getAllTeams(): Promise<Team[]> {
    try {
      // Simuler des équipes pour l'instant
      return [
        { id: 'team-frontend', departmentId: 'dept-dev', name: 'Frontend', description: 'Développement interface utilisateur' },
        { id: 'team-backend', departmentId: 'dept-dev', name: 'Backend', description: 'Développement serveur et API' },
        { id: 'team-pentest', departmentId: 'dept-security', name: 'Pentest', description: 'Tests de pénétration' }
      ];
    } catch (error) {
      console.error('❌ Erreur AdminService.getAllTeams:', error);
      return [];
    }
  }

  // Récupérer tous les membres de l'organisation
  static async getAllOrganizationMembers(): Promise<OrganizationMember[]> {
    try {
      // Récupérer directement les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nom, email, niveau')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('❌ Erreur récupération profils:', profilesError);
        return [];
      }

      return profiles.map(profile => ({
        id: profile.id,
        name: profile.nom,
        email: profile.email,
        role: this.determineUserRole(profile.email, profile.niveau) as any
      })) || [];
    } catch (error) {
      console.error('❌ Erreur AdminService.getAllOrganizationMembers:', error);
      return [];
    }
  }

  // Fonctions utilitaires privées
  static determineUserRole(email: string, niveau?: string): any {
    const adminEmails = [
      'admin@securecode.fr',
      'admin@techcorp.com',
      'testadmin@securecode.fr',
      'admin@example.com',
      'administrator@securecode.fr'
    ];

    if (adminEmails.includes(email)) {
      return 'admin_org';
    }

    // Déterminer le rôle basé sur le niveau ou l'email
    if (email.includes('manager')) return 'manager';
    if (email.includes('lead')) return 'tech_lead';
    if (email.includes('senior')) return 'senior_dev';
    if (email.includes('junior')) return 'junior_dev';
    if (email.includes('security')) return 'security_expert';
    
    // Rôle par défaut
    return 'user';
  }

  static determineUserStatus(lastUpdate?: string): 'active' | 'inactive' | 'pending' {
    if (!lastUpdate) return 'pending';
    
    const lastUpdateDate = new Date(lastUpdate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastUpdateDate > thirtyDaysAgo ? 'active' : 'inactive';
  }

  static getRoleLevel(role: string): string {
    const roleLevels: Record<string, string> = {
      'admin_org': 'Expert',
      'manager': 'Avancé',
      'tech_lead': 'Avancé',
      'senior_dev': 'Avancé',
      'junior_dev': 'Intermédiaire',
      'security_expert': 'Expert',
      'security_analyst': 'Avancé',
      'user': 'Débutant'
    };
    return roleLevels[role] || 'Débutant';
  }
}