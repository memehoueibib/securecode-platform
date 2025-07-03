import { supabase, LearningProgress, Achievement } from '../lib/supabase';
import { AdminSyncService } from './adminSyncService';
import { LearningModule } from '../types/admin';

export class LearningService {
  static async getUserProgress(userId: string): Promise<LearningProgress[]> {
    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération de la progression:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      return [];
    }
  }

  static async updateModuleProgress(
    userId: string,
    moduleId: string,
    moduleNom: string,
    progression: number,
    termine: boolean = false
  ): Promise<boolean> {
    try {
      const pointsGagnes = termine ? 50 : Math.floor(progression / 10);

      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          module_nom: moduleNom,
          progression,
          termine,
          points_gagnes: pointsGagnes,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error);
        return false;
      }

      // Mettre à jour les points utilisateur
      if (pointsGagnes > 0) {
        await this.updateUserPoints(userId, pointsGagnes);
      }

      // Vérifier les réalisations
      if (termine) {
        await this.checkAchievements(userId);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      return false;
    }
  }

  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des réalisations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des réalisations:', error);
      return [];
    }
  }

  // Récupérer tous les modules d'apprentissage disponibles
  static async getAllLearningModules(): Promise<LearningModule[]> {
    try {
      // Utiliser des modules par défaut au lieu de charger depuis la base de données
      // pour éviter les erreurs de relation dans Supabase
      return this.getDefaultModules();
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des modules d\'apprentissage:', error);
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

  // Récupérer un module d'apprentissage spécifique
  static async getLearningModule(moduleId: string): Promise<LearningModule | null> {
    try {
      const modules = this.getDefaultModules();
      return modules.find(module => module.id === moduleId) || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du module d\'apprentissage:', error);
      return null;
    }
  }

  private static async updateUserPoints(userId: string, pointsGagnes: number): Promise<void> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: profile.points + pointsGagnes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour des points:', updateError);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des points:', error);
    }
  }

  private static async checkAchievements(userId: string): Promise<void> {
    try {
      // Récupérer la progression actuelle
      const progress = await this.getUserProgress(userId);
      const completedModules = progress.filter(p => p.termine).length;

      // Définir les réalisations possibles
      const possibleAchievements = [
        {
          achievement_id: 'first-module',
          nom: 'Premier Module',
          description: 'Terminer votre premier module d\'apprentissage',
          icone: '🎓',
          condition: completedModules >= 1
        },
        {
          achievement_id: 'security-student',
          nom: 'Étudiant en Sécurité',
          description: 'Terminer 3 modules d\'apprentissage',
          icone: '📚',
          condition: completedModules >= 3
        },
        {
          achievement_id: 'security-expert',
          nom: 'Expert en Sécurité',
          description: 'Terminer tous les modules disponibles',
          icone: '🏆',
          condition: completedModules >= 5
        }
      ];

      // Vérifier et débloquer les réalisations
      for (const achievement of possibleAchievements) {
        if (achievement.condition) {
          await supabase
            .from('achievements')
            .upsert({
              user_id: userId,
              achievement_id: achievement.achievement_id,
              nom: achievement.nom,
              description: achievement.description,
              icone: achievement.icone,
              debloque: true,
              date_deblocage: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des réalisations:', error);
    }
  }
}