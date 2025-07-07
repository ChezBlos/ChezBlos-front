import React, { useState, useMemo } from "react";
import { useOrders } from "../../../../hooks/useOrderAPI";
import { useAuth } from "../../../../contexts/AuthContext";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Input } from "../../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import { OrderStatusBadge } from "../../../../components/ui/order-status-badge";
import { SearchIcon, EyeIcon, CalendarIcon } from "lucide-react";
import { Order } from "../../../../types/order";
import { OrderDetailsModal } from "../../../../components/modals/OrderDetailsModal";
import { Pagination } from "./Pagination";
import { DateFilterModal } from "./DateFilterModal";

export const CuisinierHistorySection: React.FC = () => {
  const { data: allOrders, loading } = useOrders();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TOUTES");

  // États pour le modal de détails de commande
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 commandes par page

  // États pour le filtre de date
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<{
    mode: "period" | "single";
    startDate?: string;
    endDate?: string;
    date?: string;
  } | null>(null);

  // Filtrer toutes les commandes (pour un cuisinier, on affiche toutes les commandes de l'établissement)
  const pastOrders = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders) || !user) {
      return [];
    }

    // Pour un cuisinier, on affiche toutes les commandes de l'établissement
    // (il peut voir toutes les commandes pour lesquelles il doit cuisiner)
    return allOrders;
  }, [allOrders, user]);

  // Recherche et filtre par statut et date
  const filteredOrders = useMemo(() => {
    let filtered = pastOrders;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.numeroCommande
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.numeroTable?.toString().includes(searchTerm) ||
          order.items.some((item) => {
            // Correction typage menuItem
            const menuItem =
              typeof item.menuItem === "object" && item.menuItem !== null
                ? item.menuItem
                : undefined;
            return (menuItem?.nom || item.nom || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          })
      );
    }

    // Filtre par statut
    if (selectedStatus !== "TOUTES") {
      filtered = filtered.filter((order) => order.statut === selectedStatus);
    }

    // Filtre par date
    if (dateFilter) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.dateCreation);
        orderDate.setHours(0, 0, 0, 0); // Normaliser l'heure

        if (dateFilter.mode === "single" && dateFilter.date) {
          const filterDate = new Date(dateFilter.date);
          filterDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === filterDate.getTime();
        } else if (
          dateFilter.mode === "period" &&
          dateFilter.startDate &&
          dateFilter.endDate
        ) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return orderDate >= startDate && orderDate <= endDate;
        }

        return true;
      });
    }

    return filtered;
  }, [pastOrders, searchTerm, selectedStatus, dateFilter]);

  // Pagination des données filtrées
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Reset de la page quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, dateFilter]);

  // Statistiques summary cards
  const stats = useMemo(() => {
    if (!pastOrders.length)
      return {
        totalCommandes: 0,
        commandesTerminees: 0,
        commandesAnnulees: 0,
        chiffreAffaires: 0,
      };
    const totalCommandes = pastOrders.length;
    const commandesTerminees = pastOrders.filter(
      (o) => o.statut === "TERMINE"
    ).length;
    const commandesAnnulees = pastOrders.filter(
      (o) => o.statut === "ANNULE"
    ).length;
    const chiffreAffaires = pastOrders
      .filter((o) => o.statut === "TERMINE")
      .reduce((total, o) => total + (o.montantTotal || 0), 0);
    return {
      totalCommandes,
      commandesTerminees,
      commandesAnnulees,
      chiffreAffaires,
    };
  }, [pastOrders]);

  // Formatters
  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("fr-FR").format(price);

  // Fonction pour calculer le temps de préparation
  const calculatePreparationTime = (order: Order): string => {
    // Si la commande n'est pas terminée, pas de temps de préparation calculable
    if (order.statut !== "TERMINE") {
      return "En cours...";
    }

    // Pour le calcul réel, nous aurions besoin de :
    // - dateEnvoiCuisine (quand le serveur envoie la commande en cuisine)
    // - dateMarquePret (quand le cuisinier marque comme prêt)
    //
    // En attendant ces champs, on utilise une approximation :
    // Si updatedAt existe et est différent de createdAt, on l'utilise comme fin
    const startDate = new Date(order.dateCreation);
    const endDate = order.updatedAt ? new Date(order.updatedAt) : new Date();

    // Calcul de la différence en minutes
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    // Si le temps calculé semble réaliste (entre 1 minute et 4 heures)
    if (diffMinutes >= 1 && diffMinutes <= 240) {
      return `${diffMinutes} min`;
    }

    // Sinon, afficher un placeholder en attendant les vrais champs
    return "À calculer";
  };

  // Fonction pour obtenir la date d'envoi en cuisine (pour le moment = dateCreation)
  const getKitchenSentDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour ouvrir le modal de détails de commande
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  // Fonctions pour la gestion des filtres de date
  const handleApplyDateFilter = (filter: {
    mode: "period" | "single";
    startDate?: string;
    endDate?: string;
    date?: string;
  }) => {
    setDateFilter(filter);
  };

  const handleClearDateFilter = () => {
    setDateFilter(null);
  };

  // Fonction pour changer de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // UI
  const summaryCards = [
    {
      title: "Total commandes",
      value: loading ? "..." : stats.totalCommandes.toString(),
      subtitle: "Commandes avec mes plats",
      subtitleColor: "text-orange-500",
    },
    {
      title: "Commandes terminées",
      value: loading ? "..." : stats.commandesTerminees.toString(),
      subtitle: `${
        Math.round(
          (stats.commandesTerminees / (stats.totalCommandes || 1)) * 100
        ) || 0
      }% du total`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Commandes annulées",
      value: loading ? "..." : stats.commandesAnnulees.toString(),
      subtitle: `${
        Math.round(
          (stats.commandesAnnulees / (stats.totalCommandes || 1)) * 100
        ) || 0
      }% du total`,
      subtitleColor: "text-red-500",
    },
    {
      title: "Valeur des commandes",
      value: loading ? "..." : formatPrice(stats.chiffreAffaires),
      currency: loading ? "" : "XOF",
      subtitle: `Commandes terminées`,
      subtitleColor: "text-orange-500",
    },
  ];

  return (
    <section className="flex flex-col w-full mb-10 px-3 md:px-6 lg:px-12 gap-4 md:gap-6">
      {/* Summary Cards */}
      <div className="mt-4 md:mt-6 lg:mt-8 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
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
                  {card.currency && (
                    <span className="font-medium text-lg sm:text-xl md:text-2xl text-gray-600 truncate">
                      {card.currency}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-1 w-full min-w-0">
                  <span
                    className={`font-medium text-xs md:text-sm ${card.subtitleColor} truncate w-full`}
                  >
                    {card.subtitle}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="shadow-md bg-white rounded-3xl overflow-hidden">
        {/* Header, Search, Filters */}
        <div className="flex flex-col rounded-t-3xl border-b bg-white rounded border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
            <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
              Historique des commandes cuisinées
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-80">
                <Input
                  className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                  placeholder="Rechercher un plat, commande, table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </div>

              <Button
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 h-10 md:h-12 rounded-full border border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors"
                onClick={() => setIsDateFilterOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">
                  {dateFilter ? "Filtré" : "Filtrer par date"}
                </span>
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDateFilter();
                    }}
                    className="h-5 w-5 p-0 hover:bg-orange-200"
                  >
                    ×
                  </Button>
                )}
              </Button>
            </div>
          </div>
          <Tabs
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            className="w-fit"
          >
            <TabsList className="flex justify-start h-auto bg-transparent pl-3 md:pl-4 lg:pl-6 py-0 w-fit min-w-full">
              <TabsTrigger
                value="TOUTES"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">Toutes</span>
              </TabsTrigger>
              <TabsTrigger
                value="EN_ATTENTE"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">
                  En attente
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="EN_PREPARATION"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">
                  En préparation
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="TERMINE"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">Prête</span>
              </TabsTrigger>
              <TabsTrigger
                value="ANNULE"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">
                  Annulée
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Table Content */}
        <div className="w-full">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <SpinnerMedium />
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <SearchIcon size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune commande trouvée</p>
              <p className="text-sm">
                {searchTerm || dateFilter
                  ? "Essayez de modifier vos critères de recherche"
                  : "L'historique des commandes apparaîtra ici"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-10 border-b border-slate-200">
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Plats
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      N° Table
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      ID de commande
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Temps de préparation
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Date envoi cuisine
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Statut
                    </TableHead>
                    <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                    >
                      {/* Colonne Plats avec images */}
                      <TableCell className="py-4 px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                          {/* Images des plats */}
                          {order.items && order.items.length > 1 ? (
                            <div className="w-16 h-12">
                              {/* Ici on pourrait ajouter la fonction renderStackedImages si elle existe */}
                              <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                                <img
                                  src="/img/plat_petit.png"
                                  alt="Plats"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                              {order.items?.[0]?.menuItem &&
                              typeof order.items[0].menuItem === "object" &&
                              order.items[0].menuItem.image ? (
                                <img
                                  src={`${import.meta.env.VITE_API_URL || ""}${
                                    order.items[0].menuItem.image
                                  }`}
                                  alt={order.items[0]?.nom || "Plat"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/img/plat_petit.png";
                                  }}
                                />
                              ) : (
                                <img
                                  src="/img/plat_petit.png"
                                  alt="Plat"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          {/* Noms des plats */}
                          <div className="flex flex-col gap-1">
                            {order.items && order.items.length > 0 ? (
                              <>
                                <span className="font-medium text-gray-900 text-sm">
                                  {order.items[0]?.nom ||
                                    (typeof order.items[0]?.menuItem ===
                                      "object" &&
                                      order.items[0]?.menuItem?.nom) ||
                                    "Plat inconnu"}
                                </span>
                                {order.items.length > 1 && (
                                  <span className="text-xs text-gray-500">
                                    +{order.items.length - 1} autre(s) plat(s)
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-medium text-gray-900 text-sm">
                                Aucun plat
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {order.items?.length || 0} plat(s) au total
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Colonne N° Table */}
                      <TableCell className="py-4 px-4 lg:px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-gray-900">
                            {order.numeroTable || "Non définie"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Colonne ID de commande */}
                      <TableCell className="py-4 px-4 lg:px-6">
                        <span className="font-normal text-sm text-gray-700">
                          {order.numeroCommande}
                        </span>
                      </TableCell>

                      {/* Colonne Temps de préparation */}
                      <TableCell className="py-4 px-4 lg:px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {calculatePreparationTime(order)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Colonne Date envoi cuisine */}
                      <TableCell className="py-4 px-4 lg:px-6">
                        <div className="text-sm text-gray-600">
                          {getKitchenSentDate(order.dateCreation)}
                        </div>
                      </TableCell>

                      {/* Colonne Statut */}
                      <TableCell className="py-4 px-4 lg:px-6">
                        <OrderStatusBadge statut={order.statut as any} />
                      </TableCell>

                      {/* Colonne Actions */}
                      <TableCell className="py-4 px-4 lg:px-6 text-right">
                        <button
                          className="flex items-center gap-1 text-orange-600 hover:underline text-sm font-medium"
                          onClick={() => handleViewOrderDetails(order)}
                        >
                          <EyeIcon className="h-4 w-4" /> Voir détails
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && paginatedOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal de détails de commande */}
      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => {
          setIsOrderDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />

      {/* Modal de filtre de date */}
      <DateFilterModal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        onApplyFilter={handleApplyDateFilter}
        onClearFilter={handleClearDateFilter}
        currentStartDate={dateFilter?.startDate}
        currentEndDate={dateFilter?.endDate}
        currentMode={dateFilter?.mode || "period"}
        currentDate={dateFilter?.date}
      />
    </section>
  );
};
