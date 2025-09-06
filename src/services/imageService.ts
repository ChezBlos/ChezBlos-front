/**
 * Service centralisé pour la gestion des images
 * Gère les avatars, images de menu avec support Cloudinary + fallback local
 */

// Configuration des URL d'images
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const IMAGE_BASE_URL =
  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:3000";

// Configuration Cloudinary
const CLOUDINARY_CONFIG = {
  cloud_name: "dd0dab4zq",
  base_url: "https://res.cloudinary.com/dd0dab4zq/image/upload",
  auto_format: "f_auto,q_auto", // Format et qualité automatiques
};

// Configuration des logs
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || "debug";
const ENABLE_LOGS =
  LOG_LEVEL !== "error" &&
  (import.meta.env.DEV || import.meta.env.VITE_DEBUG_IMAGES === "true");

/**
 * Fonction de logging conditionnel pour les images
 */
function logImage(message: string, ...args: any[]) {
  if (ENABLE_LOGS) {
    console.log(`🖼️ [IMAGE-SERVICE] ${message}`, ...args);
  }
}

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
 * Obtient l'URL d'un avatar utilisateur avec support Cloudinary et fallback vers les initiales
 */
export function getUserAvatarUrl(
  photoPath?: string | null,
  nom?: string | null,
  prenom?: string | null,
  size: number = 100
): { type: "image" | "initials"; url?: string; initials?: InitialsAvatar } {
  logImage(
    `Demande URL avatar - Path: ${photoPath}, User: ${prenom} ${nom}, Size: ${size}px`
  );

  // Si on a une photo, essayer de la charger
  if (photoPath) {
    let imageUrl: string;

    // Si c'est une URL Cloudinary, l'optimiser
    if (isCloudinaryUrl(photoPath)) {
      logImage("🌩️ Avatar Cloudinary détecté:", photoPath);

      const publicIdMatch = photoPath.match(
        /\/image\/upload\/(?:v\d+\/)?(.+)$/
      );
      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        const transformations = `w_${size},h_${size},c_fill,g_face,${CLOUDINARY_CONFIG.auto_format}`;
        imageUrl = generateCloudinaryUrl(publicId, transformations);
        logImage("✨ URL avatar Cloudinary optimisée:", imageUrl);
      } else {
        imageUrl = photoPath; // Fallback à l'URL originale
        logImage("⚠️ Parsing avatar Cloudinary échoué, URL originale utilisée");
      }
    }
    // Si c'est déjà une URL complète
    else if (photoPath.startsWith("http")) {
      imageUrl = photoPath;
      logImage("🌐 URL avatar externe utilisée:", imageUrl);
    }
    // Si c'est un chemin de profil
    else if (
      photoPath.includes("/uploads/profiles/") ||
      photoPath.includes("/profiles/")
    ) {
      imageUrl = `${API_BASE_URL}/auth/profile/photo/${photoPath
        .split("/")
        .pop()}`;
      logImage("📁 Avatar profil local construit:", imageUrl);
    }
    // Si c'est juste un nom de fichier
    else {
      imageUrl = `${API_BASE_URL}/auth/profile/photo/${photoPath}`;
      logImage("📁 Avatar nom fichier, URL construite:", imageUrl);
    }

    return { type: "image", url: imageUrl };
  }

  // Sinon, utiliser les initiales
  const initials = generateInitialsAvatar(nom, prenom);
  logImage("🔤 Génération initiales avatar:", initials.initials);

  return {
    type: "initials",
    initials,
  };
}

/**
 * Détermine si une URL est une URL Cloudinary
 */
function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

/**
 * Génère une URL Cloudinary optimisée avec transformations
 */
