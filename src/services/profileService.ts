const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3000/api";

export interface UpdateProfilePictureResponse {
  success: boolean;
  data: {
    id: string;
    nom: string;
    prenom: string;
    email?: string;
    telephone?: string;
    role: string;
    isCaissier: boolean;
    actif: boolean;
    photoProfil?: string;
  };
  message: string;
}

export class ProfileService {
  // Upload d'une photo de profil
  static async updateProfilePicture(
    file: File
  ): Promise<UpdateProfilePictureResponse> {
    const formData = new FormData();
    formData.append("photo", file);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Erreur lors de l'upload de la photo"
      );
    }

    const result = await response.json();
    return result;
  }
  // Récupérer l'URL complète d'une photo de profil
  static getProfilePictureUrl(photoProfil?: string): string {
    if (!photoProfil) {
      return "/avatar.png"; // Image par défaut
    }

    // Si c'est déjà une URL complète, la retourner telle quelle
    if (photoProfil.startsWith("http")) {
      return photoProfil;
    }

    // Extraire le nom du fichier du chemin
    const filename = photoProfil.split("/").pop();

    // Construire l'URL avec la route spécifique pour les images de profil
    return `${API_BASE_URL}/auth/profile/photo/${filename}`;
  }
}
