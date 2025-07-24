export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER" | "CAISSIER" | "BARMAN";
  codeAcces?: string;
  photoProfil?: string;
  actif: boolean;
  dateCreation: string;
  dateModification?: string;
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER" | "CAISSIER" | "BARMAN";
  photoProfil?: string;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: "ADMIN" | "SERVEUR" | "CUISINIER" | "CAISSIER" | "BARMAN";
  photoProfil?: string;
  actif?: boolean;
}
