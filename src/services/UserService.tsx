import { api, apiClientFile } from "@/services";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date: string;
  departement: 'IT' | 'HR' | 'Inspection' | 'Admin' | 'Formation';
}

export interface UserUpdateData {
  userID: string;
  username?: string;
  email?: string;
  departement?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  password?: string;
}

export interface UserResponse {
  success: boolean;
  users?: User[];
  msg?: string;
}

// Service utilisateurs
export const UserService = {
  /**
   * Récupère la liste des utilisateurs
   * @param department Filtre optionnel par département
   * @returns Liste des utilisateurs
   */
  getUsers: async (department?: string): Promise<UserResponse> => {
    try {
      const params = department ? { department } : {};
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return { success: false, msg: 'Erreur lors de la récupération des utilisateurs', users: [] };
    }
  },

  /**
   * Récupère un utilisateur par son ID
   * @param id ID de l'utilisateur
   * @returns Détails de l'utilisateur
   */
  getUserById: async (id: string | number): Promise<User | null> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.user;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      return null;
    }
  },

  /**
   * Met à jour un utilisateur
   * @param userData Données de l'utilisateur à mettre à jour
   * @returns Résultat de la mise à jour
   */
  updateUser: async (userData: UserUpdateData): Promise<UserResponse> => {
    try {
      const response = await api.post('/edit', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return { success: false, msg: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  },

  /**
   * Change le statut actif d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param isActive Nouveau statut actif
   * @returns Résultat de l'opération
   */
  toggleUserActive: async (userId: string | number, isActive: boolean): Promise<UserResponse> => {
    try {
      const userData: UserUpdateData = {
        userID: userId,
        is_active: isActive
      };
      return await UserService.updateUser(userData);
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'utilisateur:', error);
      return { success: false, msg: 'Erreur lors du changement de statut de l\'utilisateur' };
    }
  },

  /**
   * Met à jour le profil de l'utilisateur avec avatar
   * @param userId ID de l'utilisateur
   * @param formData Données du formulaire avec avatar
   * @returns Résultat de l'opération
   */
  updateProfile: async (userId: string | number, formData: FormData): Promise<UserResponse> => {
    try {
      // Ajout de l'ID utilisateur au formData
      formData.append('userID', userId.toString());
      
      // Utilisation de l'API client pour les fichiers
      const response = await apiClientFile.post('/edit', formData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { success: false, msg: 'Erreur lors de la mise à jour du profil' };
    }
  },

  /**
   * Change le département d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param department Nouveau département
   * @returns Résultat de l'opération
   */
  changeDepartment: async (userId: string | number, department: string): Promise<UserResponse> => {
    try {
      const userData: UserUpdateData = {
        userID: userId,
        departement: department
      };
      return await UserService.updateUser(userData);
    } catch (error) {
      console.error('Erreur lors du changement de département:', error);
      return { success: false, msg: 'Erreur lors du changement de département' };
    }
  }
};

export default UserService;