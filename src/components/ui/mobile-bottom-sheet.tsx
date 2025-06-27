import React, { useState, useEffect } from "react";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string;
  title?: string;
  subtitle?: string;
  showHandle?: boolean;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  maxHeight = "70vh",
  title,
  subtitle,
  showHandle = true,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Attendre la fin de l'animation avant de fermer
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Réinitialiser l'état de fermeture quand le sheet s'ouvre
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Gérer la fermeture avec la touche Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      // Empêcher le scroll du body
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Overlay avec animation */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-50 ${
          isClosing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={handleClose}
      />

      {/* Bottom Sheet avec animation conditionnelle */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 overflow-y-auto ${
          isClosing ? "animate-slide-down" : "animate-slide-up"
        }`}
        style={{ maxHeight }}
      >
        {/* Handle de glissement */}
        {showHandle && (
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
        )}

        {/* Header optionnel */}
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        )}

        {/* Contenu */}
        <div className="space-y-1">{children}</div>
      </div>
    </div>
  );
};

interface BottomSheetActionProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}

export const BottomSheetAction: React.FC<BottomSheetActionProps> = ({
  onClick,
  icon,
  title,
  description,
  variant = "default",
  disabled = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-orange-50 active:bg-orange-100 border-orange-200 text-orange-700";
      case "danger":
        return "bg-red-50 active:bg-red-100 border-red-200 text-red-700";
      default:
        return "bg-white active:bg-gray-10 border-gray-200 text-gray-700";
    }
  };

  const getDescriptionColor = () => {
    switch (variant) {
      case "primary":
        return "text-orange-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 justify-start px-4 py-4 border rounded-xl text-left h-auto transition-all duration-200 ${
        disabled
          ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
          : getVariantStyles()
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && (
          <div
            className={`text-sm ${
              disabled ? "text-gray-400" : getDescriptionColor()
            }`}
          >
            {description}
          </div>
        )}
      </div>
    </button>
  );
};
