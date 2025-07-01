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
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnalysisService } from '../services/analysisService';
import { LearningService } from '../services/learningService';
import { Achievement } from '../lib/supabase';

function Profile() {
  const { user, profile, updateProfile } = useAuth();
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
            </div>
          </div>

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
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
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