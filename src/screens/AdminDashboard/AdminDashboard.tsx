import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Users,
  ForkKnife,
  ChartBar,
  Package,
  CreditCard,
  Gear,
} from "@phosphor-icons/react";

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const adminMenuItems = [
    {
      title: "Gestion des utilisateurs",
      description: "Gérer le personnel et les accès",
      icon: Users,
    },
    {
      title: "Gestion du menu",
      description: "Ajouter, modifier, supprimer des plats",
      icon: ForkKnife,
    },
    {
      title: "Statistiques",
      description: "Voir les performances du restaurant",
      icon: ChartBar,
    },
    {
      title: "Gestion du stock",
      description: "Suivre les stocks et les approvisionnements",
      icon: Package,
    },
    {
      title: "Paiements",
      description: "Gérer les transactions et les factures",
      icon: CreditCard,
    },
    {
      title: "Configuration",
      description: "Paramètres du système",
      icon: Gear,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo-55.svg" alt="Chez Blos" className="h-8" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Administration
                </h1>
                <p className="text-sm text-gray-500">Chez Blos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tableau de bord administrateur
          </h2>
          <p className="text-gray-600">
            Gérez tous les aspects de votre restaurant depuis cette interface
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              {" "}
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3">
                  <item.icon size={24} className="text-orange-500" />
                  <span className="text-lg">{item.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Accéder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Aperçu rapide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-500">
                  Commandes aujourd'hui
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">€1,250</div>
                <div className="text-sm text-gray-500">Chiffre d'affaires</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">8</div>
                <div className="text-sm text-gray-500">Personnel actif</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-500">Tables occupées</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
