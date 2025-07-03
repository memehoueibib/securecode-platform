import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Play, 
  ArrowRight,
  Code,
  Shield,
  AlertTriangle,
  Key,
  Award,
  Target,
  Loader,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LearningService } from '../services/learningService';
import { LearningProgress as DBLearningProgress } from '../lib/supabase';
import { LearningModule as AdminLearningModule } from '../types/admin';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  duration: string;
  lessons: Lesson[];
  completed: boolean;
  locked: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  codeExample: {
    vulnerable: string;
    secure: string;
  };
  quiz?: {
    question: string;
    options: string[];
    correct: number;
  };
}

function Learning() {
  const { user, profile } = useAuth();
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userProgress, setUserProgress] = useState<DBLearningProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminModules, setAdminModules] = useState<AdminLearningModule[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingRetries, setLoadingRetries] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const loadData = async () => {
      if (!user) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        // Charger la progression de l'utilisateur
        const progress = await LearningService.getUserProgress(user.id);
        if (isMounted) {
          setUserProgress(progress);
        }
        
        // Utiliser des modules par défaut au lieu de charger depuis la base de données
        // pour éviter les erreurs de relation dans Supabase
        const defaultModules = getDefaultModules();
        if (isMounted) {
          setAdminModules(defaultModules);
          
          // Convertir les modules admin en format utilisateur
          const convertedModules = defaultModules.map(module => convertAdminModule(module, progress));
          setLearningModules(convertedModules);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des modules:', error);
        if (isMounted) {
          setError('Erreur lors du chargement des modules');
          
          // Réessayer si moins de 3 tentatives ont été faites
          if (loadingRetries < 3) {
            console.log(`⚠️ Nouvelle tentative de chargement (${loadingRetries + 1}/3) dans 2 secondes...`);
            setLoadingRetries(prev => prev + 1);
            retryTimeout = setTimeout(() => {
              loadData();
            }, 2000);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user, loadingRetries]);

  // Modules par défaut pour éviter les erreurs de chargement depuis Supabase
  const getDefaultModules = (): AdminLearningModule[] => {
    return [
      {
        id: 'module-xss',
        title: 'Vulnérabilités XSS',
        description: 'Comprendre et prévenir les attaques Cross-Site Scripting',
        content: {
          lessons: [
            {
              title: 'Introduction aux XSS',
              content: 'Les attaques XSS (Cross-Site Scripting) permettent à un attaquant d\'injecter du code JavaScript malveillant qui s\'exécute dans le navigateur des utilisateurs. Ces attaques peuvent voler des cookies, des jetons de session ou d\'autres informations sensibles.',
              codeExample: {
                vulnerable: 'document.getElementById("output").innerHTML = userInput;',
                secure: 'document.getElementById("output").textContent = userInput;'
              },
              quiz: {
                question: 'Quelle méthode est la plus sûre pour afficher du contenu utilisateur dans le DOM ?',
                options: ['innerHTML', 'textContent', 'outerHTML', 'insertAdjacentHTML'],
                correct: 1
              }
            }
          ]
        },
        difficulty: 'beginner',
        estimatedDuration: 30,
        status: 'published'
      },
      {
        id: 'module-injection',
        title: 'Injection de Code',
        description: 'Comprendre les risques liés à l\'injection de code et comment les éviter',
        content: {
          lessons: [
            {
              title: 'Dangers de eval()',
              content: 'La fonction eval() exécute du code JavaScript arbitraire, ce qui peut être extrêmement dangereux si elle est utilisée avec des entrées utilisateur non validées.',
              codeExample: {
                vulnerable: 'eval("console.log(" + userInput + ")");',
                secure: 'console.log(JSON.parse(userInput));'
              },
              quiz: {
                question: 'Quelle alternative sécurisée peut-on utiliser à la place de eval() pour parser du JSON ?',
                options: ['JSON.eval()', 'JSON.parse()', 'Function()', 'new Function()'],
                correct: 1
              }
            }
          ]
        },
        difficulty: 'intermediate',
        estimatedDuration: 45,
        status: 'published'
      },
      {
        id: 'module-secrets',
        title: 'Gestion des Secrets',
        description: 'Bonnes pratiques pour gérer les mots de passe et clés API',
        content: {
          lessons: [
            {
              title: 'Secrets dans le code',
              content: 'Stocker des secrets (mots de passe, clés API, jetons) directement dans le code source est une mauvaise pratique de sécurité. Ces informations peuvent être exposées si le code est partagé ou si le dépôt est public.',
              codeExample: {
                vulnerable: 'const apiKey = "sk_test_abcdef123456";',
                secure: 'const apiKey = process.env.API_KEY;'
              },
              quiz: {
                question: 'Quelle est la meilleure façon de gérer les secrets dans une application ?',
                options: ['Les coder en dur dans le code source', 'Les stocker dans un fichier de configuration public', 'Utiliser des variables d\'environnement', 'Les commenter dans le code'],
                correct: 2
              }
            }
          ]
        },
        difficulty: 'beginner',
        estimatedDuration: 25,
        status: 'published'
      }
    ];
  };

  // Convertir un module admin en format utilisateur
  const convertAdminModule = (adminModule: AdminLearningModule, progress: DBLearningProgress[]): LearningModule => {
    // Déterminer l'icône en fonction de la catégorie
    let icon: React.ElementType = BookOpen;
    if (adminModule.title?.toLowerCase().includes('xss')) {
      icon = Code;
    } else if (adminModule.title?.toLowerCase().includes('injection')) {
      icon = AlertTriangle;
    } else if (adminModule.title?.toLowerCase().includes('secret')) {
      icon = Key;
    }
    
    // Convertir la difficulté
    let difficulty: 'debutant' | 'intermediaire' | 'avance' = 'debutant';
    if (adminModule.difficulty === 'intermediate') {
      difficulty = 'intermediaire';
    } else if (adminModule.difficulty === 'advanced') {
      difficulty = 'avance';
    }
    
    // Récupérer la progression de l'utilisateur
    const userModuleProgress = progress.find(p => p.module_id === adminModule.id);
    
    // Convertir les leçons
    const lessons: Lesson[] = [];
    if (adminModule.content && adminModule.content.lessons) {
      adminModule.content.lessons.forEach((lesson: any, index: number) => {
        lessons.push({
          id: `${adminModule.id}-lesson-${index}`,
          title: lesson.title || `Leçon ${index + 1}`,
          content: lesson.content || '',
          codeExample: {
            vulnerable: lesson.codeExample?.vulnerable || '',
            secure: lesson.codeExample?.secure || ''
          },
          quiz: lesson.quiz ? {
            question: lesson.quiz.question || '',
            options: lesson.quiz.options || [],
            correct: lesson.quiz.correct || 0
          } : undefined
        });
      });
    }
    
    return {
      id: adminModule.id || `module-${Date.now()}`,
      title: adminModule.title || 'Module sans titre',
      description: adminModule.description || '',
      icon,
      difficulty,
      duration: `${adminModule.estimatedDuration || 30} min`,
      lessons,
      completed: userModuleProgress?.termine || false,
      locked: false,
      progress: userModuleProgress?.progression || 0
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'debutant': return 'bg-green-100 text-green-800';
      case 'intermediaire': return 'bg-yellow-100 text-yellow-800';
      case 'avance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartModule = (module: LearningModule) => {
    setSelectedModule(module);
    setCurrentLesson(0);
    setQuizCompleted(false);
    setShowQuiz(false);
    setSelectedAnswer(null);
  };

  const handleNextLesson = async () => {
    if (selectedModule && currentLesson < selectedModule.lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setQuizCompleted(false);
      
      // Mettre à jour la progression
      const newProgress = Math.round(((currentLesson + 2) / selectedModule.lessons.length) * 100);
      await updateProgress(newProgress, false);
    }
  };

  const handleCompleteModule = async () => {
    if (selectedModule && user) {
      await updateProgress(100, true);
      await loadUserProgress();
      setSelectedModule(null);
    }
  };

  const updateProgress = async (progression: number, termine: boolean) => {
    if (!selectedModule || !user) return;

    try {
      await LearningService.updateModuleProgress(
        user.id,
        selectedModule.id,
        selectedModule.title,
        progression,
        termine
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    }
  };

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      const progress = await LearningService.getUserProgress(user.id);
      setUserProgress(progress);
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const currentLessonData = selectedModule?.lessons[currentLesson];
    if (currentLessonData?.quiz && answerIndex === currentLessonData.quiz.correct) {
      setQuizCompleted(true);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setLoadingRetries(0);
    setDataLoaded(false);
    
    // Forcer une nouvelle tentative de chargement
    if (user) {
      const loadData = async () => {
        try {
          // Charger la progression de l'utilisateur
          const progress = await LearningService.getUserProgress(user.id);
          setUserProgress(progress);
          
          // Utiliser des modules par défaut
          const defaultModules = getDefaultModules();
          setAdminModules(defaultModules);
          
          // Convertir les modules admin en format utilisateur
          const convertedModules = defaultModules.map(module => convertAdminModule(module, progress));
          setLearningModules(convertedModules);
          
          setDataLoaded(true);
        } catch (error) {
          console.error('Erreur lors du rechargement des modules:', error);
          setError('Erreur lors du chargement des modules');
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    } else {
      setLoading(false);
    }
  };

  if (loading && !dataLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement des modules d'apprentissage...</p>
            {loadingRetries > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Tentative {loadingRetries}/3...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (selectedModule) {
    const lesson = selectedModule.lessons[currentLesson];
    const isLastLesson = currentLesson === selectedModule.lessons.length - 1;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setSelectedModule(null)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            ← Retour aux modules
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedModule.title}
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedModule.difficulty)}`}>
              {selectedModule.difficulty}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Leçon {currentLesson + 1} sur {selectedModule.lessons.length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {lesson.title}
            </h2>
            
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {lesson.content}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                  ❌ Code Vulnérable
                </h3>
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                  <pre className="text-sm text-red-800 dark:text-red-300 overflow-x-auto">
                    <code>{lesson.codeExample.vulnerable}</code>
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                  ✅ Code Sécurisé
                </h3>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <pre className="text-sm text-green-800 dark:text-green-300 overflow-x-auto">
                    <code>{lesson.codeExample.secure}</code>
                  </pre>
                </div>
              </div>
            </div>

            {lesson.quiz && !showQuiz && (
              <div className="text-center">
                <button
                  onClick={() => setShowQuiz(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Passer au Quiz
                </button>
              </div>
            )}

            {lesson.quiz && showQuiz && (
              <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quiz
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {lesson.quiz.question}
                </p>
                <div className="space-y-3">
                  {lesson.quiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedAnswer === index
                          ? selectedAnswer === lesson.quiz!.correct
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {selectedAnswer !== null && (
                  <div className="mt-4">
                    {quizCompleted ? (
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        ✅ Bonne réponse ! +10 points
                      </p>
                    ) : (
                      <p className="text-red-600 dark:text-red-400 font-medium">
                        ❌ Mauvaise réponse. La bonne réponse était : {lesson.quiz.options[lesson.quiz.correct]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentLesson + 1) / selectedModule.lessons.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Progression: {currentLesson + 1}/{selectedModule.lessons.length}
                </p>
              </div>
              
              <div>
                {!isLastLesson ? (
                  <button
                    onClick={handleNextLesson}
                    disabled={lesson.quiz && showQuiz && selectedAnswer === null}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteModule}
                    disabled={lesson.quiz && showQuiz && selectedAnswer === null}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Terminer le Module (+50 points)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un message si aucun module n'est disponible
  if (learningModules.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Modules d'Apprentissage
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Apprenez les bonnes pratiques de sécurité avec nos modules interactifs
          </p>
        </div>

        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun module d'apprentissage disponible
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Nos modules d'apprentissage sont en cours de préparation. Revenez bientôt pour découvrir du contenu éducatif sur la sécurité du code.
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Modules d'Apprentissage
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Apprenez les bonnes pratiques de sécurité avec nos modules interactifs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningModules.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun module d'apprentissage disponible pour le moment
            </p>
          </div>
        ) : (
          learningModules.map((module) => {
            const Icon = module.icon;
            const moduleProgress = userProgress.find(p => p.module_id === module.id);
            const isCompleted = moduleProgress?.termine || false;
            const progress = moduleProgress?.progression || 0;
            
            return (
              <div
                key={module.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  {module.locked && (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {module.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {module.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {module.duration}
                  </span>
                </div>

                {progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progression</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => handleStartModule(module)}
                  disabled={module.locked}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Revoir
                    </>
                  ) : module.locked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Verrouillé
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {progress > 0 ? 'Continuer' : 'Commencer'}
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Statistiques de progression */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Votre Progression
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {userProgress.filter(p => p.termine).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Modules Terminés
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {profile?.points || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Points Gagnés
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round((userProgress.filter(p => p.termine).length / Math.max(learningModules.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Progression Globale
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Learning;