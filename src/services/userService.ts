import api from "./api";

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
    console.log("Données envoyées au backend:", userData);
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

  static async getUserAccessCode(id: string): Promise<{ codeAcces: string }> {
    const response = await api.get(`/users/${id}/access-code`);
    return response.data.data;
  }
  static async generateAccessCode(id: string): Promise<{ codeAcces: string }> {
    const response = await api.post(`/users/${id}/access-code/generate`);
    return response.data.data;
  }
}
