import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Code, 
  BookOpen, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Star,
  Award,
  Zap,
  Lock,
  Eye,
  Brain,
  Crown,
  Building2,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

function LandingPage() {
  const [activeTab, setActiveTab] = useState('individuals');

  const features = [
    {
      icon: Shield,
      title: 'Analyse de Sécurité Avancée',
      description: 'Détection automatique des vulnérabilités XSS, injection de code, et secrets exposés avec des rapports détaillés.'
    },
    {
      icon: Brain,
      title: 'Intelligence Artificielle',
      description: 'Analyse IA avancée avec support de GPT-4, Claude, et autres modèles pour une détection précise.'
    },
    {
      icon: BookOpen,
      title: 'Formation Interactive',
      description: 'Modules d\'apprentissage gamifiés avec quiz, exercices pratiques et suivi de progression.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Tableaux de bord en temps réel, métriques de sécurité et rapports d\'audit complets.'
    },
    {
      icon: Users,
      title: 'Gestion Multi-Utilisateurs',
      description: 'Système de rôles granulaire, gestion d\'équipes et collaboration en temps réel.'
    },
    {
      icon: Crown,
      title: 'Interface Admin Complète',
      description: 'Panneau d\'administration avancé pour la gestion organisationnelle et la configuration.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Vulnérabilités Détectées' },
    { number: '500+', label: 'Entreprises Clientes' },
    { number: '99.9%', label: 'Précision de Détection' },
    { number: '24/7', label: 'Support Technique' }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'CISO, TechCorp',
      content: 'SecureCode a révolutionné notre approche de la sécurité. Nous avons réduit nos vulnérabilités de 85% en 6 mois.',
      avatar: '👩‍💼'
    },
    {
      name: 'Jean Martin',
      role: 'Lead Developer, StartupXYZ',
      content: 'L\'interface est intuitive et les formations sont excellentes. Nos développeurs adorent l\'aspect gamifié.',
      avatar: '👨‍💻'
    },
    {
      name: 'Sophie Laurent',
      role: 'Security Manager, BigCorp',
      content: 'Le ROI est impressionnant. Nous avons économisé des milliers d\'euros en évitant des incidents de sécurité.',
      avatar: '👩‍🔬'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '29€',
      period: '/mois',
      description: 'Parfait pour les développeurs individuels',
      features: [
        'Analyses illimitées',
        'Détection de base',
        'Modules d\'apprentissage',
        'Support email'
      ],
      cta: 'Commencer gratuitement',
      popular: false
    },
    {
      name: 'Professional',
      price: '99€',
      period: '/mois',
      description: 'Idéal pour les équipes de développement',
      features: [
        'Tout du plan Starter',
        'Analyse IA avancée',
        'Gestion d\'équipe',
        'Rapports personnalisés',
        'Support prioritaire'
      ],
      cta: 'Essai gratuit 14 jours',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: '',
      description: 'Solution complète pour les grandes organisations',
      features: [
        'Tout du plan Professional',
        'Interface admin complète',
        'SSO et intégrations',
        'Formation sur site',
        'Support dédié 24/7'
      ],
      cta: 'Contactez-nous',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                SecureCode
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Tarifs
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                À propos
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/connexion"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Essai Gratuit
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-2" />
                Nouvelle version avec IA intégrée
              </div>
              
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Sécurisez votre code avec
                <span className="text-red-600"> l'Intelligence Artificielle</span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Plateforme complète d'analyse de sécurité, formation interactive et gestion d'équipe. 
                Détectez les vulnérabilités, formez vos développeurs et renforcez votre posture de sécurité.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/inscription"
                  className="inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Essai gratuit 14 jours
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Aucune carte requise
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Support 24/7
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Analyse en cours...</h3>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        Vulnérabilité XSS détectée
                      </span>
                    </div>
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">CRITIQUE</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    <div className="flex items-center">
                      <Code className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Injection de code possible
                      </span>
                    </div>
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">ÉLEVÉ</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">
                        Code sécurisé détecté
                      </span>
                    </div>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">SÉCURISÉ</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Score de sécurité</span>
                    <span className="font-semibold text-gray-900 dark:text-white">78%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Tabs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Une solution pour tous
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Que vous soyez développeur individuel ou grande entreprise
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('individuals')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'individuals'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Développeurs
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'teams'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Équipes
              </button>
              <button
                onClick={() => setActiveTab('enterprise')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'enterprise'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Entreprises
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {activeTab === 'individuals' && (
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Pour les développeurs passionnés
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Code className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Analyse instantanée</h4>
                        <p className="text-gray-600 dark:text-gray-300">Scannez votre code en temps réel et obtenez des suggestions immédiates</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <BookOpen className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Formation continue</h4>
                        <p className="text-gray-600 dark:text-gray-300">Apprenez les meilleures pratiques avec nos modules interactifs</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Award className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Gamification</h4>
                        <p className="text-gray-600 dark:text-gray-300">Gagnez des points et débloquez des réalisations</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'teams' && (
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Pour les équipes agiles
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Users className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Collaboration</h4>
                        <p className="text-gray-600 dark:text-gray-300">Travaillez ensemble sur les vulnérabilités et partagez les bonnes pratiques</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <BarChart3 className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Métriques d'équipe</h4>
                        <p className="text-gray-600 dark:text-gray-300">Suivez les progrès de votre équipe avec des tableaux de bord détaillés</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Politiques de sécurité</h4>
                        <p className="text-gray-600 dark:text-gray-300">Définissez et appliquez des règles de sécurité personnalisées</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'enterprise' && (
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    Pour les grandes organisations
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Building2 className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Gestion multi-tenant</h4>
                        <p className="text-gray-600 dark:text-gray-300">Gérez plusieurs départements et équipes avec des permissions granulaires</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Crown className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Interface admin complète</h4>
                        <p className="text-gray-600 dark:text-gray-300">Panneau d'administration avancé pour la configuration et le monitoring</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Globe className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Intégrations SSO</h4>
                        <p className="text-gray-600 dark:text-gray-300">Connectez-vous avec Active Directory, SAML, et autres systèmes d'authentification</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-red-500 to-blue-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold">Interface Admin</h4>
                  <Crown className="h-8 w-8" />
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Utilisateurs actifs</span>
                      <span className="text-2xl font-bold">1,247</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Score sécurité global</span>
                      <span className="text-2xl font-bold">92%</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/admin"
                  className="inline-flex items-center mt-6 px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Accéder à l'admin
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Avancées
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour sécuriser votre code
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <div className="bg-red-100 dark:bg-red-900 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Plus de 500 entreprises nous font confiance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tarifs Transparents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border-2 ${
                plan.popular 
                  ? 'border-red-500 relative' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Plus populaire
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      {plan.period}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à sécuriser votre code ?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Rejoignez des milliers de développeurs qui font confiance à SecureCode
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-colors"
            >
              <Crown className="mr-2 h-5 w-5" />
              Accès Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-red-500" />
                <span className="ml-2 text-xl font-bold">SecureCode</span>
              </div>
              <p className="text-gray-400 mb-4">
                La plateforme de référence pour la sécurité du code et la formation des développeurs.
              </p>
              <div className="flex space-x-4">
                <Monitor className="h-5 w-5 text-gray-400" />
                <Smartphone className="h-5 w-5 text-gray-400" />
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Intégrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
                <li><a href="#" className="hover:text-white">Partenaires</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white">Statut</a></li>
                <li><a href="#" className="hover:text-white">Communauté</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 SecureCode. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">Confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white">Conditions</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;