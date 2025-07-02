import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Award,
  Users,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  Loader,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnalysisService } from '../services/analysisService';
import { LearningService } from '../services/learningService';
import { CodeAnalyse, Achievement } from '../lib/supabase';
import SecurityMetrics from '../components/SecurityMetrics';
import LearningProgress from '../components/LearningProgress';
import { useAdminSync } from '../hooks/useAdminSync';

function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { lastSync, syncStatus, forcSync } = useAdminSync();
  const [analyses, setAnalyses] = useState<CodeAnalyse[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalVulnerabilites: 0,
    scoreMoyen: 85,
    tendance: '+12%'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser useEffect avec dépendances correctes pour éviter la boucle infinie
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        console.log('🔄 Chargement des données du dashboard pour:', user.email);
        setLoading(true);
        setError(null);
        
        // Charger les analyses
        console.log('📊 Chargement des analyses...');
        const userAnalyses = await AnalysisService.getUserAnalyses(user.id);
        if (isMounted) {
          setAnalyses(userAnalyses);
          console.log('✅ Analyses chargées:', userAnalyses.length);
        }
        
        // Charger les statistiques
        console.log('📈 Chargement des statistiques...');
        const analysisStats = await AnalysisService.getAnalysisStats(user.id);
        if (isMounted) {
          setStats(analysisStats);
          console.log('✅ Statistiques chargées:', analysisStats);
        }
        
        // Charger les réalisations
        console.log('🏆 Chargement des réalisations...');
        const userAchievements = await LearningService.getUserAchievements(user.id);
        if (isMounted) {
          setAchievements(userAchievements);
          console.log('✅ Réalisations chargées:', userAchievements.length);
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        if (isMounted) {
          setError('Erreur lors du chargement des données');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    // Cleanup function pour éviter les fuites mémoire
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Dépendance uniquement sur user.id

  const StatCard = ({ title, value, icon: Icon, color, trend, description, onClick }: any) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  const ActivityCard = ({ title, items, icon: Icon, onViewAll }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Icon className="h-5 w-5 mr-2" />
            {title}
          </h3>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune activité récente
            </p>
            <button
              onClick={() => navigate('/analyseur')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Commencer une analyse
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.nom_fichier || 'Sans nom'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.nombre_vulnerabilites === 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sécurisé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {item.nombre_vulnerabilites} vuln.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Données pour le composant LearningProgress
  const learningModules = [
    {
      id: 'xss',
      title: 'Vulnérabilités XSS',
      description: 'Cross-Site Scripting',
      progress: 40,
      completed: false,
      locked: false,
      difficulty: 'debutant' as const,
      estimatedTime: '30 min'
    },
    {
      id: 'injection',
      title: 'Injection de Code',
      description: 'eval() et Function()',
      progress: 25,
      completed: false,
      locked: false,
      difficulty: 'intermediaire' as const,
      estimatedTime: '25 min'
    },
    {
      id: 'secrets',
      title: 'Gestion des Secrets',
      description: 'Mots de passe et clés API',
      progress: 0,
      completed: false,
      locked: false,
      difficulty: 'debutant' as const,
      estimatedTime: '20 min'
    }
  ];

  const getProgressionStats = () => {
    const points = profile?.points || 0;
    if (points >= 500) return { niveau: 'Expert', prochainNiveau: 'Maître', progression: Math.min((points - 500) / 500 * 100, 100) };
    if (points >= 200) return { niveau: 'Avancé', prochainNiveau: 'Expert', progression: (points - 200) / 300 * 100 };
    if (points >= 50) return { niveau: 'Intermédiaire', prochainNiveau: 'Avancé', progression: (points - 50) / 150 * 100 };
    return { niveau: 'Débutant', prochainNiveau: 'Intermédiaire', progression: points / 50 * 100 };
  };

  const progressionStats = getProgressionStats();

  // Données pour SecurityMetrics
  const recentScansForMetrics = analyses.slice(0, 5).map(scan => ({
    id: scan.id,
    fileName: scan.nom_fichier,
    vulnerabilities: scan.nombre_vulnerabilites,
    timestamp: scan.created_at
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement de vos données...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête avec salutation personnalisée et indicateur de sync */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bonjour, {profile?.nom || user?.email?.split('@')[0]} 👋
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Voici votre aperçu de sécurité pour aujourd'hui
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Niveau actuel</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {progressionStats.niveau}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Indicateur de synchronisation */}
        <div className="mt-4 flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
            syncStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
            syncStatus === 'syncing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
            syncStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {syncStatus === 'syncing' && <Loader className="h-3 w-3 animate-spin" />}
            {syncStatus === 'success' && <CheckCircle className="h-3 w-3" />}
            {syncStatus === 'error' && <AlertTriangle className="h-3 w-3" />}
            <span>
              {syncStatus === 'syncing' ? 'Synchronisation...' :
               syncStatus === 'success' ? 'Synchronisé' :
               syncStatus === 'error' ? 'Erreur sync' : 'En attente'}
            </span>
          </div>
          {lastSync && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Dernière sync: {lastSync.toLocaleTimeString('fr-FR')}
            </span>
          )}
          <button
            onClick={forcSync}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Forcer sync
          </button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Analyses Effectuées"
          value={stats.totalAnalyses}
          icon={FileText}
          color="text-blue-600"
          trend={stats.tendance}
          description="Ce mois"
          onClick={() => navigate('/analyseur')}
        />
        <StatCard
          title="Vulnérabilités Trouvées"
          value={stats.totalVulnerabilites}
          icon={AlertTriangle}
          color="text-red-600"
          description="Total détecté"
        />
        <StatCard
          title="Score de Sécurité"
          value={`${stats.scoreMoyen}%`}
          icon={Shield}
          color="text-green-600"
          description="Moyenne globale"
        />
        <StatCard
          title="Points Gagnés"
          value={profile?.points || 0}
          icon={Award}
          color="text-purple-600"
          description="Total accumulé"
          onClick={() => navigate('/profil')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Analyses récentes */}
          <ActivityCard
            title="Analyses Récentes"
            items={analyses}
            icon={BarChart3}
            onViewAll={() => navigate('/analyseur')}
          />

          {/* Objectifs et défis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Objectifs de la Semaine
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Analyses de Code
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {Math.min(stats.totalAnalyses, 5)}/5
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.totalAnalyses / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Modules Terminés
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {achievements.filter(a => a.debloque).length}/4
                    </span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(achievements.filter(a => a.debloque).length / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Activité Récente
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Connexion à la plateforme
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Il y a quelques minutes
                    </p>
                  </div>
                </div>
                
                {stats.totalAnalyses > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Analyse de code terminée
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Aujourd'hui
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      Rejoint la communauté SecureCode
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Métriques de sécurité */}
          <SecurityMetrics
            totalScans={stats.totalAnalyses}
            totalVulnerabilities={stats.totalVulnerabilites}
            securityScore={stats.scoreMoyen}
            trend={stats.tendance}
            recentScans={recentScansForMetrics}
          />

          {/* Progression d'apprentissage */}
          <LearningProgress
            modules={learningModules}
            totalPoints={profile?.points || 0}
            currentLevel={progressionStats.niveau}
            nextLevel={progressionStats.prochainNiveau}
            progressToNext={progressionStats.progression}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;