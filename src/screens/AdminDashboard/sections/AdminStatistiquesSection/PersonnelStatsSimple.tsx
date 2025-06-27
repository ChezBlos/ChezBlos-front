import { useState } from "react";
import { Users, ArrowClockwise, ChefHat } from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";

// Composant simplifié pour le tableau du personnel
const PersonnelStatsSection = ({
  personnelStats,
  refetchPersonnelStats,
  personnelLoading,
  personnelError,
  sortedPersonnelData,
}: any) => {
  const [activeTab, setActiveTab] = useState("TOUS");

  // Extraction des données depuis personnelStats avec la bonne structure
  const rawPersonnelData =
    (personnelStats as any)?.data?.data?.detailsPersonnel || [];
  const personnelDataToUse =
    rawPersonnelData.length > 0 ? rawPersonnelData : sortedPersonnelData || [];

  // Fonction pour formater les prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price || 0);
  };

  // Filtrage simple
  const filteredData = personnelDataToUse.filter((person: any) => {
    if (activeTab === "TOUS") return true;
    return person.role === activeTab;
  });

  // Stats par rôle
  const roleStats = {
    tous: personnelDataToUse.length,
    serveurs: personnelDataToUse.filter((p: any) => p.role === "SERVEUR")
      .length,
    cuisiniers: personnelDataToUse.filter((p: any) => p.role === "CUISINIER")
      .length,
  };

  // Calculs pour les cards
  const totalCommandes = personnelDataToUse.reduce(
    (acc: number, p: any) => acc + (p.nombreCommandes || p.totalCommandes || 0),
    0
  );
  const totalRecettes = personnelDataToUse.reduce(
    (acc: number, p: any) => acc + (p.recettesTotales || 0),
    0
  );
  const totalAnnulees = personnelDataToUse.reduce(
    (acc: number, p: any) => acc + (p.commandesAnnulees || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Statistiques Personnel
          </h2>
          <p className="text-sm text-gray-600">
            Performance du personnel pour la période sélectionnée
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetchPersonnelStats} variant="outline" size="sm">
            <ArrowClockwise size={16} className="mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Cards de résumé simplifiées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Personnel</p>
              <p className="text-lg font-semibold text-gray-900">
                {personnelDataToUse.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <ChefHat className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Commandes</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalCommandes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Recettes</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(totalRecettes)} XOF
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Annulées</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalAnnulees}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex space-x-1 bg-gray-10 p-1 rounded-lg">
        {[
          { key: "TOUS", label: "Tous", count: roleStats.tous },
          { key: "SERVEUR", label: "Serveurs", count: roleStats.serveurs },
          {
            key: "CUISINIER",
            label: "Cuisiniers",
            count: roleStats.cuisiniers,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tableau basique */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {personnelLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : personnelError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-red-500">
              <p>Erreur: {personnelError}</p>
              <Button onClick={refetchPersonnelStats} className="mt-2">
                Réessayer
              </Button>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucune donnée disponible</p>
              <p className="text-sm mt-2">
                {activeTab === "TOUS"
                  ? "Aucun personnel trouvé pour cette période"
                  : `Aucun ${activeTab.toLowerCase()} trouvé`}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commandes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recettes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps Service
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((person: any, index: number) => (
                  <tr key={person._id || index} className="hover:bg-gray-5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-orange-800">
                              {(person.prenom?.[0] || "") +
                                (person.nom?.[0] || "")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {person.prenom} {person.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {person.email || person.telephone || "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          person.role === "SERVEUR"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {person.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.nombreCommandes || person.totalCommandes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(person.recettesTotales || 0)} XOF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                person.performanceGlobale || 0,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {Math.round(person.performanceGlobale || 0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.tempsServiceMoyen ||
                        person.tempsPreparationMoyen ||
                        0}{" "}
                      min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelStatsSection;
