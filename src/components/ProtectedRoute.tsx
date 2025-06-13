import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SpinnerMedium } from "./ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"ADMIN" | "SERVEUR" | "CUISINIER">;
  requiredRoles?: string[];
  requiresCaissier?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredRoles,
  requiresCaissier = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerMedium />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles requis (nouvelle prop)
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // Vérification des rôles autorisés (ancienne prop)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiresCaissier && user && !user.isCaissier) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
