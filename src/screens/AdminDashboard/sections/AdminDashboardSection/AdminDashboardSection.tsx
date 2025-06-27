import React from "react";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Users,
  ForkKnife,
  ChartBar,
  Package,
  Gear,
  FileText,
} from "@phosphor-icons/react";
import { useDashboardStats } from "../../../../hooks/useDashboardStats";
import { SpinnerMedium } from "../../../../components/ui/spinner";

interface AdminDashboardSectionProps {
  onSectionSelect?: (
    section:
      | "dashboard"
      | "staff"
      | "menu"
      | "historique"
      | "stock"
      | "statistiques"
      | "settings"
  ) => void;
}

export const AdminDashboardSection: React.FC<AdminDashboardSectionProps> = ({
  onSectionSelect,
}) => {
  const { dashboardStats, userStats, loading, error } = useDashboardStats();

  // Fonction pour formater les prix en XOF
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };
  const handleMenuItemClick = (action: string) => {
    switch (action) {
      case "staff":
        onSectionSelect?.("staff");
        break;
      case "menu":
        onSectionSelect?.("menu");
        break;
      case "stock":
        onSectionSelect?.("stock");
        break;
      case "statistiques":
        onSectionSelect?.("statistiques");
        break;
      case "historique":
        onSectionSelect?.("historique");
        break;
      case "settings":
        onSectionSelect?.("settings");
        break;
      default:
        break;
    }
  };

  const adminMenuItems = [
    {
      title: "Gestion du personnel",
      description: "Gérer les comptes utilisateurs et leurs permissions",
      icon: Users,
      action: "staff",
    },
    {
      title: "Gestion du menu",
      description: "Créer, modifier, supprimer des plats et gérer les prix",
      icon: ForkKnife,
      action: "menu",
    },
    {
      title: "Gestion du stock",
      description: "Entrées/sorties, suivi inventaire, alertes stock bas",
      icon: Package,
      action: "stock",
    },
    {
      title: "Statistiques de ventes",
      description: "Analyses par période (jour, semaine, mois)",
      icon: ChartBar,
      action: "statistiques",
    },
    {
      title: "Historique des commandes",
      description: "Consulter l'historique complet des commandes",
      icon: FileText,
      action: "historique",
    },
    {
      title: "Configuration",
      description: "Paramètres du système et du restaurant",
      icon: Gear,
      action: "settings",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tableau de bord administrateur
        </h2>
        <p className="text-gray-600">
          Gérez tous les aspects de votre restaurant depuis cette interface
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {" "}
        {adminMenuItems.map((item, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => handleMenuItemClick(item.action)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3">
                <item.icon size={24} className="text-orange-500" />
                <span className="text-lg">{item.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuItemClick(item.action);
                }}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Aperçu rapide</h3>
          {error && (
            <div className="text-sm text-red-600">
              Erreur de chargement des données
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <SpinnerMedium />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardStats?.today.commandes || 0}
                </div>
                <div className="text-sm text-gray-500">
                  Commandes aujourd'hui
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dashboardStats?.today.recettes
                    ? formatPrice(dashboardStats.today.recettes)
                    : "0"}{" "}
                  XOF
                </div>
                <div className="text-sm text-gray-500">Chiffre d'affaires</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {userStats?.actifs || 0}
                </div>
                <div className="text-sm text-gray-500">Personnel actif</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardStats?.commandesEnAttente || 0}
                </div>
                <div className="text-sm text-gray-500">
                  Commandes en attente
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Stats Section */}
        {dashboardStats && (
          <div className="mt-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Statistiques globales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-xl font-bold text-indigo-600">
                    {dashboardStats.total.commandes || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total des commandes
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-xl font-bold text-emerald-600">
                    {dashboardStats.total.recettes
                      ? formatPrice(dashboardStats.total.recettes)
                      : "0"}{" "}
                    XOF
                  </div>
                  <div className="text-sm text-gray-500">
                    Chiffre d'affaires total
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
