import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirection basée sur le rôle de l'utilisateur
      switch (user.role.toLowerCase()) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "serveur":
          navigate("/serveur/dashboard", { replace: true });
          break;
        case "caissier":
          navigate("/caissier/dashboard", { replace: true });
          break;
        case "cuisinier":
        case "cuisine":
          navigate("/cuisine/dashboard", { replace: true });
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
      if (
        requiredRoles &&
        user &&
        !requiredRoles.includes(user.role.toLowerCase())
      ) {
        navigate("/403", { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRoles, navigate]);

  return { user, isAuthenticated, isLoading };
};
