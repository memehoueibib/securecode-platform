import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader,
  UserPlus,
  Settings,
  X,
  Save,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AdminUser, UserRole } from '../../types/admin';
import { AdminService } from '../../services/adminService';
import { AdminSyncService } from '../../services/adminSyncService';
import { supabase } from '../../lib/supabase';

function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newUser, setNewUser] = useState({
    nom: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    department: '',
    team: ''
  });
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    email: '',
    role: 'user' as UserRole,
    status: 'active',
    department: '',
    team: ''
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loadingRetries, setLoadingRetries] = useState(0);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'admin_org', label: 'Admin Organisation' },
    { value: 'manager', label: 'Manager' },
    { value: 'tech_lead', label: 'Tech Lead' },
    { value: 'senior_dev', label: 'Développeur Senior' },
    { value: 'junior_dev', label: 'Développeur Junior' },
    { value: 'security_expert', label: 'Expert Sécurité' },
    { value: 'security_analyst', label: 'Analyste Sécurité' },
    { value: 'ciso', label: 'CISO' },
    { value: 'project_manager', label: 'Chef de Projet' },
    { value: 'director', label: 'Directeur' },
    { value: 'user', label: 'Utilisateur' }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les profils directement depuis Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setMessage({type: 'error', text: 'Erreur lors du chargement des utilisateurs'});
        
        // Réessayer si moins de 3 tentatives ont été faites
        if (loadingRetries < 3) {
          console.log(`Nouvelle tentative de chargement (${loadingRetries + 1}/3) dans 2 secondes...`);
          setLoadingRetries(prev => prev + 1);
          setTimeout(() => {
            loadUsers();
          }, 2000);
        } else {
          // Utiliser des données simulées après 3 échecs
          const userData = AdminService.getAllUsers();
          setUsers(userData);
        }
      } else {
        // Transformer les profils en format AdminUser
        const adminUsers: AdminUser[] = data.map(profile => ({
          id: profile.id,
          email: profile.email,
          nom: profile.nom,
          role: AdminService.determineUserRole(profile.email, profile.niveau),
          status: AdminService.determineUserStatus(profile.updated_at),
          last_login: profile.updated_at,
          created_at: profile.created_at,
          permissions: [],
          niveau: profile.niveau,
          points: profile.points,
          score_securite: profile.score_securite
        }));
        
        setUsers(adminUsers);
        console.log('Utilisateurs chargés avec succès:', adminUsers.length);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setMessage({type: 'error', text: 'Erreur lors du chargement des utilisateurs'});
      
      // Utiliser des données simulées en cas d'erreur
      const userData = AdminService.getAllUsers();
      setUsers(userData);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role: UserRole) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nom || !newUser.email || !newUser.password) {
      setMessage({type: 'error', text: 'Veuillez remplir tous les champs obligatoires'});
      return;
    }

    try {
      setCreating(true);
      setMessage(null);
      
      // Utiliser le service de synchronisation admin
      const success = await AdminSyncService.createUserFromAdmin({
        nom: newUser.nom,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        department: newUser.department,
        team: newUser.team
      });
      
      if (success) {
        setShowAddUser(false);
        setNewUser({ nom: '', email: '', password: '', role: 'user', department: '', team: '' });
        await loadUsers(); // Recharger la liste
        
        // Notification de succès
        setMessage({type: 'success', text: 'Utilisateur créé avec succès ! Les changements sont synchronisés en temps réel.'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la création de l\'utilisateur'});
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      setMessage({type: 'error', text: 'Erreur lors de la création de l\'utilisateur'});
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      nom: user.nom,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department_id || '',
      team: user.team_id || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUpdating(true);
      setMessage(null);
      
      const success = await AdminSyncService.updateUserFromAdmin(editingUser.id, {
        nom: editForm.nom,
        role: editForm.role,
        status: editForm.status,
        department: editForm.department,
        team: editForm.team
      });
      
      if (success) {
        await loadUsers(); // Recharger la liste
        setShowEditModal(false);
        setEditingUser(null);
        setMessage({type: 'success', text: 'Utilisateur mis à jour ! Les changements sont synchronisés.'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la mise à jour'});
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      setMessage({type: 'error', text: 'Erreur lors de la mise à jour'});
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et sera synchronisée immédiatement.')) {
      return;
    }

    try {
      setMessage(null);
      const success = await AdminService.deleteUser(userId);
      if (success) {
        await loadUsers(); // Recharger la liste
        setMessage({type: 'success', text: 'Utilisateur supprimé ! Les changements sont synchronisés.'});
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({type: 'error', text: 'Erreur lors de la suppression'});
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      setMessage({type: 'error', text: 'Erreur lors de la suppression'});
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;

    const confirmMessage = action === 'delete' 
      ? `⚠️ Supprimer ${selectedUsers.length} utilisateur(s) ? Cette action est irréversible.`
      : `${action === 'activate' ? 'Activer' : 'Désactiver'} ${selectedUsers.length} utilisateur(s) ?`;

    if (!confirm(confirmMessage)) return;

    try {
      setMessage(null);
      for (const userId of selectedUsers) {
        if (action === 'delete') {
          await AdminService.deleteUser(userId);
        } else {
          await AdminSyncService.updateUserFromAdmin(userId, {
            status: action === 'activate' ? 'active' : 'inactive'
          });
        }
      }
      
      setSelectedUsers([]);
      await loadUsers();
      setMessage({type: 'success', text: `Action "${action}" appliquée à ${selectedUsers.length} utilisateur(s) ! Synchronisation en cours...`});
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Erreur action en lot:', error);
      setMessage({type: 'error', text: 'Erreur lors de l\'action en lot'});
    }
  };

  const exportUsers = () => {
    try {
      const usersToExport = filteredUsers.map(user => ({
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: getRoleLabel(user.role),
        status: user.status,
        points: user.points,
        niveau: user.niveau,
        created_at: user.created_at
      }));
      
      const blob = new Blob([JSON.stringify(usersToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs-securecode-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({type: 'success', text: `${usersToExport.length} utilisateurs exportés avec succès`});
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setMessage({type: 'error', text: 'Erreur lors de l\'export des utilisateurs'});
    }
  };

  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ➕ Ajouter un Utilisateur
          </h3>
          <button 
            onClick={() => setShowAddUser(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              value={newUser.nom}
              onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="john.doe@techcorp.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe *
            </label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Mot de passe sécurisé"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle *
            </label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département
            </label>
            <input
              type="text"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Développement, Sécurité, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Équipe
            </label>
            <input
              type="text"
              value={newUser.team}
              onChange={(e) => setNewUser({ ...newUser, team: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Frontend, Backend, etc."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddUser(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {creating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer & Synchroniser
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditUserModal = () => {
    if (!editingUser) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ✏️ Modifier l'Utilisateur
            </h3>
            <button 
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rôle *
              </label>
              <select 
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut *
              </label>
              <select 
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Département
              </label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Équipe
              </label>
              <input
                type="text"
                value={editForm.team}
                onChange={(e) => setEditForm({ ...editForm, team: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {updating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec indicateur de synchronisation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} • 
            <span className="text-green-600 dark:text-green-400 ml-1">
              🔄 Synchronisation temps réel active
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadUsers}
            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
          <button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Utilisateur
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

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="pending">En attente</option>
          </select>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              ✅ {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                ✅ Activer
              </button>
              <button 
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                ⏸️ Désactiver
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  👤 Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🎭 Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  📊 Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🏆 Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun utilisateur trouvé</p>
                    <button
                      onClick={() => setShowAddUser(true)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un utilisateur
                    </button>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.nom.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.nom}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {user.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                        {user.status === 'pending' && <Shield className="h-3 w-3 mr-1" />}
                        {user.status === 'active' ? '✅ Actif' : user.status === 'inactive' ? '❌ Inactif' : '⏳ En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      🏆 {user.points || 0} pts
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Envoyer email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
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
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.length}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.role === 'admin_org').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddUser && <AddUserModal />}

      {/* Modal d'édition d'utilisateur */}
      {showEditModal && <EditUserModal />}

      {/* Notification de synchronisation */}
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        🔄 Synchronisation temps réel active
      </div>
    </div>
  );
}

export default UserManagement;