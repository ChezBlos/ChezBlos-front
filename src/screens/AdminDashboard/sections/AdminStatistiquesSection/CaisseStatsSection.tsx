import { useState, useMemo } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { FilterIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { TrendLineChart } from "../../../../components/charts";
import { useRecettes } from "../../../../hooks/useRecettes";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import { DatePicker } from "../../../../components/ui/date-picker";
import { MonthPicker } from "../../../../components/ui/month-picker";
import { YearPicker } from "../../../../components/ui/year-picker";

export const CaisseStatsSection: React.FC = () => {
  // États pour les filtres spécifiques de chaque card
  const [dateJour, setDateJour] = useState(new Date());
  const [dateMois, setDateMois] = useState(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM
  const [dateAnnee, setDateAnnee] = useState(
    new Date().getFullYear().toString()
  );

  // État pour le type de courbe et ses paramètres
  const [typeCourbe, setTypeCourbe] = useState<"mensuelle" | "annuelle">(
    "annuelle"
  );
  const [moisCourbe, setMoisCourbe] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM pour la courbe mensuelle
  );
  const [anneeCourbe, setAnneeCourbe] = useState(
    new Date().getFullYear().toString() // YYYY pour la courbe annuelle
  );

  // États pour les modals
  const [modalOuvert, setModalOuvert] = useState<string | null>(null);
  const [valeursTemporaires, setValeursTemporaires] = useState({
    dateJour: dateJour,
    dateMois: dateMois,
    dateAnnee: dateAnnee,
    typeCourbe: typeCourbe,
    moisCourbe: moisCourbe,
    anneeCourbe: anneeCourbe,
  });

  // Fonctions pour gérer les modals
  const ouvrirModal = (type: string) => {
    setModalOuvert(type);
    // Synchroniser les valeurs temporaires avec les valeurs actuelles
    setValeursTemporaires({
      dateJour,
      dateMois,
      dateAnnee,
      typeCourbe,
      moisCourbe,
      anneeCourbe,
    });
  };

  const fermerModal = () => {
    setModalOuvert(null);
  };

  const appliquerFiltre = () => {
    if (modalOuvert === "jour") {
      setDateJour(valeursTemporaires.dateJour);
    } else if (modalOuvert === "mois") {
      setDateMois(valeursTemporaires.dateMois);
    } else if (modalOuvert === "annee") {
      setDateAnnee(valeursTemporaires.dateAnnee);
    } else if (modalOuvert === "courbe") {
      setTypeCourbe(valeursTemporaires.typeCourbe);
      setMoisCourbe(valeursTemporaires.moisCourbe);
      setAnneeCourbe(valeursTemporaires.anneeCourbe);
    }
    fermerModal();
  };

  // Mémorisation des paramètres calculés pour éviter les recalculs inutiles
  const filtreMois = useMemo(() => {
    const endDate = `${dateMois}-${new Date(
      parseInt(dateMois.split("-")[0]),
      parseInt(dateMois.split("-")[1]),
      0
    )
      .getDate()
      .toString()
      .padStart(2, "0")}`;

    return {
      mode: "period" as const,
      startDate: `${dateMois}-01`,
      endDate,
    };
  }, [dateMois]);

  const filtreAnnee = useMemo(
    () => ({
      mode: "period" as const,
      startDate: `${dateAnnee}-01-01`,
      endDate: `${dateAnnee}-12-31`,
    }),
    [dateAnnee]
  );

  // Calcul des paramètres pour la courbe selon le type
  const parametresCourbe = useMemo(() => {
    if (typeCourbe === "mensuelle") {
      const endDate = `${moisCourbe}-${new Date(
        parseInt(moisCourbe.split("-")[0]),
        parseInt(moisCourbe.split("-")[1]),
        0
      )
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      return {
        // Courbe mensuelle : afficher les jours du mois sélectionné
        startDate: `${moisCourbe}-01`,
        endDate,
        groupBy: "day" as const,
      };
    } else {
      return {
        // Courbe annuelle : afficher les mois de l'année sélectionnée
        startDate: `${anneeCourbe}-01-01`,
        endDate: `${anneeCourbe}-12-31`,
        groupBy: "month" as const,
      };
    }
  }, [typeCourbe, moisCourbe, anneeCourbe]);

  // Chargement des données pour chaque filtre
  const {
    data: dataJour,
    loading: loadingJour,
    error: errorJour,
  } = useRecettes({
    mode: "single",
    date: dateJour.toISOString().split("T")[0],
  });

  const {
    data: dataMois,
    loading: loadingMois,
    error: errorMois,
  } = useRecettes(filtreMois);

  const {
    data: dataAnnee,
    loading: loadingAnnee,
    error: errorAnnee,
  } = useRecettes(filtreAnnee);

  const {
    data: dataCourbe,
    loading: loadingCourbe,
    error: errorCourbe,
  } = useRecettes(
    {
      mode: "period",
      startDate: parametresCourbe.startDate,
      endDate: parametresCourbe.endDate,
    },
    parametresCourbe.groupBy
  );

  // Calculs des recettes pour chaque période
  const recettesJour = dataJour.reduce(
    (acc, row) => acc + (row.recettes || 0),
    0
  );
  const recettesMois = dataMois.reduce(
    (acc, row) => acc + (row.recettes || 0),
    0
  );
  const recettesAnnee = dataAnnee.reduce(
    (acc, row) => acc + (row.recettes || 0),
    0
  );

  // Données pour la courbe
  const courbeDonnees = dataCourbe.map((row) => {
    if (typeCourbe === "mensuelle") {
      // Affichage jour/mois/année pour la courbe mensuelle
      return {
        date: `${row._id.day}/${row._id.month}`,
        value: row.recettes,
      };
    } else {
      // Affichage mois/année pour la courbe annuelle
      const moisNoms = [
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
      return {
        date: `${moisNoms[row._id.month - 1]} ${row._id.year}`,
        value: row.recettes,
      };
    }
  });

  // Log temporaire pour debug de la courbe
  console.log("🔍 [CaisseStatsSection] Données brutes reçues:", dataCourbe);
  console.log(
    "🔍 [CaisseStatsSection] Données transformées pour la courbe:",
    courbeDonnees
  );
  console.log("🔍 [CaisseStatsSection] Paramètres courbe:", parametresCourbe);

  // Fonction pour formater les montants
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat("fr-FR").format(montant) + " XOF";
  };

  // Cards avec leurs données et filtres spécifiques
  const summaryCards = [
    {
      title: "Recettes du jour",
      value: formatMontant(recettesJour),
      subtitle: `Le ${dateJour.toLocaleDateString("fr-FR")}`,
      color: "text-orange-500",
      loading: loadingJour,
      error: errorJour,
      modalType: "jour",
    },
    {
      title: "Recettes du mois",
      value: formatMontant(recettesMois),
      subtitle: `${new Date(dateMois + "-01").toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })}`,
      color: "text-green-600",
      loading: loadingMois,
      error: errorMois,
      modalType: "mois",
    },
    {
      title: "Recettes de l'année",
      value: formatMontant(recettesAnnee),
      subtitle: `Année ${dateAnnee}`,
      color: "text-blue-600",
      loading: loadingAnnee,
      error: errorAnnee,
      modalType: "annee",
    },
  ];

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards avec filtres individuels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="bg-white rounded-2xl md:rounded-3xl overflow-hidden"
          >
            <CardContent className="flex flex-col items-start gap-3 md:gap-4 p-4 md:p-6">
              {/* Header avec titre et bouton filtre */}
              <div className="flex items-center justify-between w-full">
                <h3 className="font-semibold text-base md:text-lg text-gray-900">
                  {card.title}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => ouvrirModal(card.modalType)}
                  className="flex items-center gap-2 h-8 px-3"
                >
                  <FilterIcon className="h-4 w-4" />
                  <span className="text-xs">Filtrer</span>
                </Button>
              </div>

              {/* Contenu de la card */}
              {card.loading ? (
                <div className="text-center text-gray-400 py-4 w-full">
                  <SpinnerMedium />
                </div>
              ) : card.error ? (
                <div className="text-center text-red-500 py-4 w-full text-sm">
                  {card.error}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-1 w-full">
                  <span className="font-bold text-2xl md:text-3xl text-gray-900">
                    {card.value}
                  </span>
                  <span className={`font-medium text-sm ${card.color}`}>
                    {card.subtitle}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courbe évolutive avec filtre de période */}
      <Card className="rounded-2xl md:rounded-3xl overflow-hidden w-full">
        <div className="flex flex-col bg-white">
          <div className="flex flex-row items-center justify-between px-4 md:px-6 pt-4 pb-3 gap-3">
            <div className="flex flex-col">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900">
                Évolution des recettes
              </h2>
              <span className="text-sm text-gray-500">
                Courbe{" "}
                {typeCourbe === "mensuelle"
                  ? "mensuelle (évolution quotidienne)"
                  : "annuelle (évolution mensuelle)"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => ouvrirModal("courbe")}
              className="flex items-center gap-2 h-8 px-3"
            >
              <FilterIcon className="h-4 w-4" />
              <span className="text-xs">Filtre</span>
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="w-full">
            {loadingCourbe ? (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <SpinnerMedium />
              </div>
            ) : errorCourbe ? (
              <div className="flex items-center justify-center h-40 text-red-500">
                {errorCourbe}
              </div>
            ) : courbeDonnees.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400">
                Aucune donnée pour cette période
              </div>
            ) : (
              <div className="p-4">
                <TrendLineChart
                  data={courbeDonnees}
                  title={`Évolution des recettes - ${
                    typeCourbe === "mensuelle"
                      ? "Courbe mensuelle"
                      : "Courbe annuelle"
                  }`}
                  color="#f97316"
                  height={320}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals pour les filtres */}
      <Dialog open={modalOuvert !== null} onOpenChange={fermerModal}>
        <DialogContent className="max-w-md mx-auto p-0 gap-0 rounded-3xl overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-title-t3-semibold text-gray-900 flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                {modalOuvert === "jour" && "Filtrer par jour"}
                {modalOuvert === "mois" && "Filtrer par mois"}
                {modalOuvert === "annee" && "Filtrer par année"}
                {modalOuvert === "courbe" && "Configurer la courbe"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={fermerModal}
                className="h-8 w-8 rounded-full hover:bg-gray-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 py-5">
            <div className="space-y-4">
              {modalOuvert === "jour" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une date
                  </label>
                  <DatePicker
                    date={valeursTemporaires.dateJour}
                    onSelect={(date) =>
                      setValeursTemporaires((prev) => ({
                        ...prev,
                        dateJour: date || new Date(),
                      }))
                    }
                    placeholder="Sélectionner une date"
                  />
                </div>
              )}

              {modalOuvert === "mois" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un mois
                  </label>
                  <MonthPicker
                    date={valeursTemporaires.dateMois}
                    onSelect={(month) =>
                      setValeursTemporaires((prev) => ({
                        ...prev,
                        dateMois: month,
                      }))
                    }
                    placeholder="Choisir un mois"
                  />
                </div>
              )}

              {modalOuvert === "annee" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner une année
                  </label>
                  <YearPicker
                    year={valeursTemporaires.dateAnnee}
                    onSelect={(year) =>
                      setValeursTemporaires((prev) => ({
                        ...prev,
                        dateAnnee: year,
                      }))
                    }
                    placeholder="Choisir une année"
                    minYear={2020}
                    maxYear={2030}
                  />
                </div>
              )}

              {modalOuvert === "courbe" && (
                <div className="space-y-4">
                  {/* Choix du type de courbe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de courbe
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        // variant={
                        //   valeursTemporaires.typeCourbe === "mensuelle"
                        //     ? "default"
                        //     : "outline"
                        // }
                        size="sm"
                        onClick={() =>
                          setValeursTemporaires((prev) => ({
                            ...prev,
                            typeCourbe: "mensuelle",
                          }))
                        }
                        className={
                          valeursTemporaires.typeCourbe === "mensuelle"
                            ? "w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white"
                            : "w-full bg-white hover:bg-gray-5 border border-gray-200 text-black"
                        }
                      >
                        Mensuelle
                      </Button>
                      <Button
                        type="button"
                        // variant={
                        //   valeursTemporaires.typeCourbe === "annuelle"
                        //     ? "default"
                        //     : "outline"
                        // }
                        size="sm"
                        onClick={() =>
                          setValeursTemporaires((prev) => ({
                            ...prev,
                            typeCourbe: "annuelle",
                          }))
                        }
                        className={
                          valeursTemporaires.typeCourbe === "annuelle"
                            ? "w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white"
                            : "w-full bg-white hover:bg-gray-5 border border-gray-200 text-black"
                        }
                      >
                        Annuelle
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {valeursTemporaires.typeCourbe === "mensuelle"
                        ? "Évolution quotidienne dans un mois"
                        : "Évolution mensuelle dans une année"}
                    </p>
                  </div>

                  {/* Sélection conditionnelle selon le type */}
                  {valeursTemporaires.typeCourbe === "mensuelle" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner un mois
                      </label>
                      <MonthPicker
                        date={valeursTemporaires.moisCourbe}
                        onSelect={(month) =>
                          setValeursTemporaires((prev) => ({
                            ...prev,
                            moisCourbe: month,
                          }))
                        }
                        placeholder="Choisir un mois"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner une année
                      </label>
                      <YearPicker
                        year={valeursTemporaires.anneeCourbe}
                        onSelect={(year) =>
                          setValeursTemporaires((prev) => ({
                            ...prev,
                            anneeCourbe: year,
                          }))
                        }
                        placeholder="Choisir une année"
                        minYear={2020}
                        maxYear={2030}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 pb-5">
            <Button variant="ghost" onClick={fermerModal}>
              Annuler
            </Button>
            <Button
              className="bg-brand-primary-500 hover:bg-brand-primary-600 text-white"
              onClick={appliquerFiltre}
            >
              Appliquer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
