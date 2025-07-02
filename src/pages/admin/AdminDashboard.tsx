import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  Activity,
  ArrowRight,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminService } from '../../services/adminService';
import { AdminStats, AdminAnalysis } from '../../types/admin';

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalAnalyses: 0,
    totalVulnerabilities: 0,
    averageSecurityScore: 0,
    monthlyTrend: '+0'
  });
  const [recentAnalyses, setRecentAnalyses] = useState<AdminAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const adminStats = await AdminService.getAdminStats();
      setStats(adminStats);
      
      // Charger les analyses récentes
      const analyses = await AdminService.getRecentAnalyses(5);
      setRecentAnalyses(analyses);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Utilisateurs Totaux',
      value: stats.totalUsers.toString(),
      change: stats.monthlyTrend,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats.activeUsers.toString(),
      change: '+8%',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Score Sécurité Moyen',
      value: `${stats.averageSecurityScore}%`,
      change: '+5%',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      title: 'Analyses Effectuées',
      value: stats.totalAnalyses.toString(),
      change: '+18%',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    }
  ];

  const alerts = [
    {
      type: 'critical',
      message: `${stats.totalVulnerabilities} vulnérabilités détectées au total`,
      icon: AlertTriangle,
      color: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
    },
    {
      type: 'success',
      message: `${stats.activeUsers} utilisateurs actifs ce mois`,
      icon: CheckCircle,
      color: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
    }
  ];

  const quickActions = [
    {
      title: 'Gérer les Utilisateurs',
      description: 'Ajouter, modifier ou supprimer des utilisateurs',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Créer un Module',
      description: 'Nouveau module d\'apprentissage',
      href: '/admin/modules',
      icon: BookOpen,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Règles de Sécurité',
      description: 'Configurer les règles personnalisées',
      href: '/admin/security',
      icon: Shield,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Voir Analytics',
      description: 'Rapports et métriques détaillés',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de la plateforme SecureCode
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Actualiser
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Exporter Rapport
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 flex items-center text-green-600`}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change} ce mois
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analyses récentes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analyses Récentes
          </h3>
          <div className="space-y-4">
            {recentAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune analyse récente
                </p>
              </div>
            ) : (
              recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <strong>{analysis.user_name}</strong> a analysé <strong>{analysis.nom_fichier}</strong>
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{analysis.nombre_vulnerabilites} vulnérabilités</span>
                      <span>Score: {analysis.score_analyse}%</span>
                      <span>{new Date(analysis.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alertes et notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertes & Notifications
          </h3>
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div key={index} className={`p-4 border rounded-lg ${alert.color}`}>
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">
                      {alert.message}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Métriques de Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              99.9%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Disponibilité</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              1.2s
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Temps de réponse</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stats.totalAnalyses}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Analyses ce mois</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;