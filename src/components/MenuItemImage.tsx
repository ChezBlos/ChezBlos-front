import React, { useState } from "react";

interface MenuItemImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const MenuItemImage: React.FC<MenuItemImageProps> = ({
  src,
  alt,
  className = "",
  fallbackSrc = "/images/placeholder-dish.svg",
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };
  // Construire l'URL complète pour les images uploadées
  const getImageUrl = (imageSrc: string | null | undefined): string => {
    if (!imageSrc) return fallbackSrc;

    // Si c'est déjà une URL complète, l'utiliser telle quelle
    if (imageSrc.startsWith("http")) return imageSrc;

    // Si c'est un chemin relatif qui commence par '/uploads/', construire l'URL complète
    if (imageSrc.startsWith("/uploads/")) {
      return `${import.meta.env.VITE_IMAGE_BASE_URL || ""}${imageSrc}`;
    }

    // Sinon, utiliser l'image de fallback
    return fallbackSrc;
  };

  const imageUrl = imageError ? fallbackSrc : getImageUrl(src);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`w-full h-full object-cover rounded-lg ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      />
    </div>
  );
};

export default MenuItemImage;
