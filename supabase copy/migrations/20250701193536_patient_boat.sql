/*
  # Migration complète pour l'administration SecureCode

  1. Nouvelles Tables
    - `organizations` - Organisations/entreprises
    - `departments` - Départements dans les organisations
    - `teams` - Équipes dans les départements
    - `user_roles` - Rôles utilisateur
    - `permissions` - Permissions système
    - `role_permissions` - Association rôles-permissions
    - `user_role_assignments` - Attribution des rôles aux utilisateurs
    - `learning_modules` - Modules d'apprentissage organisationnels
    - `security_rules` - Règles de sécurité personnalisées
    - `ai_prompt_templates` - Templates de prompts IA
    - `system_settings` - Paramètres système

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès basées sur l'organisation
    - Contrôle d'accès granulaire

  3. Données initiales
    - Organisation par défaut
    - Rôles et permissions de base
    - Départements et équipes
    - Modules d'apprentissage
    - Règles de sécurité
    - Templates IA
*/

-- Table des organisations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  website text,
  industry text,
  size text CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des départements
CREATE TABLE IF NOT EXISTS departments (
  id text PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  manager_id uuid REFERENCES profiles(id),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des équipes
CREATE TABLE IF NOT EXISTS teams (
  id text PRIMARY KEY,
  department_id text NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  lead_id uuid REFERENCES profiles(id),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des rôles utilisateur
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  level integer DEFAULT 0,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, code)
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource, action)
);

-- Table d'association rôles-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Table d'attribution des rôles aux utilisateurs
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id text REFERENCES departments(id),
  team_id text REFERENCES teams(id),
  assigned_by uuid REFERENCES profiles(id),
  assigned_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, role_id, organization_id)
);

-- Table des modules d'apprentissage organisationnels
CREATE TABLE IF NOT EXISTS learning_modules (
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

-- Table des règles de sécurité personnalisées
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

-- Table des templates de prompts IA
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  language text NOT NULL,
  prompt text NOT NULL,
  variables text[] DEFAULT '{}',
  model_config jsonb DEFAULT '{}',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des paramètres système
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

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_department_id ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_assignments_organization_id ON user_role_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_organization_id ON learning_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_rules_organization_id ON security_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_organization_id ON ai_prompt_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_organization_id ON system_settings(organization_id);

-- Activer RLS sur toutes les tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour organizations
CREATE POLICY "Les utilisateurs peuvent voir les organisations auxquelles ils appartiennent"
  ON organizations FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour departments
CREATE POLICY "Les utilisateurs peuvent voir les départements de leur organisation"
  ON departments FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour teams
CREATE POLICY "Les utilisateurs peuvent voir les équipes de leur organisation"
  ON teams FOR SELECT TO authenticated
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN user_role_assignments ura ON d.organization_id = ura.organization_id
      WHERE ura.user_id = auth.uid() AND ura.is_active = true
    )
  );

-- Politiques RLS pour user_roles
CREATE POLICY "Les utilisateurs peuvent voir les rôles de leur organisation"
  ON user_roles FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour permissions (lecture publique pour les utilisateurs authentifiés)
CREATE POLICY "Les utilisateurs authentifiés peuvent voir les permissions"
  ON permissions FOR SELECT TO authenticated
  USING (true);

