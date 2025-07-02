import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, AlertCircle, Loader, Crown, ArrowLeft, User, Info, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SecurityService } from '../services/securityService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading, error, clearError, mfaEnabled, verifyMFA } = useAuth();
  
  // États pour MFA
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);

  // Rediriger si déjà connecté
  if (user && !loading && !showMFAVerification) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    const { error, requiresMFA } = await signIn(email, password);
    
    if (!error) {
      // Vérifier si MFA est activé
      const { enabled } = SecurityService.getPersistedMFAState();
      if (requiresMFA || enabled) {
        setShowMFAVerification(true);
      }
    }
    
    setIsLoading(false);
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMfaError(null);
    
    try {
      const success = await verifyMFA(mfaToken);
      
      if (success) {
        // La redirection se fera automatiquement grâce au Navigate ci-dessus
        setShowMFAVerification(false);
      } else {
        setMfaError('Code invalide. Veuillez réessayer.');
      }
    } catch (error) {
      setMfaError('Erreur lors de la vérification. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'user') => {
    setIsLoading(true);
    clearError();
    
    if (role === 'admin') {
      setEmail('admin@securecode.fr');
      setPassword('admin123');
      await signIn('admin@securecode.fr', 'admin123');
    } else {
      setEmail('demo@securecode.fr');
      setPassword('demo123');
      await signIn('demo@securecode.fr', 'demo123');
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Affichage de la vérification MFA
  if (showMFAVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <Smartphone className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Vérification à deux facteurs
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Entrez le code généré par votre application d'authentification
            </p>
            
            <form className="mt-8 space-y-6" onSubmit={handleVerifyMFA}>
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code à 6 chiffres
                </label>
                <input
                  id="mfaToken"
                  name="mfaToken"
                  type="text"
                  required
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              
              {mfaError && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{mfaError}</span>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || mfaToken.length !== 6}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier'
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowMFAVerification(false)}
                  className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Retour à l'accueil */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Connexion à SecureCode
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Plateforme d'analyse de sécurité de code
            </p>
          </div>

          {/* Message d'erreur avec instructions */}
          {error && error.includes('Invalid login credentials') && (
            <div className="mt-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">
                    Utilisateurs de démonstration non configurés
                  </h3>
                  <div className="text-red-700 dark:text-red-400 space-y-2">
                    <p>Pour utiliser les comptes de démonstration, vous devez :</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Aller dans votre <strong>Supabase Dashboard</strong></li>
                      <li>Section <strong>Authentication → Users</strong></li>
                      <li>Créer les utilisateurs :
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li><code>admin@securecode.fr</code> (mot de passe: admin123)</li>
                          <li><code>demo@securecode.fr</code> (mot de passe: demo123)</li>
                        </ul>
                      </li>
                    </ol>
                    <p className="mt-2 text-xs">
                      📋 Consultez le fichier <code>SETUP_INSTRUCTIONS.md</code> pour les instructions détaillées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Comptes de démonstration */}
          <div className="mt-6 space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                🚀 Comptes de Démonstration
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Connexion Admin
                  <span className="ml-2 text-xs bg-purple-800 px-2 py-1 rounded">
                    admin@securecode.fr
                  </span>
                </button>
                <button
                  onClick={() => handleDemoLogin('user')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Connexion Utilisateur
                  <span className="ml-2 text-xs bg-blue-800 px-2 py-1 rounded">
                    demo@securecode.fr
                  </span>
                </button>
              </div>
              <div className="mt-3 text-xs text-blue-700 dark:text-blue-400">
                <p><strong>Admin:</strong> Accès complet + interface d'administration</p>
                <p><strong>Utilisateur:</strong> Accès standard aux fonctionnalités</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Ou connectez-vous avec vos identifiants
                </span>
              </div>
            </div>
          </div>
          
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            {error && !error.includes('Invalid login credentials') && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/inscription"
                className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
              >
                Pas encore de compte ? Créer un compte
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            🛡️ Plateforme Professionnelle
          </h3>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Analyse de code JavaScript en temps réel</li>
            <li>• Détection de vulnérabilités XSS, injection, secrets</li>
            <li>• Interface admin complète pour les entreprises</li>
            <li>• Modules d'apprentissage interactifs</li>
            <li>• Système de points et réalisations</li>
            <li>• Authentification à deux facteurs (2FA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;