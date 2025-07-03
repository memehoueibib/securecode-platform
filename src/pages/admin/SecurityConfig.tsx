import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Save,
  X,
  RefreshCw,
  Globe,
  Lock,
  Eye,
  Download,
  Upload,
  Brain,
  Code,
  FileText,
  Settings,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { SecurityService, BlockedIP } from '../../services/securityService';
import { SecurityRule } from '../../types/admin';

function SecurityConfig() {
  const [activeTab, setActiveTab] = useState('rules');
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [blockedCountries, setBlockedCountries] = useState<{country: string, count: number, status: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Modales
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [showAddIPModal, setShowAddIPModal] = useState(false);
  const [showIPDetailsModal, setShowIPDetailsModal] = useState(false);
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);
  
  // Formulaires
  const [ruleForm, setRuleForm] = useState<Partial<SecurityRule>>({
    name: '',
    description: '',
    language: 'javascript',
    pattern: '',
    severity: 'medium',
    category: 'XSS',
    customMessage: '',
    fixSuggestion: '',
    isActive: true
  });
  
  const [ipForm, setIpForm] = useState({
    ip: '',
    reason: '',
    duration: 24, // heures
    country: ''
  });
  
  const [selectedIP, setSelectedIP] = useState<BlockedIP | null>(null);
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null);
  
  // Variables pour les tests de code
  const [code, setCode] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testingRule, setTestingRule] = useState<string | null>(null);
  
  const [promptForm, setPromptForm] = useState({
    name: '',
    description: '',
    language: 'javascript',
    prompt: '',
    isActive: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Templates de prompts IA
  const [promptTemplates, setPromptTemplates] = useState<any[]>([
    {
      id: '1',
      name: 'Analyse de Sécurité JavaScript',
      description: 'Détection des vulnérabilités dans le code JavaScript',
      language: 'javascript',
      prompt: 'Analysez ce code JavaScript pour détecter les vulnérabilités de sécurité...',
      isActive: true,
      createdAt: new Date(Date.now() - 604800000).toISOString()
    },
    {
      id: '2',
      name: 'Analyse de Sécurité Python',
      description: 'Détection des vulnérabilités dans le code Python',
      language: 'python',
      prompt: 'Analysez ce code Python pour détecter les vulnérabilités de sécurité...',
      isActive: false,
      createdAt: new Date(Date.now() - 518400000).toISOString()
    },
    {
      id: '3',
      name: 'Analyse de Sécurité PHP',
      description: 'Détection des vulnérabilités dans le code PHP',
      language: 'php',
      prompt: 'Analysez ce code PHP pour détecter les vulnérabilités de sécurité...',
      isActive: false,
      createdAt: new Date(Date.now() - 432000000).toISOString()
    }
  ]);

  useEffect(() => {
    loadSecurityData();
  }, [activeTab]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'rules') {
        // Charger les règles de sécurité
        const rules = await AdminService.getAllSecurityRules();
        setSecurityRules(rules);
      } 
      else if (activeTab === 'ips') {
        // Charger les IPs bloquées
        const ips = await SecurityService.getBlockedIPs();
        setBlockedIPs(ips);
        
        // Calculer les statistiques par pays
        const countryStats = ips.reduce((acc: Record<string, {count: number, active: number}>, ip) => {
          const country = ip.country || 'Inconnu';
          if (!acc[country]) {
            acc[country] = { count: 0, active: 0 };
          }
          acc[country].count++;
          if (ip.status === 'active') {
            acc[country].active++;
          }
          return acc;
        }, {});
        
        // Convertir en tableau pour l'affichage
        const countryList = Object.entries(countryStats).map(([country, stats]) => ({
          country,
          count: stats.count,
          status: stats.active > 0 ? 'active' : 'inactive'
        }));
        
        setBlockedCountries(countryList.sort((a, b) => b.count - a.count));
      }
      else if (activeTab === 'prompts') {
        // Charger les templates de prompts IA
        // Dans une implémentation réelle, on chargerait depuis Supabase
        // Pour l'instant, on utilise les données simulées
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
      setMessage({type: 'error', text: 'Erreur lors du chargement des données'});
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.name || !ruleForm.pattern) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      
      const success = await AdminService.createSecurityRule(ruleForm as SecurityRule);
      
      if (success) {
        setShowAddRuleModal(false);
        setRuleForm({
          name: '',
          description: '',
          language: 'javascript',
          pattern: '',
          severity: 'medium',
          category: 'XSS',
          customMessage: '',
          fixSuggestion: '',
          isActive: true
        });
        
        await loadSecurityData();
        setMessage({type: 'success', text: 'Règle de sécurité créée avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la création de la règle'});
      }
    } catch (error) {
      console.error('Erreur lors de la création de la règle:', error);
      setMessage({type: 'error', text: 'Erreur lors de la création de la règle'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule || !ruleForm.name || !ruleForm.pattern) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      
      const success = await AdminService.updateSecurityRuleStatus(selectedRule.id!, ruleForm.isActive || false);
      
      if (success) {
        setShowEditRuleModal(false);
        setSelectedRule(null);
        
        await loadSecurityData();
        setMessage({type: 'success', text: 'Règle de sécurité mise à jour avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour de la règle'});
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la règle:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour de la règle'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle de sécurité ?')) {
      return;
    }

    try {
      const success = await AdminService.deleteSecurityRule(ruleId);
      
      if (success) {
        await loadSecurityData();
        setMessage({type: 'success', text: 'Règle de sécurité supprimée avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la suppression de la règle'});
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la règle:', error);
      setMessage({type: 'error', text: 'Erreur lors de la suppression de la règle'});
    }
  };

  const handleAddIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipForm.ip || !ipForm.reason) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      
      const success = await SecurityService.blockIP(ipForm.ip, ipForm.reason, ipForm.duration);
      
      if (success) {
        setShowAddIPModal(false);
        setIpForm({
          ip: '',
          reason: '',
          duration: 24,
          country: ''
        });
        
        await loadSecurityData();
        setMessage({type: 'success', text: 'Adresse IP bloquée avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors du blocage de l\'adresse IP'});
      }
    } catch (error) {
      console.error('Erreur lors du blocage de l\'adresse IP:', error);
      setMessage({type: 'error', text: 'Erreur lors du blocage de l\'adresse IP'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir débloquer l'adresse IP ${ip} ?`)) {
      return;
    }

    try {
      const success = await SecurityService.unblockIP(ip);
      
      if (success) {
        await loadSecurityData();
        setMessage({type: 'success', text: 'Adresse IP débloquée avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors du déblocage de l\'adresse IP'});
      }
    } catch (error) {
      console.error('Erreur lors du déblocage de l\'adresse IP:', error);
      setMessage({type: 'error', text: 'Erreur lors du déblocage de l\'adresse IP'});
    }
  };

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptForm.name || !promptForm.prompt) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simuler l'ajout d'un template de prompt
      const newTemplate = {
        id: `template-${Date.now()}`,
        name: promptForm.name,
        description: promptForm.description,
        language: promptForm.language,
        prompt: promptForm.prompt,
        isActive: promptForm.isActive,
        createdAt: new Date().toISOString()
      };
      
      setPromptTemplates([newTemplate, ...promptTemplates]);
      
      setShowAddPromptModal(false);
      setPromptForm({
        name: '',
        description: '',
        language: 'javascript',
        prompt: '',
        isActive: true
      });
      
      setMessage({type: 'success', text: 'Template de prompt créé avec succès'});
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      setMessage({type: 'error', text: 'Erreur lors de la création du template'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePromptStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      // Simuler la mise à jour du statut
      const updatedTemplates = promptTemplates.map(template => 
        template.id === templateId 
          ? {...template, isActive: !currentStatus} 
          : template
      );
      
      setPromptTemplates(updatedTemplates);
      
      setMessage({type: 'success', text: `Template ${currentStatus ? 'désactivé' : 'activé'} avec succès`});
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour du statut'});
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredRules = securityRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && rule.isActive) || 
                         (filterStatus === 'inactive' && !rule.isActive);
    const matchesSeverity = filterSeverity === 'all' || rule.severity === filterSeverity;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const filteredIPs = blockedIPs.filter(ip => {
    const matchesSearch = ip.ip.includes(searchTerm) || 
                         ip.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ip.country && ip.country.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || ip.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredPrompts = promptTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.isActive) || 
                         (filterStatus === 'inactive' && !template.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const AddRuleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter une Règle de Sécurité
          </h3>
          <button 
            onClick={() => setShowAddRuleModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddRule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la règle *
              </label>
              <input
                type="text"
                value={ruleForm.name}
                onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Détection XSS innerHTML"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Langage
              </label>
              <select
                value={ruleForm.language}
                onChange={(e) => setRuleForm({ ...ruleForm, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
                <option value="java">Java</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                value={ruleForm.category}
                onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="XSS">XSS</option>
                <option value="Injection">Injection</option>
                <option value="Secrets">Secrets</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sévérité
              </label>
              <select
                value={ruleForm.severity}
                onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="critical">Critique</option>
                <option value="high">Élevée</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={ruleForm.description}
                onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description de la règle de sécurité"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pattern (RegExp) *
              </label>
              <textarea
                value={ruleForm.pattern}
                onChange={(e) => setRuleForm({ ...ruleForm, pattern: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="Ex: innerHTML\\s*=\\s*.*(?:req\\.|request\\.|input|user|params|query|body)"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message personnalisé
              </label>
              <input
                type="text"
                value={ruleForm.customMessage || ''}
                onChange={(e) => setRuleForm({ ...ruleForm, customMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Message d'erreur personnalisé"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Suggestion de correction
              </label>
              <textarea
                value={ruleForm.fixSuggestion || ''}
                onChange={(e) => setRuleForm({ ...ruleForm, fixSuggestion: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Suggestion pour corriger la vulnérabilité"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={ruleForm.isActive}
                  onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Règle active
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddRuleModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer la Règle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditRuleModal = () => {
    if (!selectedRule) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Modifier la Règle de Sécurité
            </h3>
            <button 
              onClick={() => setShowEditRuleModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleUpdateRule} className="space-y-4">
            {/* Contenu similaire à AddRuleModal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de la règle *
                </label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              {/* Autres champs similaires à AddRuleModal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Langage
                </label>
                <select
                  value={ruleForm.language}
                  onChange={(e) => setRuleForm({ ...ruleForm, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="php">PHP</option>
                  <option value="java">Java</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={ruleForm.category}
                  onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="XSS">XSS</option>
                  <option value="Injection">Injection</option>
                  <option value="Secrets">Secrets</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sévérité
                </label>
                <select
                  value={ruleForm.severity}
                  onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="critical">Critique</option>
                  <option value="high">Élevée</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Faible</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pattern (RegExp) *
                </label>
                <textarea
                  value={ruleForm.pattern}
                  onChange={(e) => setRuleForm({ ...ruleForm, pattern: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={ruleForm.isActive}
                    onChange={(e) => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveEdit" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Règle active
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditRuleModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AddIPModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bloquer une Adresse IP
          </h3>
          <button 
            onClick={() => setShowAddIPModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddIP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse IP *
            </label>
            <input
              type="text"
              value={ipForm.ip}
              onChange={(e) => setIpForm({ ...ipForm, ip: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: 192.168.1.1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raison du blocage *
            </label>
            <input
              type="text"
              value={ipForm.reason}
              onChange={(e) => setIpForm({ ...ipForm, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: tentative de brute force"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durée du blocage (heures)
            </label>
            <input
              type="number"
              min="1"
              max="8760" // 1 an
              value={ipForm.duration}
              onChange={(e) => setIpForm({ ...ipForm, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pays (optionnel)
            </label>
            <input
              type="text"
              value={ipForm.country}
              onChange={(e) => setIpForm({ ...ipForm, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Russie"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddIPModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Blocage...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Bloquer l'IP
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const IPDetailsModal = () => {
    if (!selectedIP) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Détails de l'IP Bloquée
            </h3>
            <button 
              onClick={() => setShowIPDetailsModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Adresse IP</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedIP.ip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedIP.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedIP.status === 'active' ? 'Actif' : 'Expiré'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Raison du blocage</p>
              <p className="text-gray-900 dark:text-white">{selectedIP.reason}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pays</p>
                <p className="text-gray-900 dark:text-white">{selectedIP.country || 'Non spécifié'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tentatives</p>
                <p className="text-gray-900 dark:text-white">{selectedIP.attempts}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date de blocage</p>
                <p className="text-gray-900 dark:text-white">{new Date(selectedIP.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expiration</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedIP.expires 
                    ? new Date(selectedIP.expires).toLocaleString() 
                    : 'Permanent'}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowIPDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Fermer
                </button>
                {selectedIP.status === 'active' && (
                  <button
                    onClick={() => {
                      handleUnblockIP(selectedIP.ip);
                      setShowIPDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Débloquer l'IP
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddPromptModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter un Template de Prompt IA
          </h3>
          <button 
            onClick={() => setShowAddPromptModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddPrompt} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du template *
              </label>
              <input
                type="text"
                value={promptForm.name}
                onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Analyse de Sécurité JavaScript"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Langage
              </label>
              <select
                value={promptForm.language}
                onChange={(e) => setPromptForm({ ...promptForm, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
                <option value="java">Java</option>
                <option value="general">Général (tous langages)</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={promptForm.description}
                onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description du template de prompt"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prompt *
              </label>
              <textarea
                value={promptForm.prompt}
                onChange={(e) => setPromptForm({ ...promptForm, prompt: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="Entrez votre prompt IA ici..."
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Utilisez {"{{"}code{"}}"} comme variable pour insérer le code à analyser.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActivePrompt"
                  checked={promptForm.isActive}
                  onChange={(e) => setPromptForm({ ...promptForm, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActivePrompt" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Template actif
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddPromptModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer le Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des données de sécurité...</p>
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
            Configuration de Sécurité
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les règles de sécurité et les paramètres de protection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadSecurityData}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={() => {
              if (activeTab === 'rules') setShowAddRuleModal(true);
              else if (activeTab === 'ips') setShowAddIPModal(true);
              else if (activeTab === 'prompts') setShowAddPromptModal(true);
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'rules' ? 'Nouvelle Règle' : 
             activeTab === 'ips' ? 'Bloquer IP' : 
             'Nouveau Template'}
          </button>
        </div>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-red-500 text-red-600 dark:text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Shield className="h-5 w-5 mr-2" />
            Règles de Sécurité
          </button>
          <button
            onClick={() => setActiveTab('ips')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ips'
                ? 'border-red-500 text-red-600 dark:text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Globe className="h-5 w-5 mr-2" />
            IP Bloquées
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prompts'
                ? 'border-red-500 text-red-600 dark:text-red-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Brain className="h-5 w-5 mr-2" />
            Templates de Prompts IA
          </button>
        </nav>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Rechercher ${
                activeTab === 'rules' ? 'des règles' : 
                activeTab === 'ips' ? 'des IPs' : 
                'des templates'
              }...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            {activeTab === 'ips' && <option value="expired">Expiré</option>}
          </select>
          
          {activeTab === 'rules' && (
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="critical">Critique</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
          )}
          
          <button
            onClick={() => {
              if (activeTab === 'rules') setShowAddRuleModal(true);
              else if (activeTab === 'ips') setShowAddIPModal(true);
              else if (activeTab === 'prompts') setShowAddPromptModal(true);
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors sm:hidden"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'rules' ? 'Nouvelle Règle' : 
             activeTab === 'ips' ? 'Bloquer IP' : 
             'Nouveau Template'}
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sévérité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Langage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune règle de sécurité trouvée</p>
                      <button
                        onClick={() => setShowAddRuleModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une règle
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {rule.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {rule.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {rule.category}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity === 'critical' ? 'Critique' : 
                           rule.severity === 'high' ? 'Élevée' : 
                           rule.severity === 'medium' ? 'Moyenne' : 
                           'Faible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {rule.language}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rule.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {rule.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedRule(rule);
                              setRuleForm({
                                name: rule.name,
                                description: rule.description || '',
                                language: rule.language,
                                pattern: rule.pattern,
                                severity: rule.severity,
                                category: rule.category,
                                customMessage: rule.customMessage || '',
                                fixSuggestion: rule.fixSuggestion || '',
                                isActive: rule.isActive
                              });
                              setShowEditRuleModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.id!)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ips' && (
        <>
          {/* Pays Bloqués */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pays Bloqués
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {blockedCountries.slice(0, 8).map((country, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    country.status === 'active'
                      ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {country.country}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      country.status === 'active'
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {country.count} IP{country.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${Math.min(country.count * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            {blockedCountries.length > 8 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  Voir tous les pays ({blockedCountries.length})
                </button>
              </div>
            )}
          </div>
          
          {/* Liste des IP Bloquées */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Liste des IP Bloquées
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Adresse IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Raison
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tentatives
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredIPs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune adresse IP bloquée trouvée</p>
                        <button
                          onClick={() => setShowAddIPModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Bloquer une IP
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredIPs.map((ip, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {ip.ip}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ip.reason.includes('brute force') || ip.reason.includes('attack') || ip.reason.includes('injection')
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : ip.reason.includes('suspicious') || ip.reason.includes('scan')
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          }`}>
                            {ip.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {ip.country || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {ip.attempts}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(ip.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ip.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {ip.status === 'active' ? 'Actif' : 'Expiré'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedIP(ip);
                                setShowIPDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {ip.status === 'active' && (
                              <button 
                                onClick={() => handleUnblockIP(ip.ip)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Débloquer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Liste complète des IP bloquées */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Liste des IP bloquées
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {`Blocage IP : 192.168.1.10 (Raison : scan detected),
Blocage IP : 192.168.1.11 (Raison : brute force attempt),
Blocage IP : 192.168.1.12 (Raison : malware traffic),
Blocage IP : 192.168.1.13 (Raison : suspicious activity),
Blocage IP : 192.168.1.14 (Raison : port scanning),
Blocage IP : 192.168.1.15 (Raison : ddos attempt),
Blocage IP : 192.168.1.16 (Raison : unauthorized access),
Blocage IP : 192.168.1.17 (Raison : suspicious login),
Blocage IP : 192.168.1.18 (Raison : sql injection),
Blocage IP : 192.168.1.19 (Raison : xss attack),
Blocage IP : 192.168.1.20 (Raison : exploit attempt),
Blocage IP : 192.168.1.21 (Raison : ransomware),
Blocage IP : 192.168.1.22 (Raison : botnet traffic),
Blocage IP : 192.168.1.23 (Raison : phishing),
Blocage IP : 192.168.1.24 (Raison : credential stuffing),
Blocage IP : 192.168.1.25 (Raison : malicious payload),
Blocage IP : 192.168.1.26 (Raison : data exfiltration),
Blocage IP : 192.168.1.27 (Raison : backdoor access),
Blocage IP : 192.168.1.28 (Raison : trojan detected),
Blocage IP : 192.168.1.29 (Raison : spam),
Total : 20 IP bloquées.`}
              </pre>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Exporter la liste
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'prompts' && (
        <>
          {/* Templates de Prompts IA */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Templates de Prompts IA
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configurez les prompts utilisés pour l'analyse IA du code
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Langage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPrompts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun template de prompt trouvé</p>
                        <button
                          onClick={() => setShowAddPromptModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un template
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredPrompts.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {template.language}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleTogglePromptStatus(template.id, template.isActive)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            {template.isActive ? (
                              <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                            <span className="ml-2 text-sm">
                              {template.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Fournisseurs IA Supportés */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Fournisseurs IA Supportés
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">OpenAI</h3>
                  <Brain className="h-5 w-5 text-gray-400" />
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Modèles: gpt-4, gpt-4-turbo, gpt-3.5-turbo</li>
                  <li>Tokens max: 4000</li>
                  <li>Streaming: Oui</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Anthropic (Claude)</h3>
                  <Brain className="h-5 w-5 text-gray-400" />
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Modèles: claude-3-opus, claude-3-sonnet, claude-3-haiku</li>
                  <li>Tokens max: 4000</li>
                  <li>Streaming: Oui</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Google (Gemini)</h3>
                  <Brain className="h-5 w-5 text-gray-400" />
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Modèles: gemini-pro, gemini-pro-vision</li>
                  <li>Tokens max: 2000</li>
                  <li>Streaming: Non</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Mistral AI</h3>
                  <Brain className="h-5 w-5 text-gray-400" />
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Modèles: mistral-large, mistral-medium, mistral-small</li>
                  <li>Tokens max: 2000</li>
                  <li>Streaming: Oui</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Cohere</h3>
                  <Brain className="h-5 w-5 text-gray-400" />
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Modèles: command, command-light</li>
                  <li>Tokens max: 2000</li>
                  <li>Streaming: Non</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Exemple de Prompt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Exemple de Prompt
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
{`Analysez ce code {"{{"}language{"}}"} pour détecter les vulnérabilités de sécurité.

Code à analyser:
\\\`\\\`\\\`{"{{"}language{"}"}
{"{{"}code{"}"}
\\\`\\\`\\\`

Recherchez spécifiquement:
1. Vulnérabilités XSS (Cross-Site Scripting)
2. Injections de code (eval, Function, etc.)
3. Secrets codés en dur (mots de passe, clés API)
4. Autres problèmes de sécurité

Répondez au format JSON avec cette structure:
{
  "vulnerabilities": [
    {
      "type": "xss|injection|secrets|other",
      "severity": "critique|eleve|moyen|faible",
      "line": "number",
      "description": "Description de la vulnérabilité",
      "codeSnippet": "Code problématique",
      "fix": "Solution recommandée",
      "confidence": "number (0-100)"
    }
  ],
  "summary": {
    "totalVulnerabilities": "number",
    "securityScore": "number (0-100)",
    "recommendations": ["liste de recommandations"]
  }
}`}
              </pre>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Variables disponibles:</strong> {"{{"}code{"}}"}, {"{{"}language{"}"}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Modales */}
      {showAddRuleModal && <AddRuleModal />}
      {showEditRuleModal && <EditRuleModal />}
      {showAddIPModal && <AddIPModal />}
      {showIPDetailsModal && <IPDetailsModal />}
      {showAddPromptModal && <AddPromptModal />}
    </div>
  );
}

export default SecurityConfig;