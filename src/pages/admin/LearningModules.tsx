import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader,
  Save,
  X,
  FileText,
  Code,
  Users,
  Clock
} from 'lucide-react';
import { LearningModule } from '../../types/admin';
import { AdminSyncService } from '../../services/adminSyncService';

function LearningModules() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<LearningModule>({
    title: '',
    description: '',
    content: {
      lessons: [
        {
          title: '',
          content: '',
          codeExample: {
            vulnerable: '',
            secure: ''
          },
          quiz: {
            question: '',
            options: ['', '', '', ''],
            correct: 0
          }
        }
      ]
    },
    difficulty: 'beginner',
    estimatedDuration: 30,
    status: 'draft'
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const modulesData = await AdminSyncService.getAllLearningModules();
      setModules(modulesData);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      setMessage({type: 'error', text: 'Erreur lors du chargement des modules'});
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || module.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      
      const success = await AdminSyncService.createLearningModuleFromAdmin(formData);
      
      if (success) {
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          content: {
            lessons: [
              {
                title: '',
                content: '',
                codeExample: {
                  vulnerable: '',
                  secure: ''
                },
                quiz: {
                  question: '',
                  options: ['', '', '', ''],
                  correct: 0
                }
              }
            ]
          },
          difficulty: 'beginner',
          estimatedDuration: 30,
          status: 'draft'
        });
        
        await loadModules();
        setMessage({type: 'success', text: 'Module créé avec succès !'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la création du module'});
      }
    } catch (error) {
      console.error('Erreur lors de la création du module:', error);
      setMessage({type: 'error', text: 'Erreur lors de la création du module'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditModule = (module: LearningModule) => {
    setSelectedModule(module);
    setFormData({
      ...module,
      content: module.content || {
        lessons: [
          {
            title: '',
            content: '',
            codeExample: {
              vulnerable: '',
              secure: ''
            },
            quiz: {
              question: '',
              options: ['', '', '', ''],
              correct: 0
            }
          }
        ]
      }
    });
    setShowEditModal(true);
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !formData.title || !formData.description) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      
      const success = await AdminSyncService.updateLearningModuleFromAdmin(selectedModule.id!, formData);
      
      if (success) {
        setShowEditModal(false);
        setSelectedModule(null);
        
        await loadModules();
        setMessage({type: 'success', text: 'Module mis à jour avec succès !'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour du module'});
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du module:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour du module'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module ? Cette action est irréversible.')) {
      return;
    }

    try {
      setMessage(null);
      
      // Mettre à jour le module pour le marquer comme archivé au lieu de le supprimer
      const success = await AdminSyncService.updateLearningModuleFromAdmin(moduleId, {
        status: 'archived'
      });
      
      if (success) {
        await loadModules();
        setMessage({type: 'success', text: 'Module archivé avec succès !'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de l\'archivage du module'});
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du module:', error);
      setMessage({type: 'error', text: 'Erreur lors de la suppression du module'});
    }
  };

  const handleAddLesson = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        lessons: [
          ...formData.content.lessons,
          {
            title: '',
            content: '',
            codeExample: {
              vulnerable: '',
              secure: ''
            },
            quiz: {
              question: '',
              options: ['', '', '', ''],
              correct: 0
            }
          }
        ]
      }
    });
  };

  const handleRemoveLesson = (index: number) => {
    const newLessons = [...formData.content.lessons];
    newLessons.splice(index, 1);
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        lessons: newLessons
      }
    });
  };

  const handleLessonChange = (index: number, field: string, value: any) => {
    const newLessons = [...formData.content.lessons];
    newLessons[index] = {
      ...newLessons[index],
      [field]: value
    };
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        lessons: newLessons
      }
    });
  };

  const handleCodeExampleChange = (index: number, type: 'vulnerable' | 'secure', value: string) => {
    const newLessons = [...formData.content.lessons];
    newLessons[index] = {
      ...newLessons[index],
      codeExample: {
        ...newLessons[index].codeExample,
        [type]: value
      }
    };
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        lessons: newLessons
      }
    });
  };

  const handleQuizChange = (index: number, field: string, value: any) => {
    const newLessons = [...formData.content.lessons];
    newLessons[index] = {
      ...newLessons[index],
      quiz: {
        ...newLessons[index].quiz,
        [field]: value
      }
    };
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        lessons: newLessons
      }
    });
  };

  const handleQuizOptionChange = (lessonIndex: number, optionIndex: number, value: string) => {
    const newLessons = [...formData.content.lessons];
    const newOptions = [...newLessons[lessonIndex].quiz.options];
    newOptions[optionIndex] = value;
    newLessons[lessonIndex] = {
      ...newLessons[lessonIndex],
      quiz: {
        ...newLessons[lessonIndex].quiz,
        options: newOptions
      }
    };
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        lessons: newLessons
      }
    });
  };

  const ModuleFormModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? '✏️ Modifier le Module' : '➕ Créer un Nouveau Module'}
          </h3>
          <button 
            onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={isEdit ? handleUpdateModule : handleCreateModule} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Informations Générales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre du module *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Introduction aux vulnérabilités XSS"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulté
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="5"
                  max="180"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="draft">Brouillon</option>
                  <option value="review">En revue</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description du module d'apprentissage"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Leçons */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-white">Leçons</h4>
              <button
                type="button"
                onClick={handleAddLesson}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une leçon
              </button>
            </div>
            
            {formData.content.lessons.map((lesson, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Leçon {index + 1}</h5>
                  {formData.content.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLesson(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titre de la leçon
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ex: Introduction aux attaques XSS"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contenu
                    </label>
                    <textarea
                      value={lesson.content}
                      onChange={(e) => handleLessonChange(index, 'content', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Contenu de la leçon..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code vulnérable
                      </label>
                      <textarea
                        value={lesson.codeExample?.vulnerable || ''}
                        onChange={(e) => handleCodeExampleChange(index, 'vulnerable', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                        placeholder="// Code vulnérable..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Code sécurisé
                      </label>
                      <textarea
                        value={lesson.codeExample?.secure || ''}
                        onChange={(e) => handleCodeExampleChange(index, 'secure', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                        placeholder="// Code sécurisé..."
                      />
                    </div>
                  </div>
                  
                  {/* Quiz */}
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <h6 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Quiz</h6>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Question
                        </label>
                        <input
                          type="text"
                          value={lesson.quiz?.question || ''}
                          onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Ex: Quelle méthode est sécurisée pour afficher du contenu utilisateur ?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Options
                        </label>
                        <div className="space-y-2">
                          {(lesson.quiz?.options || ['', '', '', '']).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                checked={lesson.quiz?.correct === optionIndex}
                                onChange={() => handleQuizChange(index, 'correct', optionIndex)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => handleQuizOptionChange(index, optionIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Sélectionnez la réponse correcte
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
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
                  {isEdit ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Mettre à jour' : 'Créer le Module'}
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
          <p className="text-gray-600 dark:text-gray-400">Chargement des modules d'apprentissage...</p>
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
            Modules d'Apprentissage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les modules de formation pour les utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Module
        </button>
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
            <XCircle className="h-5 w-5 mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des modules..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Toutes les difficultés</option>
            <option value="beginner">Débutant</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="advanced">Avancé</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
            <option value="review">En revue</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </div>

      {/* Liste des modules */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Difficulté
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Leçons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun module trouvé</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un module
                    </button>
                  </td>
                </tr>
              ) : (
                filteredModules.map((module) => (
                  <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {module.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {module.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                        {getDifficultyLabel(module.difficulty)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {module.estimatedDuration} min
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(module.status || 'draft')}`}>
                        {module.status === 'published' ? 'Publié' : 
                         module.status === 'draft' ? 'Brouillon' : 
                         module.status === 'review' ? 'En revue' : 
                         'Archivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {module.content?.lessons?.length || 0} leçon(s)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditModule(module)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Prévisualiser"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => module.id && handleDeleteModule(module.id)}
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {modules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modules Publiés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {modules.filter(m => m.status === 'published').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs Inscrits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* Placeholder - would be replaced with actual data */}
                {Math.floor(Math.random() * 100) + 10}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && <ModuleFormModal />}
      {showEditModal && <ModuleFormModal isEdit={true} />}
    </div>
  );
}

export default LearningModules;