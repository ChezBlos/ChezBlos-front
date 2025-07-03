import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  TrendUp,
  TrendDown,
  // CurrencyDollar,
  ChartBar,
  ChartPie,
} from "@phosphor-icons/react";
import { FilterIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  SalesBarChart,
  TrendLineChart,
  PaymentMethodChart,
  ComparisonChart,
} from "../../../../components/charts";
//import { AdvancedStatsService } from "../../../../services/advancedStatsService";
import api from "../../../../services/api";
import { SpinnerMedium } from "../../../../components/ui/spinner";

const CommandesRecettesStatsSection = ({
  advancedStats,
  dashboardStats,
  todayVsYesterday,
  // revenueChange,
  // monthlyRevenueData,
  // weeklyTrendData,
  // trendTitle = "Tendance des Commandes",
  paymentStats,
  topItems,
  comparisonData,
  formatPrice,
}: any) => {
  // États pour les filtres des courbes
  const [typeCourbeTendance, setTypeCourbeTendance] = useState<
    "hebdomadaire" | "mensuelle"
  >("hebdomadaire");
  const [typeCourbeVentes, setTypeCourbeVentes] = useState<
    "hebdomadaire" | "mensuelle"
  >("mensuelle");

  const [semaineCourbeTendance, setSemaineCourbeTendance] = useState(() => {
    // Calculer la date de début de la semaine actuelle (lundi)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche (0), aller au lundi précédent
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  });
  const [moisCourbeTendance, setMoisCourbeTendance] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  const [semaineCourbeVentes, setSemaineCourbeVentes] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  });
  const [moisCourbeVentes, setMoisCourbeVentes] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // États pour les données et chargement
  const [donneesCourbeTendance, setDonneesCourbeTendance] = useState<any[]>([]);
  const [donneesCourbeVentes, setDonneesCourbeVentes] = useState<any[]>([]);
  const [loadingTendance, setLoadingTendance] = useState(false);
  const [loadingVentes, setLoadingVentes] = useState(false);
  const [errorTendance, setErrorTendance] = useState<string | null>(null);
  const [errorVentes, setErrorVentes] = useState<string | null>(null);

  // États pour les modals
  const [modalOuvert, setModalOuvert] = useState<string | null>(null);
  const [valeursTemporaires, setValeursTemporaires] = useState({
    typeCourbeTendance: typeCourbeTendance,
    typeCourbeVentes: typeCourbeVentes,
    semaineCourbeTendance: semaineCourbeTendance,
    moisCourbeTendance: moisCourbeTendance,
    semaineCourbeVentes: semaineCourbeVentes,
    moisCourbeVentes: moisCourbeVentes,
  });

  // Fonctions pour gérer les modals
  const ouvrirModal = (type: string) => {
    setModalOuvert(type);
    setValeursTemporaires({
      typeCourbeTendance,
      typeCourbeVentes,
      semaineCourbeTendance,
      moisCourbeTendance,
      semaineCourbeVentes,
      moisCourbeVentes,
    });
  };

  const fermerModal = () => {
    setModalOuvert(null);
  };

  const appliquerFiltre = () => {
    if (modalOuvert === "tendance") {
      setTypeCourbeTendance(valeursTemporaires.typeCourbeTendance);
      setSemaineCourbeTendance(valeursTemporaires.semaineCourbeTendance);
      setMoisCourbeTendance(valeursTemporaires.moisCourbeTendance);
    } else if (modalOuvert === "ventes") {
      setTypeCourbeVentes(valeursTemporaires.typeCourbeVentes);
      setSemaineCourbeVentes(valeursTemporaires.semaineCourbeVentes);
      setMoisCourbeVentes(valeursTemporaires.moisCourbeVentes);
    }
    fermerModal();
  };

  // Fonction pour récupérer les données de commandes (tendance)
  const chargerDonneesCommandes = async (
    type: string,
    semaine: string,
    mois: string
  ) => {
    try {
      setLoadingTendance(true);
      setErrorTendance(null);

      let periode = "7days";
      let groupBy = "day";
      let dateDebut = "";
      let dateFin = "";

      if (type === "hebdomadaire") {
        const startDate = new Date(semaine);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        periode = "7days";
        groupBy = "day";
        dateDebut = startDate.toISOString().split("T")[0];
        dateFin = endDate.toISOString().split("T")[0];
      } else {
        const year = parseInt(mois.split("-")[0]);
        const month = parseInt(mois.split("-")[1]);
        const endDay = new Date(year, month, 0).getDate();

        periode = "30days";
        groupBy = "day";
        dateDebut = `${mois}-01`;
        dateFin = `${mois}-${endDay.toString().padStart(2, "0")}`;
      }

      console.log(
        `[chargerDonneesCommandes] Chargement: ${type}, ${dateDebut} à ${dateFin}`
      );

      // Utiliser l'API des statistiques de ventes pour les commandes avec authentification
      const response = await api.get(
        `/stats/sales?periode=${periode}&groupBy=${groupBy}&dateDebut=${dateDebut}&dateFin=${dateFin}`
      );
      const data = response.data;

      console.log(`[chargerDonneesCommandes] Réponse reçue:`, data);

      if (data.success && data.data?.data) {
        const donneesFormatees = data.data.data.map((item: any) => ({
          date: `${item._id.day}/${item._id.month}`,
          value: Number(item.commandes) || 0,
        }));
        console.log(
          `[chargerDonneesCommandes] Données formatées:`,
          donneesFormatees
        );
        setDonneesCourbeTendance(donneesFormatees);
      } else {
        console.log(`[chargerDonneesCommandes] Aucune donnée trouvée`);
        setDonneesCourbeTendance([]);
      }
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de commandes:",
        error
      );
      setErrorTendance("Erreur lors du chargement des données");
      setDonneesCourbeTendance([]);
    } finally {
      setLoadingTendance(false);
    }
  };

  // Fonction pour récupérer les données de ventes (utilise l'endpoint /api/recettes)
  const chargerDonneesVentes = async (
    type: string,
    semaine: string,
    mois: string
  ) => {
    try {
      setLoadingVentes(true);
      setErrorVentes(null);

      let startDate = "";
      let endDate = "";
      let groupBy = "day";

      if (type === "hebdomadaire") {
        const start = new Date(semaine);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        startDate = start.toISOString().split("T")[0];
        endDate = end.toISOString().split("T")[0];
        groupBy = "day";
      } else {
        const year = parseInt(mois.split("-")[0]);
        const month = parseInt(mois.split("-")[1]);
        const endDay = new Date(year, month, 0).getDate();

        startDate = `${mois}-01`;
        endDate = `${mois}-${endDay.toString().padStart(2, "0")}`;
        groupBy = "day";
      }

      console.log(
        `[chargerDonneesVentes] Chargement: ${type}, ${startDate} à ${endDate}`
      );

      const response = await api.get(
        `/recettes?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`
      );
      const data = response.data;

      console.log(`[chargerDonneesVentes] Réponse reçue:`, data);

      if (data.data && Array.isArray(data.data)) {
        const donneesFormatees = data.data.map((item: any) => ({
          date: `${item._id.day}/${item._id.month}`,
          commandes: Number(item.commandes) || 0,
          recettes: Number(item.recettes) || 0,
        }));
        console.log(
          `[chargerDonneesVentes] Données formatées:`,
          donneesFormatees
        );
        setDonneesCourbeVentes(donneesFormatees);
      } else {
        console.log(`[chargerDonneesVentes] Aucune donnée trouvée`);
        setDonneesCourbeVentes([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de ventes:", error);
      setErrorVentes("Erreur lors du chargement des données");
      setDonneesCourbeVentes([]);
    } finally {
      setLoadingVentes(false);
    }
  };

  // Charger les données au montage et quand les filtres changent
  useEffect(() => {
    chargerDonneesCommandes(
      typeCourbeTendance,
      semaineCourbeTendance,
      moisCourbeTendance
    );
  }, [typeCourbeTendance, semaineCourbeTendance, moisCourbeTendance]);

  useEffect(() => {
    chargerDonneesVentes(
      typeCourbeVentes,
      semaineCourbeVentes,
      moisCourbeVentes
    );
  }, [typeCourbeVentes, semaineCourbeVentes, moisCourbeVentes]);

  // Titres dynamiques pour les courbes
  const titreDynamiqueCourbeTendance = useMemo(() => {
    if (typeCourbeTendance === "hebdomadaire") {
      return `Commandes - Semaine du ${new Date(
        semaineCourbeTendance
      ).toLocaleDateString("fr-FR")}`;
    } else {
      const [year, month] = moisCourbeTendance.split("-");
      const monthNames = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      return `Commandes - ${monthNames[parseInt(month) - 1]} ${year}`;
    }
  }, [typeCourbeTendance, semaineCourbeTendance, moisCourbeTendance]);

  const titreDynamiqueCourbeVentes = useMemo(() => {
    if (typeCourbeVentes === "hebdomadaire") {
      return `Évolution des Ventes - Semaine du ${new Date(
        semaineCourbeVentes
      ).toLocaleDateString("fr-FR")}`;
    } else {
      const [year, month] = moisCourbeVentes.split("-");
      const monthNames = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      return `Évolution des Ventes - ${
        monthNames[parseInt(month) - 1]
      } ${year}`;
    }
  }, [typeCourbeVentes, semaineCourbeVentes, moisCourbeVentes]);

  // Fonction pour formater les noms des modes de paiement
  function formatPaymentMethodName(mode: string): string {
    const formatMap: { [key: string]: string } = {
      ESPECES: "Espèces",
      CARTE: "Carte Bancaire",
      CHEQUE: "Chèque",
      WAVE: "Wave",
      ORANGE_MONEY: "Orange Money",
      MOBILE_MONEY: "Mobile Money",
      MTN_MONEY: "MTN Money",
      MOOV_MONEY: "Moov Money",
      PAYPAL: "PayPal",
      VIREMENT: "Virement",
    };
    return (
      formatMap[mode] ||
      mode
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    );
  }

  // Transformer les données de paiement pour le graphique
  const transformedPaymentData =
    paymentStats?.data?.map((payment: any) => ({
      modePaiement: formatPaymentMethodName(payment._id) || "Inconnu",
      montantTotal: payment.montantTotal || 0,
      pourcentage: payment.pourcentageTransactions || 0,
    })) || [];

  return (
    <section className="space-y-6">
      {/* KPI Cards Performances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Commandes Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(advancedStats?.today?.commandes !== undefined
                    ? advancedStats.today.commandes
                    : dashboardStats?.today?.commandes) || 0}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {todayVsYesterday.isPositive ? (
                    <TrendUp size={16} className="text-green-600" />
                  ) : (
                    <TrendDown size={16} className="text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      todayVsYesterday.isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {todayVsYesterday.value.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">vs hier</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ChartBar size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Revenus Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(
                    (advancedStats?.today?.recettes !== undefined
                      ? advancedStats.today.recettes
                      : dashboardStats?.today?.recettes) || 0
                  )}{" "}
                  XOF
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {revenueChange.isPositive ? (
                    <TrendUp size={16} className="text-green-600" />
                  ) : (
                    <TrendDown size={16} className="text-red-600" />
                  )}
                  <span
                    className={`text-sm ${
                      revenueChange.isPositive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {revenueChange.value.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500">vs hier</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyDollar size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card> */}
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cette Semaine</p>
                <p className="text-xl font-bold text-gray-900">
                  {advancedStats?.week?.commandes !== undefined
                    ? advancedStats.week.commandes
                    : 0}{" "}
                  commandes
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ChartBar size={20} className="text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ce Mois</p>
                <p className="text-xl font-bold text-gray-900">
                  {advancedStats?.month?.commandes !== undefined
                    ? advancedStats.month.commandes
                    : 0}{" "}
                  commandes
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <ChartPie size={20} className="text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Graphiques de performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{titreDynamiqueCourbeVentes}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => ouvrirModal("ventes")}
                className="h-8 gap-2"
              >
                <FilterIcon className="h-4 w-4" />
                {typeCourbeVentes === "hebdomadaire"
                  ? "Hebdomadaire"
                  : "Mensuelle"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingVentes ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <SpinnerMedium />
              </div>
            ) : errorVentes ? (
              <div className="h-80 flex items-center justify-center text-red-500">
                Erreur: {errorVentes}
              </div>
            ) : donneesCourbeVentes && donneesCourbeVentes.length > 0 ? (
              <SalesBarChart data={donneesCourbeVentes} height={350} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{titreDynamiqueCourbeTendance}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => ouvrirModal("tendance")}
                className="h-8 gap-2"
              >
                <FilterIcon className="h-4 w-4" />
                {typeCourbeTendance === "hebdomadaire"
                  ? "Hebdomadaire"
                  : "Mensuelle"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTendance ? (
              <div className="h-80 flex items-center justify-center text-gray-500">
                <SpinnerMedium />
              </div>
            ) : errorTendance ? (
              <div className="h-80 flex items-center justify-center text-red-500">
                Erreur: {errorTendance}
              </div>
            ) : donneesCourbeTendance && donneesCourbeTendance.length > 0 ? (
              <TrendLineChart
                data={donneesCourbeTendance}
                title={titreDynamiqueCourbeTendance}
                color="#f97316"
                height={350}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modes de paiement et Top plats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Modes de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {transformedPaymentData && transformedPaymentData.length > 0 ? (
              <PaymentMethodChart data={transformedPaymentData} height={350} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Top Plats Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems && topItems.length > 0 ? (
                topItems.map((plat: any, index: number) => (
                  <div
                    key={plat._id || plat.id || index}
                    className="flex items-center justify-between p-3 bg-gray-5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {plat.nom || plat.name || "Plat inconnu"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {plat.totalVendu ||
                          plat.quantiteVendue ||
                          plat.quantity ||
                          0}{" "}
                        vendus
                      </span>
                      <span className="text-sm font-semibold">
                        {formatPrice(
                          plat.totalRecettes ||
                            plat.revenus ||
                            plat.revenue ||
                            plat.recettes ||
                            0
                        )}{" "}
                        XOF
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Comparaison des périodes */}
      {comparisonData && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des Périodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonChart data={comparisonData} height={300} />
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    {comparisonData.period1.label}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Commandes:</span>{" "}
                      <span className="font-medium">
                        {comparisonData.period1.commandes}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Recettes:</span>{" "}
                      <span className="font-medium">
                        {formatPrice(comparisonData.period1.recettes)} XOF
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">
                    {comparisonData.period2.label}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Commandes:</span>{" "}
                      <span className="font-medium">
                        {comparisonData.period2.commandes}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Recettes:</span>{" "}
                      <span className="font-medium">
                        {formatPrice(comparisonData.period2.recettes)} XOF
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-5 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Différences
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2">
                      <span className="text-gray-600">Commandes:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          comparisonData.differences.commandesPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {comparisonData.differences.commandesPercent >= 0 ? (
                          <TrendUp size={14} />
                        ) : (
                          <TrendDown size={14} />
                        )}
                        {Math.abs(
                          comparisonData.differences.commandesPercent
                        ).toFixed(1)}
                        %
                      </span>
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <span className="text-gray-600">Recettes:</span>
                      <span
                        className={`font-medium flex items-center gap-1 ${
                          comparisonData.differences.recettesPercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {comparisonData.differences.recettesPercent >= 0 ? (
                          <TrendUp size={14} />
                        ) : (
                          <TrendDown size={14} />
                        )}
                        {Math.abs(
                          comparisonData.differences.recettesPercent
                        ).toFixed(1)}
                        %
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de filtre pour la courbe de tendance des commandes */}
      <Dialog open={modalOuvert === "tendance"} onOpenChange={fermerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrer la courbe des commandes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type de période
              </label>
              <select
                value={valeursTemporaires.typeCourbeTendance}
                onChange={(e) =>
                  setValeursTemporaires({
                    ...valeursTemporaires,
                    typeCourbeTendance: e.target.value as
                      | "hebdomadaire"
                      | "mensuelle",
                  })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="hebdomadaire">Hebdomadaire (7 jours)</option>
                <option value="mensuelle">Mensuelle (par jour)</option>
              </select>
            </div>

            {valeursTemporaires.typeCourbeTendance === "hebdomadaire" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Début de semaine
                </label>
                <Input
                  type="date"
                  value={valeursTemporaires.semaineCourbeTendance}
                  onChange={(e) =>
                    setValeursTemporaires({
                      ...valeursTemporaires,
                      semaineCourbeTendance: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {valeursTemporaires.typeCourbeTendance === "mensuelle" && (
              <div>
                <label className="block text-sm font-medium mb-2">Mois</label>
                <Input
                  type="month"
                  value={valeursTemporaires.moisCourbeTendance}
                  onChange={(e) =>
                    setValeursTemporaires({
                      ...valeursTemporaires,
                      moisCourbeTendance: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={fermerModal}>
                Annuler
              </Button>
              <Button onClick={appliquerFiltre}>Appliquer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de filtre pour la courbe des ventes */}
      <Dialog open={modalOuvert === "ventes"} onOpenChange={fermerModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrer le diagramme des ventes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type de période
              </label>
              <select
                value={valeursTemporaires.typeCourbeVentes}
                onChange={(e) =>
                  setValeursTemporaires({
                    ...valeursTemporaires,
                    typeCourbeVentes: e.target.value as
                      | "hebdomadaire"
                      | "mensuelle",
                  })
                }
                className="w-full p-2 border rounded-md"
              >
                <option value="hebdomadaire">Hebdomadaire (7 jours)</option>
                <option value="mensuelle">Mensuelle (par jour)</option>
              </select>
            </div>

            {valeursTemporaires.typeCourbeVentes === "hebdomadaire" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Début de semaine
                </label>
                <Input
                  type="date"
                  value={valeursTemporaires.semaineCourbeVentes}
                  onChange={(e) =>
                    setValeursTemporaires({
                      ...valeursTemporaires,
                      semaineCourbeVentes: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {valeursTemporaires.typeCourbeVentes === "mensuelle" && (
              <div>
                <label className="block text-sm font-medium mb-2">Mois</label>
                <Input
                  type="month"
                  value={valeursTemporaires.moisCourbeVentes}
                  onChange={(e) =>
                    setValeursTemporaires({
                      ...valeursTemporaires,
                      moisCourbeVentes: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={fermerModal}>
                Annuler
              </Button>
              <Button onClick={appliquerFiltre}>Appliquer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CommandesRecettesStatsSection;
