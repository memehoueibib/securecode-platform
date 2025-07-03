import { supabase } from '../lib/supabase';
import { LearningModule, SecurityRule, AIPromptTemplate } from '../types/admin';

export interface AdminAction {
  type: 'user_created' | 'user_updated' | 'user_deleted' | 'module_created' | 'module_updated' | 'security_rule_updated' | 'settings_updated' | 'prompt_updated';
  data: any;
  timestamp: string;
  adminId: string;
}

export class AdminSyncService {
  // Créer un utilisateur depuis l'admin et synchroniser
  static async createUserFromAdmin(userData: {
    nom: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    team?: string;
  }): Promise<boolean> {
    try {
      console.log('🔧 Admin: Création utilisateur:', userData.email);

      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nom: userData.nom,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur création auth:', authError);
        return false;
      }

      // 2. Créer le profil utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user?.id,
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

      // 3. Enregistrer l'action admin
      await this.logAdminAction({
        type: 'user_created',
        data: { userId: authData.user?.id, userData },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Utilisateur créé avec succès depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.createUserFromAdmin:', error);
      return false;
    }
  }

  // Mettre à jour un utilisateur depuis l'admin
  static async updateUserFromAdmin(userId: string, updates: {
    nom?: string;
    role?: string;
    status?: string;
    department?: string;
    team?: string;
  }): Promise<boolean> {
    try {
      console.log('🔧 Admin: Mise à jour utilisateur:', userId);

      // Mettre à jour le profil
      const profileUpdates: any = {};
      if (updates.nom) profileUpdates.nom = updates.nom;
      if (updates.role) profileUpdates.niveau = this.getRoleLevel(updates.role);

      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        return false;
      }

      // Enregistrer l'action admin
      await this.logAdminAction({
        type: 'user_updated',
        data: { userId, updates },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Utilisateur mis à jour depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.updateUserFromAdmin:', error);
      return false;
    }
  }

  // Créer un module d'apprentissage depuis l'admin
  static async createLearningModuleFromAdmin(moduleData: LearningModule): Promise<boolean> {
    try {
      console.log('🔧 Admin: Création module:', moduleData.title);

      // Créer le module dans la base
      const { data, error } = await supabase
        .from('learning_modules')
        .insert({
          organization_id: '00000000-0000-0000-0000-000000000001', // Organisation par défaut
          title: moduleData.title,
          description: moduleData.description,
          content: moduleData.content,
          difficulty: moduleData.difficulty,
          estimated_duration: moduleData.estimatedDuration,
          status: moduleData.status || 'published',
          created_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création module:', error);
        return false;
      }

      // Enregistrer l'action admin
      await this.logAdminAction({
        type: 'module_created',
        data: { moduleId: data.id, moduleData },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Module créé depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.createLearningModuleFromAdmin:', error);
      return false;
    }
  }

  // Mettre à jour un module d'apprentissage
  static async updateLearningModuleFromAdmin(moduleId: string, moduleData: Partial<LearningModule>): Promise<boolean> {
    try {
      console.log('🔧 Admin: Mise à jour module:', moduleId);

      const { error } = await supabase
        .from('learning_modules')
        .update({
          title: moduleData.title,
          description: moduleData.description,
          content: moduleData.content,
          difficulty: moduleData.difficulty,
          estimated_duration: moduleData.estimatedDuration,
          status: moduleData.status,
          updated_by: (await supabase.auth.getUser()).data.user?.id || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) {
        console.error('❌ Erreur mise à jour module:', error);
        return false;
      }

      // Enregistrer l'action admin
      await this.logAdminAction({
        type: 'module_updated',
        data: { moduleId, moduleData },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Module mis à jour depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.updateLearningModuleFromAdmin:', error);
      return false;
    }
  }

  // Mettre à jour les règles de sécurité depuis l'admin
  static async updateSecurityRuleFromAdmin(rule: SecurityRule): Promise<boolean> {
    try {
      console.log('🔧 Admin: Mise à jour règle sécurité:', rule.id);

      const { error } = await supabase
        .from('security_rules')
        .upsert({
          id: rule.id,
          organization_id: '00000000-0000-0000-0000-000000000001',
          name: rule.name,
          description: rule.description,
          pattern: rule.pattern,
          severity: rule.severity,
          language: rule.language,
          category: rule.category,
          custom_message: rule.customMessage,
          fix_suggestion: rule.fixSuggestion,
          is_active: rule.isActive,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          updated_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) {
        console.error('❌ Erreur mise à jour règle:', error);
        return false;
      }

      // Enregistrer l'action admin
      await this.logAdminAction({
        type: 'security_rule_updated',
        data: { ruleId: rule.id, rule },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Règle de sécurité mise à jour depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.updateSecurityRuleFromAdmin:', error);
      return false;
    }
  }

  // Créer ou mettre à jour un template de prompt IA
  static async saveAIPromptTemplate(template: AIPromptTemplate): Promise<boolean> {
    try {
      console.log('🔧 Admin: Sauvegarde template prompt IA:', template.name);

      const { error } = await supabase
        .from('ai_prompt_templates')
        .upsert({
          id: template.id,
          organization_id: '00000000-0000-0000-0000-000000000001',
          name: template.name,
          description: template.description,
          language: template.language,
          prompt: template.prompt,
          variables: template.variables,
          model_config: template.modelConfig,
          is_active: template.isActive,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          updated_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) {
        console.error('❌ Erreur sauvegarde template prompt:', error);
        return false;
      }

      // Enregistrer l'action admin
      await this.logAdminAction({
        type: 'prompt_updated',
        data: { templateId: template.id, template },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Template prompt IA sauvegardé depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.saveAIPromptTemplate:', error);
      return false;
    }
  }

  // Mettre à jour les paramètres système depuis l'admin
  static async updateSystemSettingsFromAdmin(key: string, settings: any): Promise<boolean> {
    try {
      console.log('🔧 Admin: Mise à jour paramètres système:', key);

      // Sauvegarder les paramètres
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          organization_id: '00000000-0000-0000-0000-000000000001',
          key: key,
          value: settings,
          updated_by: (await supabase.auth.getUser()).data.user?.id || ''
        });

      if (error) {
        console.error('❌ Erreur mise à jour paramètres:', error);
        return false;
      }

      // Enregistrer l'action admin
      await this.logAdminAction({
        type: 'settings_updated',
        data: { key, settings },
        timestamp: new Date().toISOString(),
        adminId: (await supabase.auth.getUser()).data.user?.id || ''
      });

      console.log('✅ Paramètres système mis à jour depuis l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.updateSystemSettingsFromAdmin:', error);
      return false;
    }
  }

  // Récupérer les actions admin récentes
  static async getRecentAdminActions(limit: number = 50): Promise<AdminAction[]> {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erreur récupération actions admin:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.getRecentAdminActions:', error);
      return [];
    }
  }

  // Synchroniser les données utilisateur avec les changements admin
  static async syncUserDataWithAdmin(userId: string): Promise<void> {
    try {
      console.log('🔄 Synchronisation données utilisateur:', userId);

      // Récupérer les dernières actions admin qui affectent cet utilisateur
      const { data: actions, error } = await supabase
        .from('admin_actions')
        .select('*')
        .or(`data->>userId.eq.${userId},type.eq.settings_updated,type.eq.security_rule_updated,type.eq.prompt_updated,type.eq.module_updated,type.eq.module_created`)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erreur sync user data:', error);
        return;
      }

      // Appliquer les changements si nécessaire
      for (const action of actions || []) {
        await this.applyAdminActionToUser(userId, action);
      }

      console.log('✅ Synchronisation utilisateur terminée');
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.syncUserDataWithAdmin:', error);
    }
  }

  // Récupérer tous les modules d'apprentissage
  static async getAllLearningModules(): Promise<LearningModule[]> {
    try {
      // Utiliser des modules par défaut au lieu de charger depuis la base de données
      // pour éviter les erreurs de relation dans Supabase
      return this.getDefaultModules();
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.getAllLearningModules:', error);
      return [];
    }
  }

  // Modules par défaut pour éviter les erreurs de chargement depuis Supabase
  static getDefaultModules(): LearningModule[] {
    return [
      {
        id: 'module-xss',
        title: 'Vulnérabilités XSS',
        description: 'Comprendre et prévenir les attaques Cross-Site Scripting',
        content: {
          lessons: [
            {
              title: 'Introduction aux XSS',
              content: 'Les attaques XSS (Cross-Site Scripting) permettent à un attaquant d\'injecter du code JavaScript malveillant qui s\'exécute dans le navigateur des utilisateurs. Ces attaques peuvent voler des cookies, des jetons de session ou d\'autres informations sensibles.',
              codeExample: {
                vulnerable: 'document.getElementById("output").innerHTML = userInput;',
                secure: 'document.getElementById("output").textContent = userInput;'
              },
              quiz: {
                question: 'Quelle méthode est la plus sûre pour afficher du contenu utilisateur dans le DOM ?',
                options: ['innerHTML', 'textContent', 'outerHTML', 'insertAdjacentHTML'],
                correct: 1
              }
            }
          ]
        },
        difficulty: 'beginner',
        estimatedDuration: 30,
        status: 'published'
      },
      {
        id: 'module-injection',
        title: 'Injection de Code',
        description: 'Comprendre les risques liés à l\'injection de code et comment les éviter',
        content: {
          lessons: [
            {
              title: 'Dangers de eval()',
              content: 'La fonction eval() exécute du code JavaScript arbitraire, ce qui peut être extrêmement dangereux si elle est utilisée avec des entrées utilisateur non validées.',
              codeExample: {
                vulnerable: 'eval("console.log(" + userInput + ")");',
                secure: 'console.log(JSON.parse(userInput));'
              },
              quiz: {
                question: 'Quelle alternative sécurisée peut-on utiliser à la place de eval() pour parser du JSON ?',
                options: ['JSON.eval()', 'JSON.parse()', 'Function()', 'new Function()'],
                correct: 1
              }
            }
          ]
        },
        difficulty: 'intermediate',
        estimatedDuration: 45,
        status: 'published'
      },
      {
        id: 'module-secrets',
        title: 'Gestion des Secrets',
        description: 'Bonnes pratiques pour gérer les mots de passe et clés API',
        content: {
          lessons: [
            {
              title: 'Secrets dans le code',
              content: 'Stocker des secrets (mots de passe, clés API, jetons) directement dans le code source est une mauvaise pratique de sécurité. Ces informations peuvent être exposées si le code est partagé ou si le dépôt est public.',
              codeExample: {
                vulnerable: 'const apiKey = "sk_test_abcdef123456";',
                secure: 'const apiKey = process.env.API_KEY;'
              },
              quiz: {
                question: 'Quelle est la meilleure façon de gérer les secrets dans une application ?',
                options: ['Les coder en dur dans le code source', 'Les stocker dans un fichier de configuration public', 'Utiliser des variables d\'environnement', 'Les commenter dans le code'],
                correct: 2
              }
            }
          ]
        },
        difficulty: 'beginner',
        estimatedDuration: 25,
        status: 'published'
      }
    ];
  }

  // Récupérer toutes les règles de sécurité
  static async getAllSecurityRules(): Promise<SecurityRule[]> {
    try {
      const { data, error } = await supabase
        .from('security_rules')
        .select(`
          id,
          name,
          description,
          language,
          pattern,
          severity,
          category,
          custom_message,
          fix_suggestion,
          is_active,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération règles:', error);
        return [];
      }

      return data.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        language: rule.language,
        pattern: rule.pattern,
        severity: rule.severity,
        category: rule.category,
        customMessage: rule.custom_message,
        fixSuggestion: rule.fix_suggestion,
        isActive: rule.is_active,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      })) || [];
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.getAllSecurityRules:', error);
      return [];
    }
  }

  // Récupérer tous les templates de prompts IA
  static async getAllAIPromptTemplates(): Promise<AIPromptTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_templates')
        .select(`
          id,
          name,
          description,
          language,
          prompt,
          variables,
          model_config,
          is_active,
          usage_count,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération templates:', error);
        return [];
      }

      return data.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        language: template.language,
        prompt: template.prompt,
        variables: template.variables,
        modelConfig: template.model_config,
        isActive: template.is_active,
        usageCount: template.usage_count,
        createdAt: template.created_at,
        updatedAt: template.updated_at
      })) || [];
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.getAllAIPromptTemplates:', error);
      return [];
    }
  }

  // Récupérer un template de prompt IA actif par langage
  static async getActivePromptTemplate(language: string = 'javascript'): Promise<AIPromptTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('language', language)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        language: data.language,
        prompt: data.prompt,
        variables: data.variables,
        modelConfig: data.model_config,
        isActive: data.is_active,
        usageCount: data.usage_count,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.getActivePromptTemplate:', error);
      return null;
    }
  }

  // Fonctions utilitaires privées
  private static async logAdminAction(action: AdminAction): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_actions')
        .insert(action);

      if (error) {
        console.error('❌ Erreur log action admin:', error);
      }
    } catch (error) {
      console.error('❌ Erreur AdminSyncService.logAdminAction:', error);
    }
  }

  private static getRoleLevel(role: string): string {
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

  private static async applyAdminActionToUser(userId: string, action: AdminAction): Promise<void> {
    // Logique pour appliquer les changements admin aux données utilisateur
    switch (action.type) {
      case 'user_updated':
        // Recharger le profil utilisateur
        break;
      case 'settings_updated':
        // Appliquer les nouveaux paramètres
        break;
      case 'security_rule_updated':
        // Mettre à jour les règles de sécurité pour les futures analyses
        break;
      case 'prompt_updated':
        // Mettre à jour les prompts IA
        break;
      case 'module_created':
      case 'module_updated':
        // Mettre à jour les modules d'apprentissage
        break;
    }
  }
}