import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Types TypeScript pour la base de données
export interface Profile {
  id: string;
  nom: string;
  email: string;
  avatar_url?: string;
  niveau: string;
  points: number;
  score_securite: number;
  created_at: string;
  updated_at: string;
}

export interface CodeAnalyse {
  id: string;
  user_id: string;
  nom_fichier: string;
  contenu_code: string;
  nombre_vulnerabilites: number;
  score_analyse: number;
  created_at: string;
  ai_analysis_used?: boolean;
  language?: string;
}

export interface Vulnerability {
  id: string;
  analyse_id: string;
  type: 'xss' | 'injection' | 'secrets';
  severite: 'critique' | 'eleve' | 'moyen' | 'faible';
  ligne: number;
  description: string;
  code_snippet: string;
  solution: string;
  corrigee: boolean;
  created_at: string;
  confidence?: number;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  module_id: string;
  module_nom: string;
  progression: number;
  termine: boolean;
  points_gagnes: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  nom: string;
  description: string;
  icone: string;
  debloque: boolean;
  date_deblocage?: string;
  created_at: string;
}

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