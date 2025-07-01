import { supabase, CodeAnalyse, Vulnerability } from '../lib/supabase';
import { scanCode } from './vulnerabilityScanner';

export class AnalysisService {
  static async createAnalysis(
    userId: string,
    fileName: string,
    code: string,
    language: string = 'javascript',
    aiAnalysisUsed: boolean = false
  ) {
    try {
      // Scanner le code pour détecter les vulnérabilités
      const detectedVulnerabilities = scanCode(code);
      
      // Calculer le score de sécurité
      const scoreAnalyse = this.calculateSecurityScore(detectedVulnerabilities);
      
      // Créer l'analyse dans la base de données
      const { data: analysisData, error: analysisError } = await supabase
        .from('code_analyses')
        .insert({
          user_id: userId,
          nom_fichier: fileName,
          contenu_code: code,
          nombre_vulnerabilites: detectedVulnerabilities.length,
          score_analyse: scoreAnalyse,
          ai_analysis_used: aiAnalysisUsed,
          language: language
        })
        .select()
        .single();

      if (analysisError) {
        console.error('Erreur lors de la création de l\'analyse:', analysisError);
        throw analysisError;
      }

      // Sauvegarder les vulnérabilités
      const vulnerabilities: Partial<Vulnerability>[] = detectedVulnerabilities.map(vuln => ({
        analyse_id: analysisData.id,
        type: vuln.type as 'xss' | 'injection' | 'secrets',
        severite: vuln.severity as 'critique' | 'eleve' | 'moyen' | 'faible',
        ligne: vuln.line,
        description: vuln.description,
        code_snippet: vuln.codeSnippet,
        solution: vuln.fix,
        corrigee: false
      }));

      let vulnerabilityData: Vulnerability[] = [];
      if (vulnerabilities.length > 0) {
        const { data: vulnData, error: vulnError } = await supabase
          .from('vulnerabilities')
          .insert(vulnerabilities)
          .select();

        if (vulnError) {
          console.error('Erreur lors de la sauvegarde des vulnérabilités:', vulnError);
        } else {
          vulnerabilityData = vulnData || [];
        }
      }

      // Mettre à jour les points de l'utilisateur
      await this.updateUserPoints(userId, scoreAnalyse);

      return {
        analyse: analysisData,
        vulnerabilities: vulnerabilityData
      };
    } catch (error) {
      console.error('Erreur dans createAnalysis:', error);
      throw error;
    }
  }

  static async getUserAnalyses(userId: string): Promise<CodeAnalyse[]> {
    try {
      const { data, error } = await supabase
        .from('code_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des analyses:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getUserAnalyses:', error);
      return [];
    }
  }

  static async getAnalysisVulnerabilities(analysisId: string): Promise<Vulnerability[]> {
    try {
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('analyse_id', analysisId)
        .order('severite', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des vulnérabilités:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans getAnalysisVulnerabilities:', error);
      return [];
    }
  }

  static async deleteAnalysis(userId: string, analysisId: string): Promise<boolean> {
    try {
      // Vérifier que l'analyse appartient à l'utilisateur
      const { data: analysis } = await supabase
        .from('code_analyses')
        .select('user_id')
        .eq('id', analysisId)
        .single();

      if (!analysis || analysis.user_id !== userId) {
        throw new Error('Analyse non trouvée ou non autorisée');
      }

      // Supprimer l'analyse (les vulnérabilités seront supprimées en cascade)
      const { error } = await supabase
        .from('code_analyses')
        .delete()
        .eq('id', analysisId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur dans deleteAnalysis:', error);
      return false;
    }
  }

  static async getAnalysisStats(userId: string) {
    try {
      // Charger toutes les analyses de l'utilisateur
      const analyses = await this.getUserAnalyses(userId);
      
      const totalAnalyses = analyses.length;
      const totalVulnerabilites = analyses.reduce((sum, analysis) => sum + analysis.nombre_vulnerabilites, 0);
      const scoreMoyen = totalAnalyses > 0 
        ? Math.round(analyses.reduce((sum, analysis) => sum + analysis.score_analyse, 0) / totalAnalyses)
        : 0;

      // Calculer la tendance (simple simulation)
      const tendance = totalAnalyses > 0 ? '+12%' : '0%';

      return {
        totalAnalyses,
        totalVulnerabilites,
        scoreMoyen,
        tendance
      };
    } catch (error) {
      console.error('Erreur dans getAnalysisStats:', error);
      return {
        totalAnalyses: 0,
        totalVulnerabilites: 0,
        scoreMoyen: 0,
        tendance: '0%'
      };
    }
  }

  private static calculateSecurityScore(vulnerabilities: any[]): number {
    if (vulnerabilities.length === 0) return 100;

    let score = 100;
    vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critique':
          score -= 25;
          break;
        case 'eleve':
          score -= 15;
          break;
        case 'moyen':
          score -= 10;
          break;
        case 'faible':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  private static async updateUserPoints(userId: string, score: number) {
    try {
      // Calculer les points gagnés basés sur le score
      const pointsGagnes = Math.max(1, Math.floor(score / 10));

      // Mettre à jour les points de l'utilisateur
      const { error } = await supabase.rpc('increment_user_points', {
        user_id: userId,
        points_to_add: pointsGagnes
      });

      if (error) {
        console.error('Erreur lors de la mise à jour des points:', error);
      }
    } catch (error) {
      console.error('Erreur dans updateUserPoints:', error);
    }
  }
}