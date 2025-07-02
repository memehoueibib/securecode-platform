/*
  # Setup demo data for SecureCode platform

  This migration creates sample data that will be associated with demo users
  once they are created through the Supabase authentication system.
  
  IMPORTANT: Before using the demo accounts, you must create the actual auth users:
  1. Email: admin@securecode.fr, Password: admin123
  2. Email: demo@securecode.fr, Password: demo123
  
  These can be created via:
  - Registration page at /inscription
  - Supabase Dashboard > Authentication > Users
*/

-- Create a function to setup demo data for a user
CREATE OR REPLACE FUNCTION setup_demo_user_data(
  user_id uuid,
  user_email text,
  user_name text,
  user_level text DEFAULT 'Débutant',
  user_points integer DEFAULT 0,
  user_score integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  -- Update or insert profile
  INSERT INTO profiles (id, nom, email, niveau, points, score_securite, created_at, updated_at)
  VALUES (user_id, user_name, user_email, user_level, user_points, user_score, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    nom = EXCLUDED.nom,
    niveau = EXCLUDED.niveau,
    points = EXCLUDED.points,
    score_securite = EXCLUDED.score_securite,
    updated_at = now();

  -- Add sample achievements for demo user (not admin)
  IF user_email = 'demo@securecode.fr' THEN
    INSERT INTO achievements (
      user_id, achievement_id, nom, description, icone, debloque, date_deblocage, created_at
    ) VALUES 
    (
      user_id, 'first_scan', 'Premier Scan', 'Effectuer votre première analyse de code',
      '🔍', true, now() - interval '2 days', now() - interval '2 days'
    ),
    (
      user_id, 'vulnerability_hunter', 'Chasseur de Vulnérabilités', 'Détecter 5 vulnérabilités',
      '🎯', true, now() - interval '1 day', now() - interval '1 day'
    )
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    -- Add sample learning progress
    INSERT INTO learning_progress (
      user_id, module_id, module_nom, progression, termine, points_gagnes, created_at, updated_at
    ) VALUES 
    (
      user_id, 'xss_basics', 'Bases des attaques XSS', 100, true, 50,
      now() - interval '3 days', now() - interval '2 days'
    ),
    (
      user_id, 'sql_injection', 'Injection SQL', 75, false, 30,
      now() - interval '2 days', now() - interval '1 hour'
    )
    ON CONFLICT (user_id, module_id) DO NOTHING;

    -- Add sample code analyses
    INSERT INTO code_analyses (
      user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse,
      ai_analysis_used, language, created_at
    ) VALUES 
    (
      user_id, 'login.js',
      'function login(username, password) {
    var query = "SELECT * FROM users WHERE username = ''" + username + "'' AND password = ''" + password + "''";
    return database.query(query);
}',
      2, 65, true, 'javascript', now() - interval '2 days'
    ),
    (
      user_id, 'user-profile.js',
      'function displayUserProfile(userId) {
    document.getElementById("profile").innerHTML = "<h1>Welcome " + userId + "</h1>";
    localStorage.setItem("currentUser", userId);
}',
      1, 80, false, 'javascript', now() - interval '1 day'
    );

    -- Add corresponding vulnerabilities for the analyses
    INSERT INTO vulnerabilities (
      analyse_id, type, severite, ligne, description, code_snippet, solution, corrigee, confidence
    )
    SELECT 
      ca.id,
      'injection',
      'critique',
      2,
      'Injection SQL détectée dans la requête de connexion',
      'var query = "SELECT * FROM users WHERE username = ''" + username + "'' AND password = ''" + password + "''";',
      'Utilisez des requêtes préparées avec des paramètres liés',
      false,
      95
    FROM code_analyses ca 
    WHERE ca.user_id = user_id AND ca.nom_fichier = 'login.js'
    ON CONFLICT DO NOTHING;

    INSERT INTO vulnerabilities (
      analyse_id, type, severite, ligne, description, code_snippet, solution, corrigee, confidence
    )
    SELECT 
      ca.id,
      'xss',
      'eleve',
      2,
      'Vulnérabilité XSS via innerHTML',
      'document.getElementById("profile").innerHTML = "<h1>Welcome " + userId + "</h1>";',
      'Utilisez textContent au lieu de innerHTML pour éviter l''injection de code',
      false,
      90
    FROM code_analyses ca 
    WHERE ca.user_id = user_id AND ca.nom_fichier = 'user-profile.js'
    ON CONFLICT DO NOTHING;

  END IF;

  -- Add admin-specific achievements
  IF user_email = 'admin@securecode.fr' THEN
    INSERT INTO achievements (
      user_id, achievement_id, nom, description, icone, debloque, date_deblocage, created_at
    ) VALUES 
    (
      user_id, 'admin_access', 'Accès Administrateur', 'Accès complet à la plateforme',
      '👑', true, now(), now()
    ),
    (
      user_id, 'platform_master', 'Maître de la Plateforme', 'Expertise complète en sécurité',
      '🏆', true, now(), now()
    )
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    -- Add admin learning progress
    INSERT INTO learning_progress (
      user_id, module_id, module_nom, progression, termine, points_gagnes, created_at, updated_at
    ) VALUES 
    (
      user_id, 'admin_security', 'Sécurité Administrative', 100, true, 100, now(), now()
    ),
    (
      user_id, 'advanced_threats', 'Menaces Avancées', 100, true, 150, now(), now()
    )
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically setup demo data when demo users are created
CREATE OR REPLACE FUNCTION handle_demo_user_creation()
RETURNS trigger AS $$
BEGIN
  -- Check if this is one of our demo users and setup their data
  IF NEW.email = 'admin@securecode.fr' THEN
    PERFORM setup_demo_user_data(
      NEW.id, 
      'admin@securecode.fr', 
      'Administrateur Demo', 
      'Expert', 
      1000, 
      95
    );
  ELSIF NEW.email = 'demo@securecode.fr' THEN
    PERFORM setup_demo_user_data(
      NEW.id, 
      'demo@securecode.fr', 
      'Utilisateur Demo', 
      'Intermédiaire', 
      500, 
      75
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically setup demo data when profiles are created
DROP TRIGGER IF EXISTS setup_demo_data_trigger ON profiles;
CREATE TRIGGER setup_demo_data_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW 
  WHEN (NEW.email IN ('admin@securecode.fr', 'demo@securecode.fr'))
  EXECUTE FUNCTION handle_demo_user_creation();

-- If demo users already exist, setup their data now
DO $$
DECLARE
  admin_profile profiles%ROWTYPE;
  demo_profile profiles%ROWTYPE;
BEGIN
  -- Check if admin profile exists and setup data
  SELECT * INTO admin_profile FROM profiles WHERE email = 'admin@securecode.fr';
  IF FOUND THEN
    PERFORM setup_demo_user_data(
      admin_profile.id, 
      'admin@securecode.fr', 
      'Administrateur Demo', 
      'Expert', 
      1000, 
      95
    );
  END IF;

  -- Check if demo profile exists and setup data
  SELECT * INTO demo_profile FROM profiles WHERE email = 'demo@securecode.fr';
  IF FOUND THEN
    PERFORM setup_demo_user_data(
      demo_profile.id, 
      'demo@securecode.fr', 
      'Utilisateur Demo', 
      'Intermédiaire', 
      500, 
      75
    );
  END IF;
END $$;