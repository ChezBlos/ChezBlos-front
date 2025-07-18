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
  // Clock,
} from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";
import { ExpenseCategoryPieChart } from "../../../../components/charts";
import { useState } from "react";
// import { Badge } from "../../../../components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "../../../../components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Ce composant affichera la section Statistiques Stocks & Dépenses
// À compléter avec la logique et le JSX extraits de AdminStatistiquesSection

const StocksDepensesStatsSection = ({
  stockStats,
  stockLoading,
  stockError,
  expenseStats,
  expenseLoading,
  expenseError,
  // stockAlerts,
  // alertsLoading,
  alertsError,
  stockMovements,
  // movementsLoading,
  movementsError,
  // stockItems,
  // itemsLoading,
  itemsError,
  selectedPeriod = "30days",
  formatPrice,
  refetchMovements: refetchMovementsProp,
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

  // Pagination pour les mouvements
  const [currentPage, setCurrentPage] = useState(1);
  const movementsPerPage = 10;

  // Helpers pour badges et formatage
  // function getTypeBadgeColor(type: string) {
  //   switch (type) {
  //     case "entrée":
  //     case "approvisionnement":
  //       return "bg-green-100 text-green-800";
  //     case "sortie":
  //     case "consommation":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-700";
  //   }
  // }
  // function formatTypeLabel(type: string) {
  //   if (!type) return "-";
  //   switch (type) {
  //     case "entrée":
  //       return "Entrée";
  //     case "sortie":
  //       return "Sortie";
  //     case "approvisionnement":
  //       return "Approvisionnement";
  //     case "consommation":
  //       return "Consommation";
  //     default:
  //       return type.charAt(0).toUpperCase() + type.slice(1);
  //   }
  // }
  function formatDate(date: string) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function formatRole(role: string | null | undefined) {
    if (!role) return "-";
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "Admin";
      case "SERVEUR":
        return "Serveur";
      case "CUISINIER":
        return "Cuisinier";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }
  }

  // Pagination mouvements
  const totalPages = Math.max(
    1,
    Math.ceil((stockMovements?.length || 0) / movementsPerPage)
  );
  const paginatedMovements = (stockMovements || []).slice(
    (currentPage - 1) * movementsPerPage,
    currentPage * movementsPerPage
  );

  // Fallback pour refetchMovements
  const refetchMovements =
    typeof refetchMovementsProp === "function"
      ? refetchMovementsProp
      : () => window.location.reload();

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
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Statistiques Stock & Dépenses
          </h2>
          <p className="text-sm text-gray-600">
            Inventaire et dépenses pour {getPeriodLabel()}
          </p>
        </div>
      </div> */}

      {/* KPI Cards Stock & Dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* <Card className="rounded-3xl">
          <CardContent className="p-6 ">
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
        </Card> */}
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dépenses Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenseLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (() => {
                      const montant = expenseStats?.totalDepenses || 0;
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
        {/* <Card className="rounded-3xl">
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
        </Card> */}
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Valeur Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (() => {
                      const valeur = stockStats?.valeurTotale || 0;
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
      {/* Répartition des dépenses par catégorie */}
      {expenseStats?.parCategorie && expenseStats.parCategorie.length > 0 && (
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dépenses par Catégorie - {getPeriodLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              <div className="w-full md:w-1/2">
                <ExpenseCategoryPieChart
                  data={expenseStats.parCategorie}
                  height={320}
                />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
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
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                }}
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mouvements récents */}
      <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
        {/* Header - harmonisé */}
        <div className="flex flex-col border-b bg-white border-slate-200">
          <div className="flex flex-row items-center justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
            <h2 className="font-bold text-2xl text-gray-900 flex-shrink-0">
              Mouvements Récents
            </h2>
            {/* Pagination controls ici si besoin */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refetchMovements}
                className="flex items-center rounded-full gap-2 h-10 md:h-12 px-3 md:px-4"
              >
                <ArrowClockwise className="h-4 w-4" />
              </Button>
              {/* Pagination */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p: number) => Math.max(1, p - 1))
                  }
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p: number) => Math.min(totalPages, p + 1))
                  }
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Table Content */}
        <div className="w-full">
          {paginatedMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Package size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun mouvement trouvé</p>
              <p className="text-sm">
                Les mouvements de stock récents apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-10 border-b border-slate-200">
                      <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                        Produit
                      </TableHead>
                      <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                        Quantité
                      </TableHead>
                      <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                        Statut
                      </TableHead>
                      <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                        Modifié par
                      </TableHead>
                      <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMovements.map((mvt: any) => {
                      // Harmonisation des champs selon le backend
                      const type = mvt.type ? mvt.type.toLowerCase() : "-";
                      const nomProduit = mvt.articleNom || "-";
                      const nomUtilisateur =
                        mvt.prenom || mvt.utilisateur || "-";
                      const photoUtilisateur = mvt.photoProfil;
                      const roleUtilisateur = mvt.role || "-";
                      const quantite = mvt.quantite;
                      const unite = mvt.unite || "";
                      const isEntree =
                        type === "entree" || type === "approvisionnement";
                      const isSortie =
                        type === "sortie" || type === "consommation";
                      // Détermination du badge statut
                      let statutLabel = "-";
                      let badgeClass = "bg-gray-10 text-gray-700";
                      if (isEntree) {
                        statutLabel = "Entrée";
                        badgeClass = "bg-green-100 text-green-800";
                      } else if (isSortie) {
                        statutLabel = "Sortie";
                        badgeClass = "bg-red-100 text-red-800";
                      }
                      return (
                        <TableRow
                          key={mvt._id}
                          className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                        >
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span className="font-medium text-gray-900">
                              {nomProduit}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span
                              className={`font-bold ${
                                isEntree ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isEntree ? "+" : "-"}
                              {quantite} {unite}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                            >
                              {statutLabel}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <div className="flex items-center gap-2">
                              {photoUtilisateur ? (
                                <img
                                  src={photoUtilisateur}
                                  alt={nomUtilisateur}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                              ) : (
                                <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                                  {nomUtilisateur?.[0] || "?"}
                                </span>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {nomUtilisateur}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatRole(roleUtilisateur)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span className="text-sm text-gray-700">
                              {formatDate(mvt.date)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Table - simplifiée
              <div className="block md:hidden">
                {paginatedMovements.map((mvt: any) => {
                  const type = mvt.type ? mvt.type.toLowerCase() : "-";
                  const nomProduit = mvt.articleNom || "-";
                  const nomUtilisateur = mvt.prenom || mvt.utilisateur || "-";
                  const photoUtilisateur = mvt.photoProfil;
                  const roleUtilisateur = mvt.role || "-";
                  const quantite = mvt.quantite;
                  const unite = mvt.unite || "";
                  const isEntree = type === "entree";
                  return (
                    <div
                      key={mvt._id}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <div className="flex justify-between py-3 px-4 bg-gray-5">
                        <span className="text-sm font-medium text-gray-900">
                          Produit
                        </span>
                        <span className="text-sm text-gray-700">
                          {nomProduit}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 px-4 bg-white">
                        <span className="text-sm font-medium text-gray-900">
                          Type
                        </span>
                        <Badge
                          className={`text-xs font-medium ${getTypeBadgeColor(
                            type
                          )}`}
                        >
                          {formatTypeLabel(type)}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-3 px-4 bg-gray-5">
                        <span className="text-sm font-medium text-gray-900">
                          Quantité
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            isEntree ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isEntree ? "+" : "-"}
                          {quantite} {unite}
                        </span>
                      </div>
                      <div className="flex justify-between py-3 px-4 bg-white">
                        <span className="text-sm font-medium text-gray-900">
                          Utilisateur
                        </span>
                        <div className="flex items-center gap-2">
                          {photoUtilisateur ? (
                            <img
                              src={photoUtilisateur}
                              alt={nomUtilisateur}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                              {nomUtilisateur?.[0] || "?"}
                            </span>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900">
                              {nomUtilisateur}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatRole(roleUtilisateur)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between py-3 px-4 bg-gray-5">
                        <span className="text-sm font-medium text-gray-900">
                          Date
                        </span>
                        <span className="text-sm text-gray-700">
                          {formatDate(mvt.date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div> */}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StocksDepensesStatsSection;
