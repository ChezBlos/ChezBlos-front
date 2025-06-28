import { useState } from "react";
import {
  Users,
  ArrowClockwise,
  ChefHat,
  XCircle,
  CurrencyDollar,
} from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

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
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
      </div> */}

      {/* Cards de résumé harmonisées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Personnel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personnelDataToUse.length}
                </p>
                <p className="text-sm text-blue-600 mt-2">Total employés</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCommandes}
                </p>
                <p className="text-sm text-green-600 mt-2">Total servies</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ChefHat size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recettes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(totalRecettes)} XOF
                </p>
                <p className="text-sm text-purple-600 mt-2">
                  Chiffre d'affaires
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CurrencyDollar size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Annulées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAnnulees}
                </p>
                <p className="text-sm text-red-600 mt-2">Commandes annulées</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle size={24} className="text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de filtre (tabs) harmonisés + Tableau dans une Card comme AdminStaffSection */}
      <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full mt-4">
        {/* Header Tabs + Titre */}
        <div className="flex flex-col border-b bg-white border-slate-200">
          <div className="flex flex-row items-center gap-2 px-3 md:px-4 lg:px-6 pt-4 pb-3">
            <h3 className="font-bold text-2xl text-gray-900 flex-shrink-0 mr-4">
              Tableau du Personnel
            </h3>
          </div>
          <div className="px-5">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex justify-start h-auto bg-transparent p-0 w-fit min-w-full">
                <TabsTrigger
                  value="TOUS"
                  className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                >
                  <span className="font-semibold text-xs md:text-sm">Tous</span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({roleStats.tous})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="SERVEUR"
                  className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                >
                  <span className="font-semibold text-xs md:text-sm">
                    Serveurs
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({roleStats.serveurs})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="CUISINIER"
                  className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                >
                  <span className="font-semibold text-xs md:text-sm">
                    Cuisiniers
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({roleStats.cuisiniers})
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        {/* Tableau harmonisé dans la Card */}
        <div className="bg-white rounded-b-3xl md:rounded-b-3xl overflow-hidden">
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
                <p className="text-lg font-medium">Aucune donnée disponible</p>
                <p className="text-sm mt-2">
                  {activeTab === "TOUS"
                    ? "Aucun personnel trouvé pour cette période"
                    : `Aucun ${activeTab.toLowerCase()} trouvé`}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-10 border-b border-slate-200">
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Employé
                    </th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Rôle
                    </th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Commandes
                    </th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Recettes
                    </th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Performance
                    </th>
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Temps Service
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((person: any, index: number) => (
                    <tr
                      key={person._id || index}
                      className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                    >
                      <td className="py-4 px-4 lg:px-6">
                        <div className="flex items-center gap-2">
                          {/* Avatar ou initiales */}
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 font-bold text-sm">
                            {(person.prenom?.[0] || "") +
                              (person.nom?.[0] || "")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {person.prenom} {person.nom}
                            </span>
                            <span className="text-xs text-gray-500">
                              {person.email || person.telephone || "-"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 lg:px-6">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            person.role === "SERVEUR"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {person.role === "SERVEUR"
                            ? "Serveur"
                            : person.role === "CUISINIER"
                            ? "Cuisinier"
                            : person.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 lg:px-6">
                        <span className="font-medium text-gray-900">
                          {person.nombreCommandes || person.totalCommandes || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 lg:px-6">
                        <span className="font-medium text-gray-900">
                          {formatPrice(person.recettesTotales || 0)} XOF
                        </span>
                      </td>
                      <td className="py-4 px-4 lg:px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
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
                      <td className="py-4 px-4 lg:px-6">
                        <span className="font-medium text-gray-900">
                          {person.tempsServiceMoyen ||
                            person.tempsPreparationMoyen ||
                            0}{" "}
                          min
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PersonnelStatsSection;
