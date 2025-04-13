import UserService, { User, UserResponse, UserUpdateData } from '@/services/UserService';
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer la liste des utilisateurs
 * @param initialDepartment Département initial pour le filtrage
 */
export const useUsersList = (initialDepartment: string = '') => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [department, setDepartment] = useState<string>(initialDepartment);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fonction pour rafraîchir les données
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await UserService.getUsers(department || undefined);
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

    fetchUsers();
  }, [department, refreshTrigger]);

  // Changer le département pour le filtrage
  const changeDepartment = useCallback((newDepartment: string) => {
    setDepartment(newDepartment);
  }, []);

  return {
    users,
    loading,
    error,
    department,
    changeDepartment,
    refreshData
  };
};

/**
 * Hook pour gérer un utilisateur spécifique
 * @param userId ID de l'utilisateur
 */
export const useUserProfile = (userId: string | number) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fonction pour rafraîchir les données
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Charger le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const userData = await UserService.getUserById(userId);
        if (userData) {
          setUser(userData);
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
    };

    fetchUserProfile();
  }, [userId, refreshTrigger]);

  // Mettre à jour un utilisateur
  const updateUser = useCallback(async (userData: UserUpdateData): Promise<UserResponse> => {
    setLoading(true);
    try {
      const response = await UserService.updateUser(userData);
      if (response.success) {
        refreshData();
        return response;
      } else {
        setError(response.msg || 'Erreur lors de la mise à jour');
        return response;
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      const errorResponse = { success: false, msg: 'Erreur de connexion au serveur' };
      setError(errorResponse.msg);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // Mettre à jour le profil avec avatar
  const updateProfile = useCallback(async (formData: FormData): Promise<UserResponse> => {
    setLoading(true);
    try {
      const response = await UserService.updateProfile(userId, formData);
      if (response.success) {
        refreshData();
        return response;
      } else {
        setError(response.msg || 'Erreur lors de la mise à jour du profil');
        return response;
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      const errorResponse = { success: false, msg: 'Erreur de connexion au serveur' };
      setError(errorResponse.msg);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  }, [userId, refreshData]);

  return {
    user,
    loading,
    error,
    updateUser,
    updateProfile,
    refreshData
  };
};

/**
 * Hook pour gérer le formulaire d'édition d'utilisateur
 * @param initialData Données initiales du formulaire
 */
export const useUserForm = (initialData: Partial<UserUpdateData> = {}) => {
  const [formData, setFormData] = useState<UserUpdateData>({
    userID: initialData.userID || '',
    username: initialData.username || '',
    email: initialData.email || '',
    departement: initialData.departement || 'IT',
    is_active: initialData.is_active !== undefined ? initialData.is_active : true,
    is_staff: initialData.is_staff || false,
    is_superuser: initialData.is_superuser || false,
    password: initialData.password || '',
  });

  // Mettre à jour le formulaire avec de nouvelles données
  const updateFormData = useCallback((newData: Partial<UserUpdateData>) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  // Gérer les changements dans le formulaire
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const inputValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
    }));
  }, []);

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData({
      userID: initialData.userID || '',
      username: initialData.username || '',
      email: initialData.email || '',
      departement: initialData.departement || 'IT',
      is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      is_staff: initialData.is_staff || false,
      is_superuser: initialData.is_superuser || false,
      password: initialData.password || '',
    });
  }, [initialData]);

  return {
    formData,
    handleChange,
    updateFormData,
    resetForm
  };
};

/**
 * Hook pour gérer le contexte d'authentification utilisateur
 */
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier la session active au chargement
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        // Ceci est un exemple - vous devrez adapter selon votre API d'authentification
        const response = await fetch('/api/checkSession', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('accessToken');
        }
      } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
        setError('Erreur de vérification de la session');
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem('accessToken')) {
      checkSession();
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  // Fonction de connexion
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Ceci est un exemple - vous devrez adapter selon votre API d'authentification
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('accessToken', data.token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        return true;
      } else {
        setError(data.msg || 'Erreur de connexion');
        return false;
      }
    } catch (err) {
        console.error('Erreur de connexion au serveur:', err);
      setError('Erreur de connexion au serveur');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      // Ceci est un exemple - vous devrez adapter selon votre API d'authentification
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      localStorage.removeItem('accessToken');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };
};