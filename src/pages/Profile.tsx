import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BarChart3, 
  Shield, 
  Settings,
  Edit,
  Save,
  X,
  Trophy,
  Target,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnalysisService } from '../services/analysisService';
import { LearningService } from '../services/learningService';
import { Achievement } from '../lib/supabase';
import { SecurityService } from '../services/securityService';

function Profile() {
  const { user, profile, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: profile?.nom || '',
    email: profile?.email || ''
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalVulnerabilites: 0,
    scoreMoyen: 85,
    tendance: '+12%'
  });
  const [loading, setLoading] = useState(true);
  
  // États pour le changement de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user && profile) {
      setEditForm({
        nom: profile.nom,
        email: profile.email
      });
      loadProfileData();
    }
  }, [user, profile]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Charger les statistiques
      const analysisStats = await AnalysisService.getAnalysisStats(user.id);
      setStats(analysisStats);
      
      // Charger les réalisations
      const userAchievements = await LearningService.getUserAchievements(user.id);
      setAchievements(userAchievements);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (profile) {
      await updateProfile(editForm);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      nom: profile?.nom || '',
      email: profile?.email || ''
    });
    setIsEditing(false);
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    // Vérifier la complexité du mot de passe
    const passwordValidation = SecurityService.validatePassword(passwordForm.newPassword);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Appeler la fonction de changement de mot de passe
      const success = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      if (success) {
        setPasswordSuccess('Mot de passe modifié avec succès');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordSuccess(null);
        }, 3000);
      } else {
        // L'erreur est déjà définie dans la fonction changePassword
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      setPasswordError('Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getProgressionStats = () => {
    const points = profile?.points || 0;
    if (points >= 500) return { niveau: 'Expert', prochainNiveau: 'Maître', progression: Math.min((points - 500) / 500 * 100, 100) };
    if (points >= 200) return { niveau: 'Avancé', prochainNiveau: 'Expert', progression: (points - 200) / 300 * 100 };
    if (points >= 50) return { niveau: 'Intermédiaire', prochainNiveau: 'Avancé', progression: (points - 50) / 150 * 100 };
    return { niveau: 'Débutant', prochainNiveau: 'Intermédiaire', progression: points / 50 * 100 };
  };

  const progressionStats = getProgressionStats();
  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const defaultAchievements = [
    {
      id: 'first-scan',
      achievement_id: 'first-scan',
      nom: 'Premier Scan',
      description: 'Effectuer votre première analyse',
      icone: '🔍',
      debloque: stats.totalAnalyses > 0
    },
    {
      id: 'vulnerability-hunter',
      achievement_id: 'vulnerability-hunter',
      nom: 'Chasseur de Vulnérabilités',
      description: 'Trouver 10 vulnérabilités',
      icone: '🏹',
      debloque: stats.totalVulnerabilites >= 10
    },
    {
      id: 'security-student',
      achievement_id: 'security-student',
      nom: 'Étudiant en Sécurité',
      description: 'Terminer votre premier module d\'apprentissage',
      icone: '📚',
      debloque: achievements.some(a => a.achievement_id === 'first-module' && a.debloque)
    },
    {
      id: 'point-collector',
      achievement_id: 'point-collector',
      nom: 'Collecteur de Points',
      description: 'Atteindre 100 points',
      icone: '⭐',
      debloque: (profile?.points || 0) >= 100
    }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mon Profil
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gérez vos informations et suivez votre progression
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Informations Personnelles
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{profile?.nom}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{profile?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Membre depuis
                </label>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{memberSince}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Changer mon mot de passe
                </button>
              </div>
            </div>
          </div>
          
          {/* Formulaire de changement de mot de passe */}
          {showPasswordForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Changer mon mot de passe
                </h2>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {passwordSuccess}
                </div>
              )}
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    >
                      {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    >
                      {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    >
                      {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Changer le mot de passe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Statistiques détaillées */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Statistiques Détaillées
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalAnalyses}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Analyses
                </div>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                <Shield className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.totalVulnerabilites}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Vulnérabilités
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <Award className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile?.points || 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Points
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {achievements.filter(a => a.debloque).length}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Réalisations
                </div>
              </div>
            </div>
          </div>

          {/* Réalisations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Réalisations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.debloque
                      ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl ${achievement.debloque ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icone}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        achievement.debloque 
                          ? 'text-green-800 dark:text-green-300' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {achievement.nom}
                      </h3>
                      <p className={`text-sm ${
                        achievement.debloque 
                          ? 'text-green-700 dark:text-green-400' 
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau de progression */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Niveau Actuel
            </h3>

            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {progressionStats.niveau}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {profile?.points || 0} points
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Progression vers {progressionStats.prochainNiveau}</span>
                <span>{Math.round(progressionStats.progression)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressionStats.progression}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Continuez à apprendre et analyser pour progresser !
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Résumé d'Activité
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Score de sécurité moyen</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.scoreMoyen}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Analyses cette semaine</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(stats.totalAnalyses, 7)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Réalisations débloquées</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {achievements.filter(a => a.debloque).length}/4
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Prêt pour le défi ?
            </h3>
            <p className="text-red-100 text-sm mb-4">
              Analysez plus de code pour améliorer vos compétences en sécurité
            </p>
            <button 
              onClick={() => window.location.href = '/analyseur'}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Commencer une Analyse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;