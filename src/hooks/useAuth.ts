import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirection basée sur le rôle de l'utilisateur (workflow simplifié)
      switch (user.role) {
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "CAISSIER":
          navigate("/caissier/dashboard", { replace: true });
          break;
        default:
          navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
};

export const useRequireAuth = (requiredRoles?: string[]) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
        return;
      }
      if (requiredRoles && user && !requiredRoles.includes(user.role)) {
        navigate("/403", { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRoles, navigate]);

  return { user, isAuthenticated, isLoading };
};
