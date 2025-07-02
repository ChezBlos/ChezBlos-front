// DEPRECATED: Utiliser getMenuImageUrl du imageService à la place
import { getMenuImageUrl as getMenuImageUrlFromService } from "../services/imageService";
import { logger } from "../utils/logger";
// Fonction utilitaire pour générer l'URL d'une image de menu
// DEPRECATED: Utilisez getMenuImageUrl du imageService
export function getMenuImageUrl(image: string | undefined | null): string {
  logger.warn(
    "menuImageUtils.getMenuImageUrl est déprécié. Utilisez getMenuImageUrl du imageService."
  );
  return getMenuImageUrlFromService(image);
}
