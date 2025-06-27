import React from "react";

interface SpinnerProps {
  size?: string;
  speed?: string;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "40",
  speed = "0.8",
  color = "#F97316", // Orange brand primary
  className = "",
}) => {
  // Nettoyer className pour retirer les classes de taille qui peuvent interférer
  const cleanClassName = className
    .split(" ")
    .filter((c) => !c.startsWith("h-") && !c.startsWith("w-"))
    .join(" ");

  const sizeNumber = parseInt(size);

  // Fallback CSS spinner si ldrs pose des problèmes
  return (
    <div className={`flex items-center justify-center ${cleanClassName}`}>
      <div
        className="animate-spin rounded-full border-solid"
        style={{
          width: `${sizeNumber}px`,
          height: `${sizeNumber}px`,
          borderWidth: `${Math.ceil(sizeNumber / 10)}px`,
          borderColor: `${color} transparent ${color} ${color}`,
          animationDuration: `${1 / parseFloat(speed)}s`,
        }}
      />
    </div>
  );
};

// Variantes prédéfinies pour différents cas d'usage
export const SpinnerSmall: React.FC<Omit<SpinnerProps, "size">> = (props) => (
  <Spinner size="24" {...props} />
);

export const SpinnerMedium: React.FC<Omit<SpinnerProps, "size">> = (props) => (
  <Spinner size="40" {...props} />
);

export const SpinnerLarge: React.FC<Omit<SpinnerProps, "size">> = (props) => (
  <Spinner size="60" {...props} />
);

// Spinner pour boutons
export const ButtonSpinner: React.FC<Omit<SpinnerProps, "size" | "color">> = (
  props
) => <Spinner size="20" color="#ffffff" {...props} />;

// Spinner pour écrans de chargement complets
export const LoadingSpinner: React.FC<SpinnerProps> = (props) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
      <Spinner size="60" {...props} />
    </div>
  </div>
);

export default Spinner;
