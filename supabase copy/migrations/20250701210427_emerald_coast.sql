-- Script pour créer des données de démonstration
-- À exécuter dans l'éditeur SQL de Supabase APRÈS avoir créé les utilisateurs

DO $$
DECLARE
  admin_id uuid;
  demo_id uuid;
  analysis_id uuid;
  vuln_analysis_id uuid;
BEGIN
  -- Récupérer les IDs des utilisateurs depuis auth.users
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@securecode.fr';
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo@securecode.fr';
  
  -- Vérifier si les utilisateurs existent
  IF admin_id IS NULL THEN
    RAISE NOTICE 'ATTENTION: Utilisateur admin@securecode.fr non trouvé !';
    RAISE NOTICE 'Créez d''abord cet utilisateur dans Supabase Dashboard > Authentication > Users';
  END IF;
  
  IF demo_id IS NULL THEN
    RAISE NOTICE 'ATTENTION: Utilisateur demo@securecode.fr non trouvé !';
    RAISE NOTICE 'Créez d''abord cet utilisateur dans Supabase Dashboard > Authentication > Users';
  END IF;
  
  -- Configuration pour l'utilisateur ADMIN
  IF admin_id IS NOT NULL THEN
    RAISE NOTICE 'Configuration des données pour admin@securecode.fr...';
    
    -- Mettre à jour le profil admin
    INSERT INTO profiles (id, nom, email, niveau, points, score_securite, created_at, updated_at)
    VALUES (admin_id, 'Administrateur SecureCode', 'admin@securecode.fr', 'Expert', 1000, 95, now(), now())
    ON CONFLICT (id) DO UPDATE SET
      nom = 'Administrateur SecureCode',
      niveau = 'Expert',
      points = 1000,
      score_securite = 95,
      updated_at = now();
    
    -- Ajouter des analyses pour l'admin
    INSERT INTO code_analyses (id, user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language, created_at)
    VALUES 
    (gen_random_uuid(), admin_id, 'security-audit.js', 
     'function performSecurityAudit() {
        const results = scanForVulnerabilities();
        return generateReport(results);
      }', 0, 100, 'javascript', now() - interval '1 day'),
    (gen_random_uuid(), admin_id, 'admin-dashboard.js', 
     'function loadAdminDashboard() {
        const metrics = calculateSecurityMetrics();
        return renderDashboard(metrics);
      }', 0, 98, 'javascript', now() - interval '2 hours'),
    (gen_random_uuid(), admin_id, 'user-management.js', 
     'function manageUsers() {
        const users = getAllUsers();
        return displayUserTable(users);
      }', 0, 97, 'javascript', now() - interval '30 minutes')
    ON CONFLICT DO NOTHING;
    
    -- Ajouter des réalisations admin
    INSERT INTO achievements (user_id, achievement_id, nom, description, icone, debloque, date_deblocage, created_at)
    VALUES 
    (admin_id, 'admin-access', 'Accès Administrateur', 'Accès complet à la plateforme', '👑', true, now(), now()),
    (admin_id, 'platform-master', 'Maître de la Plateforme', 'Expertise complète en sécurité', '🏆', true, now(), now()),
    (admin_id, 'security-guru', 'Gourou de la Sécurité', 'Connaissance approfondie des vulnérabilités', '🧙‍♂️', true, now(), now())
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    RAISE NOTICE 'Données admin configurées avec succès !';
  END IF;
  
  -- Configuration pour l'utilisateur DEMO
  IF demo_id IS NOT NULL THEN
    RAISE NOTICE 'Configuration des données pour demo@securecode.fr...';
    
    -- Mettre à jour le profil demo
    INSERT INTO profiles (id, nom, email, niveau, points, score_securite, created_at, updated_at)
    VALUES (demo_id, 'Utilisateur Démo', 'demo@securecode.fr', 'Intermédiaire', 250, 75, now() - interval '5 days', now())
    ON CONFLICT (id) DO UPDATE SET
      nom = 'Utilisateur Démo',
      niveau = 'Intermédiaire',
      points = 250,
      score_securite = 75,
      updated_at = now();
    
    -- Ajouter des analyses pour le demo (avec vulnérabilités)
    INSERT INTO code_analyses (id, user_id, nom_fichier, contenu_code, nombre_vulnerabilites, score_analyse, language, created_at)
    VALUES 
    (gen_random_uuid(), demo_id, 'vulnerable-login.js', 
     'function login(username, password) {
        var query = "SELECT * FROM users WHERE username = ''" + username + "'' AND password = ''" + password + "''";
        return database.execute(query);
      }', 2, 25, 'javascript', now() - interval '3 days'),
    (gen_random_uuid(), demo_id, 'xss-example.js', 
     'function displayMessage(userInput) {
        document.getElementById("message").innerHTML = userInput;
        eval("console.log(''" + userInput + "'')");
      }', 2, 30, 'javascript', now() - interval '2 days'),
    (gen_random_uuid(), demo_id, 'better-code.js', 
     'function displayMessage(userInput) {
        const sanitized = userInput.replace(/[<>]/g, "");
        document.getElementById("message").textContent = sanitized;
      }', 0, 90, 'javascript', now() - interval '1 day'),
    (gen_random_uuid(), demo_id, 'api-keys.js', 
     'const config = {
        apiKey: "sk-1234567890abcdef",
        dbPassword: "supersecret123"
      };', 2, 40, 'javascript', now() - interval '4 hours')
    ON CONFLICT DO NOTHING;
    
    -- Ajouter des vulnérabilités pour les analyses du demo
    -- Pour vulnerable-login.js
    INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence, created_at)
    SELECT 
      ca.id,
      'injection',
      'critique',
      2,
      'Vulnérabilité d''injection SQL dans la fonction de connexion',
      'var query = "SELECT * FROM users WHERE username = ''" + username + "'' AND password = ''" + password + "''";',
      'Utiliser des requêtes préparées avec des paramètres liés pour éviter les injections SQL',
      98,
      now()
    FROM code_analyses ca 
    WHERE ca.user_id = demo_id AND ca.nom_fichier = 'vulnerable-login.js'
    ON CONFLICT DO NOTHING;
    
    -- Pour xss-example.js
    INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence, created_at)
    SELECT 
      ca.id,
      'xss',
      'eleve',
      2,
      'Vulnérabilité XSS via innerHTML avec données utilisateur',
      'document.getElementById("message").innerHTML = userInput;',
      'Utiliser textContent au lieu de innerHTML pour éviter l''injection de code HTML',
      95,
      now()
    FROM code_analyses ca 
    WHERE ca.user_id = demo_id AND ca.nom_fichier = 'xss-example.js'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence, created_at)
    SELECT 
      ca.id,
      'injection',
      'critique',
      3,
      'Utilisation dangereuse d''eval() avec des données utilisateur',
      'eval("console.log(''" + userInput + "'')");',
      'Éviter eval() et utiliser des alternatives sécurisées comme JSON.parse()',
      97,
      now()
    FROM code_analyses ca 
    WHERE ca.user_id = demo_id AND ca.nom_fichier = 'xss-example.js'
    ON CONFLICT DO NOTHING;
    
    -- Pour api-keys.js
    INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence, created_at)
    SELECT 
      ca.id,
      'secrets',
      'eleve',
      2,
      'Clé API codée en dur dans le code source',
      'apiKey: "sk-1234567890abcdef"',
      'Utiliser des variables d''environnement pour stocker les clés API',
      90,
      now()
    FROM code_analyses ca 
    WHERE ca.user_id = demo_id AND ca.nom_fichier = 'api-keys.js'
    ON CONFLICT DO NOTHING;
    
    INSERT INTO vulnerabilities (analyse_id, type, severite, ligne, description, code_snippet, solution, confidence, created_at)
    SELECT 
      ca.id,
      'secrets',
      'eleve',
      3,
      'Mot de passe de base de données codé en dur',
      'dbPassword: "supersecret123"',
      'Utiliser des variables d''environnement pour les mots de passe',
      92,
      now()
    FROM code_analyses ca 
    WHERE ca.user_id = demo_id AND ca.nom_fichier = 'api-keys.js'
    ON CONFLICT DO NOTHING;
    
    -- Ajouter des réalisations demo
    INSERT INTO achievements (user_id, achievement_id, nom, description, icone, debloque, date_deblocage, created_at)
    VALUES 
    (demo_id, 'first-analysis', 'Première Analyse', 'Effectuer votre première analyse de code', '🔍', true, now() - interval '3 days', now() - interval '3 days'),
    (demo_id, 'vulnerability-hunter', 'Chasseur de Vulnérabilités', 'Détecter 5 vulnérabilités', '🎯', true, now() - interval '2 days', now() - interval '2 days'),
    (demo_id, 'learning-enthusiast', 'Passionné d''Apprentissage', 'Commencer un module d''apprentissage', '📚', true, now() - interval '1 day', now() - interval '1 day')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Ajouter de la progression d'apprentissage
    INSERT INTO learning_progress (user_id, module_id, module_nom, progression, termine, points_gagnes, created_at, updated_at)
    VALUES 
    (demo_id, 'xss-basics', 'Introduction aux attaques XSS', 100, true, 50, now() - interval '2 days', now() - interval '1 day'),
    (demo_id, 'sql-injection', 'Prévention des injections SQL', 75, false, 30, now() - interval '1 day', now() - interval '2 hours'),
    (demo_id, 'secure-coding', 'Bonnes pratiques de codage', 25, false, 10, now() - interval '4 hours', now() - interval '1 hour')
    ON CONFLICT (user_id, module_id) DO NOTHING;
    
    RAISE NOTICE 'Données demo configurées avec succès !';
  END IF;
  
  -- Résumé final
  RAISE NOTICE '=== CONFIGURATION TERMINÉE ===';
  RAISE NOTICE 'Utilisateurs configurés:';
  IF admin_id IS NOT NULL THEN
    RAISE NOTICE '✅ admin@securecode.fr - Données admin créées';
  ELSE
    RAISE NOTICE '❌ admin@securecode.fr - Utilisateur manquant';
  END IF;
  
  IF demo_id IS NOT NULL THEN
    RAISE NOTICE '✅ demo@securecode.fr - Données demo créées';
  ELSE
    RAISE NOTICE '❌ demo@securecode.fr - Utilisateur manquant';
  END IF;
  
  RAISE NOTICE 'Vous pouvez maintenant tester l''interface admin !';
  
END $$;