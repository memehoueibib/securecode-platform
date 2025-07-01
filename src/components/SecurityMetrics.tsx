import React from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface SecurityMetricsProps {
  totalScans: number;
  totalVulnerabilities: number;
  securityScore: number;
  trend: string;
  recentScans: Array<{
    id: string;
    fileName: string;
    vulnerabilities: number;
    timestamp: string;
  }>;
}

function SecurityMetrics({ totalScans, totalVulnerabilities, securityScore, trend, recentScans }: SecurityMetricsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Très Bon';
    if (score >= 70) return 'Bon';
    if (score >= 60) return 'Moyen';
    return 'À Améliorer';
  };

  const getTrendIcon = (trend: string) => {
    return trend.startsWith('+') ? 
      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  };

  const getTrendColor = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Score de sécurité principal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - securityScore / 100)}`}
                className={securityScore >= 80 ? 'text-green-500' : securityScore >= 60 ? 'text-yellow-500' : 'text-red-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {securityScore}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Sécurité
                </div>
              </div>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(securityScore)}`}>
            <Shield className="h-4 w-4 mr-1" />
            {getScoreLabel(securityScore)}
          </div>
          
          <div className="flex items-center justify-center mt-2 text-sm">
            {getTrendIcon(trend)}
            <span className={`ml-1 ${getTrendColor(trend)}`}>
              {trend} ce mois
            </span>
          </div>
        </div>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Analyses</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalScans}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vulnérabilités</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalVulnerabilities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analyses récentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analyses Récentes
        </h3>
        
        {recentScans.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune analyse récente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentScans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${scan.vulnerabilities === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {scan.fileName || 'Sans nom'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(scan.timestamp).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {scan.vulnerabilities === 0 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sécurisé
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {scan.vulnerabilities}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">
          Recommandations
        </h3>
        {securityScore >= 80 ? (
          <p className="text-blue-100 text-sm">
            Excellent travail ! Continuez à maintenir ces bonnes pratiques de sécurité.
          </p>
        ) : securityScore >= 60 ? (
          <p className="text-blue-100 text-sm">
            Bon début ! Consultez nos modules d'apprentissage pour améliorer votre score.
          </p>
        ) : (
          <p className="text-blue-100 text-sm">
            Votre code nécessite une attention particulière. Commencez par corriger les vulnérabilités critiques.
          </p>
        )}
        <button 
          onClick={() => window.location.href = '/apprentissage'}
          className="mt-3 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
        >
          Voir les Conseils
        </button>
      </div>
    </div>
  );
}

export default SecurityMetrics;