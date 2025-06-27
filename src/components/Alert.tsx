import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: (id: string) => void;
  autoClose?: boolean;
  duration?: number;
}

export const Alert: React.FC<AlertProps> = ({
  id,
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 10);

    // Auto-fermeture
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Durée de l'animation de sortie
  };

  const baseClasses = `
    relative max-w-sm w-full bg-white rounded-xl border shadow-lg
    transform transition-all duration-300 ease-in-out
    ${
      isVisible && !isLeaving
        ? "translate-x-0 opacity-100 scale-100"
        : "translate-x-full opacity-0 scale-95"
    }
  `;

  const typeConfig = {
    success: {
      borderClass: "border-l-4 border-l-emerald-500 border-emerald-200",
      iconClass: "text-emerald-600",
      icon: CheckCircle2,
      bgAccent: "bg-emerald-50",
    },
    error: {
      borderClass: "border-l-4 border-l-red-500 border-red-200",
      iconClass: "text-red-600",
      icon: XCircle,
      bgAccent: "bg-red-50",
    },
    warning: {
      borderClass: "border-l-4 border-l-amber-500 border-amber-200",
      iconClass: "text-amber-600",
      icon: AlertTriangle,
      bgAccent: "bg-amber-50",
    },
    info: {
      borderClass: "border-l-4 border-l-blue-500 border-blue-200",
      iconClass: "text-blue-600",
      icon: Info,
      bgAccent: "bg-blue-50",
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;
  return (
    <div className={`${baseClasses} ${config.borderClass}`}>
      <div className="flex items-start space-x-3 p-4 pr-6 flex-1 min-w-0">
        <div className={`${config.bgAccent} p-1 rounded-full flex-shrink-0`}>
          <IconComponent className={`h-4 w-4 ${config.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-gray-900 leading-relaxed break-words">
            {message}
          </p>
        </div>
      </div>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1.5 rounded-md hover:bg-gray-100/80"
        aria-label="Fermer l'alerte"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
