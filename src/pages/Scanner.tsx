import React, { useState, useEffect } from 'react';
import { 
  Play, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Code, 
  BookOpen,
  Copy,
  Download,
  Clock,
  Filter,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  BarChart3,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnalysisService } from '../services/analysisService';
import { CodeAnalyse, Vulnerability as DBVulnerability } from '../lib/supabase';
import { scanCode, exampleVulnerableCode, Vulnerability } from '../services/vulnerabilityScanner';
import { APIConfigService } from '../services/apiConfigService';
import CodeEditor from '../components/CodeEditor';
import VulnerabilityModal from '../components/VulnerabilityModal';
import SecurityMetrics from '../components/SecurityMetrics';

function Scanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<CodeAnalyse[]>([]);
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalVulnerabilites: 0,
    scoreMoyen: 85,
    tendance: '+12%'
  });
  const [useAI, setUseAI] = useState(false);
  const [hasActiveAIConfig, setHasActiveAIConfig] = useState(false);

  useEffect(() => {
    if (user) {
      loadScanHistory();
      checkAIConfig();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadScanHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const analyses = await AnalysisService.getUserAnalyses(user.id);
      setScanHistory(analyses);
      
      const analysisStats = await AnalysisService.getAnalysisStats(user.id);
      setStats(analysisStats);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAIConfig = async () => {
    if (!user) return;
    
    try {
      const config = await APIConfigService.getActiveAPIConfig(user.id);
      setHasActiveAIConfig(!!config);
    } catch (error) {
      console.error('Erreur lors de la vérification de la configuration IA:', error);
    }
  };

  const handleScan = async () => {
    if (!code.trim() || !user) return;

    setIsScanning(true);
    
    try {
      // Créer l'analyse dans la base de données avec l'option IA si activée
      const result = await AnalysisService.createAnalysis(
        user.id,
        fileName || 'code.js',
        code,
        'javascript',
        useAI
      );
      
      if (result) {
        // Convertir les vulnérabilités de la DB vers le format local
        const localVulnerabilities: Vulnerability[] = result.vulnerabilities.map(v => ({
          id: v.id,
          type: v.type,
          severity: v.severite,
          line: v.ligne,
          description: v.description,
          codeSnippet: v.code_snippet,
          fix: v.solution,
          explanation: `Cette vulnérabilité de type ${v.type} peut compromettre la sécurité de votre application.`
        }));
        
        setVulnerabilities(localVulnerabilities);
        setSelectedAnalysis(result.analyse.id);
        
        // Recharger l'historique
        await loadScanHistory();
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const loadAnalysisFromHistory = async (analysis: CodeAnalyse) => {
    setCode(analysis.contenu_code);
    setFileName(analysis.nom_fichier);
    setSelectedAnalysis(analysis.id);
    
    // Charger les vulnérabilités de cette analyse
    const vulnerabilities = await AnalysisService.getAnalysisVulnerabilities(analysis.id);
    const localVulnerabilities: Vulnerability[] = vulnerabilities.map(v => ({
      id: v.id,
      type: v.type,
      severity: v.severite,
      line: v.ligne,
      description: v.description,
      codeSnippet: v.code_snippet,
      fix: v.solution,
      explanation: `Cette vulnérabilité de type ${v.type} peut compromettre la sécurité de votre application.`
    }));
    
    setVulnerabilities(localVulnerabilities);
    setShowHistory(false);
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!user) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) {
      return;
    }

    try {
      const success = await AnalysisService.deleteAnalysis(user.id, analysisId);
      if (success) {
        await loadScanHistory();
        
        // Si l'analyse supprimée était celle actuellement affichée, effacer l'affichage
        if (selectedAnalysis === analysisId) {
          setCode('');
          setFileName('');
          setVulnerabilities([]);
          setSelectedAnalysis(null);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const loadDemo = () => {
    setCode(exampleVulnerableCode);
    setFileName('demo-vulnerable.js');
    setVulnerabilities([]);
    setSelectedAnalysis(null);
  };

  const clearCode = () => {
    setCode('');
    setFileName('');
    setVulnerabilities([]);
    setSelectedAnalysis(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
      case 'eleve': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700';
      case 'moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700';
      case 'faible': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return <AlertTriangle className="h-4 w-4" />;
  };

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesSeverity = filterSeverity === 'all' || vuln.severity === filterSeverity;
    const matchesSearch = searchTerm === '' || 
      vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const exportResults = () => {
    const results = {
      fileName: fileName || 'code.js',
      timestamp: new Date().toISOString(),
      vulnerabilities: vulnerabilities.map(v => ({
        type: v.type,
        severity: v.severity,
        line: v.line,
        description: v.description,
        fix: v.fix
      }))
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse-securite-${fileName || 'code'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const VulnerabilityCard = ({ vulnerability }: { vulnerability: Vulnerability }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(vulnerability.severity)}`}>
            {getSeverityIcon(vulnerability.severity)}
            <span className="ml-1 capitalize">{vulnerability.severity}</span>
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            Ligne {vulnerability.line}
          </span>
        </div>
        <button
          onClick={() => setSelectedVulnerability(vulnerability)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover:underline"
        >
          Voir détails
        </button>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {vulnerability.description}
      </h3>
      
      <div className="bg-red-50 dark:bg-red-900 rounded-md p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">Code vulnérable:</span>
          <button
            onClick={() => navigator.clipboard.writeText(vulnerability.codeSnippet)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <code className="text-sm text-red-800 dark:text-red-200 font-mono break-all block">
          {vulnerability.codeSnippet}
        </code>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900 rounded-md p-3">
        <span className="text-sm font-medium text-green-800 dark:text-green-300">Solution:</span>
        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
          {vulnerability.fix}
        </p>
      </div>
    </div>
  );

  // Données pour SecurityMetrics
  const recentScansForMetrics = scanHistory.slice(0, 5).map(scan => ({
    id: scan.id,
    fileName: scan.nom_fichier,
    vulnerabilities: scan.nombre_vulnerabilites,
    timestamp: scan.created_at
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analyseur de Code
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Analysez votre code JavaScript pour détecter les vulnérabilités de sécurité
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              Historique ({scanHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* Historique des analyses */}
      {showHistory && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Historique des Analyses
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6">
            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune analyse effectuée pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedAnalysis === analysis.id
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => loadAnalysisFromHistory(analysis)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        {analysis.ai_analysis_used && (
                          <Brain className="h-4 w-4 text-purple-500" title="Analysé avec IA" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {analysis.nom_fichier || 'Sans nom'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(analysis.created_at).toLocaleDateString('fr-FR')}
                          </span>
                          <span>Score: {analysis.score_analyse}%</span>
                          <span>{analysis.contenu_code.length} caractères</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {analysis.nombre_vulnerabilites === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sécurisé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {analysis.nombre_vulnerabilites} vuln.
                        </span>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAnalysis(analysis.id);
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Zone d'analyse principale */}
        <div className="lg:col-span-3 space-y-6">
          {/* Éditeur de code amélioré */}
          <CodeEditor
            value={code}
            onChange={setCode}
            onScan={handleScan}
            isScanning={isScanning}
            fileName={fileName}
            onFileNameChange={setFileName}
          />

          {/* Option d'analyse IA */}
          {hasActiveAIConfig && (
            <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={() => setUseAI(!useAI)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="useAI" className="text-sm text-purple-800 dark:text-purple-300 flex items-center">
                <Brain className="h-4 w-4 mr-1" />
                Utiliser l'analyse IA avancée
              </label>
            </div>
          )}

          {/* Actions rapides */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDemo}
                className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <Code className="h-4 w-4 mr-2" />
                Charger l'exemple
              </button>
              
              <button
                onClick={clearCode}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouveau
              </button>
              
              {vulnerabilities.length > 0 && (
                <button
                  onClick={exportResults}
                  className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </button>
              )}
            </div>
            
            {vulnerabilities.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {vulnerabilities.length} vulnérabilité{vulnerabilities.length > 1 ? 's' : ''} trouvée{vulnerabilities.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Filtres et recherche */}
          {vulnerabilities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Toutes les sévérités</option>
                    <option value="critique">Critique</option>
                    <option value="eleve">Élevé</option>
                    <option value="moyen">Moyen</option>
                    <option value="faible">Faible</option>
                  </select>
                </div>
                
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher dans les vulnérabilités..."
                    className="w-full pl-10 pr-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Résultats */}
          {filteredVulnerabilities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Résultats de l'Analyse
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredVulnerabilities.length} sur {vulnerabilities.length} vulnérabilité{vulnerabilities.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-6">
                {filteredVulnerabilities.map((vulnerability) => (
                  <VulnerabilityCard key={vulnerability.id} vulnerability={vulnerability} />
                ))}
              </div>
            </div>
          )}

          {vulnerabilities.length === 0 && code && !isScanning && selectedAnalysis && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucune vulnérabilité détectée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Votre code semble sécurisé selon nos vérifications automatisées.
                </p>
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    ✅ Bonne pratique ! Continuez à écrire du code sécurisé.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panneau latéral avec métriques */}
        <div className="space-y-6">
          <SecurityMetrics
            totalScans={stats.totalAnalyses}
            totalVulnerabilities={stats.totalVulnerabilites}
            securityScore={stats.scoreMoyen}
            trend={stats.tendance}
            recentScans={recentScansForMetrics}
          />

          {/* Actions rapides */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={loadDemo}
                className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              >
                <div className="flex items-center">
                  <Code className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">Code d'exemple</span>
                </div>
              </button>
              <button 
                onClick={() => navigate('/apprentissage')}
                className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">Guide sécurité</span>
                </div>
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className="w-full text-left px-4 py-3 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
              >
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">Voir l'historique</span>
                </div>
              </button>
              {hasActiveAIConfig && (
                <button 
                  onClick={() => setUseAI(!useAI)}
                  className={`w-full text-left px-4 py-3 ${
                    useAI 
                      ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200' 
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  } rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors`}
                >
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 mr-3" />
                    <span className="text-sm font-medium">
                      {useAI ? 'Analyse IA activée' : 'Activer l\'analyse IA'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal des détails de vulnérabilité */}
      <VulnerabilityModal
        vulnerability={selectedVulnerability}
        onClose={() => setSelectedVulnerability(null)}
      />
    </div>
  );
}

export default Scanner;