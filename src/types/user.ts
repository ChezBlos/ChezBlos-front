export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  codeAcces?: string;
  photoProfil?: string;
  actif: boolean;
  isCaissier?: boolean;
  dateCreation: string;
  dateModification?: string;
}

// Type d'affichage incluant le rôle CAISSIER virtuel
export type DisplayRole = "ADMIN" | "SERVEUR" | "CUISINIER" | "CAISSIER";

// Fonction utilitaire pour déterminer le rôle affiché
export const getDisplayRole = (user: User): DisplayRole => {
  if (user.role === "SERVEUR" && user.isCaissier) {
    return "CAISSIER";
  }
  return user.role;
};

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  photoProfil?: string;
  isCaissier?: boolean;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: "ADMIN" | "SERVEUR" | "CUISINIER";
  photoProfil?: string;
  actif?: boolean;
  isCaissier?: boolean;
}
