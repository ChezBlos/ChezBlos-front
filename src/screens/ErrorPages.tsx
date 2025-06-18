import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas.
        </p>
        <Link to="/">
          <Button className="bg-orange-500 hover:bg-orange-600">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export const Unauthorized: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleReturnToLogin = () => {
    logout(); // Déconnecter l'utilisateur
    navigate("/login"); // Rediriger vers la page de login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Accès non autorisé
        </h2>
        <p className="text-gray-600 mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Button
          onClick={handleReturnToLogin}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Se déconnecter et retourner au login
        </Button>
      </div>
    </div>
  );
};
