import React, { useState } from "react";
import {
  getUserAvatarUrl,
  handleImageError,
  IMAGE_DEFAULTS,
} from "../services/imageService";

interface UserAvatarProps {
  /** Photo de profil de l'utilisateur */
  photo?: string | null;
  /** Nom de famille */
  nom?: string | null;
  /** Prénom */
  prenom?: string | null;
  /** Taille de l'avatar */
  size?: "sm" | "md" | "lg" | "xl";
  /** Classes CSS supplémentaires */
  className?: string;
  /** Fonction appelée en cas d'erreur de chargement */
  onImageError?: () => void;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

/**
 * Composant Avatar universel pour tous les utilisateurs
 * Affiche la photo de profil ou les initiales avec couleur générée
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  photo,
  nom,
  prenom,
  size = "md",
  className = "",
  onImageError,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  const avatarInfo = getUserAvatarUrl(photo, nom, prenom);
  const sizeClass = sizeClasses[size];

  // Si on a une image et qu'elle n'a pas échoué à charger
  if (avatarInfo.type === "image" && avatarInfo.url && !imageLoadError) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <img
          src={avatarInfo.url}
          alt={`Avatar de ${prenom} ${nom}`}
          className={`${sizeClass} rounded-full object-cover border-2 border-gray-200`}
          onError={(e) => {
            setImageLoadError(true);
            onImageError?.();
            handleImageError(e, IMAGE_DEFAULTS.menuItem);
          }}
          onLoad={() => setImageLoadError(false)}
        />
      </div>
    );
  }

  // Sinon, afficher les initiales avec une vérification de sécurité
  const initials = avatarInfo.initials || {
    initials: "?",
    backgroundColor: "bg-gray-500",
    textColor: "text-white",
  };

  return (
    <div
      className={`
        ${sizeClass} 
        ${initials.backgroundColor} 
        ${initials.textColor}
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-semibold 
        border-2 
        border-gray-200 
        ${className}
      `}
      title={`${prenom} ${nom}`.trim() || "Utilisateur"}
    >
      {initials.initials}
    </div>
  );
};

export default UserAvatar;
