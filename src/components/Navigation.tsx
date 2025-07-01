import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  BarChart3, 
  Search, 
  BookOpen, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de Bord', href: '/tableau-de-bord', icon: BarChart3 },
    { name: 'Analyseur', href: '/analyseur', icon: Search },
    { name: 'Apprentissage', href: '/apprentissage', icon: BookOpen },
    { name: 'Profil', href: '/profil', icon: User },
    { name: 'Paramètres', href: '/parametres', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = async () => {
    await signOut();
    navigate('/connexion');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/tableau-de-bord" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SecureCode
              </span>
            </Link>
          </div>

          {/* Navigation principale - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Actions utilisateur - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Bonjour, {profile?.nom || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-700 dark:text-gray-300 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-2"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {profile?.nom || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 py-1 rounded-md text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;