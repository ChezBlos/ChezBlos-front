import { useState, useMemo } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Users, ArrowClockwise, ChefHat } from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";

// Props à compléter selon les besoins (données, handlers, etc.)
const PersonnelStatsSection = ({
  personnelStats,
  userStats,
  sortCriteria,
  setSortCriteria,
  personnelDateRange,
  setPersonnelDateRange,
  refetchPersonnelStats,
  personnelLoading,
  personnelError,
  sortedPersonnelData,
}: any) => {
  const [activeTab, setActiveTab] = useState("TOUS");

  // Fonction pour formater les prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  // Filtrage des données par rôle
  const filteredPersonnelData = useMemo(() => {
    if (!sortedPersonnelData || !Array.isArray(sortedPersonnelData)) return [];

    if (activeTab === "TOUS") {
      return sortedPersonnelData;
    }

    return sortedPersonnelData.filter(
      (personnel: any) => personnel.role === activeTab
    );
  }, [sortedPersonnelData, activeTab]);

  // Calculs de statistiques par rôle
  const roleStats = useMemo(() => {
    if (!sortedPersonnelData || !Array.isArray(sortedPersonnelData)) {
      return {
        tous: 0,
        serveurs: 0,
        cuisiniers: 0,
      };
    }

    const tous = sortedPersonnelData.length;
    const serveurs = sortedPersonnelData.filter(
      (p: any) => p.role === "SERVEUR"
    ).length;
    const cuisiniers = sortedPersonnelData.filter(
      (p: any) => p.role === "CUISINIER"
    ).length;

    return { tous, serveurs, cuisiniers };
  }, [sortedPersonnelData]);
  // Summary cards style AdminHistoriqueSection
  const summaryCards = [
    {
      title: "Personnel Actif",
      mobileTitle: "Actif",
      value: personnelLoading
        ? "..."
        : (
            personnelStats?.data?.statsGlobales?.personnelActif ??
            userStats?.actifs ??
            0
          ).toString(),
      subtitle: `sur ${
        personnelStats?.data?.statsGlobales?.totalPersonnel ??
        userStats?.total ??
        0
      } total`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Commandes Terminées",
      mobileTitle: "Terminées",
      value: personnelLoading
        ? "..."
        : (
            sortedPersonnelData?.reduce(
              (acc: number, p: any) => acc + (p.nombreCommandes || 0),
              0
            ) || 0
          ).toString(),
      subtitle: `Total période`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Commandes Annulées",
      mobileTitle: "Annulées",
      value: personnelLoading
        ? "..."
        : (
            sortedPersonnelData?.reduce(
              (acc: number, p: any) => acc + (p.commandesAnnulees || 0),
              0
            ) || 0
          ).toString(),
      subtitle: `Taux: ${
        sortedPersonnelData?.length > 0
          ? (
              (sortedPersonnelData.reduce(
                (acc: number, p: any) => acc + (p.commandesAnnulees || 0),
                0
              ) /
                (sortedPersonnelData.reduce(
                  (acc: number, p: any) =>
                    acc + (p.nombreCommandes || 0) + (p.commandesAnnulees || 0),
                  0
                ) || 1)) *
              100
            ).toFixed(1)
          : "0"
      }%`,
      subtitleColor: "text-red-500",
    },
    {
      title: "Recettes Totales",
      mobileTitle: "Recettes",
      value: personnelLoading
        ? "..."
        : formatPrice(
            sortedPersonnelData?.reduce(
              (acc: number, p: any) => acc + (p.recettesTotales || 0),
              0
            ) || 0
          ),
      currency: personnelLoading ? "" : "XOF",
      subtitle: "Période sélectionnée",
      subtitleColor: "text-orange-500",
    },
  ];

  // Fonctions pour les badges
  const getRoleBadge = (role: string) => {
    const roleColors = {
      SERVEUR: "bg-blue-100 text-blue-700",
      CUISINIER: "bg-green-100 text-green-700",
    };

    const colorClass =
      roleColors[role as keyof typeof roleColors] ||
      "bg-gray-100 text-gray-700";

    return (
      <Badge
        className={`${colorClass} rounded-full px-3 py-1 font-medium text-xs border`}
      >
        {role === "SERVEUR"
          ? "Serveur"
          : role === "CUISINIER"
          ? "Cuisinier"
          : role}
      </Badge>
    );
  };

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards - Style AdminHistoriqueSection */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                <span className="hidden sm:inline">{card.title}</span>
                <span className="sm:hidden">{card.mobileTitle}</span>
              </h3>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <p className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-900 truncate w-full">
                  {card.value}
                  {card.currency && (
                    <span className="text-sm ml-1">{card.currency}</span>
                  )}
                </p>
                <p
                  className={`text-xs sm:text-sm md:text-base ${card.subtitleColor} truncate w-full`}
                >
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carte principale - Style AdminHistoriqueSection */}
      <div className="my-0 md:mb-6 lg:mb-8 px-3 md:px-6">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and Search - Responsive */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            {" "}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              {" "}
              <div className="flex flex-col gap-1">
                <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                  Statistiques Détaillées du Personnel
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={sortCriteria}
                  onChange={(e) => setSortCriteria(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="performanceGlobale">
                    Trier par Performance
                  </option>
                  <option value="scoreEfficacite">Trier par Efficacité</option>
                  <option value="nombreCommandes">Trier par Commandes</option>
                  <option value="recettesTotales">Trier par Recettes</option>
                  <option value="tempsServiceMoyen">
                    Trier par Temps Service
                  </option>
                  <option value="nom">Trier par Nom</option>
                </select>
                <input
                  type="date"
                  value={personnelDateRange.dateDebut}
                  onChange={(e) =>
                    setPersonnelDateRange((prev: any) => ({
                      ...prev,
                      dateDebut: e.target.value,
                    }))
                  }
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-5">à</span>
                <input
                  type="date"
                  value={personnelDateRange.dateFin}
                  onChange={(e) =>
                    setPersonnelDateRange((prev: any) => ({
                      ...prev,
                      dateFin: e.target.value,
                    }))
                  }
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />{" "}
                <Button
                  onClick={refetchPersonnelStats}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={personnelLoading}
                >
                  <ArrowClockwise
                    size={16}
                    className={`mr-1 ${personnelLoading ? "animate-spin" : ""}`}
                  />
                  {personnelLoading ? "Actualisation..." : "Actualiser"}
                </Button>
              </div>
            </div>
            {/* Onglets de filtrage par rôle */}
            <div className="overflow-x-auto scrollbar-hide w-full">
              {" "}
              <div className="flex items-center gap-1 px-3 md:px-4 lg:px-6 pb-3 min-w-max">
                {[
                  {
                    key: "TOUS",
                    label: "Tous",
                    count: roleStats.tous,
                    icon: Users,
                  },
                  {
                    key: "SERVEUR",
                    label: "Serveurs",
                    count: roleStats.serveurs,
                    icon: Users,
                  },
                  {
                    key: "CUISINIER",
                    label: "Cuisiniers",
                    count: roleStats.cuisiniers,
                    icon: ChefHat,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    <span
                      className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                        activeTab === tab.key
                          ? "bg-orange-200 text-orange-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="w-full">
            {personnelLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-5">
                    Chargement des statistiques...
                  </p>
                </div>
              </div>
            ) : personnelError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center py-8 text-red-500">
                  <p>Erreur: {personnelError}</p>
                  <Button onClick={refetchPersonnelStats} className="mt-2">
                    Réessayer
                  </Button>
                </div>
              </div>
            ) : filteredPersonnelData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-5 py-8">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Aucune donnée de personnel disponible</p>
                  <p className="text-sm mt-2">
                    {activeTab === "TOUS"
                      ? "Aucun personnel trouvé pour cette période"
                      : `Aucun ${activeTab.toLowerCase()} trouvé pour cette période`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-5">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Personnel
                      </th>{" "}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      {activeTab !== "CUISINIER" && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commandes Terminées
                        </th>
                      )}
                      {activeTab !== "CUISINIER" && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commandes Annulées
                        </th>
                      )}
                      {activeTab !== "CUISINIER" && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Commandes
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === "CUISINIER"
                          ? "Plats Préparés"
                          : "Plats Servis"}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {activeTab === "CUISINIER"
                          ? "Temps Préparation (min)"
                          : "Temps Service (min)"}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score Efficacité
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      {activeTab !== "CUISINIER" && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recettes (XOF)
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPersonnelData.map(
                      (personnel: any, index: number) => (
                        <tr key={personnel._id} className="hover:bg-gray-5">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                  ? "bg-orange-600"
                                  : "bg-gray-300"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {(personnel.nom || "?").charAt(0)}
                                {(personnel.prenom || "?").charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {personnel.prenom || "Prénom"}{" "}
                                  {personnel.nom || "Nom"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {personnel.email || "Non renseigné"}
                                </div>
                              </div>
                            </div>
                          </td>{" "}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getRoleBadge(personnel.role || "Non défini")}
                          </td>
                          {activeTab !== "CUISINIER" && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="font-medium text-green-600">
                                {personnel.nombreCommandes ?? 0}
                              </div>
                            </td>
                          )}
                          {activeTab !== "CUISINIER" && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="font-medium text-red-600">
                                {personnel.commandesAnnulees ?? 0}
                              </div>
                            </td>
                          )}
                          {activeTab !== "CUISINIER" && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="font-medium text-blue-600">
                                {personnel.totalCommandes ?? 0}
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {personnel.nombrePlatsServis ?? 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div
                              className={`font-medium ${
                                typeof (activeTab === "CUISINIER"
                                  ? personnel.tempsPreparationMoyen
                                  : personnel.tempsServiceMoyen) === "number" &&
                                (activeTab === "CUISINIER"
                                  ? personnel.tempsPreparationMoyen
                                  : personnel.tempsServiceMoyen) <=
                                  (activeTab === "CUISINIER" ? 20 : 15)
                                  ? "text-green-600"
                                  : typeof (activeTab === "CUISINIER"
                                      ? personnel.tempsPreparationMoyen
                                      : personnel.tempsServiceMoyen) ===
                                      "number" &&
                                    (activeTab === "CUISINIER"
                                      ? personnel.tempsPreparationMoyen
                                      : personnel.tempsServiceMoyen) <=
                                      (activeTab === "CUISINIER" ? 30 : 25)
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {typeof (activeTab === "CUISINIER"
                                ? personnel.tempsPreparationMoyen
                                : personnel.tempsServiceMoyen) === "number"
                                ? (activeTab === "CUISINIER"
                                    ? personnel.tempsPreparationMoyen
                                    : personnel.tempsServiceMoyen
                                  ).toFixed(1)
                                : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div
                              className={`font-bold ${
                                typeof personnel.scoreEfficacite === "number" &&
                                personnel.scoreEfficacite >= 80
                                  ? "text-green-600"
                                  : typeof personnel.scoreEfficacite ===
                                      "number" &&
                                    personnel.scoreEfficacite >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {typeof personnel.scoreEfficacite === "number"
                                ? personnel.scoreEfficacite.toFixed(1)
                                : "-"}
                              %
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div
                              className={`font-bold ${
                                typeof personnel.performanceGlobale ===
                                  "number" && personnel.performanceGlobale >= 80
                                  ? "text-green-600"
                                  : typeof personnel.performanceGlobale ===
                                      "number" &&
                                    personnel.performanceGlobale >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {typeof personnel.performanceGlobale === "number"
                                ? personnel.performanceGlobale.toFixed(1)
                                : "-"}
                              %
                            </div>
                          </td>
                          {activeTab !== "CUISINIER" && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatPrice(personnel.recettesTotales ?? 0)}
                            </td>
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Légende des couleurs */}
          {filteredPersonnelData.length > 0 && (
            <div className="border-t bg-gray-5 px-3 md:px-4 lg:px-6 py-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Légende :
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">
                      {activeTab === "CUISINIER"
                        ? "Temps de Préparation"
                        : "Temps de Service"}{" "}
                      :
                    </span>
                    <div className="mt-1">
                      <span className="text-green-600">
                        • ≤ {activeTab === "CUISINIER" ? "20" : "15"}min :
                        Excellent
                      </span>
                      <br />
                      <span className="text-yellow-600">
                        • {activeTab === "CUISINIER" ? "20-30" : "15-25"}min :
                        Correct
                      </span>
                      <br />
                      <span className="text-red-600">
                        • &gt; {activeTab === "CUISINIER" ? "30" : "25"}min : À
                        améliorer
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Score d'Efficacité :</span>
                    <div className="mt-1">
                      <span className="text-green-600">
                        • ≥ 80% : Excellent
                      </span>
                      <br />
                      <span className="text-yellow-600">
                        • 60-79% : Correct
                      </span>
                      <br />
                      <span className="text-red-600">
                        • &lt; 60% : À améliorer
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Performance Globale :</span>
                    <div className="mt-1">
                      <span className="text-green-600">
                        • ≥ 80% : Top performer
                      </span>
                      <br />
                      <span className="text-yellow-600">
                        • 60-79% : Bon niveau
                      </span>
                      <br />
                      <span className="text-red-600">
                        • &lt; 60% : Formation requis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default PersonnelStatsSection;
