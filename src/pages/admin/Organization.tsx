import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  UserPlus,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Loader,
  Save,
  X,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { Department, Team, OrganizationMember } from '../../types/admin';

function Organization() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepartments, setExpandedDepartments] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [departmentForm, setDepartmentForm] = useState({
    id: '',
    name: '',
    description: ''
  });
  
  const [teamForm, setTeamForm] = useState({
    id: '',
    name: '',
    description: '',
    departmentId: ''
  });
  
  const [memberForm, setMemberForm] = useState({
    userId: '',
    departmentId: '',
    teamId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Charger les départements
      const departmentsData = await AdminService.getAllDepartments();
      setDepartments(departmentsData);
      
      // Charger les équipes
      const teamsData = await AdminService.getAllTeams();
      setTeams(teamsData);
      
      // Charger les membres
      const membersData = await AdminService.getAllOrganizationMembers();
      setMembers(membersData);
      
      // Initialiser les départements comme fermés
      const expandedState: Record<string, boolean> = {};
      departmentsData.forEach(dept => {
        expandedState[dept.id] = false;
      });
      setExpandedDepartments(expandedState);
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'organisation:', error);
      setMessage({type: 'error', text: 'Erreur lors du chargement des données'});
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (deptId: string) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const getDepartmentTeams = (deptId: string) => {
    return teams.filter(team => team.departmentId === deptId);
  };

  const getDepartmentMembers = (deptId: string) => {
    return members.filter(member => member.departmentId === deptId && !member.teamId);
  };

  const getTeamMembers = (teamId: string) => {
    return members.filter(member => member.teamId === teamId);
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentForm.name) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      
      // Simuler l'ajout d'un département
      const newDepartment: Department = {
        id: `dept-${Date.now()}`,
        name: departmentForm.name,
        description: departmentForm.description
      };
      
      setDepartments([...departments, newDepartment]);
      setShowAddDepartmentModal(false);
      setDepartmentForm({
        id: '',
        name: '',
        description: ''
      });
      
      setMessage({type: 'success', text: 'Département ajouté avec succès !'});
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du département:', error);
      setMessage({type: 'error', text: 'Erreur lors de l\'ajout du département'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.departmentId) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      
      // Simuler l'ajout d'une équipe
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        departmentId: teamForm.departmentId,
        name: teamForm.name,
        description: teamForm.description
      };
      
      setTeams([...teams, newTeam]);
      setShowAddTeamModal(false);
      setTeamForm({
        id: '',
        name: '',
        description: '',
        departmentId: ''
      });
      
      setMessage({type: 'success', text: 'Équipe ajoutée avec succès !'});
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'équipe:', error);
      setMessage({type: 'error', text: 'Erreur lors de l\'ajout de l\'équipe'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.userId) {
      setMessage({type: 'error', text: 'Veuillez sélectionner un utilisateur'});
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);
      
      // Simuler l'ajout d'un membre
      const existingMember = members.find(m => m.id === memberForm.userId);
      
      if (existingMember) {
        // Mettre à jour le membre existant
        const updatedMembers = members.map(m => 
          m.id === memberForm.userId 
            ? { 
                ...m, 
                departmentId: memberForm.departmentId || m.departmentId, 
                teamId: memberForm.teamId || m.teamId 
              }
            : m
        );
        setMembers(updatedMembers);
      } else {
        // Ajouter un nouveau membre (simulé)
        const newMember: OrganizationMember = {
          id: memberForm.userId,
          name: 'Nouvel Utilisateur',
          email: 'user@example.com',
          role: 'user',
          departmentId: memberForm.departmentId,
          teamId: memberForm.teamId
        };
        setMembers([...members, newMember]);
      }
      
      setShowAddMemberModal(false);
      setMemberForm({
        userId: '',
        departmentId: '',
        teamId: ''
      });
      
      setMessage({type: 'success', text: 'Membre ajouté avec succès !'});
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
      setMessage({type: 'error', text: 'Erreur lors de l\'ajout du membre'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const AddDepartmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter un Département
          </h3>
          <button 
            onClick={() => setShowAddDepartmentModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddDepartment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du département *
            </label>
            <input
              type="text"
              value={departmentForm.name}
              onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Développement"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={departmentForm.description}
              onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Description du département"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddDepartmentModal(false)}
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
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddTeamModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter une Équipe
          </h3>
          <button 
            onClick={() => setShowAddTeamModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddTeam} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département *
            </label>
            <select
              value={teamForm.departmentId}
              onChange={(e) => setTeamForm({ ...teamForm, departmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Sélectionner un département</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'équipe *
            </label>
            <input
              type="text"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ex: Frontend"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Description de l'équipe"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddTeamModal(false)}
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
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddMemberModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ajouter un Membre
          </h3>
          <button 
            onClick={() => setShowAddMemberModal(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Utilisateur *
            </label>
            <select
              value={memberForm.userId}
              onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {/* Simuler des utilisateurs */}
              <option value="user1">John Doe (john@example.com)</option>
              <option value="user2">Jane Smith (jane@example.com)</option>
              <option value="user3">Bob Johnson (bob@example.com)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département
            </label>
            <select
              value={memberForm.departmentId}
              onChange={(e) => setMemberForm({ ...memberForm, departmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Aucun département</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Équipe
            </label>
            <select
              value={memberForm.teamId}
              onChange={(e) => setMemberForm({ ...memberForm, teamId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={!memberForm.departmentId}
            >
              <option value="">Aucune équipe</option>
              {memberForm.departmentId && getDepartmentTeams(memberForm.departmentId).map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddMemberModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter
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
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'organisation...</p>
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
            Organisation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez la structure de votre organisation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddDepartmentModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Département
          </button>
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Équipe
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Membre
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
            <XCircle className="h-5 w-5 mr-2" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans l'organisation..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Structure de l'organisation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Structure Organisationnelle
        </h2>
        
        {filteredDepartments.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun département trouvé</p>
            <button
              onClick={() => setShowAddDepartmentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un département
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                {/* En-tête du département */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => toggleDepartment(department.id)}
                >
                  <div className="flex items-center">
                    {expandedDepartments[department.id] ? (
                      <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg mr-3">
                      <Briefcase className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {department.name}
                      </h3>
                      {department.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {department.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getDepartmentTeams(department.id).length} équipe(s)
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDepartment(department);
                        setDepartmentForm({
                          id: department.id,
                          name: department.name,
                          description: department.description || ''
                        });
                        // Ouvrir modal d'édition (à implémenter)
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Contenu du département (équipes et membres) */}
                {expandedDepartments[department.id] && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {/* Équipes */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Équipes
                        </h4>
                        <button
                          onClick={() => {
                            setTeamForm({
                              ...teamForm,
                              departmentId: department.id
                            });
                            setShowAddTeamModal(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter
                        </button>
                      </div>
                      
                      <div className="space-y-2 pl-6">
                        {getDepartmentTeams(department.id).length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Aucune équipe
                          </p>
                        ) : (
                          getDepartmentTeams(department.id).map((team) => (
                            <div key={team.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg mr-2">
                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                      {team.name}
                                    </h5>
                                    {team.description && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {team.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {getTeamMembers(team.id).length} membre(s)
                                  </span>
                                  <button 
                                    onClick={() => {
                                      setSelectedTeam(team);
                                      setTeamForm({
                                        id: team.id,
                                        name: team.name,
                                        description: team.description || '',
                                        departmentId: team.departmentId
                                      });
                                      // Ouvrir modal d'édition (à implémenter)
                                    }}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Membres de l'équipe */}
                              {getTeamMembers(team.id).length > 0 && (
                                <div className="mt-3 pl-6 space-y-1.5">
                                  <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Membres:
                                  </h6>
                                  {getTeamMembers(team.id).map((member) => (
                                    <div key={member.id} className="flex items-center justify-between text-xs">
                                      <div className="flex items-center">
                                        <User className="h-3 w-3 text-gray-400 mr-1" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                          {member.name}
                                        </span>
                                      </div>
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {member.role}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Membres directs du département */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Membres directs
                        </h4>
                        <button
                          onClick={() => {
                            setMemberForm({
                              ...memberForm,
                              departmentId: department.id,
                              teamId: ''
                            });
                            setShowAddMemberModal(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter
                        </button>
                      </div>
                      
                      <div className="space-y-2 pl-6">
                        {getDepartmentMembers(department.id).length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Aucun membre direct
                          </p>
                        ) : (
                          getDepartmentMembers(department.id).map((member) => (
                            <div key={member.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-1">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <span className="text-gray-900 dark:text-white">
                                    {member.name}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                    {member.email}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                                {member.role}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Building2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Départements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {departments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Équipes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {teams.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <User className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Membres</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {members.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showAddDepartmentModal && <AddDepartmentModal />}
      {showAddTeamModal && <AddTeamModal />}
      {showAddMemberModal && <AddMemberModal />}
    </div>
  );
}

export default Organization;