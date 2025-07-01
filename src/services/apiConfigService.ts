import { supabase } from '../lib/supabase';
import { AIAnalysisConfig, AI_PROVIDERS } from './aiAnalysisService';

export interface UserAPIConfig {
  id: string;
  user_id: string;
  provider: string;
  api_key_encrypted: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class APIConfigService {
  private static encryptApiKey(apiKey: string): string {
    return btoa(apiKey);
  }

  private static decryptApiKey(encryptedKey: string): string {
    return atob(encryptedKey);
  }

  static async saveAPIConfig(userId: string, config: AIAnalysisConfig): Promise<boolean> {
    try {
      // Désactiver les autres configs du même provider
      await supabase
        .from('user_api_configs')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('provider', config.provider);

      // Insérer ou mettre à jour la nouvelle config
      const { error } = await supabase
        .from('user_api_configs')
        .upsert({
          user_id: userId,
          provider: config.provider,
          api_key_encrypted: this.encryptApiKey(config.apiKey),
          model: config.model,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          is_active: true
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde de la config API:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config API:', error);
      return false;
    }
  }

  static async getUserAPIConfigs(userId: string): Promise<UserAPIConfig[]> {
    try {
      const { data, error } = await supabase
        .from('user_api_configs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des configs API:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des configs API:', error);
      return [];
    }
  }

  static async getActiveAPIConfig(userId: string): Promise<AIAnalysisConfig | null> {
    try {
      const { data, error } = await supabase
        .from('user_api_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        provider: data.provider,
        apiKey: this.decryptApiKey(data.api_key_encrypted),
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.max_tokens
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la config API active:', error);
      return null;
    }
  }

  static async setActiveConfig(userId: string, configId: string): Promise<boolean> {
    try {
      // Désactiver toutes les configs
      await supabase
        .from('user_api_configs')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Activer la config sélectionnée
      const { error } = await supabase
        .from('user_api_configs')
        .update({ is_active: true })
        .eq('id', configId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de l\'activation de la config:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation de la config:', error);
      return false;
    }
  }

  static async deleteAPIConfig(userId: string, configId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_api_configs')
        .delete()
        .eq('id', configId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la suppression de la config API:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la config API:', error);
      return false;
    }
  }

  static getProviderInfo(providerId: string) {
    return AI_PROVIDERS.find(p => p.id === providerId);
  }

  static getAllProviders() {
    return AI_PROVIDERS;
  }
}