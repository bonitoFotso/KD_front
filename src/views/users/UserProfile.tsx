import UserService, { User } from '@/services/UserService';
import React, { useState, useEffect, useCallback } from 'react';

interface UserProfileProps {
  userId: string | number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    departement: string;
    password: string;
    confirmPassword: string;
    avatar?: File | null;
  }>({
    username: '',
    email: '',
    departement: '',
    password: '',
    confirmPassword: '',
    avatar: null
  });


  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await UserService.getUserById(userId);
      if (userData) {
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          departement: userData.departement,
          password: '',
          confirmPassword: '',
          avatar: null
        });
        setError(null);
      } else {
        setError('Impossible de charger les données du profil');
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      setError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  },[userId]);

  // Charger le profil utilisateur
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, userId]);



  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      avatar: file
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que les mots de passe correspondent si fournis
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    
    try {
      // Créer un FormData pour l'envoi avec fichier si nécessaire
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('departement', formData.departement);
      
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }
      
      const response = await UserService.updateProfile(userId, submitData);
      
      if (response.success) {
        setIsEditing(false);
        fetchUserProfile();
      } else {
        setError(response.msg || 'Erreur lors de la mise à jour du profil');
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div>Chargement du profil...</div>;
  }

  if (error && !user) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div>Utilisateur non trouvé</div>;
  }

  return (
    <div className="user-profile">
      <h1>Profil Utilisateur</h1>
      
      {error && <div className="error">{error}</div>}
      
      {!isEditing ? (
        <div className="profile-info">
          <div className="profile-header">
            <div className="avatar">
              {/* Ici vous pouvez afficher l'avatar s'il existe */}
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="user-details">
              <h2>{user.username}</h2>
              <p className="email">{user.email}</p>
              <p className="department">Département: {user.departement}</p>
              <p className="status">
                Statut: <span className={user.is_active ? 'active' : 'inactive'}>
                  {user.is_active ? 'Actif' : 'Inactif'}
                </span>
              </p>
              <p className="member-since">
                Membre depuis: {new Date(user.date).toLocaleDateString()}
              </p>
              <p className="role">
                Rôle: {user.is_superuser ? 'Administrateur' : (user.is_staff ? 'Staff' : 'Utilisateur')}
              </p>
            </div>
          </div>
          
          <button 
            className="edit-button" 
            onClick={() => setIsEditing(true)}
            disabled={loading}
          >
            Modifier mon profil
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <h2>Modifier mon profil</h2>
          
          <div className="form-group">
            <label htmlFor="avatar">Photo de profil</label>
            <input 
              type="file" 
              id="avatar" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="departement">Département</label>
            <select
              id="departement"
              name="departement"
              value={formData.departement}
              onChange={handleInputChange}
              required
            >
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Inspection">Inspection</option>
              <option value="Admin">Admin</option>
              <option value="Formation">Formation</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={!formData.password}
            />
          </div>
          
          <div className="buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  username: user.username,
                  email: user.email,
                  departement: user.departement,
                  password: '',
                  confirmPassword: '',
                  avatar: null
                });
                setError(null);
              }}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;