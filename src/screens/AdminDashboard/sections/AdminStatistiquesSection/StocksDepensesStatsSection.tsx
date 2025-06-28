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
  expenseStats,
  expenseLoading,
  stockAlerts,
  alertsLoading,
  stockMovements,
  movementsLoading,
  stockItems,
  itemsLoading,
  formatPrice,
}: any) => {
  return (
    <>
      {/* KPI Cards Stock & Dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Articles en Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stockLoading ? "..." : stockStats?.totalArticles || 0}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {stockLoading
                    ? "Chargement..."
                    : `${stockStats?.articlesEnStock || 0} disponibles`}
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
                  {expenseLoading
                    ? "..."
                    : `${formatPrice(
                        expenseStats?.depensesMensuelle || 0
                      )} XOF`}
                </p>
                <p className="text-sm text-gray-5 mt-2">Ce mois</p>
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
                  {alertsLoading ? "..." : stockAlerts?.length || 0}
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  {stockAlerts && stockAlerts.length > 0
                    ? "Attention requise"
                    : "Tout va bien"}
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
                  {stockLoading
                    ? "..."
                    : `${formatPrice(stockStats?.valeurTotaleStock || 0)} XOF`}
                </p>
                <p className="text-sm text-green-600 mt-2">Inventaire total</p>
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
                <div className="text-center text-gray-5 py-8">
                  Chargement des alertes...
                </div>
              ) : stockAlerts && stockAlerts.length > 0 ? (
                stockAlerts.map((alert: any) => (
                  <div
                    key={alert._id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">{alert.nom}</p>
                        <p className="text-sm text-gray-600">
                          {alert.categorie && `${alert.categorie} • `}Stock:{" "}
                          {alert.quantiteStock} {alert.unite}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-700">
                        Seuil: {alert.seuilAlerte}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-5 py-8">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucune alerte de stock</p>
                  <p className="text-sm">
                    Tous les articles sont bien approvisionnés
                  </p>
                </div>
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
                <div className="text-center text-gray-5 py-8">
                  Chargement des mouvements...
                </div>
              ) : stockMovements && stockMovements.length > 0 ? (
                stockMovements.map((movement: any) => (
                  <div
                    key={movement._id}
                    className="flex items-center justify-between p-3 bg-gray-5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          movement.type === "entree"
                            ? "bg-green-500"
                            : movement.type === "sortie"
                            ? "bg-blue-500"
                            : movement.type === "perte"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {movement.articleNom}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(movement.date).toLocaleDateString("fr-FR")}{" "}
                          • {movement.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          movement.type === "entree"
                            ? "text-green-600"
                            : movement.type === "sortie"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {movement.type === "entree" ? "+" : "-"}
                        {movement.quantite}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-5 py-8">
                  <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucun mouvement récent</p>
                  <p className="text-sm">Les mouvements apparaîtront ici</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Répartition des dépenses par catégorie */}
      {expenseStats?.parCategorie && expenseStats.parCategorie.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseStats.parCategorie.map(
                (categorie: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                          index % 4 === 0
                            ? "from-blue-400 to-blue-600"
                            : index % 4 === 1
                            ? "from-green-400 to-green-600"
                            : index % 4 === 2
                            ? "from-orange-400 to-orange-600"
                            : "from-purple-400 to-purple-600"
                        }`}
                      ></div>
                      <span className="font-medium capitalize">
                        {categorie.categorie}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {categorie.pourcentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(categorie.montant)} XOF
                        </p>
                      </div>
                    </div>
                  </div>
                )
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
            <div className="text-center text-gray-5 py-8">
              Chargement des articles...
            </div>
          ) : stockItems && stockItems.length > 0 ? (
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
                  {stockItems.slice(0, 10).map((item: any) => (
                    <tr key={item._id} className="border-b hover:bg-gray-5">
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.nom}
                          </p>
                          {item.fournisseur && (
                            <p className="text-sm text-gray-5">
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
              {stockItems.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline" size="sm">
                    Voir tous les articles ({stockItems.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-5 py-12">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Aucun article en stock
              </h3>
              <p className="text-sm">
                Commencez par ajouter des articles à votre inventaire
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default StocksDepensesStatsSection;
