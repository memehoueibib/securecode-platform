/*
  # Migration Admin Interface - Tables et données de démonstration

  1. Nouvelles Tables
    - `admin_actions` - Journal des actions administratives
    - `learning_modules` - Modules d'apprentissage configurables
    - `security_rules` - Règles de sécurité personnalisées
    - `system_settings` - Paramètres système globaux

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès pour admins et utilisateurs
    - Triggers de notification temps réel

  3. Données de démonstration
    - 3 modules d'apprentissage
    - 3 règles de sécurité
    - 3 paramètres système
*/

-- Table pour journaliser les actions admin
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('user_created', 'user_updated', 'user_deleted', 'module_created', 'module_updated', 'security_rule_updated', 'settings_updated')),
  data jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Vérifier si learning_modules existe déjà, sinon la créer
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'learning_modules') THEN
    CREATE TABLE learning_modules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text,
      content jsonb DEFAULT '{}',
      difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
      estimated_duration integer, -- en minutes
      tags text[] DEFAULT '{}',
      prerequisites uuid[] DEFAULT '{}',
      status text DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
      version integer DEFAULT 1,
      created_by uuid NOT NULL REFERENCES profiles(id),
      updated_by uuid REFERENCES profiles(id),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Table pour les règles de sécurité personnalisées
CREATE TABLE IF NOT EXISTS security_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  language text NOT NULL,
  pattern text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category text NOT NULL,
  custom_message text,
  fix_suggestion text,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, key)
);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'learning_modules') THEN
    ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour admin_actions
DROP POLICY IF EXISTS "Admins can view all admin actions" ON admin_actions;
CREATE POLICY "Admins can view all admin actions" ON admin_actions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@securecode.fr', 'admin@techcorp.com', 'testadmin@securecode.fr')
    )
  );

DROP POLICY IF EXISTS "Admins can insert admin actions" ON admin_actions;
CREATE POLICY "Admins can insert admin actions" ON admin_actions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@securecode.fr', 'admin@techcorp.com', 'testadmin@securecode.fr')
    )
  );

-- Politiques RLS pour learning_modules
DROP POLICY IF EXISTS "Users can view published learning modules" ON learning_modules;
CREATE POLICY "Users can view published learning modules" ON learning_modules
  FOR SELECT TO authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage learning modules" ON learning_modules;
CREATE POLICY "Admins can manage learning modules" ON learning_modules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@securecode.fr', 'admin@techcorp.com', 'testadmin@securecode.fr')
    )
  );

-- Politiques RLS pour security_rules
DROP POLICY IF EXISTS "Users can view active security rules" ON security_rules;
CREATE POLICY "Users can view active security rules" ON security_rules
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage security rules" ON security_rules;
CREATE POLICY "Admins can manage security rules" ON security_rules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@securecode.fr', 'admin@techcorp.com', 'testadmin@securecode.fr')
    )
  );

-- Politiques RLS pour system_settings
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email IN ('admin@securecode.fr', 'admin@techcorp.com', 'testadmin@securecode.fr')
    )
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON admin_actions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_organization_id ON learning_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_status ON learning_modules(status);
CREATE INDEX IF NOT EXISTS idx_security_rules_organization_id ON security_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_rules_active ON security_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_system_settings_organization_key ON system_settings(organization_id, key);

