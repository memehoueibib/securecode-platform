import { supabase, CodeAnalyse, Vulnerability } from '../lib/supabase';
import { scanCode } from './vulnerabilityScanner';
import { AIAnalysisService } from './aiAnalysisService';
import { APIConfigService } from './apiConfigService';

export interface AnalysisResult {
  analyse: CodeAnalyse;
  vulnerabilities: Vulnerability[];
}

export class AnalysisService {
  static async createAnalysis(
    userId: string,
    fileName: string,
    code: string,
    language: string = 'javascript',
    useAI: boolean = false
  ): Promise<AnalysisResult | null> {
    try {
      console.log('🔍 Création d\'une nouvelle analyse pour:', userId);
      
      let detectedVulnerabilities = [];
      let aiResults = null;
      
      // Analyse standard avec les règles de sécurité
      detectedVulnerabilities = await scanCode(code, fileName);
      
      // Si l'analyse IA est demandée, utiliser l'API configurée
      if (useAI) {
        try {
          const apiConfig = await APIConfigService.getActiveAPIConfig(userId);
          
          if (apiConfig) {
            console.log('🤖 Utilisation de l\'analyse IA avec', apiConfig.provider);
            aiResults = await AIAnalysisService.analyzeCodeWithAI(code, language, apiConfig);
            
            // Fusionner les résultats de l'IA avec les résultats standard
            if (aiResults && aiResults.vulnerabilities) {
              // Convertir les résultats de l'IA au format attendu
              const aiVulnerabilities = aiResults.vulnerabilities.map((v: any) => {
                // Normaliser le type pour s'assurer qu'il est valide
                let type = v.type.toLowerCase();
                if (type !== 'xss' && type !== 'injection' && type !== 'secrets') {
                  if (type.includes('xss')) type = 'xss';
                  else if (type.includes('inject')) type = 'injection';
                  else if (type.includes('secret') || type.includes('password') || type.includes('key')) type = 'secrets';
                  else type = 'xss'; // Type par défaut
                }
                
                // Normaliser la sévérité
                let severity = v.severity.toLowerCase();
                if (severity !== 'critique' && severity !== 'eleve' && severity !== 'moyen' && severity !== 'faible') {
                  if (severity.includes('crit')) severity = 'critique';
                  else if (severity.includes('high') || severity.includes('elev')) severity = 'eleve';
                  else if (severity.includes('med') || severity.includes('moy')) severity = 'moyen';
                  else if (severity.includes('low') || severity.includes('faib')) severity = 'faible';
                  else severity = 'moyen'; // Sévérité par défaut
                }
                
                return {
                  id: `ai-${type}-${v.line}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  type: type as 'xss' | 'injection' | 'secrets',
                  severity: severity as 'critique' | 'eleve' | 'moyen' | 'faible',
                  line: v.line,
                  description: v.description,
                  codeSnippet: v.codeSnippet,
                  fix: v.fix,
                  explanation: `IA: ${v.description}`
                };
              });
              
              // Ajouter les vulnérabilités détectées par l'IA
              detectedVulnerabilities = [...detectedVulnerabilities, ...aiVulnerabilities];
              
              // Dédupliquer les vulnérabilités (même type et même ligne)
              detectedVulnerabilities = detectedVulnerabilities.filter((vuln, index, self) => 
                index === self.findIndex(v => v.type === vuln.type && v.line === vuln.line)
              );
            }
          } else {
            console.log('⚠️ Aucune configuration IA active trouvée, utilisation de l\'analyse standard uniquement');
          }
        } catch (error) {
          console.error('❌ Erreur lors de l\'analyse IA:', error);
          // Continuer avec les résultats standard en cas d'erreur
        }
      }
      
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
          language: language,
          ai_analysis_used: useAI
        })
        .select()
        .single();

      if (analyseError) {
        console.error('❌ Erreur lors de la création de l\'analyse:', analyseError);
        return null;
      }

      console.log('✅ Analyse créée:', analyse.id);

      // Créer les vulnérabilités dans la base de données
      const vulnerabilities: Vulnerability[] = [];
      
      if (detectedVulnerabilities.length > 0) {
        // S'assurer que les types sont valides selon la contrainte de la base de données
        const validVulnerabilityInserts = detectedVulnerabilities
          .filter(vuln => ['xss', 'injection', 'secrets'].includes(vuln.type))
          .map(vuln => ({
            analyse_id: analyse.id,
            type: vuln.type,
            severite: vuln.severity,
            ligne: vuln.line,
            description: vuln.description,
            code_snippet: vuln.codeSnippet,
            solution: vuln.fix,
            confidence: 100
          }));

        if (validVulnerabilityInserts.length > 0) {
          const { data: vulnData, error: vulnError } = await supabase
            .from('vulnerabilities')
            .insert(validVulnerabilityInserts)
            .select();

          if (vulnError) {
            console.error('❌ Erreur lors de la création des vulnérabilités:', vulnError);
          } else {
            vulnerabilities.push(...vulnData);
            console.log('✅ Vulnérabilités créées:', vulnData.length);
          }
        }
      }

      // Mettre à jour les statistiques utilisateur
      await this.updateUserStats(userId, detectedVulnerabilities.length);

      return {
        analyse,
        vulnerabilities
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
      return null;
    }
  }

  static async getUserAnalyses(userId: string): Promise<CodeAnalyse[]> {
    try {
      console.log('📊 Récupération des analyses pour:', userId);
      
      const { data, error } = await supabase
        .from('code_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des analyses:', error);
        return [];
      }

      console.log('✅ Analyses récupérées:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des analyses:', error);
      return [];
    }
  }

  static async getAnalysisVulnerabilities(analysisId: string): Promise<Vulnerability[]> {
    try {
      console.log('🔍 Récupération des vulnérabilités pour l\'analyse:', analysisId);
      
      const { data, error } = await supabase
        .from('vulnerabilities')
        .select('*')
        .eq('analyse_id', analysisId)
        .order('severite', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des vulnérabilités:', error);
        return [];
      }

      console.log('✅ Vulnérabilités récupérées:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des vulnérabilités:', error);
      return [];
    }
  }

  static async deleteAnalysis(userId: string, analysisId: string): Promise<boolean> {
    try {
      console.log('🗑️ Suppression de l\'analyse:', analysisId);
      
      const { error } = await supabase
        .from('code_analyses')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erreur lors de la suppression de l\'analyse:', error);
        return false;
      }

      console.log('✅ Analyse supprimée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'analyse:', error);
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
        console.error('❌ Erreur lors de la mise à jour de la vulnérabilité:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la vulnérabilité:', error);
      return false;
    }
  }

  static async getAnalysisStats(userId: string) {
    try {
      console.log('📈 Calcul des statistiques pour:', userId);
      
      // Récupérer toutes les analyses de l'utilisateur
      const { data: analyses, error: analysesError } = await supabase
        .from('code_analyses')
        .select('nombre_vulnerabilites, score_analyse, created_at')
        .eq('user_id', userId);

      if (analysesError) {
        console.error('❌ Erreur lors de la récupération des statistiques:', analysesError);
        return {
          totalAnalyses: 0,
          totalVulnerabilites: 0,
          scoreMoyen: 0,
          tendance: '0%'
        };
      }

      const totalAnalyses = analyses?.length || 0;
      const totalVulnerabilites = analyses?.reduce((sum, a) => sum + a.nombre_vulnerabilites, 0) || 0;
      const scoreMoyen = totalAnalyses > 0 
        ? Math.round(analyses.reduce((sum, a) => sum + a.score_analyse, 0) / totalAnalyses)
        : 0;

      // Calculer la tendance (comparaison avec le mois dernier)
      const maintenant = new Date();
      const moisDernier = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, maintenant.getDate());
      
      const analysesCeMois = analyses?.filter(a => new Date(a.created_at) >= moisDernier) || [];
      const tendance = analysesCeMois.length > 0 ? `+${Math.round((analysesCeMois.length / totalAnalyses) * 100)}%` : '0%';

      const stats = {
        totalAnalyses,
        totalVulnerabilites,
        scoreMoyen,
        tendance
      };

      console.log('✅ Statistiques calculées:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
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
      console.log('📊 Mise à jour des stats utilisateur:', userId);
      
      // Récupérer le profil actuel
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points, score_securite')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError);
        return;
      }

      // Calculer les nouveaux points et score
      const pointsGagnes = 10 + (vulnerabilitiesFound * 5); // Points de base + bonus par vulnérabilité trouvée
      const nouveauxPoints = (profile.points || 0) + pointsGagnes;
      
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
        console.error('❌ Erreur lors de la mise à jour des statistiques:', updateError);
      } else {
        console.log('✅ Stats utilisateur mises à jour');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des statistiques:', error);
    }
  }
}