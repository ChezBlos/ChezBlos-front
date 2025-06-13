import React from "react";
import { LineSpinner } from "ldrs/react";

interface SpinnerProps {
  size?: string;
  stroke?: string;
  speed?: string;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "40",
  stroke = "3",
  speed = "1",
  color = "#F97316", // Orange brand primary
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LineSpinner size={size} stroke={stroke} speed={speed} color={color} />
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
      <p className="text-gray-600 font-medium">Chargement...</p>
    </div>
  </div>
);

export default Spinner;
