import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Learning from './pages/Learning';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AlertCircle, RefreshCw, Shield, Settings as SettingsIcon } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/connexion" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return !user ? <>{children}</> : <Navigate to="/tableau-de-bord" replace />;
}

function ErrorFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Configuration Manquante
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Créez un fichier .env.local avec :
            </h3>
            <div className="text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
              <div>VITE_SUPABASE_URL=https://vjiukoujlkwzypsvqhvc.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </button>
            
            <button
              onClick={() => window.open('/demo', '_blank')}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Mode Démonstration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading, error } = useAuth();

  const handleRetry = () => {
    console.log('🔄 Retry demandé, rechargement de la page...');
    window.location.reload();
  };

  // Afficher l'erreur SEULEMENT pour les problèmes de configuration
  if (error && (error.includes('Variables d\'environnement') || error.includes('CONFIGURATION'))) {
    return <ErrorFallback error={error} onRetry={handleRetry} />;
  }

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            SecureCode
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connexion à la plateforme...
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {user && <Navigation />}
      <Routes>
        <Route path="/connexion" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/inscription" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/tableau-de-bord" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/analyseur" element={
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        } />
        <Route path="/apprentissage" element={
          <ProtectedRoute>
            <Learning />
          </ProtectedRoute>
        } />
        <Route path="/profil" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/parametres" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        {/* Route de démonstration pour accès sans auth */}
        <Route path="/demo" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700 p-4">
              <div className="container mx-auto text-center">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <h1 className="text-xl font-bold text-blue-900 dark:text-blue-300">
                  SecureCode - Mode Démonstration
                </h1>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  Explorez l'analyseur de sécurité sans authentification
                </p>
              </div>
            </div>
            <Scanner />
          </div>
        } />
        
        {/* Redirection par défaut */}
        <Route path="/" element={
          <Navigate to={user ? "/tableau-de-bord" : "/connexion"} replace />
        } />
        
        {/* Route 404 */}
        <Route path="*" element={
          <Navigate to={user ? "/tableau-de-bord" : "/connexion"} replace />
        } />
      </Routes>
    </div>
  );
}

function App() {
  console.log('🚀 Initialisation de l\'application SecureCode');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;