-- Fonction pour updated_at (vérifier si elle existe déjà)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at (avec vérification d'existence)
DO $$
BEGIN
  -- Trigger pour learning_modules
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_learning_modules_updated_at') THEN
    CREATE TRIGGER update_learning_modules_updated_at 
    BEFORE UPDATE ON learning_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger pour security_rules
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_security_rules_updated_at') THEN
    CREATE TRIGGER update_security_rules_updated_at 
    BEFORE UPDATE ON security_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Trigger pour system_settings
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_settings_updated_at') THEN
    CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insérer des données de démonstration
DO $$
DECLARE
  admin_user_id uuid;
  org_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur admin
  SELECT id INTO admin_user_id FROM profiles WHERE email = 'admin@securecode.fr' LIMIT 1;
  
  -- Récupérer ou créer une organisation par défaut
  SELECT id INTO org_id FROM organizations LIMIT 1;
  
  -- Si pas d'organisation, en créer une par défaut
  IF org_id IS NULL THEN
    INSERT INTO organizations (name, slug, description) 
    VALUES ('SecureCode Default', 'securecode-default', 'Organisation par défaut')
    RETURNING id INTO org_id;
  END IF;
  
  -- Si l'utilisateur admin existe, insérer les données de démonstration
  IF admin_user_id IS NOT NULL AND org_id IS NOT NULL THEN
    
    -- Insérer les modules d'apprentissage (si pas déjà présents)
    IF NOT EXISTS (SELECT 1 FROM learning_modules WHERE title = 'Introduction aux Vulnérabilités XSS') THEN
      INSERT INTO learning_modules (organization_id, title, description, content, difficulty, estimated_duration, status, created_by)
      VALUES 
      (org_id, 'Introduction aux Vulnérabilités XSS', 'Apprenez à identifier et prévenir les attaques Cross-Site Scripting', '{"lessons": [{"title": "Introduction XSS", "content": "Les attaques XSS permettent d''injecter du code malveillant dans les pages web."}]}', 'beginner', 30, 'published', admin_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM learning_modules WHERE title = 'Injection de Code Avancée') THEN
      INSERT INTO learning_modules (organization_id, title, description, content, difficulty, estimated_duration, status, created_by)
      VALUES 
      (org_id, 'Injection de Code Avancée', 'Techniques avancées de détection d''injection de code', '{"lessons": [{"title": "Dangers eval", "content": "La fonction eval peut exécuter du code arbitraire et doit être évitée."}]}', 'advanced', 60, 'published', admin_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM learning_modules WHERE title = 'Gestion des Secrets') THEN
      INSERT INTO learning_modules (organization_id, title, description, content, difficulty, estimated_duration, status, created_by)
      VALUES 
      (org_id, 'Gestion des Secrets', 'Bonnes pratiques pour la gestion des mots de passe et clés API', '{"lessons": [{"title": "Secrets sécurisés", "content": "Ne jamais stocker de secrets en dur dans le code source."}]}', 'intermediate', 45, 'published', admin_user_id);
    END IF;

    -- Insérer les règles de sécurité (si pas déjà présentes)
    IF NOT EXISTS (SELECT 1 FROM security_rules WHERE name = 'XSS innerHTML Detection') THEN
      INSERT INTO security_rules (organization_id, name, description, language, pattern, severity, category, custom_message, fix_suggestion, created_by)
      VALUES 
      (org_id, 'XSS innerHTML Detection', 'Détecte l''utilisation dangereuse d''innerHTML avec des données utilisateur', 'javascript', 'innerHTML\\s*=\\s*.*(?:req\\.|request\\.|input|user|params|query|body)', 'high', 'XSS', 'Utilisation dangereuse d''innerHTML détectée', 'Utilisez textContent au lieu d''innerHTML', admin_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM security_rules WHERE name = 'Eval Function Usage') THEN
      INSERT INTO security_rules (organization_id, name, description, language, pattern, severity, category, custom_message, fix_suggestion, created_by)
      VALUES 
      (org_id, 'Eval Function Usage', 'Détecte l''utilisation de la fonction eval', 'javascript', 'eval\\s*\\(', 'critical', 'Code Injection', 'Utilisation de eval détectée', 'Évitez eval, utilisez JSON.parse pour les données JSON', admin_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM security_rules WHERE name = 'Hardcoded Secrets') THEN
      INSERT INTO security_rules (organization_id, name, description, language, pattern, severity, category, custom_message, fix_suggestion, created_by)
      VALUES 
      (org_id, 'Hardcoded Secrets', 'Détecte les secrets codés en dur', 'javascript', '(password|api_key|secret|token)\\s*[=:]\\s*[''"][^''"]{6,}[''"]', 'high', 'Secrets', 'Secret codé en dur détecté', 'Utilisez des variables d''environnement', admin_user_id);
    END IF;

    -- Insérer les paramètres système (si pas déjà présents)
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE organization_id = org_id AND key = 'global_settings') THEN
      INSERT INTO system_settings (organization_id, key, value, description, updated_by)
      VALUES 
      (org_id, 'global_settings', '{"general": {"siteName": "SecureCode", "adminEmail": "admin@securecode.fr"}, "security": {"passwordMinLength": 8, "sessionTimeout": 30}, "notifications": {"emailEnabled": true, "slackEnabled": false}}', 'Paramètres globaux du système', admin_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE organization_id = org_id AND key = 'security_config') THEN
      INSERT INTO system_settings (organization_id, key, value, description, updated_by)
      VALUES 
      (org_id, 'security_config', '{"scanTimeout": 30, "maxFileSize": 1048576, "allowedLanguages": ["javascript", "typescript", "python", "java"]}', 'Configuration de sécurité pour les analyses', admin_user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE organization_id = org_id AND key = 'ui_settings') THEN
      INSERT INTO system_settings (organization_id, key, value, description, updated_by)
      VALUES 
      (org_id, 'ui_settings', '{"theme": "dark", "language": "fr", "itemsPerPage": 20}', 'Paramètres d''interface utilisateur', admin_user_id);
    END IF;
    
  END IF;
END $$;

-- Fonction pour notifier les changements en temps réel
CREATE OR REPLACE FUNCTION notify_admin_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifier les changements pour la synchronisation temps réel
  PERFORM pg_notify('admin_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'timestamp', now()
  )::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les notifications temps réel (avec vérification d'existence)
DO $$
BEGIN
  -- Trigger pour admin_actions
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_admin_actions_changes') THEN
    CREATE TRIGGER notify_admin_actions_changes
      AFTER INSERT OR UPDATE OR DELETE ON admin_actions
      FOR EACH ROW EXECUTE FUNCTION notify_admin_changes();
  END IF;

  -- Trigger pour learning_modules
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_learning_modules_changes') THEN
    CREATE TRIGGER notify_learning_modules_changes
      AFTER INSERT OR UPDATE OR DELETE ON learning_modules
      FOR EACH ROW EXECUTE FUNCTION notify_admin_changes();
  END IF;

  -- Trigger pour security_rules
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_security_rules_changes') THEN
    CREATE TRIGGER notify_security_rules_changes
      AFTER INSERT OR UPDATE OR DELETE ON security_rules
      FOR EACH ROW EXECUTE FUNCTION notify_admin_changes();
  END IF;

  -- Trigger pour system_settings
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'notify_system_settings_changes') THEN
    CREATE TRIGGER notify_system_settings_changes
      AFTER INSERT OR UPDATE OR DELETE ON system_settings
      FOR EACH ROW EXECUTE FUNCTION notify_admin_changes();
  END IF;
END $$;