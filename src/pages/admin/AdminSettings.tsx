import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Key,
  Server,
  Monitor,
  Palette,
  Lock,
  AlertTriangle,
  CheckCircle,
  Loader,
  X
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    language: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    enableAuditLog: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
    userRegistrations: boolean;
  };
  integrations: {
    enableSlack: boolean;
    slackWebhook: string;
    enableTeams: boolean;
    teamsWebhook: string;
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxFileSize: number;
    enableCompression: boolean;
  };
}

function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'SecureCode',
      siteDescription: 'Plateforme d\'analyse de sécurité de code',
      adminEmail: 'admin@securecode.fr',
      timezone: 'Europe/Paris',
      language: 'fr'
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
      enableAuditLog: true
    },
    notifications: {
      emailNotifications: true,
      securityAlerts: true,
      systemUpdates: true,
      userRegistrations: false
    },
    integrations: {
      enableSlack: false,
      slackWebhook: '',
      enableTeams: false,
      teamsWebhook: ''
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      maxFileSize: 10,
      enableCompression: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Les paramètres sont déjà initialisés dans le state
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);
      // Simuler la réinitialisation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Réinitialiser aux valeurs par défaut
      setSettings({
        general: {
          siteName: 'SecureCode',
          siteDescription: 'Plateforme d\'analyse de sécurité de code',
          adminEmail: 'admin@securecode.fr',
          timezone: 'Europe/Paris',
          language: 'fr'
        },
        security: {
          passwordMinLength: 8,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          enableTwoFactor: false,
          enableAuditLog: true
        },
        notifications: {
          emailNotifications: true,
          securityAlerts: true,
          systemUpdates: true,
          userRegistrations: false
        },
        integrations: {
          enableSlack: false,
          slackWebhook: '',
          enableTeams: false,
          teamsWebhook: ''
        },
        performance: {
          cacheEnabled: true,
          cacheDuration: 3600,
          maxFileSize: 10,
          enableCompression: true
        }
      });
      
      setShowResetModal(false);
      setMessage({ type: 'success', text: 'Paramètres réinitialisés avec succès' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la réinitialisation' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: Settings },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Intégrations', icon: Globe },
    { id: 'performance', name: 'Performance', icon: Monitor }
  ];

  const ResetConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            Confirmer la réinitialisation
          </h3>
          <button 
            onClick={() => setShowResetModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Êtes-vous sûr de vouloir réinitialiser tous les paramètres ? Cette action est irréversible et tous vos paramètres personnalisés seront perdus.
          </p>
          <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">
              ⚠️ Tous les paramètres seront remplacés par les valeurs par défaut.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={resetSettings}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</p>
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
            Paramètres Système
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configuration globale de la plateforme
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
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
            <AlertTriangle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des onglets */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Onglet Général */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres Généraux
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email administrateur
                    </label>
                    <input
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) => updateSettings('general', 'adminEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description du site
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fuseau horaire
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSettings('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => updateSettings('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Sécurité */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres de Sécurité
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Longueur minimale du mot de passe
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="20"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timeout de session (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tentatives de connexion max
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="10"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Authentification à deux facteurs
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Activer l'authentification à deux facteurs pour tous les utilisateurs
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings('security', 'enableTwoFactor', !settings.security.enableTwoFactor)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.enableTwoFactor ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Journal d'audit
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enregistrer toutes les actions importantes dans un journal d'audit
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings('security', 'enableAuditLog', !settings.security.enableAuditLog)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.enableAuditLog ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.enableAuditLog ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres de Notifications
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {key === 'emailNotifications' ? 'Notifications par email' :
                           key === 'securityAlerts' ? 'Alertes de sécurité' :
                           key === 'systemUpdates' ? 'Mises à jour système' :
                           'Inscriptions utilisateurs'}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {key === 'emailNotifications' ? 'Envoyer des notifications par email' :
                           key === 'securityAlerts' ? 'Alertes en cas de problème de sécurité' :
                           key === 'systemUpdates' ? 'Notifications des mises à jour système' :
                           'Notifications lors de nouvelles inscriptions'}
                        </p>
                      </div>
                      <button
                        onClick={() => updateSettings('notifications', key, !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet Intégrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Intégrations Externes
                </h3>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Slack
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Envoyer des notifications vers Slack
                        </p>
                      </div>
                      <button
                        onClick={() => updateSettings('integrations', 'enableSlack', !settings.integrations.enableSlack)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.integrations.enableSlack ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.integrations.enableSlack ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {settings.integrations.enableSlack && (
                      <input
                        type="url"
                        placeholder="https://hooks.slack.com/services/..."
                        value={settings.integrations.slackWebhook}
                        onChange={(e) => updateSettings('integrations', 'slackWebhook', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>

                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          Microsoft Teams
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Envoyer des notifications vers Teams
                        </p>
                      </div>
                      <button
                        onClick={() => updateSettings('integrations', 'enableTeams', !settings.integrations.enableTeams)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.integrations.enableTeams ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.integrations.enableTeams ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {settings.integrations.enableTeams && (
                      <input
                        type="url"
                        placeholder="https://outlook.office.com/webhook/..."
                        value={settings.integrations.teamsWebhook}
                        onChange={(e) => updateSettings('integrations', 'teamsWebhook', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Performance */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Paramètres de Performance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée du cache (secondes)
                    </label>
                    <input
                      type="number"
                      min="300"
                      max="86400"
                      value={settings.performance.cacheDuration}
                      onChange={(e) => updateSettings('performance', 'cacheDuration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taille max fichier (MB)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.performance.maxFileSize}
                      onChange={(e) => updateSettings('performance', 'maxFileSize', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Cache activé
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Activer la mise en cache pour améliorer les performances
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings('performance', 'cacheEnabled', !settings.performance.cacheEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.performance.cacheEnabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.performance.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Compression activée
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Compresser les réponses pour réduire la bande passante
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings('performance', 'enableCompression', !settings.performance.enableCompression)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.performance.enableCompression ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.performance.enableCompression ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de réinitialisation */}
      {showResetModal && <ResetConfirmModal />}
    </div>
  );
}

export default AdminSettings;