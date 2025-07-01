/*
  # Création de la table user_api_configs

  1. Nouvelle Table
    - `user_api_configs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers profiles)
      - `provider` (text, fournisseur IA)
      - `api_key_encrypted` (text, clé API chiffrée)
      - `model` (text, modèle IA utilisé)
      - `temperature` (real, paramètre de température)
      - `max_tokens` (integer, nombre max de tokens)
      - `is_active` (boolean, configuration active)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `user_api_configs`
    - Politique pour que les utilisateurs ne voient que leurs configs
    - Politique pour créer/modifier leurs propres configs

  3. Index
    - Index sur user_id pour les requêtes rapides
    - Index unique sur (user_id, provider) pour éviter les doublons
*/

-- Créer la table user_api_configs
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

-- Activer RLS
ALTER TABLE user_api_configs ENABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_api_configs_user_id ON user_api_configs(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_api_configs_user_provider ON user_api_configs(user_id, provider);

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent voir leurs propres configs API"
  ON user_api_configs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres configs API"
  ON user_api_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres configs API"
  ON user_api_configs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres configs API"
  ON user_api_configs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ajouter des colonnes à la table code_analyses pour tracker l'utilisation de l'IA
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_analyses' AND column_name = 'ai_analysis_used'
  ) THEN
    ALTER TABLE code_analyses ADD COLUMN ai_analysis_used boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_analyses' AND column_name = 'language'
  ) THEN
    ALTER TABLE code_analyses ADD COLUMN language text DEFAULT 'javascript';
  END IF;
END $$;

-- Ajouter une colonne confidence aux vulnérabilités
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vulnerabilities' AND column_name = 'confidence'
  ) THEN
    ALTER TABLE vulnerabilities ADD COLUMN confidence integer DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100);
  END IF;
END $$;