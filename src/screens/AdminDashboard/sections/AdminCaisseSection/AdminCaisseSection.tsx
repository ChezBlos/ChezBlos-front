import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
// import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../../components/ui/table";
import { Funnel } from "@phosphor-icons/react";
import { Button } from "../../../../components/ui/button";
import { ChartPie } from "@phosphor-icons/react";
import { PaymentMethodChart } from "../../../../components/charts";
import { useCaisseStats } from "../../../../hooks/useCaisseStats";
import { DatePicker } from "../../../../components/ui/date-picker";

function formatPaymentMethodName(mode: string): string {
  const formatMap: Record<string, string> = {
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
      .replace(/\b\w/g, (l: string) => l.toUpperCase())
  );
}

export const AdminCaisseSection: React.FC = () => {
  // States pour les filtres
  const [searchTerm] = useState(""); // Pour recherche future
  const [date, setDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  // Utilisation du hook optimisé
  const { loading, error, formattedData, refetch } = useCaisseStats({
    date,
    startDate,
    endDate,
  });

  // Déstructuration des données formatées
  const { summaryCards, recettesParJour, paymentStats } = formattedData || {
    summaryCards: [],
    recettesParJour: [],
    paymentStats: [],
  };

  // Filtrage par recherche et date (sur les données API)
  const filteredRecettes = useMemo(() => {
    return recettesParJour.filter((row: any) => {
      const matchSearch =
        searchTerm === "" ||
        row.date.includes(searchTerm) ||
        row.ca.toString().includes(searchTerm) ||
        row.commandes.toString().includes(searchTerm);
      let matchDate = true;
      if (date) matchDate = row.date === date;
      if (startDate && endDate)
        matchDate = row.date >= startDate && row.date <= endDate;
      else if (startDate) matchDate = row.date >= startDate;
      else if (endDate) matchDate = row.date <= endDate;
      return matchSearch && matchDate;
    });
  }, [recettesParJour, searchTerm, date, startDate, endDate]);

  // Agrégation des stats de paiement filtrées (ici, on prend tout le paymentStats de l'API)
  const paymentStatsAgg = paymentStats.map((stat: any) => ({
    modePaiement: formatPaymentMethodName(stat._id),
    montantTotal: stat.montantTotal,
    pourcentage: stat.pourcentageTransactions,
  }));

  // Handler pour le modal (à adapter selon le code réel)
  const handleApplyDateFilter = (params: {
    date?: string;
    start?: string;
    end?: string;
  }) => {
    setDate(params.date || null);
    setStartDate(params.start || null);
    setEndDate(params.end || null);
    setIsDateFilterOpen(false);
  };

  // Modal de filtre par date (composant local)
  const DateFilterModal = ({
    isOpen,
    onClose,
    onApply,
    currentDate,
    currentStart,
    currentEnd,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onApply: (params: { date?: string; start?: string; end?: string }) => void;
    currentDate: string | null;
    currentStart: string | null;
    currentEnd: string | null;
  }) => {
    const [localDate, setLocalDate] = useState<Date | undefined>(
      currentDate ? new Date(currentDate) : undefined
    );
    const [localStart, setLocalStart] = useState<Date | undefined>(
      currentStart ? new Date(currentStart) : undefined
    );
    const [localEnd, setLocalEnd] = useState<Date | undefined>(
      currentEnd ? new Date(currentEnd) : undefined
    );

    const handleApply = () => {
      const dateStr = localDate ? localDate.toISOString().split("T")[0] : "";
      const startStr = localStart ? localStart.toISOString().split("T")[0] : "";
      const endStr = localEnd ? localEnd.toISOString().split("T")[0] : "";
      onApply({ date: dateStr, start: startStr, end: endStr });
      onClose();
    };

    const handleClear = () => {
      setLocalDate(undefined);
      setLocalStart(undefined);
      setLocalEnd(undefined);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h3 className="font-bold text-lg mb-4">Filtrer par date</h3>
          <div className="flex flex-col gap-3">
            <label className="text-xs">Date précise :</label>
            <DatePicker
              date={localDate}
              onSelect={setLocalDate}
              placeholder="Sélectionner une date"
            />
            <label className="text-xs mt-2">Ou intervalle :</label>
            <div className="flex flex-col gap-2">
              <DatePicker
                date={localStart}
                onSelect={setLocalStart}
                placeholder="Date de début"
              />
              <DatePicker
                date={localEnd}
                onSelect={setLocalEnd}
                placeholder="Date de fin"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              className="px-3 py-1 rounded border text-gray-700"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              className="px-3 py-1 rounded border text-gray-700"
              onClick={handleClear}
              type="button"
            >
              Réinitialiser
            </button>
            <button
              className="px-3 py-1 rounded bg-orange-500 text-white"
              onClick={handleApply}
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Gestion du loading et des erreurs */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Chargement des données...</span>
        </div>
      )}

      {error && (
        <div className="mx-3 md:mx-6 lg:mx-12 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur de chargement
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={refetch}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center justify-end px-3 md:px-6 lg:px-12 mt-4  md:mt-6 lg:mt-8 ">
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-full border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100"
              onClick={() => setIsDateFilterOpen(true)}
            >
              <Funnel className="h-5 w-5" />
              Filtrer par date
            </Button>
          </div>

          {/* Summary Cards + Donut Chart */}
          <div className="px-3 md:px-6 lg:px-12 flex flex-col md:flex-row items-start gap-4 md:gap-6 w-full min-w-0">
            <div className="flex-1 flex flex-row gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
              {summaryCards.map((card: any, index: number) => (
                <Card
                  key={index}
                  className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0"
                >
                  <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                      {card.title}
                    </h3>
                    <div className="flex flex-col items-start gap-1 w-full min-w-0">
                      <div className="flex items-start gap-1 w-full min-w-0">
                        <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
                          {card.value}
                        </span>
                      </div>
                      <div className="flex items-start gap-1 w-full min-w-0">
                        <span
                          className={`font-medium text-xs md:text-sm ${card.color} truncate w-full`}
                        >
                          {card.subtitle}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          {/* Tableau des recettes par jour - version desktop only, header épais, pas de fallback mobile */}
          <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12 h-full flex flex-col md:flex-row items-start gap-4 md:gap-6 w-full min-w-0">
            <Card className="rounded-t-2xl  border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
              <div className="flex flex-col bg-white border-slate-200">
                <div className="flex flex-row items-center justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
                  <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                    Recettes par jour
                  </h2>
                  {/* <div className="relative flex-1 lg:w-80 max-w-xs ml-auto">
                <Input
                  className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                  placeholder="Rechercher une date, un montant, une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <MagnifyingGlass className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
              </div> */}
                </div>
              </div>
              <CardContent className="p-0">
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-10 border-b border-slate-200">
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Date
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Chiffre d'affaires
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Commandes
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecettes.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-gray-400 py-8"
                          >
                            Aucune donnée trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecettes.map((row: any, idx: number) => (
                          <TableRow
                            key={idx}
                            className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                          >
                            <TableCell className="py-4 px-4 lg:px-6 font-medium text-gray-900">
                              {row.date}
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6 font-semibold text-orange-600">
                              {row.ca} XOF
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6 font-medium text-gray-900">
                              {row.commandes}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Donut chart modes de paiement */}
            <div className="w-1/3 flex-shrink-0 mt-2 md:mt-0">
              <Card className="bg-white rounded-2xl md:rounded-3xl overflow-hidden h-full flex flex-col">
                <CardContent className="flex flex-col items-center justify-center p-4 md:p-6 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <ChartPie className="text-orange-500" size={22} />
                    <span className="font-semibold text-base md:text-lg text-gray-900">
                      Modes de paiement
                    </span>
                  </div>
                  {paymentStatsAgg && paymentStatsAgg.length > 0 ? (
                    <PaymentMethodChart data={paymentStatsAgg} height={220} />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400">
                      Aucune donnée
                    </div>
                  )}
                  <div className="mt-2 w-full flex flex-col gap-1">
                    {paymentStatsAgg.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs text-gray-700"
                      >
                        <span>{p.modePaiement}</span>
                        <span className="font-semibold text-gray-900">
                          {p.pourcentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Modal de filtre par date */}
      <DateFilterModal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        onApply={handleApplyDateFilter}
        currentDate={date}
        currentStart={startDate}
        currentEnd={endDate}
      />
    </section>
  );
};
