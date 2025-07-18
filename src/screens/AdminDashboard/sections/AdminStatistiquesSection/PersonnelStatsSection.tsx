import { useState, useEffect } from "react";
import { Users, ChefHat, XCircle } from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import { UserAvatar } from "../../../../components/UserAvatar";
import api from "../../../../services/api";

// Composant amélioré pour le tableau du personnel avec appels API spécifiques
const PersonnelStatsSection = ({
  personnelStats,
  refetchPersonnelStats,
  personnelLoading,
  personnelError,
  sortedPersonnelData,
}: any) => {
  const [activeTab, setActiveTab] = useState("SERVEUR");
  const [cuisiniersData, setCuisiniersData] = useState<any[]>([]);
  const [loadingCuisiniers, setLoadingCuisiniers] = useState(false);
  const [errorCuisiniers, setErrorCuisiniers] = useState<string | null>(null);

  // Fonction pour récupérer les données des cuisiniers
  const fetchCuisiniersData = async () => {
    try {
      setLoadingCuisiniers(true);
      setErrorCuisiniers(null);

      console.log("🔍 Récupération des données des cuisiniers...");
      const response = await api.get("/stats/cuisiniers?periode=30days");

      console.log("📋 Réponse complète de l'API cuisiniers:", response);
      console.log("📊 response.data:", response.data);
      console.log("🔍 response.data?.success:", response.data?.success);
      console.log("🔍 response.data?.data:", response.data?.data);
      console.log(
        "🔍 response.data?.data?.detailsPersonnel:",
        response.data?.data?.detailsPersonnel
      );

      // La structure est response.data.data.data.detailsPersonnel (double nesting)
      const cuisiniersArray = response.data?.data?.data?.detailsPersonnel;

      if (
        response.data?.success &&
        cuisiniersArray &&
        Array.isArray(cuisiniersArray)
      ) {
        setCuisiniersData(cuisiniersArray);
        console.log(
          "✅ Données cuisiniers récupérées:",
          cuisiniersArray.length,
          "cuisiniers"
        );

        // Afficher le détail des données pour vérifier leur contenu
        console.log("📋 DÉTAIL DES DONNÉES CUISINIERS:");
        cuisiniersArray.forEach((cuisinier, index) => {
          console.log(`👨‍🍳 Cuisinier ${index + 1}:`, {
            nom: cuisinier.nom,
            prenom: cuisinier.prenom,
            platsCuisines: cuisinier.platsCuisines,
            nombreCommandes: cuisinier.nombreCommandes,
            tempsPreparationMoyen: cuisinier.tempsPreparationMoyen,
            recettesGenerees: cuisinier.recettesGenerees,
            performanceGlobale: cuisinier.performanceGlobale,
            scoreEfficacite: cuisinier.scoreEfficacite,
          });
        });
      } else {
        console.warn("⚠️ Aucune donnée cuisiniers trouvée - structure:", {
          success: response.data?.success,
          hasData: !!response.data?.data,
          hasNestedData: !!response.data?.data?.data,
          hasPersonnel: !!response.data?.data?.data?.detailsPersonnel,
          dataKeys: response.data?.data
            ? Object.keys(response.data.data)
            : "aucune",
          nestedDataKeys: response.data?.data?.data
            ? Object.keys(response.data.data.data)
            : "aucune",
        });
        setCuisiniersData([]);
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des données cuisiniers:",
        error
      );
      setErrorCuisiniers("Erreur lors du chargement des données cuisiniers");
      setCuisiniersData([]);
    } finally {
      setLoadingCuisiniers(false);
    }
  };

  // Charger les données des cuisiniers quand l'onglet change
  useEffect(() => {
    if (activeTab === "CUISINIER") {
      fetchCuisiniersData();
    }
  }, [activeTab]);

  // Extraction des données depuis personnelStats avec la bonne structure
  const rawPersonnelData =
    (personnelStats as any)?.data?.data?.detailsPersonnel || [];
  const personnelDataToUse =
    rawPersonnelData.length > 0 ? rawPersonnelData : sortedPersonnelData || [];

  // Fonction pour formater les prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price || 0);
  };

  // Séparer les données par rôle
  const serveurs = personnelDataToUse.filter(
    (person: any) => person.role === "SERVEUR"
  );

  // Utiliser les données spécifiques aux cuisiniers si disponibles
  const cuisiniers =
    activeTab === "CUISINIER" && cuisiniersData.length > 0
      ? cuisiniersData
      : personnelDataToUse.filter((person: any) => person.role === "CUISINIER");

  // Données filtrées selon l'onglet actif
  const filteredData = activeTab === "SERVEUR" ? serveurs : cuisiniers;

  // États de chargement et d'erreur selon l'onglet actif
  const isLoading =
    activeTab === "SERVEUR" ? personnelLoading : loadingCuisiniers;
  const hasError = activeTab === "SERVEUR" ? personnelError : errorCuisiniers;

  // Stats par rôle
  const roleStats = {
    serveurs: serveurs.length,
    cuisiniers: cuisiniers.length,
  };

  // Calculs pour les cards selon le rôle actif
  const getStatsForActiveTab = () => {
    const currentData = filteredData;

    if (activeTab === "SERVEUR") {
      return {
        totalCommandes: currentData.reduce(
          (acc: number, p: any) => acc + (p.nombreCommandes || 0),
          0
        ),
        totalTerminees: currentData.reduce(
          (acc: number, p: any) => acc + (p.commandesTerminees || 0),
          0
        ),
        totalAnnulees: currentData.reduce(
          (acc: number, p: any) => acc + (p.commandesAnnulees || 0),
          0
        ),
        totalRecettes: currentData.reduce(
          (acc: number, p: any) => acc + (p.recettesTotales || 0),
          0
        ),
      };
    } else {
      return {
        totalPlats: currentData.reduce(
          (acc: number, p: any) => acc + (p.platsCuisines || p.totalPlats || 0),
          0
        ),
        totalPreparations: currentData.reduce(
          (acc: number, p: any) => acc + (p.nombrePreparations || 0),
          0
        ),
        tempsPreparationMoyen:
          currentData.length > 0
            ? currentData.reduce(
                (acc: number, p: any) => acc + (p.tempsPreparationMoyen || 0),
                0
              ) / currentData.length
            : 0,
      };
    }
  };

  const currentStats = getStatsForActiveTab();

  return (
    <div className="space-y-6">
      {/* Cards de résumé selon le rôle actif */}
      {activeTab === "SERVEUR" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Serveurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roleStats.serveurs}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">Total actifs</p>
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
                    {currentStats.totalCommandes}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Total effectuées
                  </p>
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
                    {formatPrice(currentStats.totalRecettes)} XOF
                  </p>
                  <p className="text-sm text-purple-600 mt-2">
                    Chiffre d'affaires
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ChefHat size={24} className="text-purple-600" />
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
                    {currentStats.totalAnnulees}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Commandes annulées
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle size={24} className="text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cuisiniers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roleStats.cuisiniers}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">Total actifs</p>
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
                  <p className="text-sm text-gray-600 mb-1">Plats Cuisinés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentStats.totalPlats}
                  </p>
                  <p className="text-sm text-green-600 mt-2">Total préparés</p>
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
                  <p className="text-sm text-gray-600 mb-1">Temps Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(currentStats.tempsPreparationMoyen || 0)} min
                  </p>
                  <p className="text-sm text-orange-600 mt-2">Préparation</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ChefHat size={24} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  value="SERVEUR"
                  className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                >
                  <span className="font-semibold text-xs md:text-sm">
                    Serveurs
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="CUISINIER"
                  className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                >
                  <span className="font-semibold text-xs md:text-sm">
                    Cuisiniers
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        {/* Tableau harmonisé dans la Card */}
        <div className="bg-white rounded-b-3xl md:rounded-b-3xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <SpinnerMedium />
              </div>
            </div>
          ) : hasError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-500">
                <p>Erreur: {hasError}</p>
                <Button
                  onClick={
                    activeTab === "SERVEUR"
                      ? refetchPersonnelStats
                      : fetchCuisiniersData
                  }
                  className="mt-2"
                >
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
                  {activeTab === "SERVEUR"
                    ? "Aucun serveur trouvé"
                    : "Aucun cuisinier trouvé"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-10 border-b border-slate-200">
                    <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      {activeTab === "SERVEUR" ? "Serveur" : "Cuisinier"}
                    </th>
                    {activeTab === "SERVEUR" ? (
                      <>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Commandes éffectuées
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Commandes terminées
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Commandes annulées
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Recettes
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Performance
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Plats Cuisinés
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Commandes terminées
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Temps Moyen
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Recettes Générées
                        </th>
                        <th className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Score d'Efficacité
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((person: any, index: number) => {
                    // Debug pour voir les données de chaque personne
                    if (activeTab === "CUISINIER") {
                      console.log(`🔍 Données cuisinier ${index}:`, {
                        nom: person.nom,
                        prenom: person.prenom,
                        platsCuisines: person.platsCuisines,
                        totalPlats: person.totalPlats,
                        tempsPreparationMoyen: person.tempsPreparationMoyen,
                        tempsMoyen: person.tempsMoyen,
                        recettesGenerees: person.recettesGenerees,
                        scoreEfficacite: person.scoreEfficacite,
                        qualiteDonnees: person.qualiteDonnees,
                        toutesLesCles: Object.keys(person),
                      });
                    }

                    return (
                      <tr
                        key={person._id || index}
                        className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                      >
                        <td className="py-4 px-4 lg:px-6">
                          <div className="flex items-center gap-2">
                            {/* Avatar avec image ou initiales */}
                            <UserAvatar
                              photo={person.photoProfil}
                              nom={person.nom}
                              prenom={person.prenom}
                              size="sm"
                            />
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
                        {activeTab === "SERVEUR" ? (
                          <>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-gray-900">
                                {person.nombreCommandes ||
                                  person.totalCommandes ||
                                  0}
                              </span>
                            </td>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-green-600">
                                {person.commandesTerminees || 0}
                              </span>
                            </td>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-red-600">
                                {person.commandesAnnulees || 0}
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
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-gray-900">
                                {person.platsCuisines || person.totalPlats || 0}
                              </span>
                            </td>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-green-600">
                                {person.nombreCommandes || 0}
                              </span>
                            </td>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-gray-900">
                                {person.tempsPreparationMoyen
                                  ? `${Math.round(
                                      person.tempsPreparationMoyen
                                    )} min`
                                  : "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-gray-900">
                                {formatPrice(person.recettesGenerees || 0)} XOF
                              </span>
                            </td>
                            <td className="py-4 px-4 lg:px-6">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        person.scoreEfficacite || 0,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs">
                                  {Math.round(person.scoreEfficacite || 0)}%
                                </span>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
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
