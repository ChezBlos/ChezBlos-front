import React, { useState } from "react";
import {
  getMenuImageUrl,
  handleImageError,
  IMAGE_DEFAULTS,
} from "../services/imageService";

interface MenuItemImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  onImageError?: () => void;
}

/**
 * Composant optimisé pour les images de plats/menu
 * Utilise le service centralisé pour la gestion des images
 */
const MenuItemImage: React.FC<MenuItemImageProps> = ({
  src,
  alt = "Image du plat",
  className = "",
  fallbackSrc = IMAGE_DEFAULTS.menuItem,
  onImageError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoadError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    setIsLoading(false);
    onImageError?.();
    handleImageError(e, fallbackSrc);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
  };

  // Utiliser le service centralisé pour obtenir l'URL
  const imageUrl = imageError ? fallbackSrc : getMenuImageUrl(src);

  return (
    <div className={`relative ${className}`}>
      {isLoading && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        onError={handleImageLoadError}
        onLoad={handleImageLoad}
        className={`w-full h-full object-cover rounded-lg ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        loading="lazy"
      />
    </div>
  );
};

export default MenuItemImage;
