import UserService, { User, UserUpdateData } from '@/services/UserService';
import React, { useState, useEffect } from 'react';

// Composant pour la gestion des utilisateurs
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserUpdateData>({
    userID: '',
    username: '',
    email: '',
    departement: '',
  });

  // Charger les utilisateurs au chargement du composant
  useEffect(() => {
    fetchUsers();
  }, [selectedDepartment]);

  // Récupérer la liste des utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getUsers(selectedDepartment || undefined);
      if (response.success && response.users) {
        setUsers(response.users);
        setError(null);
      } else {
        setError(response.msg || 'Erreur lors de la récupération des utilisateurs');
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de filtres
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  // Gérer les changements dans le formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));
  };

  // Commencer l'édition d'un utilisateur
  const startEditing = (user: User) => {
    setEditingUser(user);
    setFormData({
      userID: user.id,
      username: user.username,
      email: user.email,
      departement: user.departement,
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser
    });
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingUser(null);
    setFormData({
      userID: '',
      username: '',
      email: '',
      departement: '',
    });
  };

  // Soumettre le formulaire d'édition
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await UserService.updateUser(formData);
      if (response.success) {
        fetchUsers();
        cancelEditing();
      } else {
        setError(response.msg || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Toggle du statut actif d'un utilisateur
  const toggleUserActive = async (userId: string | number, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await UserService.toggleUserActive(userId, !isActive);
      if (response.success) {
        fetchUsers();
      } else {
        setError(response.msg || 'Erreur lors du changement de statut');
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-management">
      <h1>Gestion des utilisateurs</h1>
      
      {/* Filtres */}
      <div className="filters">
        <select value={selectedDepartment} onChange={handleDepartmentChange}>
          <option value="">Tous les départements</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Inspection">Inspection</option>
          <option value="Admin">Admin</option>
          <option value="Formation">Formation</option>
        </select>
        <button onClick={fetchUsers} disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {/* Message d'erreur */}
      {error && <div className="error">{error}</div>}

      {/* Formulaire d'édition */}
      {editingUser && (
        <form onSubmit={handleSubmit} className="edit-form">
          <h2>Modifier l'utilisateur</h2>
          
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username || ''}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="departement">Département</label>
            <select
              id="departement"
              name="departement"
              value={formData.departement || ''}
              onChange={handleFormChange}
              required
            >
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Inspection">Inspection</option>
              <option value="Admin">Admin</option>
              <option value="Formation">Formation</option>
            </select>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleFormChange}
              />
              Actif
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="is_staff"
                checked={formData.is_staff || false}
                onChange={handleFormChange}
              />
              Staff
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="is_superuser"
                checked={formData.is_superuser || false}
                onChange={handleFormChange}
              />
              Administrateur
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe (optionnel)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password || ''}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={cancelEditing} disabled={loading}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des utilisateurs */}
      <div className="users-list">
        {loading && !editingUser ? (
          <p>Chargement des utilisateurs...</p>
        ) : users.length === 0 ? (
          <p>Aucun utilisateur trouvé</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Département</th>
                <th>Statut</th>
                <th>Date de création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className={user.is_active ? '' : 'inactive'}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.departement}</td>
                  <td>{user.is_active ? 'Actif' : 'Inactif'}</td>
                  <td>{new Date(user.date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => startEditing(user)}>
                      Modifier
                    </button>
                    <button onClick={() => toggleUserActive(user.id, user.is_active)}>
                      {user.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;