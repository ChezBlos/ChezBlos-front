/**
 * Service centralisé pour la gestion des images
 * Gère les avatars, images de menu, et toutes les autres images de l'application
 */

// Configuration des URL d'images
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3000";

// Images par défaut
const DEFAULT_IMAGES = {
  // Avatar par défaut - on génère les initiales
  avatar: null, // Sera géré par generateInitialsAvatar
  // Image de plat par défaut
  menuItem: "/img/plat_petit.png",
  // Logo de l'app
  logo: "/img/logo.png",
  // Placeholder générique
  placeholder: "/img/placeholder.png",
} as const;

/**
 * Interface pour les informations d'avatar avec initiales
 */
interface InitialsAvatar {
  initials: string;
  backgroundColor: string;
  textColor: string;
}

/**
 * Génère un avatar avec initiales basé sur le nom et prénom
 */
export function generateInitialsAvatar(
  nom?: string | null,
  prenom?: string | null
): InitialsAvatar {
  // Protection ultra-robuste pour les paramètres d'entrée
  const nomSafe = nom ? String(nom).trim() : "";
  const prenomSafe = prenom ? String(prenom).trim() : "";

  // Extraire les initiales avec protection
  const firstInitial = prenomSafe.charAt(0)?.toUpperCase() || "";
  const lastInitial = nomSafe.charAt(0)?.toUpperCase() || "";
  const initials = `${firstInitial}${lastInitial}` || "??";

  // Utiliser un background gris uniforme pour tous les avatars
  return {
    initials,
    backgroundColor: "bg-gray-500",
    textColor: "text-white",
  };
}

/**
 * Obtient l'URL d'un avatar utilisateur avec fallback vers les initiales
 */
export function getUserAvatarUrl(
  photoPath?: string | null,
  nom?: string | null,
  prenom?: string | null
): { type: "image" | "initials"; url?: string; initials?: InitialsAvatar } {
  // Si on a une photo, essayer de la charger
  if (photoPath) {
    let imageUrl: string;

    // Si c'est déjà une URL complète
    if (photoPath.startsWith("http")) {
      imageUrl = photoPath;
    }
    // Si c'est un chemin de profil
    else if (
      photoPath.includes("/uploads/profiles/") ||
      photoPath.includes("/profiles/")
    ) {
      imageUrl = `${API_BASE_URL}/auth/profile/photo/${photoPath
        .split("/")
        .pop()}`;
    }
    // Si c'est juste un nom de fichier
    else {
      imageUrl = `${API_BASE_URL}/auth/profile/photo/${photoPath}`;
    }

    return { type: "image", url: imageUrl };
  }

  // Sinon, utiliser les initiales
  return {
    type: "initials",
    initials: generateInitialsAvatar(nom, prenom),
  };
}

// Set pour tracker les images qui ont échoué (évite les requêtes répétées)
const failedImages = new Set<string>();

/**
 * Obtient l'URL d'une image de menu avec fallback et cache des échecs
 */
export function getMenuImageUrl(imagePath?: string | null): string {
  if (!imagePath) {
    return DEFAULT_IMAGES.menuItem;
  }

  // Construire l'URL finale
  let finalUrl: string;

  // Si c'est déjà une URL complète
  if (imagePath.startsWith("http")) {
    finalUrl = imagePath;
  }
  // Si c'est un chemin avec /uploads/
  else if (imagePath.startsWith("/uploads/")) {
    finalUrl = `${IMAGE_BASE_URL}${imagePath}`;
  }
  // Sinon, construire l'URL depuis le dossier menu
  else {
    finalUrl = `${IMAGE_BASE_URL}/uploads/menu/${imagePath}`;
  }

  // Si cette image a déjà échoué, retourner directement l'image par défaut
  if (failedImages.has(finalUrl)) {
    return DEFAULT_IMAGES.menuItem;
  }

  return finalUrl;
}

/**
 * Alias pour getMenuImageUrl pour une meilleure sémantique dans les commandes
 */
export function getOrderItemImage(imagePath?: string | null): string {
  return getMenuImageUrl(imagePath);
}

/**
 * Vérifie si une image existe (pour la précharge)
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Gère l'erreur de chargement d'image (fallback automatique)
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string = DEFAULT_IMAGES.menuItem
): void {
  const target = event.target as HTMLImageElement;
  const currentSrc = target.src;

  // Marquer cette image comme échouée pour éviter les requêtes futures
  if (!currentSrc.includes("plat_petit.png")) {
    failedImages.add(currentSrc);
  }

  // Basculer vers l'image de fallback seulement si ce n'est pas déjà fait
  if (!currentSrc.includes("plat_petit.png")) {
    target.src = fallbackSrc;
  }
}

/**
 * Fonction utilitaire pour réinitialiser le cache des images échouées
 * (utile pour les tests ou si des images sont re-uploadées)
 */
export function clearFailedImagesCache(): void {
  failedImages.clear();
}

/**
 * Constantes d'export pour une utilisation facile
 */
export const IMAGE_DEFAULTS = DEFAULT_IMAGES;
export const IMAGE_CONFIG = {
  API_BASE_URL,
  IMAGE_BASE_URL,
};

/**
 * Types utiles
 */
export type ImageType = keyof typeof DEFAULT_IMAGES;
export type AvatarInfo = ReturnType<typeof getUserAvatarUrl>;
