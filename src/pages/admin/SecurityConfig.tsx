import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Loader,
  Code,
  AlertTriangle,
  Key,
  Brain,
  Terminal,
  FileCode,
  RefreshCw
} from 'lucide-react';
import { AdminSyncService } from '../../services/adminSyncService';
import { SecurityRule, AIPromptTemplate } from '../../types/admin';

function SecurityConfig() {
  // États pour les règles de sécurité
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<SecurityRule | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleFormData, setRuleFormData] = useState<SecurityRule>({
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
  
  // États pour les templates de prompts IA
  const [promptTemplates, setPromptTemplates] = useState<AIPromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AIPromptTemplate | null>(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateFormData, setTemplateFormData] = useState<AIPromptTemplate>({
    name: '',
    description: '',
    language: 'javascript',
    prompt: '',
    variables: [],
    modelConfig: { temperature: 0.1, max_tokens: 2000 },
    isActive: true
  });
  
  // États communs
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'rules') {
        const rules = await AdminSyncService.getAllSecurityRules();
        setSecurityRules(rules);
      } else if (activeTab === 'prompts') {
        const templates = await AdminSyncService.getAllAIPromptTemplates();
        setPromptTemplates(templates);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setMessage({type: 'error', text: 'Erreur lors du chargement des données'});
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour les règles de sécurité
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormData.name || !ruleFormData.pattern) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      
      const success = await AdminSyncService.updateSecurityRuleFromAdmin(ruleFormData);
      
      if (success) {
        setShowRuleForm(false);
        setRuleFormData({
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
        
        await loadData();
        setMessage({type: 'success', text: 'Règle de sécurité créée avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la création de la règle'});
      }
    } catch (error) {
      console.error('Erreur lors de la création de la règle:', error);
      setMessage({type: 'error', text: 'Erreur lors de la création de la règle'});
    } finally {
      setSaving(false);
    }
  };

  const handleEditRule = (rule: SecurityRule) => {
    setSelectedRule(rule);
    setRuleFormData(rule);
    setShowRuleForm(true);
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule || !ruleFormData.name || !ruleFormData.pattern) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      
      const success = await AdminSyncService.updateSecurityRuleFromAdmin({
        ...ruleFormData,
        id: selectedRule.id
      });
      
      if (success) {
        setShowRuleForm(false);
        setSelectedRule(null);
        
        await loadData();
        setMessage({type: 'success', text: 'Règle de sécurité mise à jour avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour de la règle'});
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la règle:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour de la règle'});
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRuleStatus = async (rule: SecurityRule) => {
    try {
      const updatedRule = { ...rule, isActive: !rule.isActive };
      const success = await AdminSyncService.updateSecurityRuleFromAdmin(updatedRule);
      
      if (success) {
        await loadData();
        setMessage({
          type: 'success', 
          text: `Règle ${updatedRule.isActive ? 'activée' : 'désactivée'} avec succès`
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour du statut'});
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour du statut'});
    }
  };

  // Fonctions pour les templates de prompts IA
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormData.name || !templateFormData.prompt) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      
      const success = await AdminSyncService.saveAIPromptTemplate(templateFormData);
      
      if (success) {
        setShowTemplateForm(false);
        setTemplateFormData({
          name: '',
          description: '',
          language: 'javascript',
          prompt: '',
          variables: [],
          modelConfig: { temperature: 0.1, max_tokens: 2000 },
          isActive: true
        });
        
        await loadData();
        setMessage({type: 'success', text: 'Template de prompt créé avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la création du template'});
      }
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      setMessage({type: 'error', text: 'Erreur lors de la création du template'});
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = (template: AIPromptTemplate) => {
    setSelectedTemplate(template);
    setTemplateFormData(template);
    setShowTemplateForm(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !templateFormData.name || !templateFormData.prompt) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      
      const success = await AdminSyncService.saveAIPromptTemplate({
        ...templateFormData,
        id: selectedTemplate.id
      });
      
      if (success) {
        setShowTemplateForm(false);
        setSelectedTemplate(null);
        
        await loadData();
        setMessage({type: 'success', text: 'Template de prompt mis à jour avec succès'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour du template'});
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du template:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour du template'});
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTemplateStatus = async (template: AIPromptTemplate) => {
    try {
      const updatedTemplate = { ...template, isActive: !template.isActive };
      const success = await AdminSyncService.saveAIPromptTemplate(updatedTemplate);
      
      if (success) {
        await loadData();
        setMessage({
          type: 'success', 
          text: `Template ${updatedTemplate.isActive ? 'activé' : 'désactivé'} avec succès`
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour du statut'});
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour du statut'});
    }
  };

  // Filtrage des données
  const filteredRules = securityRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || rule.language === filterLanguage;
    const matchesSeverity = filterSeverity === 'all' || rule.severity === filterSeverity;
    
    return matchesSearch && matchesLanguage && matchesSeverity;
  });

  const filteredTemplates = promptTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filterLanguage === 'all' || template.language === filterLanguage;
    
    return matchesSearch && matchesLanguage;
  });

  // Fonctions utilitaires
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'XSS': return <Code className="h-4 w-4" />;
      case 'Injection': return <Terminal className="h-4 w-4" />;
      case 'Secrets': return <Key className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'javascript': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'typescript': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'python': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'java': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Formulaire pour les règles de sécurité
  const RuleForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Modifier la Règle de Sécurité' : 'Nouvelle Règle de Sécurité'}
          </h3>
          <button 
            onClick={() => {
              setShowRuleForm(false);
              if (!isEdit) {
                setRuleFormData({
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
              }
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={isEdit ? handleUpdateRule : handleCreateRule} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la règle *
              </label>
              <input
                type="text"
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Détection XSS innerHTML"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Langage
              </label>
              <select
                value={ruleFormData.language}
                onChange={(e) => setRuleFormData({ ...ruleFormData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="csharp">C#</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sévérité
              </label>
              <select
                value={ruleFormData.severity}
                onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="critical">Critique</option>
                <option value="high">Élevée</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
              </label>
              <select
                value={ruleFormData.category}
                onChange={(e) => setRuleFormData({ ...ruleFormData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="XSS">XSS</option>
                <option value="Injection">Injection</option>
                <option value="Secrets">Secrets</option>
                <option value="Authentication">Authentification</option>
                <option value="Authorization">Autorisation</option>
                <option value="CSRF">CSRF</option>
                <option value="Other">Autre</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={ruleFormData.description}
                onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description de la règle de sécurité"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pattern (expression régulière) *
              </label>
              <textarea
                value={ruleFormData.pattern}
                onChange={(e) => setRuleFormData({ ...ruleFormData, pattern: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="Ex: innerHTML\\s*=\\s*.*(?:req\\.|request\\.|input|user|params|query|body)"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Utilisez une expression régulière valide pour détecter le pattern dans le code.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message personnalisé
              </label>
              <textarea
                value={ruleFormData.customMessage}
                onChange={(e) => setRuleFormData({ ...ruleFormData, customMessage: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Message d'erreur à afficher lorsque cette vulnérabilité est détectée"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Suggestion de correction
              </label>
              <textarea
                value={ruleFormData.fixSuggestion}
                onChange={(e) => setRuleFormData({ ...ruleFormData, fixSuggestion: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Suggestion pour corriger cette vulnérabilité"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={ruleFormData.isActive}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Règle active
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Les règles inactives ne seront pas utilisées lors de l'analyse de code.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowRuleForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Mettre à jour' : 'Créer la règle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Formulaire pour les templates de prompts IA
  const TemplateForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Modifier le Template de Prompt IA' : 'Nouveau Template de Prompt IA'}
          </h3>
          <button 
            onClick={() => {
              setShowTemplateForm(false);
              if (!isEdit) {
                setTemplateFormData({
                  name: '',
                  description: '',
                  language: 'javascript',
                  prompt: '',
                  variables: [],
                  modelConfig: { temperature: 0.1, max_tokens: 2000 },
                  isActive: true
                });
              }
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={isEdit ? handleUpdateTemplate : handleCreateTemplate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du template *
              </label>
              <input
                type="text"
                value={templateFormData.name}
                onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Analyse de sécurité JavaScript"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Langage
              </label>
              <select
                value={templateFormData.language}
                onChange={(e) => setTemplateFormData({ ...templateFormData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="csharp">C#</option>
                <option value="general">Général</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description du template de prompt"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prompt IA *
              </label>
              <textarea
                value={templateFormData.prompt}
                onChange={(e) => setTemplateFormData({ ...templateFormData, prompt: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder={`En tant qu'expert en sécurité logicielle, analysez le code JavaScript suivant et identifiez toutes les vulnérabilités de sécurité potentielles.

Code à analyser:
\`\`\`javascript
{{code}}
\`\`\`

Veuillez fournir une analyse détaillée incluant:

1. **Vulnérabilités identifiées** - Listez chaque vulnérabilité avec:
   - Type (XSS, Injection, Secrets exposés, etc.)
   - Sévérité (Critique, Élevée, Moyenne, Faible)
   - Ligne concernée
   - Description du problème
   - Impact potentiel

2. **Recommandations de correction** - Pour chaque vulnérabilité:
   - Solution spécifique
   - Code corrigé suggéré
   - Bonnes pratiques à adopter

3. **Score de sécurité global** - Sur 100, avec justification

4. **Recommandations générales** - Améliorations de sécurité additionnelles

Formatez la réponse en JSON avec cette structure:
{
  "vulnerabilities": [
    {
      "type": "xss|injection|secrets|other",
      "severity": "critique|eleve|moyen|faible",
      "line": number,
      "description": "string",
      "impact": "string",
      "solution": "string",
      "correctedCode": "string"
    }
  ],
  "securityScore": number,
  "summary": "string",
  "recommendations": ["string"]
}`}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Utilisez {{code}} comme variable pour insérer le code à analyser.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Variables (séparées par des virgules)
              </label>
              <input
                type="text"
                value={templateFormData.variables?.join(', ') || ''}
                onChange={(e) => {
                  const vars = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                  setTemplateFormData({ ...templateFormData, variables: vars });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="code, language, severity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Température (0.0 - 1.0)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={templateFormData.modelConfig?.temperature || 0.1}
                onChange={(e) => {
                  const temp = parseFloat(e.target.value);
                  setTemplateFormData({
                    ...templateFormData,
                    modelConfig: {
                      ...templateFormData.modelConfig,
                      temperature: temp
                    }
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isTemplateActive"
                  checked={templateFormData.isActive}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isTemplateActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Template actif
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Seul un template actif par langage sera utilisé lors de l'analyse de code.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowTemplateForm(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Mettre à jour' : 'Créer le template'}
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
            Configuration de Sécurité
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les règles de sécurité et les templates d'analyse IA
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={() => {
              if (activeTab === 'rules') {
                setShowRuleForm(true);
                setSelectedRule(null);
                setRuleFormData({
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
              } else {
                setShowTemplateForm(true);
                setSelectedTemplate(null);
                setTemplateFormData({
                  name: '',
                  description: '',
                  language: 'javascript',
                  prompt: '',
                  variables: [],
                  modelConfig: { temperature: 0.1, max_tokens: 2000 },
                  isActive: true
                });
              }
            }}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'rules' ? 'Nouvelle Règle' : 'Nouveau Template'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'rules'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Règles de Sécurité
            </div>
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'prompts'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Templates de Prompts IA
            </div>
          </button>
        </div>
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
              placeholder={`Rechercher des ${activeTab === 'rules' ? 'règles' : 'templates'}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les langages</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="php">PHP</option>
            <option value="csharp">C#</option>
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
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'rules' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Langage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sévérité
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
                        onClick={() => {
                          setShowRuleForm(true);
                          setSelectedRule(null);
                          setRuleFormData({
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
                        }}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une règle
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </div>
                        {rule.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {rule.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(rule.language)}`}>
                          {rule.language}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300">
                          {getCategoryIcon(rule.category)}
                          <span className="ml-1">{rule.category}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                          {rule.severity === 'critical' && 'Critique'}
                          {rule.severity === 'high' && 'Élevée'}
                          {rule.severity === 'medium' && 'Moyenne'}
                          {rule.severity === 'low' && 'Faible'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleRuleStatus(rule)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            rule.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {rule.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditRule(rule)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
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
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Langage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Variables
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
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun template de prompt IA trouvé</p>
                      <button
                        onClick={() => {
                          setShowTemplateForm(true);
                          setSelectedTemplate(null);
                          setTemplateFormData({
                            name: '',
                            description: '',
                            language: 'javascript',
                            prompt: '',
                            variables: [],
                            modelConfig: { temperature: 0.1, max_tokens: 2000 },
                            isActive: true
                          });
                        }}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un template
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {template.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(template.language)}`}>
                          {template.language}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {template.variables && template.variables.length > 0 ? (
                            template.variables.map((variable, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {variable}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Aucune variable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleTemplateStatus(template)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {template.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditTemplate(template)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Modales */}
      {showRuleForm && <RuleForm isEdit={!!selectedRule} />}
      {showTemplateForm && <TemplateForm isEdit={!!selectedTemplate} />}
    </div>
  );
}

export default SecurityConfig;