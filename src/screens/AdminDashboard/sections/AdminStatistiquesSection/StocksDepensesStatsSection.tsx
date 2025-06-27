import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  CurrencyDollar,
  Package,
  Receipt,
  ArrowClockwise,
  Clock,
} from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";

// Ce composant affichera la section Statistiques Stocks & Dépenses
// À compléter avec la logique et le JSX extraits de AdminStatistiquesSection

const StocksDepensesStatsSection = ({
  stockStats,
  stockLoading,
  stockError,
  expenseStats,
  expenseLoading,
  expenseError,
  stockAlerts,
  alertsLoading,
  alertsError,
  stockMovements,
  movementsLoading,
  movementsError,
  stockItems,
  itemsLoading,
  itemsError,
  selectedPeriod = "30days",
  formatPrice,
}: any) => {
  // Générer des titres adaptatifs selon la période
  const getPeriodLabel = () => {
    const periodLabels: { [key: string]: string } = {
      "7days": "7 derniers jours",
      "30days": "30 derniers jours",
      "3months": "3 derniers mois",
      "6months": "6 derniers mois",
      "1year": "cette année",
    };
    return periodLabels[selectedPeriod] || "cette période";
  };

  // Vérifier s'il y a des erreurs critiques
  const hasErrors =
    stockError || expenseError || alertsError || movementsError || itemsError;

  if (hasErrors) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Statistiques Stock & Dépenses
            </h2>
            <p className="text-sm text-gray-600">
              Inventaire et dépenses pour {getPeriodLabel()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Une erreur est survenue lors du chargement des données
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              <ArrowClockwise size={16} className="mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Statistiques Stock & Dépenses
          </h2>
          <p className="text-sm text-gray-600">
            Inventaire et dépenses pour {getPeriodLabel()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <ArrowClockwise size={16} className="mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI Cards Stock & Dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Articles en Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stockStats?.totalArticles ||
                    stockStats?.data?.totalArticles ||
                    stockItems?.length ||
                    0
                  )}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {stockLoading
                    ? "Chargement..."
                    : `${
                        stockStats?.totalArticles ||
                        stockStats?.data?.articlesEnStock ||
                        stockStats?.articlesEnStock ||
                        stockItems?.filter(
                          (item: any) => item.quantiteStock > 0
                        )?.length ||
                        0
                      } disponibles`}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dépenses Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenseLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (() => {
                      const montant =
                        expenseStats?.data?.depensesMensuelle ||
                        expenseStats?.depensesMensuelle ||
                        expenseStats?.total ||
                        expenseStats?.montantTotal ||
                        0;
                      return montant > 0
                        ? `${formatPrice(montant)} XOF`
                        : "0 XOF";
                    })()
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-2">{getPeriodLabel()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Receipt size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Alertes Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alertsLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (() => {
                      // Récupérer les alertes depuis la bonne structure
                      const totalAlertes =
                        stockAlerts?.totalAlertes ||
                        stockAlerts?.data?.totalAlertes ||
                        (stockAlerts?.stockBas?.length || 0) +
                          (stockAlerts?.expiration?.length || 0) ||
                        stockAlerts?.length ||
                        0;
                      return totalAlertes;
                    })()
                  )}
                </p>
                <p
                  className={`text-sm mt-2 ${(() => {
                    const alertCount =
                      stockAlerts?.totalAlertes ||
                      stockAlerts?.data?.totalAlertes ||
                      (stockAlerts?.stockBas?.length || 0) +
                        (stockAlerts?.expiration?.length || 0) ||
                      stockAlerts?.length ||
                      0;
                    return alertCount > 0
                      ? "text-orange-600 font-medium"
                      : "text-green-600";
                  })()}`}
                >
                  {(() => {
                    const alertCount =
                      stockAlerts?.totalAlertes ||
                      stockAlerts?.data?.totalAlertes ||
                      (stockAlerts?.stockBas?.length || 0) +
                        (stockAlerts?.expiration?.length || 0) ||
                      stockAlerts?.length ||
                      0;
                    return alertCount > 0
                      ? `${alertCount} alerte${alertCount > 1 ? "s" : ""}`
                      : "Tout va bien";
                  })()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (() => {
                      const valeur =
                        stockStats?.valeurTotaleStock ||
                        stockStats?.data?.valeurTotaleStock ||
                        stockItems?.reduce(
                          (acc: number, item: any) =>
                            acc +
                            (item.prixAchat || 0) * (item.quantiteStock || 0),
                          0
                        ) ||
                        0;
                      return valeur > 0
                        ? `${formatPrice(valeur)} XOF`
                        : "0 XOF";
                    })()
                  )}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Inventaire total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollar size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Alertes de stock et mouvements récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes de stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Alertes de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alertsLoading ? (
                <div className="text-center text-gray-500 py-8">
                  Chargement des alertes...
                </div>
              ) : (
                (() => {
                  // Gestion des alertes selon la vraie structure API
                  const stockBas =
                    stockAlerts?.stockBas || stockAlerts?.data?.stockBas || [];
                  const expiration =
                    stockAlerts?.expiration ||
                    stockAlerts?.data?.expiration ||
                    [];
                  const alertsArray = [...stockBas, ...expiration];

                  if (alertsArray.length > 0) {
                    return alertsArray.map((alert: any) => (
                      <div
                        key={alert._id || alert.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {alert.nom ||
                                alert.articleNom ||
                                alert.name ||
                                "Article"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {alert.categorie && `${alert.categorie} • `}
                              Stock:{" "}
                              {alert.quantiteStock || alert.quantite || 0}{" "}
                              {alert.unite || ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-yellow-700">
                            Seuil: {alert.seuilAlerte || alert.seuil || "N/A"}
                          </p>
                        </div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="text-center text-gray-500 py-8">
                        <Package
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>Aucune alerte de stock</p>
                        <p className="text-sm">
                          Tous les articles sont bien approvisionnés
                        </p>
                      </div>
                    );
                  }
                })()
              )}
            </div>
          </CardContent>
        </Card>
        {/* Mouvements récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowClockwise size={20} className="text-blue-600" />
              Mouvements Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {movementsLoading ? (
                <div className="text-center text-gray-500 py-8">
                  Chargement des mouvements...
                </div>
              ) : (
                (() => {
                  // Gestion flexible des mouvements - essayons plusieurs structures
                  const movements =
                    stockMovements?.data || stockMovements || [];
                  const movementsArray = Array.isArray(movements)
                    ? movements
                    : [];

                  if (movementsArray.length > 0) {
                    return movementsArray.map((movement: any) => {
                      const typeConfig = {
                        entree: {
                          color: "bg-green-500",
                          label: "Entrée",
                          textColor: "text-green-600",
                        },
                        sortie: {
                          color: "bg-blue-500",
                          label: "Sortie",
                          textColor: "text-blue-600",
                        },
                        perte: {
                          color: "bg-red-500",
                          label: "Perte",
                          textColor: "text-red-600",
                        },
                        ajustement: {
                          color: "bg-yellow-500",
                          label: "Ajustement",
                          textColor: "text-yellow-600",
                        },
                      };
                      const config =
                        typeConfig[movement.type as keyof typeof typeConfig] ||
                        typeConfig.ajustement;

                      return (
                        <div
                          key={movement._id}
                          className="flex items-center justify-between p-3 bg-gray-5 rounded-lg hover:bg-gray-10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${config.color}`}
                            ></div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {movement.articleNom}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(movement.date).toLocaleDateString(
                                  "fr-FR"
                                )}{" "}
                                •
                                <span
                                  className={`ml-1 ${config.textColor} font-medium`}
                                >
                                  {config.label}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-medium ${config.textColor}`}
                            >
                              {movement.type === "entree" ? "+" : "-"}
                              {movement.quantite} {movement.unite || ""}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div className="text-center text-gray-500 py-8">
                        <Clock
                          size={48}
                          className="mx-auto mb-4 text-gray-300"
                        />
                        <p>Aucun mouvement récent</p>
                        <p className="text-sm">
                          Les mouvements apparaîtront ici
                        </p>
                      </div>
                    );
                  }
                })()
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Répartition des dépenses par catégorie */}
      {expenseStats?.parCategorie && expenseStats.parCategorie.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt size={20} className="text-purple-600" />
              Dépenses par Catégorie - {getPeriodLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseStats.parCategorie.map(
                (categorie: any, index: number) => {
                  const percentage = categorie.pourcentage || 0;
                  const colors = [
                    "from-blue-400 to-blue-600",
                    "from-green-400 to-green-600",
                    "from-orange-400 to-orange-600",
                    "from-purple-400 to-purple-600",
                    "from-red-400 to-red-600",
                    "from-yellow-400 to-yellow-600",
                  ];

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-5 rounded-lg hover:bg-gray-10 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                            colors[index % colors.length]
                          }`}
                        ></div>
                        <span className="font-medium capitalize flex-1">
                          {categorie.categorie || "Non catégorisé"}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${
                                colors[index % colors.length]
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(categorie.montant)} XOF
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Articles du stock */}
      <Card>
        <CardHeader>
          <CardTitle>Articles en Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="text-center text-gray-500 py-8">
              Chargement des articles...
            </div>
          ) : (
            (() => {
              // Gestion flexible des articles - essayons plusieurs structures
              const items =
                stockItems?.stockItems ||
                stockItems?.data?.stockItems ||
                stockItems ||
                [];
              const itemsArray = Array.isArray(items) ? items : [];

              if (itemsArray.length > 0) {
                return (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Article
                          </th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">
                            Catégorie
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700">
                            Stock
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700">
                            Prix d'achat
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-gray-700">
                            Statut
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsArray.slice(0, 10).map((item: any) => (
                          <tr
                            key={item._id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.nom}
                                </p>
                                {item.fournisseur && (
                                  <p className="text-sm text-gray-500">
                                    {item.fournisseur}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {item.categorie || "Non catégorisé"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-medium">
                                {item.quantiteStock} {item.unite}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-medium">
                                {formatPrice(item.prixAchat)} XOF
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {item.quantiteStock <= item.seuilAlerte ? (
                                <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                  Stock faible
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  En stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {itemsArray.length > 10 && (
                      <div className="text-center py-4">
                        <Button variant="outline" size="sm">
                          Voir tous les articles ({itemsArray.length})
                        </Button>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div className="text-center text-gray-500 py-12">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Aucun article en stock
                    </h3>
                    <p className="text-sm">
                      Commencez par ajouter des articles à votre inventaire
                    </p>
                  </div>
                );
              }
            })()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StocksDepensesStatsSection;
