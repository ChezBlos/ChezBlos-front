import axios from "axios";
import { logger } from "../utils/logger";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://chezblos-back.onrender.com/api";

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
  // DEPRECATED: Utiliser getUserAvatarUrl du imageService à la place
  static getProfilePictureUrl(photoProfil?: string): string {
    logger.warn(
      "ProfileService.getProfilePictureUrl est déprécié. Utilisez getUserAvatarUrl du imageService."
    );

    if (!photoProfil) {
      return "/img/plat_petit.png"; // Image par défaut
    }

    // Si c'est déjà une URL complète, la retourner telle quelle
    if (photoProfil.startsWith("http")) {
      return photoProfil;
    }

    // Extraire le nom du fichier du chemin
    const filename = photoProfil.split("/").pop();
    const IMAGE_BASE_URL = import.meta.env.VITE_API_URL || "";

    // Construire l'URL avec la route spécifique pour les images de profil
    // Ajout d'un paramètre unique pour forcer le rafraîchissement après upload
    return `${IMAGE_BASE_URL}/auth/profile/photo/${filename}?t=${Date.now()}`;
  }
}
