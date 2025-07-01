import { supabase, CodeAnalyse, Vulnerability } from '../lib/supabase';
import { scanCode } from './vulnerabilityScanner';

export interface AnalysisResult {
  analyse: CodeAnalyse;
  vulnerabilities: Vulnerability[];
}

export class AnalysisService {
  static async createAnalysis(
    userId: string,
    fileName: string,
    code: string,
    language: string = 'javascript'
  ): Promise<AnalysisResult | null> {
    try {
      // Scanner le code pour détecter les vulnérabilités
      const detectedVulnerabilities = scanCode(code, fileName);
      const scoreAnalyse = Math.max(100 - (detectedVulnerabilities.length * 10), 0);

      // Créer l'analyse dans la base de données
      const { data: analyse, error: analyseError } = await supabase
        .from('code_analyses')
        .insert({
          user_id: userId,
          nom_fichier: fileName,
          contenu_code: code,
          nombre_vulnerabilites: detectedVulnerabilities.length,
          score_analyse: scoreAnalyse,
          language: language
        })
        .select()
        .single();

      if (analyseError) {
        console.error('Erreur lors de la création de l\'analyse:', analyseError);
        return null;
      }

      // Créer les vulnérabilités dans la base de données
      const vulnerabilities: Vulnerability[] = [];
      
      if (detectedVulnerabilities.length > 0) {
        const vulnerabilityInserts = detectedVulnerabilities.map(vuln => ({
          analyse_id: analyse.id,
          type: vuln.type,
          severite: vuln.severity,
          ligne: vuln.line,
          description: vuln.description,
          code_snippet: vuln.codeSnippet,
          solution: vuln.fix
        }));

        const { data: vulnData, error: vulnError } = await supabase
          .from('vulnerabilities')
          .insert(vulnerabilityInserts)
          .select();

        if (vulnError) {
          console.error('Erreur lors de la création des vulnérabilités:', vulnError);
        } else {
          vulnerabilities.push(...vulnData);
        }
      }

      // Mettre à jour les statistiques utilisateur
      await this.updateUserStats(userId, detectedVulnerabilities.length);

      return {
        analyse,
        vulnerabilities
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      return null;
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
        console.error('Erreur lors de la récupération des analyses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des analyses:', error);
      return [];
    }
  }

  static async getAnalysisVulnerabilities(analysisId: string): Promise<Vulnerability[]> {
    try {
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('analyse_id', analysisId)
        .order('severite', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des vulnérabilités:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des vulnérabilités:', error);
      return [];
    }
  }

  static async deleteAnalysis(userId: string, analysisId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('code_analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la suppression de l\'analyse:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'analyse:', error);
      return false;
    }
  }

  static async markVulnerabilityAsFixed(vulnerabilityId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vulnerabilities')
        .update({ corrigee: true })
        .eq('id', vulnerabilityId);

      if (error) {
        console.error('Erreur lors de la mise à jour de la vulnérabilité:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la vulnérabilité:', error);
      return false;
    }
  }

  static async getAnalysisStats(userId: string) {
    try {
      // Récupérer toutes les analyses de l'utilisateur
      const { data: analyses, error: analysesError } = await supabase
        .from('code_analyses')
        .select('nombre_vulnerabilites, score_analyse, created_at')
        .eq('user_id', userId);

      if (analysesError) {
        console.error('Erreur lors de la récupération des statistiques:', analysesError);
        return {
          totalAnalyses: 0,
          totalVulnerabilites: 0,
          scoreMoyen: 0,
          tendance: '0%'
        };
      }

      const totalAnalyses = analyses.length;
      const totalVulnerabilites = analyses.reduce((sum, a) => sum + a.nombre_vulnerabilites, 0);
      const scoreMoyen = totalAnalyses > 0 
        ? Math.round(analyses.reduce((sum, a) => sum + a.score_analyse, 0) / totalAnalyses)
        : 0;

      // Calculer la tendance (comparaison avec le mois dernier)
      const maintenant = new Date();
      const moisDernier = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, maintenant.getDate());
      
      const analysesCeMois = analyses.filter(a => new Date(a.created_at) >= moisDernier);
      const tendance = analysesCeMois.length > 0 ? `+${Math.round((analysesCeMois.length / totalAnalyses) * 100)}%` : '0%';

      return {
        totalAnalyses,
        totalVulnerabilites,
        scoreMoyen,
        tendance
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalAnalyses: 0,
        totalVulnerabilites: 0,
        scoreMoyen: 0,
        tendance: '0%'
      };
    }
  }

  private static async updateUserStats(userId: string, vulnerabilitiesFound: number): Promise<void> {
    try {
      // Récupérer le profil actuel
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points, score_securite')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
        return;
      }

      // Calculer les nouveaux points et score
      const pointsGagnes = 10 + (vulnerabilitiesFound * 5); // Points de base + bonus par vulnérabilité trouvée
      const nouveauxPoints = profile.points + pointsGagnes;
      
      // Calculer le nouveau score de sécurité (moyenne pondérée)
      const nouveauScore = Math.max(100 - (vulnerabilitiesFound * 3), 0);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: nouveauxPoints,
          score_securite: nouveauScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour des statistiques:', updateError);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  }
}