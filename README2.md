# 🛡️ SecureCode - Plateforme de Révision de Code Sécurisé

Une plateforme moderne et complète pour l'analyse de vulnérabilités de sécurité dans le code JavaScript, avec modules d'apprentissage interactifs.

## 🚀 Fonctionnalités

### 🔍 Analyseur de Code
- **Détection automatique** de vulnérabilités XSS, injection de code, et secrets codés en dur
- **Éditeur de code avancé** avec numéros de ligne et coloration syntaxique
- **Upload/Download** de fichiers de code
- **Export des résultats** en JSON
- **Filtres et recherche** dans les vulnérabilités

### 📊 Tableau de Bord
- **Métriques de sécurité** en temps réel
- **Score de sécurité** calculé dynamiquement
- **Historique des analyses** avec tendances
- **Objectifs quotidiens** et hebdomadaires
- **Système de points** et gamification

### 🎓 Modules d'Apprentissage
- **Leçons interactives** sur les vulnérabilités de sécurité
- **Comparaisons code vulnérable/sécurisé**
- **Quiz et exercices pratiques**
- **Suivi de progression** personnalisé
- **Système de réalisations**

### 👤 Gestion des Utilisateurs
- **Authentification sécurisée** avec Supabase
- **Profils utilisateur** complets
- **Statistiques personnalisées**
- **Niveaux et progression**

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **React Router** pour la navigation
- **Lucide React** pour les icônes

### Backend & Base de Données
- **Supabase** pour l'authentification et la base de données
- **PostgreSQL** avec Row Level Security (RLS)
- **APIs REST** automatiques

### Déploiement
- **Vite** pour le build
- **Netlify** pour l'hébergement
- **Variables d'environnement** sécurisées

## 📋 Installation et Configuration

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd securecode-platform
npm install
```

### 2. Configuration Supabase

#### Créer un Projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anonyme

#### Configurer les Variables d'Environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos clés Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

#### Exécuter les Migrations
```sql
-- Exécuter le contenu de supabase/migrations/create_initial_schema.sql
-- dans l'éditeur SQL de Supabase
```

### 3. Lancement en Développement
```bash
npm run dev
```

### 4. Build pour Production
```bash
npm run build
npm run preview
```

## 🗄️ Structure de la Base de Données

### Tables Principales
- **profiles** - Profils utilisateurs étendus
- **code_analyses** - Analyses de code effectuées
- **vulnerabilities** - Vulnérabilités détectées
- **learning_progress** - Progression d'apprentissage
- **achievements** - Réalisations utilisateur

### Sécurité
- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques d'accès** strictes par utilisateur
- **Authentification** gérée par Supabase Auth

## 🔧 APIs et Services

### AnalysisService
```typescript
// Créer une nouvelle analyse
await AnalysisService.createAnalysis(userId, fileName, code);

// Récupérer les analyses utilisateur
await AnalysisService.getUserAnalyses(userId);

// Obtenir les statistiques
await AnalysisService.getAnalysisStats(userId);
```

### LearningService
```typescript
// Mettre à jour la progression
await LearningService.updateModuleProgress(userId, moduleId, progression);

// Récupérer les réalisations
await LearningService.getUserAchievements(userId);
```

## 🎯 Détection de Vulnérabilités

### Types Supportés
1. **XSS (Cross-Site Scripting)**
   - `innerHTML = userInput`
   - `outerHTML = userInput`
   - `insertAdjacentHTML` avec données utilisateur

2. **Injection de Code**
   - `eval()` avec entrées utilisateur
   - `Function()` constructor
   - `setTimeout/setInterval` avec strings

3. **Secrets Codés en Dur**
   - Mots de passe en plain text
   - Clés API exposées
   - Tokens et credentials

### Niveaux de Sévérité
- **🔴 Critique** - Risque immédiat de sécurité
- **🟠 Élevé** - Vulnérabilité importante
- **🟡 Moyen** - Risque modéré
- **🔵 Faible** - Amélioration recommandée

## 🚀 Déploiement

### Netlify (Recommandé)
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Build automatique à chaque push

### Variables d'Environnement de Production
```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_production
```

## 🧪 Tests et Démonstration

### Comptes de Test
- **Email**: demo@securecode.fr
- **Mot de passe**: demo123456

### Code d'Exemple Vulnérable
```javascript
// XSS
document.getElementById('output').innerHTML = userInput;

// Injection
eval('console.log("' + userInput + '")');

// Secrets
const apiKey = "sk-1234567890abcdef";
```

## 📱 Responsive Design

- **Mobile First** - Optimisé pour tous les écrans
- **Dark Mode** - Support complet du thème sombre
- **Animations** - Transitions fluides et micro-interactions
- **Accessibilité** - Conforme aux standards WCAG

## 🔒 Sécurité

### Mesures Implémentées
- **Authentification sécurisée** avec Supabase
- **Row Level Security** sur toutes les données
- **Validation côté client et serveur**
- **Sanitisation des entrées utilisateur**
- **HTTPS obligatoire** en production

### Bonnes Pratiques
- Aucune exécution de code utilisateur
- Analyse statique uniquement
- Stockage sécurisé des données sensibles
- Logs d'audit automatiques

## 🤝 Contribution

### Développement Local
1. Fork le projet
2. Créer une branche feature
3. Développer et tester
4. Soumettre une Pull Request

### Standards de Code
- **TypeScript** strict
- **ESLint** pour la qualité
- **Prettier** pour le formatage
- **Tests unitaires** requis

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Contact
- **Issues GitHub** pour les bugs
- **Discussions** pour les questions
- **Email**: support@securecode.fr

---

**🛡️ SecureCode** - Rendons le code plus sûr, ensemble !