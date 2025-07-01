/*
  # Migration complète pour SecureCode Platform

  1. Tables principales
    - `profiles` - Profils utilisateurs étendus
    - `code_analyses` - Analyses de code effectuées
    - `vulnerabilities` - Vulnérabilités détectées
    - `learning_progress` - Progression d'apprentissage
    - `achievements` - Réalisations utilisateur
    - `user_api_configs` - Configurations API IA

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès strictes par utilisateur
    - Triggers automatiques pour les profils

  3. Fonctionnalités
    - Système de points et niveaux
    - Analyse IA configurable
    - Suivi de progression
*/

-- Extension pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supprimer les politiques existantes si elles existent
DO $$ 
BEGIN
  -- Supprimer les politiques pour profiles
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur propre profil" ON profiles;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles;
  
  -- Supprimer les politiques pour code_analyses
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres analyses" ON code_analyses;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres analyses" ON code_analyses;
  
  -- Supprimer les politiques pour vulnerabilities
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les vulnérabilités de leurs analyses" ON vulnerabilities;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des vulnérabilités pour leurs analyses" ON vulnerabilities;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour les vulnérabilités de leurs analyses" ON vulnerabilities;
  
  -- Supprimer les politiques pour learning_progress
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre progression" ON learning_progress;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre progression" ON learning_progress;
  
  -- Supprimer les politiques pour achievements
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres réalisations" ON achievements;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres réalisations" ON achievements;
  
  -- Supprimer les politiques pour user_api_configs
  DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres configs API" ON user_api_configs;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres configs API" ON user_api_configs;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres configs API" ON user_api_configs;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres configs API" ON user_api_configs;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  niveau text DEFAULT 'Débutant',
  points integer DEFAULT 0,
  score_securite integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des analyses de code
CREATE TABLE IF NOT EXISTS code_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nom_fichier text NOT NULL,
  contenu_code text NOT NULL,
  nombre_vulnerabilites integer DEFAULT 0,
  score_analyse integer DEFAULT 0,
  ai_analysis_used boolean DEFAULT false,
  language text DEFAULT 'javascript',
  created_at timestamptz DEFAULT now()
);

-- Table des vulnérabilités
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analyse_id uuid NOT NULL REFERENCES code_analyses(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('xss', 'injection', 'secrets')),
  severite text NOT NULL CHECK (severite IN ('critique', 'eleve', 'moyen', 'faible')),
  ligne integer NOT NULL,
  description text NOT NULL,
  code_snippet text NOT NULL,
  solution text NOT NULL,
  corrigee boolean DEFAULT false,
  confidence integer DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamptz DEFAULT now()
);

-- Table de progression d'apprentissage
CREATE TABLE IF NOT EXISTS learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  module_nom text NOT NULL,
  progression integer DEFAULT 0,
  termine boolean DEFAULT false,
  points_gagnes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter la contrainte unique si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'learning_progress_user_id_module_id_key' 
    AND table_name = 'learning_progress'
  ) THEN
    ALTER TABLE learning_progress ADD CONSTRAINT learning_progress_user_id_module_id_key UNIQUE(user_id, module_id);
  END IF;
END $$;

-- Table des réalisations
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  nom text NOT NULL,
  description text NOT NULL,
  icone text NOT NULL,
  debloque boolean DEFAULT false,
  date_deblocage timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Ajouter la contrainte unique si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'achievements_user_id_achievement_id_key' 
    AND table_name = 'achievements'
  ) THEN
    ALTER TABLE achievements ADD CONSTRAINT achievements_user_id_achievement_id_key UNIQUE(user_id, achievement_id);
  END IF;
END $$;

-- Table des configurations API IA
CREATE TABLE IF NOT EXISTS user_api_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'mistral', 'cohere')),
  api_key_encrypted text NOT NULL,
  model text NOT NULL DEFAULT '',
  temperature real NOT NULL DEFAULT 0.1 CHECK (temperature >= 0 AND temperature <= 1),
  max_tokens integer NOT NULL DEFAULT 2000 CHECK (max_tokens >= 100 AND max_tokens <= 8000),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter la contrainte unique si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'idx_user_api_configs_user_provider' 
    AND table_name = 'user_api_configs'
  ) THEN
    ALTER TABLE user_api_configs ADD CONSTRAINT idx_user_api_configs_user_provider UNIQUE(user_id, provider);
  END IF;
END $$;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_code_analyses_user_id ON code_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_analyse_id ON vulnerabilities(analyse_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_configs_user_id ON user_api_configs(user_id);

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_configs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Politiques RLS pour code_analyses
CREATE POLICY "Les utilisateurs peuvent voir leurs propres analyses"
  ON code_analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres analyses"
  ON code_analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour vulnerabilities
CREATE POLICY "Les utilisateurs peuvent voir les vulnérabilités de leurs analyses"
  ON vulnerabilities FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM code_analyses 
    WHERE code_analyses.id = vulnerabilities.analyse_id 
    AND code_analyses.user_id = auth.uid()
  ));

CREATE POLICY "Les utilisateurs peuvent créer des vulnérabilités pour leurs analyses"
  ON vulnerabilities FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM code_analyses 
    WHERE code_analyses.id = vulnerabilities.analyse_id 
    AND code_analyses.user_id = auth.uid()
  ));

CREATE POLICY "Les utilisateurs peuvent mettre à jour les vulnérabilités de leurs analyses"
  ON vulnerabilities FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM code_analyses 
    WHERE code_analyses.id = vulnerabilities.analyse_id 
    AND code_analyses.user_id = auth.uid()
  ));

-- Politiques RLS pour learning_progress
CREATE POLICY "Les utilisateurs peuvent voir leur propre progression"
  ON learning_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre progression"
  ON learning_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour achievements
CREATE POLICY "Les utilisateurs peuvent voir leurs propres réalisations"
  ON achievements FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres réalisations"
  ON achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour user_api_configs
CREATE POLICY "Les utilisateurs peuvent voir leurs propres configs API"
  ON user_api_configs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres configs API"
  ON user_api_configs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres configs API"
  ON user_api_configs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres configs API"
  ON user_api_configs FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, nom, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    new.email
  );
  
  -- Initialiser les réalisations par défaut
  INSERT INTO achievements (user_id, achievement_id, nom, description, icone, debloque)
  VALUES 
    (new.id, 'first-scan', 'Premier Scan', 'Effectuer votre première analyse de code', '🔍', false),
    (new.id, 'vulnerability-hunter', 'Chasseur de Vulnérabilités', 'Trouver 10 vulnérabilités', '🏹', false),
    (new.id, 'first-module', 'Premier Module', 'Terminer votre premier module d''apprentissage', '🎓', false),
    (new.id, 'point-collector', 'Collecteur de Points', 'Atteindre 100 points', '⭐', false);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer les triggers existants avant de les recréer
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_learning_progress_updated_at ON learning_progress;
DROP TRIGGER IF EXISTS update_user_api_configs_updated_at ON user_api_configs;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_configs_updated_at
  BEFORE UPDATE ON user_api_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();