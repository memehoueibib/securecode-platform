-- Function to handle demo user creation
CREATE OR REPLACE FUNCTION handle_demo_user_creation()
RETURNS trigger AS $$
BEGIN
  -- Check if this is a demo user
  IF NEW.email IN ('admin@securecode.fr', 'demo@securecode.fr') THEN
    
    -- Set up admin user
    IF NEW.email = 'admin@securecode.fr' THEN
      UPDATE profiles SET
        nom = 'Administrateur SecureCode',
        niveau = 'Expert',
        points = 1000,
        score_securite = 95,
        updated_at = now()
      WHERE id = NEW.id;
      
      -- Add admin achievements
      INSERT INTO achievements (user_id, achievement_id, nom, description, icone, debloque, date_deblocage)
      VALUES 
      (
        NEW.id,
        'admin-access',
        'Accès Administrateur',
        'Accès complet à la plateforme SecureCode',
        '👑',
        true,
        now()
      ),
      (
        NEW.id,
        'platform-master',
        'Maître de la Plateforme',
        'Expertise complète en sécurité informatique',
        '🏆',
        true,
        now()
      );
      
    -- Set up demo user
    ELSIF NEW.email = 'demo@securecode.fr' THEN
      UPDATE profiles SET
        nom = 'Utilisateur Démo',
        niveau = 'Intermédiaire',
        points = 250,
        score_securite = 75,
        updated_at = now()
      WHERE id = NEW.id;
      
      -- Add sample code analyses
      INSERT INTO code_analyses (user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language)
      VALUES 
      (
        NEW.id,
        'exemple-vulnerable.js',
        $CODE$function processUserInput(input) {
    document.getElementById("output").innerHTML = input;
    eval("console.log('" + input + "')");
    const apiKey = "sk-1234567890abcdef";
    return input;
}$CODE$,
        3,
        25,
        'javascript'
      ),
      (
        NEW.id,
        'code-securise.js',
        $CODE$function processUserInput(input) {
    const sanitized = input.replace(/[<>]/g, "");
    document.getElementById("output").textContent = sanitized;
    console.log("Processing:", sanitized);
    return sanitized;
}$CODE$,
        0,
        100,
        'javascript'
      ),
      (
        NEW.id,
        'auth-system.js',
        $CODE$function authenticateUser(username, password) {
    // Vulnérable: SQL injection possible
    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    return database.execute(query);
}$CODE$,
        1,
        40,
        'javascript'
      );
      
      -- Add vulnerabilities for the first analysis
      INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence)
      SELECT 
        ca.id,
        'xss',
        'critique',
        2,
        'Utilisation dangereuse d''innerHTML avec des données utilisateur non filtrées',
        'document.getElementById("output").innerHTML = input;',
        'Utiliser textContent au lieu d''innerHTML ou sanitiser les données',
        95
      FROM code_analyses ca 
      WHERE ca.nom_fichier = 'exemple-vulnerable.js' AND ca.user_id = NEW.id;

      INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence)
      SELECT 
        ca.id,
        'injection',
        'critique',
        3,
        'Utilisation d''eval() avec des données utilisateur - risque d''injection de code',
        $VULN$eval("console.log('" + input + "')");$VULN$,
        'Éviter eval() et utiliser des alternatives sécurisées',
        98
      FROM code_analyses ca 
      WHERE ca.nom_fichier = 'exemple-vulnerable.js' AND ca.user_id = NEW.id;

      INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence)
      SELECT 
        ca.id,
        'secrets',
        'eleve',
        4,
        'Clé API codée en dur dans le code source',
        'const apiKey = "sk-1234567890abcdef";',
        'Utiliser des variables d''environnement pour les secrets',
        90
      FROM code_analyses ca 
      WHERE ca.nom_fichier = 'exemple-vulnerable.js' AND ca.user_id = NEW.id;
      
      -- Add vulnerability for auth system
      INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence)
      SELECT 
        ca.id,
        'injection',
        'critique',
        3,
        'Vulnérabilité d''injection SQL dans le système d''authentification',
        $VULN$const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";$VULN$,
        'Utiliser des requêtes préparées ou un ORM pour éviter les injections SQL',
        99
      FROM code_analyses ca 
      WHERE ca.nom_fichier = 'auth-system.js' AND ca.user_id = NEW.id;

      -- Add sample learning progress
      INSERT INTO learning_progress (user_id, module_id, module_nom, progression, termine, points_gagnes)
      VALUES 
      (
        NEW.id,
        'xss-basics',
        'Introduction aux attaques XSS',
        100,
        true,
        50
      ),
      (
        NEW.id,
        'injection-prevention',
        'Prévention des injections de code',
        75,
        false,
        30
      ),
      (
        NEW.id,
        'secure-coding',
        'Bonnes pratiques de codage sécurisé',
        25,
        false,
        10
      ),
      (
        NEW.id,
        'sql-injection',
        'Prévention des injections SQL',
        60,
        false,
        25
      );

      -- Add sample achievements
      INSERT INTO achievements (user_id, achievement_id, nom, description, icone, debloque, date_deblocage)
      VALUES 
      (
        NEW.id,
        'first-analysis',
        'Première Analyse',
        'Effectuer votre première analyse de code',
        '🔍',
        true,
        now()
      ),
      (
        NEW.id,
        'vulnerability-hunter',
        'Chasseur de Vulnérabilités',
        'Détecter 10 vulnérabilités',
        '🎯',
        true,
        now()
      ),
      (
        NEW.id,
        'learning-enthusiast',
        'Passionné d''Apprentissage',
        'Terminer un module d''apprentissage',
        '📚',
        true,
        now()
      ),
      (
        NEW.id,
        'security-student',
        'Étudiant en Sécurité',
        'Progresser dans l''apprentissage de la sécurité',
        '🎓',
        true,
        now()
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for demo user setup
DROP TRIGGER IF EXISTS setup_demo_data_trigger ON profiles;
CREATE TRIGGER setup_demo_data_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.email = ANY(ARRAY['admin@securecode.fr', 'demo@securecode.fr']))
  EXECUTE FUNCTION handle_demo_user_creation();

-- Create some general sample data that doesn't depend on specific users
-- This helps populate the platform with realistic content

-- Add some sample API configurations templates (these will be user-specific when created)
-- Note: These are just for reference and will be created per user

-- Add some sample learning modules data that could be referenced
-- This is just informational and doesn't create actual user data

-- The actual demo users need to be created through Supabase Auth:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create user with email: admin@securecode.fr, password: admin123456
-- 3. Create user with email: demo@securecode.fr, password: demo123456
-- 4. The trigger will automatically set up their demo data

-- Or use the Supabase API to create users programmatically