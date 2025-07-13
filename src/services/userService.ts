import api from "./api";
import { logger } from "../utils/logger";

export interface StaffUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
  photoProfil?: string;
  dateCreation: string;
  dateModification?: string;
  codeAcces?: string;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier?: boolean;
  actif?: boolean;
  motDePasse?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

export class UserService {
  static async getUsers(): Promise<StaffUser[]> {
    const response = await api.get("/users");
    // La réponse backend a la structure { success: true, data: { users, pagination }, message }
    return response.data.data.users || [];
  }

  static async getUserById(id: string): Promise<StaffUser> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  }
  static async createUser(userData: CreateUserRequest): Promise<StaffUser> {
    // Utiliser l'endpoint spécialisé pour créer du staff
    logger.debug("Données envoyées au backend:", userData);
    const response = await api.post("/users/staff", userData);
    return response.data.data;
  }

  static async updateUser(
    id: string,
    userData: Partial<CreateUserRequest>
  ): Promise<StaffUser> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  static async toggleUserStatus(id: string): Promise<StaffUser> {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data.data;
  }

  static async getUserAccessCode(id: string): Promise<any> {
    logger.info(
      `🔍 [Frontend] Récupération du code d'accès pour l'utilisateur ID: ${id}`
    );
    try {
      const response = await api.get(`/users/${id}/access-code`);
      logger.info(`✅ [Frontend] Code d'accès récupéré:`, response.data.data);
      return response.data.data;
    } catch (error) {
      logger.error(
        `❌ [Frontend] Erreur lors de la récupération du code:`,
        error
      );
      throw error;
    }
  }

  static async generateAccessCode(id: string): Promise<any> {
    logger.info(
      `🔄 [Frontend] Début de régénération de code d'accès pour l'utilisateur ID: ${id}`
    );
    try {
      const response = await api.post(`/users/${id}/access-code/generate`);
      logger.info(
        `🎉 [Frontend] Code d'accès regénéré avec succès:`,
        response.data.data
      );
      return response.data.data;
    } catch (error) {
      logger.error(
        `❌ [Frontend] Erreur lors de la régénération du code:`,
        error
      );
      throw error;
    }
  }

  static async permanentlyDeleteUser(id: string): Promise<boolean> {
    logger.info(
      `🗑️ [Frontend] Suppression définitive de l'utilisateur ID: ${id}`
    );
    try {
      const response = await api.delete(`/users/${id}/permanent`);
      logger.info(
        `✅ [Frontend] Utilisateur supprimé définitivement avec succès`
      );
      return response.data.success;
    } catch (error) {
      logger.error(
        `❌ [Frontend] Erreur lors de la suppression définitive:`,
        error
      );
      throw error;
    }
  }
}
