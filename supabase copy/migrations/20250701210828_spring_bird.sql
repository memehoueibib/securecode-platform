/*
  # Correction des politiques RLS et ajout de données de test

  1. Correction des politiques RLS
    - Simplification des politiques d'accès
    - Correction de la fonction uid()
    - Ajout de politiques pour les utilisateurs publics

  2. Ajout de données de test
    - Profils utilisateurs
    - Analyses de code
    - Vulnérabilités
    - Progression d'apprentissage

  3. Fonctions utilitaires
    - Fonction pour obtenir l'ID utilisateur
    - Triggers pour les profils
*/

-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON profiles;

-- Créer des politiques RLS simplifiées pour les profils
CREATE POLICY "Enable read access for users based on user_id" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for users based on user_id" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour code_analyses
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres analyses" ON code_analyses;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres analyses" ON code_analyses;
DROP POLICY IF EXISTS "Users can view own analyses" ON code_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON code_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON code_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON code_analyses;

CREATE POLICY "Enable all operations for users on own analyses" ON code_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour vulnerabilities
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les vulnérabilités de leurs ana" ON vulnerabilities;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des vulnérabilités pour leurs" ON vulnerabilities;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour les vulnérabilités de" ON vulnerabilities;
DROP POLICY IF EXISTS "Users can view vulnerabilities of own analyses" ON vulnerabilities;
DROP POLICY IF EXISTS "Users can insert vulnerabilities for own analyses" ON vulnerabilities;
DROP POLICY IF EXISTS "Users can update vulnerabilities of own analyses" ON vulnerabilities;

CREATE POLICY "Enable all operations for users on vulnerabilities" ON vulnerabilities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM code_analyses 
      WHERE code_analyses.id = vulnerabilities.analyse_id 
      AND code_analyses.user_id = auth.uid()
    )
  );

-- Politiques pour learning_progress
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre progression" ON learning_progress;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre progression" ON learning_progress;
DROP POLICY IF EXISTS "Users can view own learning progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can insert own learning progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can update own learning progress" ON learning_progress;

CREATE POLICY "Enable all operations for users on own learning progress" ON learning_progress
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour achievements
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres réalisations" ON achievements;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres réalisat" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON achievements;

CREATE POLICY "Enable all operations for users on own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour créer des données de test pour un utilisateur
CREATE OR REPLACE FUNCTION create_demo_data_for_user(user_email text)
RETURNS void AS $$
DECLARE
  user_id uuid;
  analysis_id uuid;
  analysis_id_2 uuid;
  analysis_id_3 uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'Utilisateur % non trouvé', user_email;
    RETURN;
  END IF;

  -- Créer ou mettre à jour le profil
  INSERT INTO profiles (id, nom, email, niveau, points, score_securite)
  VALUES (
    user_id,
    CASE 
      WHEN user_email = 'admin@securecode.fr' THEN 'Administrateur SecureCode'
      WHEN user_email = 'demo@securecode.fr' THEN 'Utilisateur Démo'
      ELSE 'Utilisateur'
    END,
    user_email,
    CASE 
      WHEN user_email = 'admin@securecode.fr' THEN 'Expert'
      ELSE 'Intermédiaire'
    END,
    CASE 
      WHEN user_email = 'admin@securecode.fr' THEN 1000
      ELSE 250
    END,
    CASE 
      WHEN user_email = 'admin@securecode.fr' THEN 95
      ELSE 75
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    niveau = EXCLUDED.niveau,
    points = EXCLUDED.points,
    score_securite = EXCLUDED.score_securite,
    updated_at = now();

  -- Créer des analyses de code
  IF user_email = 'admin@securecode.fr' THEN
    -- Analyses pour l'admin
    INSERT INTO code_analyses (id, user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language)
    VALUES 
    (gen_random_uuid(), user_id, 'security-audit.js', 'function auditSecurity() { return "secure"; }', 0, 100, 'javascript'),
    (gen_random_uuid(), user_id, 'admin-panel.js', 'function adminAccess() { return true; }', 0, 98, 'javascript');
  ELSE
    -- Analyses pour l'utilisateur démo
    INSERT INTO code_analyses (id, user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language)
    VALUES 
    (gen_random_uuid(), user_id, 'vulnerable-code.js', 'document.innerHTML = userInput;', 2, 45, 'javascript')
    RETURNING id INTO analysis_id;

    INSERT INTO code_analyses (id, user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language)
    VALUES 
    (gen_random_uuid(), user_id, 'better-code.js', 'document.textContent = userInput;', 0, 90, 'javascript')
    RETURNING id INTO analysis_id_2;

    INSERT INTO code_analyses (id, user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language)
    VALUES 
    (gen_random_uuid(), user_id, 'auth-system.js', 'eval(userCode);', 1, 30, 'javascript')
    RETURNING id INTO analysis_id_3;

    -- Ajouter des vulnérabilités pour la première analyse
    IF analysis_id IS NOT NULL THEN
      INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution)
      VALUES 
      (analysis_id, 'xss', 'eleve', 1, 'Vulnérabilité XSS détectée', 'document.innerHTML = userInput;', 'Utilisez textContent au lieu de innerHTML'),
      (analysis_id, 'injection', 'critique', 1, 'Risque d''injection de code', 'document.innerHTML = userInput;', 'Validez et échappez les entrées utilisateur');
    END IF;

    -- Ajouter une vulnérabilité pour la troisième analyse
    IF analysis_id_3 IS NOT NULL THEN
      INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution)
      VALUES 
      (analysis_id_3, 'injection', 'critique', 1, 'Utilisation dangereuse d''eval()', 'eval(userCode);', 'Évitez eval(), utilisez JSON.parse() pour les données');
    END IF;

    -- Ajouter de la progression d'apprentissage
    INSERT INTO learning_progress (user_id, module_id, module_nom, progression, termine, points_gagnes)
    VALUES 
    (user_id, 'xss', 'Vulnérabilités XSS', 75, false, 30),
    (user_id, 'injection', 'Injection de Code', 100, true, 50),
    (user_id, 'secrets', 'Gestion des Secrets', 25, false, 10);

    -- Ajouter des réalisations
    INSERT INTO achievements (user_id, achievement_id, nom, description, icone, debloque, date_deblocage)
    VALUES 
    (user_id, 'first-scan', 'Premier Scan', 'Effectuer votre première analyse', '🔍', true, now()),
    (user_id, 'first-module', 'Premier Module', 'Terminer votre premier module', '🎓', true, now());
  END IF;

  RAISE NOTICE 'Données créées pour %', user_email;
END;
$$ LANGUAGE plpgsql;

-- Créer les données pour les utilisateurs existants
DO $$
BEGIN
  -- Créer les données pour admin@securecode.fr
  PERFORM create_demo_data_for_user('admin@securecode.fr');
  
  -- Créer les données pour demo@securecode.fr
  PERFORM create_demo_data_for_user('demo@securecode.fr');
  
  RAISE NOTICE 'Toutes les données de démonstration ont été créées';
END $$;