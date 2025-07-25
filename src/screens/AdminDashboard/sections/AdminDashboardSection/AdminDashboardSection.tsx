import React from "react";
import {
  Card,
  CardContent,
  // CardHeader,
  // CardTitle,
} from "../../../../components/ui/card";
import { Users, ForkKnife, ChartBar } from "@phosphor-icons/react";
import { useDashboardStats } from "../../../../hooks/useDashboardStats";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import { Doughnut } from "react-chartjs-2";

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

export const AdminDashboardSection: React.FC<
  AdminDashboardSectionProps
> = ({}) => {
  const { dashboardStats, userStats, loading, error } = useDashboardStats();

  // Fonction pour formater les prix en XOF
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

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
          <div className="flex justify-center items-center h-32 mb-8">
            <SpinnerMedium />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Commandes Totale
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats?.today.commandes || 0}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">Aujourd'hui</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ForkKnife size={24} className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Commandes terminées
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats?.today.commandesTerminees ?? 0}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">Aujourd'hui</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ForkKnife size={24} className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Personnel</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {userStats?.actifs || 0}
                    </p>
                    <p className="text-sm text-orange-600 mt-2">Actifs</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users size={24} className="text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Recettes</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {dashboardStats?.total.recettes
                        ? formatPrice(dashboardStats.total.recettes)
                        : "0"}{" "}
                      XOF
                    </p>
                    <p className="text-sm text-emerald-600 mt-2">
                      Chiffre d'affaires
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <ChartBar size={24} className="text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plats préparés</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {dashboardStats?.today.platsPrepares ?? 0}
                    </p>
                    <p className="text-sm text-indigo-600 mt-2">Aujourd'hui</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <ForkKnife size={24} className="text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plats servis</p>
                    <p className="text-2xl font-bold text-fuchsia-600">
                      {dashboardStats?.today.platsServis ?? 0}
                    </p>
                    <p className="text-sm text-fuchsia-600 mt-2">Aujourd'hui</p>
                  </div>
                  <div className="p-3 bg-fuchsia-100 rounded-lg">
                    <ForkKnife size={24} className="text-fuchsia-600" />
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        )}
      </div>

      {/* Tableau des serveurs et commandes terminées + diagramme circulaire */}
      {(() => {
        if (loading) {
          return (
            <div className="flex justify-center items-center h-32 mb-8">
              <SpinnerMedium />
            </div>
          );
        }
        if (
          !dashboardStats?.today?.commandesTermineesParServeur ||
          dashboardStats.today.commandesTermineesParServeur.length === 0
        ) {
          return (
            <div className="mb-8 bg-white rounded-2xl shadow p-6 text-center text-gray-500">
              Aucune donnée de commandes terminées par serveur pour aujourd'hui.
            </div>
          );
        }
        return (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Diagramme circulaire */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center min-h-[320px]">
              <h4 className="text-md font-semibold text-gray-900 mb-4">
                Répartition des commandes terminées
              </h4>
              <div className="w-full max-w-xs mx-auto">
                <Doughnut
                  data={{
                    labels:
                      dashboardStats.today.commandesTermineesParServeur.map(
                        (row) => `${row.serveur.prenom} ${row.serveur.nom}`
                      ),
                    datasets: [
                      {
                        data: dashboardStats.today.commandesTermineesParServeur.map(
                          (row) => row.commandesTerminees
                        ),
                        backgroundColor: [
                          "#f97316",
                          "#3b82f6",
                          "#10b981",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#06b6d4",
                          "#84cc16",
                        ],
                        borderColor: "#fff",
                        borderWidth: 2,
                        hoverBorderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          font: { family: "Gilroy, sans-serif", size: 12 },
                          color: "#374151",
                          usePointStyle: true,
                          padding: 20,
                        },
                      },
                      tooltip: {
                        backgroundColor: "#1f2937",
                        titleColor: "#f9fafb",
                        bodyColor: "#f9fafb",
                        borderColor: "#f97316",
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                          label: function (context: any) {
                            const value = context.raw;
                            const label = context.label;
                            const total = context.dataset.data.reduce(
                              (a: number, b: number) => a + b,
                              0
                            );
                            const percent = total
                              ? ((value / total) * 100).toFixed(1)
                              : 0;
                            return `${label}: ${value} commandes (${percent}%)`;
                          },
                        },
                      },
                      title: {
                        display: false,
                      },
                    },
                    cutout: "60%",
                  }}
                  height={260}
                />
              </div>
            </div>
            {/* Liste des serveurs */}
            <div className="bg-white rounded-2xl shadow p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-semibold text-gray-900">
                  Commandes terminées par serveur (aujourd'hui)
                </h4>
              </div>
              <ul className="divide-y divide-gray-10">
                {dashboardStats.today.commandesTermineesParServeur.map(
                  (row) => {
                    return (
                      <li
                        key={row.serveur._id}
                        className="flex items-center px-5 py-5 gap-3"
                      >
                        {/* Avatar cercle avec initiales */}
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-base">
                          {row.serveur.prenom.charAt(0)}
                          {row.serveur.nom.charAt(0)}
                        </div>
                        {/* Infos serveur */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">
                            {row.serveur.prenom} {row.serveur.nom}
                          </div>
                          <div className="text-xs text-gray-500">Serveur</div>
                        </div>
                        {/* Nombre de commandes terminées */}
                        <div className="flex flex-col items-end min-w-[80px]">
                          <span className="font-bold text-blue-700 text-lg">
                            {row.commandesTerminees}
                          </span>
                          <span className="text-xs text-gray-500">
                            commandes
                          </span>
                        </div>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
          </div>
        );
      })()}

      {/* Menu Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {" "}
        {adminMenuItems.map((item, index) => (
          <Card
            key={index}
            className="cursor-pointer rounded-3xl"
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
      </div> */}
    </div>
  );
};
