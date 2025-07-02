import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { loginApi, getUserProfile } from "../services/api";
import { logger } from "../utils/logger";

export interface User {
  id: string;
  _id?: string; // Ajout pour compatibilité avec le backend
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
  photoProfil?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: {
    email?: string;
    motDePasse?: string;
    codeAcces?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await getUserProfile();
          // Normaliser le rôle en minuscules
          const userData = response.data.data;
          if (userData && userData.role)
            userData.role = userData.role.toLowerCase();
          setUser(userData); // Corriger l'accès aux données
        } catch (error) {
          logger.error("Erreur lors de la récupération du profil:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);
  const login = async (credentials: {
    email?: string;
    motDePasse?: string;
    telephone?: string;
    codeAcces?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await loginApi(credentials);
      const { user: userData, token: authToken } = response.data.data;
      // Normaliser le rôle en minuscules
      if (userData && userData.role)
        userData.role = userData.role.toLowerCase();
      setUser(userData);
      setToken(authToken);
      localStorage.setItem("token", authToken);
    } catch (error) {
      logger.error("Erreur de connexion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Dans src/services/api.ts, il faut modifier l'intercepteur de réponse axios :
// Remplacer ceci :
// if (error.response?.status === 401) {
//   localStorage.removeItem('token');
//   window.location.href = '/login';
// }
// Par :
// if (error.response?.status === 401) {
//   localStorage.removeItem('token');
//   // Ne pas rediriger automatiquement, laisser le composant gérer l'affichage de l'erreur
// }
