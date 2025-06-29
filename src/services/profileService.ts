import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

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

    const response = await axios.post(
      `${API_BASE_URL}/auth/profile/photo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
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
    const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";

    // Construire l'URL avec la route spécifique pour les images de profil
    // Ajout d'un paramètre unique pour forcer le rafraîchissement après upload
    return `${IMAGE_BASE_URL}/auth/profile/photo/${filename}?t=${Date.now()}`;
  }
}