function generateCloudinaryUrl(
  publicId: string,
  transformations: string = CLOUDINARY_CONFIG.auto_format
): string {
  // Nettoyer le public_id (enlever les préfixes Cloudinary s'ils existent)
  const cleanPublicId = publicId.replace(/^.*\/image\/upload\//, "");

  logImage("🏗️ Génération URL Cloudinary base...");
  logImage("📋 Public ID nettoyé:", cleanPublicId);
  logImage("🌐 Base URL:", CLOUDINARY_CONFIG.base_url);

  const url = `${CLOUDINARY_CONFIG.base_url}/${transformations}/${cleanPublicId}`;

  logImage("✨ URL finale générée:", url);

  return url;
}

// Set pour tracker les images qui ont échoué (évite les requêtes répétées)
const failedImages = new Set<string>();

/**
 * Obtient l'URL d'une image de menu avec support Cloudinary et fallback
 * @param imagePath - Chemin vers l'image (peut être null/undefined)
 * @param size - Taille demandée ('small', 'medium', 'large')
 * @returns URL de l'image optimisée ou image par défaut
 */
export function getMenuImageUrl(
  imagePath?: string | null,
  size: "small" | "medium" | "large" = "medium"
): string {
  logImage(`Demande URL menu - Path: ${imagePath}, Size: ${size}`);

  if (!imagePath) {
    logImage(
      "Aucun chemin fourni, retour image par défaut:",
      DEFAULT_IMAGES.menuItem
    );
    return DEFAULT_IMAGES.menuItem;
  }

  // Si c'est déjà une URL Cloudinary complète, l'optimiser
  if (isCloudinaryUrl(imagePath)) {
    logImage("🌩️ URL Cloudinary détectée:", imagePath);

    // Extraire le public_id de l'URL Cloudinary
    const publicIdMatch = imagePath.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
    if (publicIdMatch) {
      const publicId = publicIdMatch[1];
      logImage("🆔 Public ID extrait:", publicId);

      // Transformations selon la taille demandée - format carré préservé
      const sizeTransforms = {
        small: "w_300,h_300,c_fit", // Format carré, image entière visible
        medium: "w_500,h_500,c_fit", // Format carré, image entière visible
        large: "w_700,h_700,c_fit", // Format carré, image entière visible
      };

      const transformations = `${sizeTransforms[size]},${CLOUDINARY_CONFIG.auto_format}`;
      const optimizedUrl = generateCloudinaryUrl(publicId, transformations);
      logImage("✨ URL Cloudinary optimisée générée:", optimizedUrl);
      return optimizedUrl;
    }

    logImage("⚠️ Impossible de parser l'URL Cloudinary, retour URL originale");
    return imagePath;
  }

  // Si c'est déjà une URL HTTP complète (non-Cloudinary)
  if (imagePath.startsWith("http")) {
    logImage("🌐 URL HTTP externe détectée:", imagePath);

    // Si cette image a déjà échoué, retourner l'image par défaut
    if (failedImages.has(imagePath)) {
      logImage(
        "❌ Image précédemment en échec, fallback:",
        DEFAULT_IMAGES.menuItem
      );
      return DEFAULT_IMAGES.menuItem;
    }
    return imagePath;
  }

  // Construire l'URL pour le stockage local
  let finalUrl: string;

  // Si c'est un chemin avec /uploads/
  if (imagePath.startsWith("/uploads/")) {
    finalUrl = `${IMAGE_BASE_URL}${imagePath}`;
    logImage("📁 Chemin uploads détecté, URL locale:", finalUrl);
  }
  // Sinon, construire l'URL depuis le dossier menu
  else {
    finalUrl = `${IMAGE_BASE_URL}/uploads/menu/${imagePath}`;
    logImage("📁 Nom fichier détecté, URL locale construite:", finalUrl);
  }

  // Si cette image a déjà échoué, retourner directement l'image par défaut
  if (failedImages.has(finalUrl)) {
    logImage(
      "❌ Image locale précédemment en échec, fallback:",
      DEFAULT_IMAGES.menuItem
    );
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

  logImage("❌ Erreur chargement image:", currentSrc);

  // Marquer cette image comme échouée pour éviter les requêtes futures
  if (!currentSrc.includes("plat_petit.png")) {
    failedImages.add(currentSrc);
    logImage("📝 Image ajoutée à la liste des échecs");
  }

  // Basculer vers l'image de fallback seulement si ce n'est pas déjà fait
  if (!currentSrc.includes("plat_petit.png")) {
    target.src = fallbackSrc;
    logImage("🔄 Fallback vers:", fallbackSrc);
  } else {
    logImage("⚠️ Image de fallback déjà utilisée, pas de changement");
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
 * Génère une URL Cloudinary avec transformations personnalisées
 * @param publicId Public ID de l'image sur Cloudinary
 * @param transformations Transformations personnalisées
 * @returns URL Cloudinary optimisée
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations?: string
): string {
  if (!publicId) {
    logImage("⚠️ Public ID vide, retour au placeholder");
    return DEFAULT_IMAGES.placeholder;
  }

  const finalTransforms = transformations || CLOUDINARY_CONFIG.auto_format;

  logImage("🔄 Génération URL Cloudinary...");
  logImage("📋 Public ID:", publicId);
  logImage("🛠️ Transformations:", finalTransforms);

  const url = generateCloudinaryUrl(publicId, finalTransforms);

  logImage("📤 URL générée:", url);

  return url;
}

/**
 * Extrait le public_id d'une URL Cloudinary complète
 * @param cloudinaryUrl URL Cloudinary complète
 * @returns Public ID ou null si non trouvé
 */
export function extractCloudinaryPublicId(
  cloudinaryUrl: string
): string | null {
  if (!isCloudinaryUrl(cloudinaryUrl)) {
    logImage("⚠️ URL non-Cloudinary pour extraction Public ID:", cloudinaryUrl);
    return null;
  }

  logImage("🔍 Extraction Public ID depuis URL Cloudinary...");
  logImage("📥 URL source:", cloudinaryUrl);

  const match = cloudinaryUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
  const publicId = match ? match[1] : null;

  if (publicId) {
    logImage("✅ Public ID extrait:", publicId);
  } else {
    logImage("❌ Impossible d'extraire le Public ID");
  }

  return publicId;
}

/**
 * Vérifie si le système utilise Cloudinary (détection automatique)
 * @param imageUrl URL d'exemple d'image
 * @returns true si Cloudinary est utilisé
 */
export function isUsingCloudinary(imageUrl?: string): boolean {
  return imageUrl ? isCloudinaryUrl(imageUrl) : false;
}

/**
 * Constantes d'export pour une utilisation facile
 */
export const IMAGE_DEFAULTS = DEFAULT_IMAGES;
export const IMAGE_CONFIG = {
  API_BASE_URL,
  IMAGE_BASE_URL,
  CLOUDINARY: CLOUDINARY_CONFIG,
};

/**
 * Types utiles
 */
export type ImageType = keyof typeof DEFAULT_IMAGES;
export type AvatarInfo = ReturnType<typeof getUserAvatarUrl>;

/**
 * Exemples d'utilisation :
 *
 * // Pour une image de menu avec taille spécifique et support Cloudinary
 * const imageUrl = getMenuImageUrl(menuItem.image, 'large');
 * <img src={imageUrl} alt="Plat" onError={handleImageError} />
 *
 * // Pour un avatar utilisateur avec taille personnalisée
 * const avatar = getUserAvatarUrl(user.photoProfil, user.nom, user.prenom, 150);
 * if (avatar.type === 'image') {
 *   <img src={avatar.url} alt="Avatar" />
 * } else {
 *   <div className={avatar.initials.backgroundColor}>
 *     {avatar.initials.initials}
 *   </div>
 * }
 *
 * // Pour générer une URL Cloudinary personnalisée
 * const customUrl = getCloudinaryUrl('chez-blos/menu/plat_123', 'w_400,h_300,c_fill,q_80');
 *
 * // Pour vérifier si une image utilise Cloudinary
 * const usingCloudinary = isUsingCloudinary(menuItem.image);
 *
 * // Pour gérer les erreurs d'images automatiquement
 * <img
 *   src={getMenuImageUrl(item.image, 'medium')}
 *   alt="Plat"
 *   onError={handleImageError}
 * />
 */
