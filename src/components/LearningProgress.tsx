import React from 'react';
import { BookOpen, CheckCircle, Lock, Star, Trophy, Target, ArrowRight } from 'lucide-react';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  locked: boolean;
  difficulty: 'debutant' | 'intermediaire' | 'avance';
  estimatedTime: string;
}

interface LearningProgressProps {
  modules: LearningModule[];
  totalPoints: number;
  currentLevel: string;
  nextLevel: string;
  progressToNext: number;
}

function LearningProgress({ modules, totalPoints, currentLevel, nextLevel, progressToNext }: LearningProgressProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'debutant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediaire': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'avance': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const completedModules = modules.filter(m => m.completed).length;
  const totalModules = modules.length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progression générale */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progression d'Apprentissage
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedModules}/{totalModules} modules
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progression globale</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalPoints}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedModules}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Terminés</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currentLevel}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Niveau</div>
          </div>
        </div>
      </div>

      {/* Niveau actuel */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 mr-2" />
            <span className="font-semibold">Niveau {currentLevel}</span>
          </div>
          <Star className="h-6 w-6" />
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm text-purple-100 mb-2">
            <span>Progression vers {nextLevel}</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <div className="w-full bg-purple-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-purple-100 text-sm">
          Continuez à apprendre pour débloquer le niveau {nextLevel} !
        </p>
      </div>

      {/* Liste des modules */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Modules Disponibles
          </h3>
          <button
            onClick={() => window.location.href = '/apprentissage'}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            Voir tout
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="space-y-3">
          {modules.slice(0, 3).map((module) => (
            <div
              key={module.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                module.locked 
                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
              onClick={() => !module.locked && (window.location.href = '/apprentissage')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {module.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : module.locked ? (
                    <Lock className="h-5 w-5 text-gray-400" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-blue-500" />
                  )}
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {module.title}
                  </h4>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {module.estimatedTime}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {module.description}
              </p>
              
              {!module.locked && (
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          module.completed ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {module.progress}% terminé
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    module.completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {module.completed ? 'Revoir' : 'Continuer'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Objectifs quotidiens */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Objectifs Quotidiens
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-sm text-green-800 dark:text-green-300">
                Effectuer une analyse de code
              </span>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Terminé
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 rounded-full mr-3"></div>
              <span className="text-sm text-blue-800 dark:text-blue-300">
                Terminer une leçon d'apprentissage
              </span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              En cours
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-gray-400 rounded-full mr-3"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Gagner 50 points
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
              {Math.min(totalPoints, 50)}/50
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningProgress;