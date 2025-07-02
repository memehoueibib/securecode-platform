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
      // Récupérer les modules depuis la base de données
      const modules = await AdminSyncService.getAllLearningModules();
      
      // Si aucun module n'est trouvé, retourner un tableau vide
      if (!modules || modules.length === 0) {
        console.log('⚠️ Aucun module d\'apprentissage trouvé dans la base de données');
        return [];
      }
      
      // Filtrer les modules publiés uniquement
      return modules.filter(module => module.status === 'published');
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des modules d\'apprentissage:', error);
      return [];
    }
  }

  // Récupérer un module d'apprentissage spécifique
  static async getLearningModule(moduleId: string): Promise<LearningModule | null> {
    try {
      const modules = await AdminSyncService.getAllLearningModules();
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