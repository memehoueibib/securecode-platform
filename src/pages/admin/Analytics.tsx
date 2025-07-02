import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Loader
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  userActivity: Array<{ date: string; activeUsers: number; newUsers: number }>;
  vulnerabilityTrends: Array<{ date: string; critical: number; high: number; medium: number; low: number }>;
  moduleCompletion: Array<{ module: string; completion: number; enrolled: number }>;
  securityScores: Array<{ range: string; count: number }>;
}

function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des données analytics
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: AnalyticsData = {
        userActivity: [
          { date: '2024-01-15', activeUsers: 45, newUsers: 8 },
          { date: '2024-01-16', activeUsers: 52, newUsers: 12 },
          { date: '2024-01-17', activeUsers: 48, newUsers: 6 },
          { date: '2024-01-18', activeUsers: 61, newUsers: 15 },
          { date: '2024-01-19', activeUsers: 58, newUsers: 9 },
          { date: '2024-01-20', activeUsers: 67, newUsers: 18 },
          { date: '2024-01-21', activeUsers: 72, newUsers: 14 }
        ],
        vulnerabilityTrends: [
          { date: '2024-01-15', critical: 12, high: 28, medium: 45, low: 23 },
          { date: '2024-01-16', critical: 8, high: 32, medium: 41, low: 19 },
          { date: '2024-01-17', critical: 15, high: 25, medium: 38, low: 27 },
          { date: '2024-01-18', critical: 6, high: 29, medium: 52, low: 31 },
          { date: '2024-01-19', critical: 11, high: 34, medium: 47, low: 25 },
          { date: '2024-01-20', critical: 9, high: 27, medium: 43, low: 29 },
          { date: '2024-01-21', critical: 7, high: 31, medium: 49, low: 33 }
        ],
        moduleCompletion: [
          { module: 'XSS Basics', completion: 78, enrolled: 45 },
          { module: 'Code Injection', completion: 65, enrolled: 38 },
          { module: 'Secret Management', completion: 82, enrolled: 52 },
          { module: 'SQL Injection', completion: 71, enrolled: 29 },
          { module: 'CSRF Protection', completion: 59, enrolled: 34 }
        ],
        securityScores: [
          { range: '90-100', count: 15 },
          { range: '80-89', count: 28 },
          { range: '70-79', count: 34 },
          { range: '60-69', count: 22 },
          { range: '0-59', count: 12 }
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des analytics...</p>
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
            Analytics & Rapports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analysez les performances et tendances de la plateforme
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.userActivity[data.userActivity.length - 1]?.activeUsers || 0}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% cette semaine
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vulnérabilités Critiques</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.vulnerabilityTrends[data.vulnerabilityTrends.length - 1]?.critical || 0}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                -15% cette semaine
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de Réussite</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(data?.moduleCompletion.reduce((sum, m) => sum + m.completion, 0) / (data?.moduleCompletion.length || 1))}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% cette semaine
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Score Moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% cette semaine
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité des utilisateurs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activité des Utilisateurs
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" name="Utilisateurs Actifs" />
              <Line type="monotone" dataKey="newUsers" stroke="#10b981" name="Nouveaux Utilisateurs" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tendances des vulnérabilités */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendances des Vulnérabilités
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.vulnerabilityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critique" />
              <Bar dataKey="high" stackId="a" fill="#f97316" name="Élevé" />
              <Bar dataKey="medium" stackId="a" fill="#eab308" name="Moyen" />
              <Bar dataKey="low" stackId="a" fill="#22c55e" name="Faible" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion des modules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Taux de Completion des Modules
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.moduleCompletion} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="module" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="completion" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution des scores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribution des Scores de Sécurité
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.securityScores}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data?.securityScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau de données détaillées */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Données Détaillées
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Utilisateurs Actifs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nouveaux Utilisateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vulnérabilités Critiques
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Vulnérabilités
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.userActivity.map((day, index) => {
                const vulnData = data.vulnerabilityTrends[index];
                const totalVuln = vulnData ? vulnData.critical + vulnData.high + vulnData.medium + vulnData.low : 0;
                
                return (
                  <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(day.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {day.activeUsers}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {day.newUsers}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {vulnData?.critical || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {totalVuln}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;