-- Politiques RLS pour role_permissions
CREATE POLICY "Les utilisateurs peuvent voir les permissions de leurs rôles"
  ON role_permissions FOR SELECT TO authenticated
  USING (
    role_id IN (
      SELECT role_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour user_role_assignments
CREATE POLICY "Les utilisateurs peuvent voir leurs propres attributions de rôles"
  ON user_role_assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Politiques RLS pour learning_modules
CREATE POLICY "Les utilisateurs peuvent voir les modules de leur organisation"
  ON learning_modules FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour security_rules
CREATE POLICY "Les utilisateurs peuvent voir les règles de leur organisation"
  ON security_rules FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour ai_prompt_templates
CREATE POLICY "Les utilisateurs peuvent voir les templates de leur organisation"
  ON ai_prompt_templates FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Politiques RLS pour system_settings
CREATE POLICY "Les utilisateurs peuvent voir les paramètres de leur organisation"
  ON system_settings FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_role_assignments 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at
  BEFORE UPDATE ON learning_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_rules_updated_at
  BEFORE UPDATE ON security_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prompt_templates_updated_at
  BEFORE UPDATE ON ai_prompt_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer l'organisation par défaut
INSERT INTO organizations (id, name, slug, description, industry, size) VALUES
  ('00000000-0000-0000-0000-000000000001', 'SecureCode', 'securecode', 'Plateforme de sécurité de code par défaut', 'technology', 'startup')
ON CONFLICT (id) DO NOTHING;

-- Insérer les permissions de base
INSERT INTO permissions (resource, action, description) VALUES
  ('dashboard', 'read', 'Voir le tableau de bord'),
  ('dashboard', 'manage', 'Gérer le tableau de bord'),
  ('users', 'read', 'Voir les utilisateurs'),
  ('users', 'manage', 'Gérer les utilisateurs'),
  ('modules', 'read', 'Voir les modules d''apprentissage'),
  ('modules', 'manage', 'Gérer les modules d''apprentissage'),
  ('security', 'read', 'Voir les règles de sécurité'),
  ('security', 'manage', 'Gérer les règles de sécurité'),
  ('analytics', 'read', 'Voir les analyses'),
  ('analytics', 'manage', 'Gérer les analyses'),
  ('admin', 'read', 'Accès lecture admin'),
  ('admin', 'manage', 'Accès complet admin')
ON CONFLICT (resource, action) DO NOTHING;

-- Insérer les rôles de base
INSERT INTO user_roles (organization_id, code, name, description, level, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin_org', 'Administrateur Organisation', 'Accès complet à l''organisation', 100, true),
  ('00000000-0000-0000-0000-000000000001', 'manager', 'Manager', 'Gestion d''équipe et de département', 80, true),
  ('00000000-0000-0000-0000-000000000001', 'senior_dev', 'Développeur Senior', 'Développeur expérimenté', 60, true),
  ('00000000-0000-0000-0000-000000000001', 'security_expert', 'Expert Sécurité', 'Spécialiste en cybersécurité', 70, true),
  ('00000000-0000-0000-0000-000000000001', 'user', 'Utilisateur', 'Utilisateur standard', 10, true)
ON CONFLICT (organization_id, code) DO NOTHING;

-- Insérer des départements
INSERT INTO departments (id, organization_id, name, description) VALUES
  ('dept-dev', '00000000-0000-0000-0000-000000000001', 'Développement', 'Équipe de développement logiciel'),
  ('dept-security', '00000000-0000-0000-0000-000000000001', 'Sécurité', 'Équipe cybersécurité'),
  ('dept-qa', '00000000-0000-0000-0000-000000000001', 'Qualité', 'Assurance qualité et tests'),
  ('dept-devops', '00000000-0000-0000-0000-000000000001', 'DevOps', 'Infrastructure et déploiement')
ON CONFLICT (id) DO NOTHING;

-- Insérer des équipes
INSERT INTO teams (id, department_id, name, description) VALUES
  ('team-frontend', 'dept-dev', 'Frontend', 'Développement interface utilisateur'),
  ('team-backend', 'dept-dev', 'Backend', 'Développement serveur et API'),
  ('team-mobile', 'dept-dev', 'Mobile', 'Applications mobiles'),
  ('team-pentest', 'dept-security', 'Pentest', 'Tests de pénétration'),
  ('team-compliance', 'dept-security', 'Compliance', 'Conformité et audit')
ON CONFLICT (id) DO NOTHING;

-- Associer les permissions aux rôles
DO $$
DECLARE
  admin_role_id uuid;
  manager_role_id uuid;
  dev_role_id uuid;
  security_role_id uuid;
BEGIN
  -- Récupérer les IDs des rôles
  SELECT id INTO admin_role_id FROM user_roles WHERE code = 'admin_org';
  SELECT id INTO manager_role_id FROM user_roles WHERE code = 'manager';
  SELECT id INTO dev_role_id FROM user_roles WHERE code = 'senior_dev';
  SELECT id INTO security_role_id FROM user_roles WHERE code = 'security_expert';
  
  -- Permissions pour Admin Org (toutes)
  IF admin_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT admin_role_id, id FROM permissions
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Permissions pour Manager
  IF manager_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT manager_role_id, id FROM permissions 
    WHERE resource IN ('dashboard', 'users', 'analytics', 'admin')
    AND action IN ('read', 'manage')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Permissions pour Développeur
  IF dev_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT dev_role_id, id FROM permissions 
    WHERE resource IN ('dashboard', 'modules', 'admin')
    AND action = 'read'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Permissions pour Expert Sécurité
  IF security_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT security_role_id, id FROM permissions 
    WHERE resource IN ('dashboard', 'security', 'analytics', 'admin')
    AND action IN ('read', 'manage')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insérer des modules d'apprentissage de base
DO $$
DECLARE
  first_profile_id uuid;
BEGIN
  -- Récupérer le premier profil disponible
  SELECT id INTO first_profile_id FROM profiles LIMIT 1;
  
  IF first_profile_id IS NOT NULL THEN
    INSERT INTO learning_modules (
      id, organization_id, title, description, difficulty, estimated_duration, 
      tags, status, created_by
    ) VALUES
      (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000001',
        'Sécurité JavaScript Avancée',
        'Module complet sur les vulnérabilités JavaScript et leur prévention',
        'advanced',
        45,
        ARRAY['javascript', 'security', 'xss', 'injection'],
        'published',
        first_profile_id
      ),
      (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000001',
        'Introduction à la Cybersécurité',
        'Concepts de base de la sécurité informatique',
        'beginner',
        30,
        ARRAY['security', 'basics', 'awareness'],
        'published',
        first_profile_id
      ),
      (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000001',
        'OWASP Top 10 - Guide Pratique',
        'Étude détaillée des 10 vulnérabilités les plus critiques',
        'intermediate',
        60,
        ARRAY['owasp', 'vulnerabilities', 'web-security'],
        'published',
        first_profile_id
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insérer des règles de sécurité par défaut
DO $$
DECLARE
  first_profile_id uuid;
BEGIN
  -- Récupérer le premier profil disponible
  SELECT id INTO first_profile_id FROM profiles LIMIT 1;
  
  IF first_profile_id IS NOT NULL THEN
    INSERT INTO security_rules (
      organization_id, name, description, language, pattern, severity, 
      category, custom_message, fix_suggestion, created_by
    ) VALUES
      (
        '00000000-0000-0000-0000-000000000001',
        'Détection innerHTML dangereux',
        'Détecte l''utilisation dangereuse de innerHTML avec des données utilisateur',
        'javascript',
        'innerHTML\s*=\s*.*(?:req\.|request\.|input|user|params|query|body)',
        'high',
        'XSS',
        'Utilisation dangereuse de innerHTML détectée',
        'Utilisez textContent ou échappez le contenu HTML',
        first_profile_id
      ),
      (
        '00000000-0000-0000-0000-000000000001',
        'Détection eval() dangereux',
        'Détecte l''utilisation de eval() qui peut conduire à l''injection de code',
        'javascript',
        'eval\s*\(',
        'critical',
        'Code Injection',
        'Utilisation de eval() détectée - risque d''injection de code',
        'Évitez eval(), utilisez JSON.parse() pour les données JSON',
        first_profile_id
      ),
      (
        '00000000-0000-0000-0000-000000000001',
        'Secrets codés en dur',
        'Détecte les mots de passe et clés API codés en dur',
        'javascript',
        'password|api_key|secret',
        'high',
        'Secrets',
        'Secret potentiel codé en dur détecté',
        'Utilisez des variables d''environnement pour les secrets',
        first_profile_id
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insérer des templates de prompts IA
DO $$
DECLARE
  first_profile_id uuid;
BEGIN
  -- Récupérer le premier profil disponible
  SELECT id INTO first_profile_id FROM profiles LIMIT 1;
  
  IF first_profile_id IS NOT NULL THEN
    INSERT INTO ai_prompt_templates (
      organization_id, name, description, language, prompt, variables, 
      model_config, created_by
    ) VALUES
      (
        '00000000-0000-0000-0000-000000000001',
        'Analyse Sécurité JavaScript',
        'Template pour l''analyse de sécurité du code JavaScript',
        'javascript',
        'Analysez ce code JavaScript pour détecter les vulnérabilités de sécurité.',
        ARRAY['code'],
        '{"temperature": 0.1, "max_tokens": 2000}',
        first_profile_id
      ),
      (
        '00000000-0000-0000-0000-000000000001',
        'Génération Quiz Sécurité',
        'Template pour générer des questions de quiz sur la sécurité',
        'general',
        'Générez des questions de quiz sur la sécurité informatique.',
        ARRAY['num_questions', 'topic', 'difficulty', 'audience'],
        '{"temperature": 0.3, "max_tokens": 1500}',
        first_profile_id
      )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insérer des paramètres système par défaut
INSERT INTO system_settings (organization_id, key, value, description) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'branding',
    '{"primary_color": "#dc2626", "secondary_color": "#1f2937", "logo_url": null}',
    'Configuration du branding de l''organisation'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'security_policy',
    '{"password_min_length": 8, "mfa_required": false, "session_timeout": 3600}',
    'Politique de sécurité de l''organisation'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'notifications',
    '{"email_enabled": true, "slack_webhook": null, "alert_thresholds": {"critical": 1, "high": 5}}',
    'Configuration des notifications'
  )
ON CONFLICT (organization_id, key) DO NOTHING;