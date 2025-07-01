import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Brain, 
  Key, 
  Save, 
  Trash2, 
  Plus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { APIConfigService } from '../services/apiConfigService';
import { AI_PROVIDERS } from '../services/aiAnalysisService';

interface APIConfig {
  id?: string;
  provider: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ai');
  const [configs, setConfigs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  
  const [formData, setFormData] = useState<APIConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 2000,
    isActive: false
  });

  useEffect(() => {
    if (user) {
      loadConfigs();
    }
  }, [user]);

  const loadConfigs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userConfigs = await APIConfigService.getUserAPIConfigs(user.id);
      setConfigs(userConfigs);
    } catch (error) {
      console.error('Erreur lors du chargement des configurations:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !formData.apiKey.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs requis' });
      return;
    }

    try {
      setSaving(true);
      const success = await APIConfigService.saveAPIConfig(user.id, {
        provider: formData.provider,
        apiKey: formData.apiKey,
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens
      });

      if (success) {
        setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès' });
        setShowForm(false);
        setFormData({
          provider: 'openai',
          apiKey: '',
          model: 'gpt-4',
          temperature: 0.1,
          maxTokens: 2000,
          isActive: false
        });
        await loadConfigs();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!user || !confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      return;
    }

    try {
      const success = await APIConfigService.deleteAPIConfig(user.id, configId);
      if (success) {
        setMessage({ type: 'success', text: 'Configuration supprimée' });
        await loadConfigs();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleSetActive = async (configId: string) => {
    if (!user) return;

    try {
      const success = await APIConfigService.setActiveConfig(user.id, configId);
      if (success) {
        setMessage({ type: 'success', text: 'Configuration activée' });
        await loadConfigs();
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'activation' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'activation' });
    }
  };

  const getProviderInfo = (providerId: string) => {
    return AI_PROVIDERS.find(p => p.id === providerId);
  };

  const toggleApiKeyVisibility = (configId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const tabs = [
    { id: 'ai', name: 'Configuration IA', icon: Brain },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'general', name: 'Général', icon: SettingsIcon }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configurez votre expérience SecureCode
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Onglets */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Configuration IA */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configurations IA
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Configurez vos clés API pour l'analyse IA avancée
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </button>
            </div>

            {/* Liste des configurations */}
            {configs.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune configuration IA
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ajoutez une configuration pour utiliser l'analyse IA avancée
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une configuration
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => {
                  const provider = getProviderInfo(config.provider);
                  return (
                    <div
                      key={config.id}
                      className={`p-4 rounded-lg border ${
                        config.is_active
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            config.is_active ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            <Brain className={`h-5 w-5 ${
                              config.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {provider?.name || config.provider}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Modèle: {config.model}</span>
                              <span>Temp: {config.temperature}</span>
                              <span>Tokens: {config.max_tokens}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {config.is_active && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <Zap className="h-3 w-3 mr-1" />
                              Actif
                            </span>
                          )}
                          
                          {!config.is_active && (
                            <button
                              onClick={() => handleSetActive(config.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Activer
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(config.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Clé API: {showApiKey[config.id] ? config.api_key_encrypted : '••••••••••••••••'}
                        </span>
                        <button
                          onClick={() => toggleApiKeyVisibility(config.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showApiKey[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formulaire d'ajout */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nouvelle Configuration IA
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => {
                      const provider = getProviderInfo(e.target.value);
                      setFormData({
                        ...formData,
                        provider: e.target.value,
                        model: provider?.defaultModel || '',
                        maxTokens: provider?.maxTokens || 2000
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {AI_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Modèle
                  </label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {getProviderInfo(formData.provider)?.models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clé API
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Votre clé API"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Température ({formData.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tokens max
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.apiKey.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Informations sur les fournisseurs */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
              Fournisseurs IA Supportés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {provider.name}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Modèles: {provider.models.join(', ')}</p>
                    <p>Tokens max: {provider.maxTokens}</p>
                    <p>Streaming: {provider.supportsStreaming ? 'Oui' : 'Non'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sécurité */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Paramètres de Sécurité
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Les paramètres de sécurité seront disponibles dans une prochaine version.
          </p>
        </div>
      )}

      {/* Général */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Paramètres Généraux
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Les paramètres généraux seront disponibles dans une prochaine version.
          </p>
        </div>
      )}
    </div>
  );
}

export default Settings;