import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, Loader, ArrowLeft, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual' // individual, team, enterprise
  });
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user, loading, error, clearError } = useAuth();

  // Rediriger si déjà connecté
  if (user && !loading) {
    return <Navigate to="/tableau-de-bord" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    clearError();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Vérifier la longueur du mot de passe (maintenant 12 caractères minimum)
    if (formData.password.length < 12) {
      return;
    }
    
    // Vérifier la complexité du mot de passe
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.nom);
    
    if (!error) {
      setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
    }
    
    setIsLoading(false);
  };

  const accountTypes = [
    {
      id: 'individual',
      name: 'Développeur Individuel',
      description: 'Pour les développeurs freelance et indépendants',
      icon: '👨‍💻',
      features: ['Analyses illimitées', 'Modules d\'apprentissage', 'Support communautaire']
    },
    {
      id: 'team',
      name: 'Équipe',
      description: 'Pour les équipes de développement (2-50 personnes)',
      icon: '👥',
      features: ['Gestion d\'équipe', 'Rapports collaboratifs', 'Support prioritaire']
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      description: 'Pour les grandes organisations (50+ personnes)',
      icon: '🏢',
      features: ['Interface admin', 'SSO', 'Support dédié 24/7'],
      highlight: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Retour à l'accueil */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-red-600 to-blue-600 text-white">
            <div className="flex items-center justify-center">
              <Shield className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Rejoignez SecureCode</h2>
                <p className="text-red-100">Sécurisez votre code dès aujourd'hui</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Sélection du type de compte */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choisissez votre type de compte
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accountTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.accountType === type.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-900'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    } ${type.highlight ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setFormData({ ...formData, accountType: type.id })}
                  >
                    {type.highlight && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                          <Crown className="h-3 w-3 mr-1" />
                          Recommandé
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{type.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{type.description}</p>
                      <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                        {type.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <input
                      type="radio"
                      name="accountType"
                      value={type.id}
                      checked={formData.accountType === type.id}
                      onChange={handleChange}
                      className="absolute top-2 right-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom complet *
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Adresse email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Au moins 12 caractères"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Répétez votre mot de passe"
                  />
                </div>
              </div>

              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Les mots de passe ne correspondent pas</span>
                </div>
              )}

              {formData.password.length > 0 && formData.password.length < 12 && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Le mot de passe doit contenir au moins 12 caractères</span>
                </div>
              )}
              
              {formData.password.length >= 12 && !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password) && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial</span>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={
                    isLoading || 
                    formData.password !== formData.confirmPassword || 
                    formData.password.length < 12 ||
                    !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)
                  }
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
                
                <Link
                  to="/connexion"
                  className="flex-1 flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Déjà un compte ? Se connecter
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            ✨ Inclus dans tous les plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Sécurité</h4>
              <ul className="space-y-1 mt-1">
                <li>• Analyses illimitées</li>
                <li>• Détection IA avancée</li>
                <li>• Rapports détaillés</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Formation</h4>
              <ul className="space-y-1 mt-1">
                <li>• Modules interactifs</li>
                <li>• Quiz et exercices</li>
                <li>• Suivi de progression</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Sécurité Avancée</h4>
              <ul className="space-y-1 mt-1">
                <li>• Authentification 2FA</li>
                <li>• Surveillance des menaces</li>
                <li>• Alertes de sécurité</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;