import React, { useState, useMemo } from "react";
import { Order } from "../../../../types/order";
import { usePrintReceipt } from "../../../../hooks/usePrintReceipt";
import { PrintReceiptModal } from "../../../../components/modals/PrintReceiptModal";
import { OrderDetailsModal } from "../../../../components/modals/OrderDetailsModal";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { SearchIcon, RefreshCw, Printer, Eye, CreditCard } from "lucide-react";
import { useOrders } from "../../../../hooks/useOrderAPI";
import { Card, CardContent } from "../../../../components/ui/card";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { DotsThreeVertical, Money } from "@phosphor-icons/react";
import { Pagination } from "./Pagination";

export const CaissierHistoriqueSection: React.FC<{
  onRefresh?: () => Promise<void>;
}> = ({ onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus] = useState("TOUTES");

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // États pour le modal de détails de commande
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Récupération des hooks
  const { data: allOrders, loading } = useOrders();

  const {
    isPrintModalOpen,
    selectedOrderToPrint,
    isPrinting,
    openPrintModal,
    closePrintModal,
    handlePrintStart,
  } = usePrintReceipt();

  // Fonction utilitaire pour vérifier si une date est aujourd'hui
  const isToday = (date: string | Date) => {
    const today = new Date();
    const orderDate = new Date(date);
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  // Filtrer uniquement les commandes terminées
  const completedOrders = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders)) return [];

    return allOrders
      .filter((order) => order.statut === "TERMINE")
      .sort(
        (a, b) =>
          new Date(b.dateModification || b.dateCreation).getTime() -
          new Date(a.dateModification || a.dateCreation).getTime()
      );
  }, [allOrders]);

  // Recherche et filtre par critères
  const filteredOrders = useMemo(() => {
    let filtered = completedOrders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.numeroCommande
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.numeroTable?.toString().includes(searchTerm) ||
          order.items.some((item) => {
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

    // Filtre par statut si statut spécifique sélectionné
    if (selectedStatus !== "TOUTES") {
      filtered = filtered.filter((order) => order.statut === selectedStatus);
    }

    return filtered;
  }, [completedOrders, searchTerm, selectedStatus]);

  // Pagination des commandes filtrées
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
  }, [searchTerm, selectedStatus]);

  // Statistiques summary cards
  const stats = useMemo(() => {
    if (!completedOrders.length)
      return {
        totalCommandes: 0,
        montantTotal: 0,
        commandesAujourdhui: 0,
      };

    const totalCommandes = completedOrders.length;
    const montantTotal = completedOrders.reduce(
      (total, o) => total + (o.montantTotal || 0),
      0
    );

    // Calculer les commandes d'aujourd'hui
    const commandesAujourdhui = completedOrders.filter((order) =>
      isToday(order.dateCreation)
    ).length;

    return {
      totalCommandes,
      montantTotal,
      commandesAujourdhui,
    };
  }, [completedOrders, isToday]);

  // Formatters
  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("fr-FR").format(price);

  // Fonction pour formater les noms des modes de paiement
  const formatPaymentMethodName = (modePaiement: string): string => {
    if (!modePaiement) return "Non défini";

    switch (modePaiement.toUpperCase()) {
      case "ESPECES":
        return "Espèces";
      case "CARTE_BANCAIRE":
        return "Carte bancaire";
      case "WAVE":
        return "Wave";
      case "MTN_MONEY":
        return "MTN Money";
      case "ORANGE_MONEY":
        return "Orange Money";
      case "MOOV_MONEY":
        return "Moov Money";
      default:
        return modePaiement;
    }
  };

  // Fonction pour obtenir l'icône de paiement (composant React)
  const getPaymentIcon = (modePaiement: string, size: "sm" | "md" = "md") => {
    const iconProps = {
      size: size === "sm" ? 16 : 20,
      strokeWeight: "1.5",
      color: "#F97316" as const,
    };

    const containerSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";
    const imageSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";

    switch (modePaiement?.toLowerCase()) {
      case "especes":
        return (
          <div
            className={`flex ${containerSize} bg-orange-100 text-orange-600 items-center justify-center rounded-full flex-shrink-0`}
          >
            <Money size={iconProps.size} />
          </div>
        );
      case "carte_bancaire":
      case "carte":
        return (
          <div
            className={`flex ${containerSize} bg-orange-100 text-orange-600 items-center justify-center rounded-full flex-shrink-0`}
          >
            <CreditCard size={iconProps.size} />
          </div>
        );
      case "wave":
        return (
          <img
            src="/img/wave.jpg"
            alt="Wave"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      case "mtn_money":
        return (
          <img
            src="/img/mtn_money.jpg"
            alt="MTN Money"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      case "orange_money":
        return (
          <img
            src="/img/orange_money.jpg"
            alt="Orange Money"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      case "moov_money":
        return (
          <img
            src="/img/moov_money.jpg"
            alt="Moov Money"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      default:
        return (
          <div
            className={`flex ${containerSize} bg-orange-100 text-orange-600 items-center justify-center rounded-full flex-shrink-0`}
          >
            <Money size={iconProps.size} />
          </div>
        );
    }
  };

  // Fonction pour ouvrir le modal de détails de commande
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePrintReceipt = (order: Order) => {
    openPrintModal(order);
  };

  if (loading) {
    return (
      <section className="flex flex-col w-full mb-10 px-3 md:px-6 lg:px-12 gap-4 md:gap-6">
        <div className="flex items-center justify-center p-8">
          <SpinnerMedium />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col w-full mb-10 px-3 md:px-6 lg:px-12 gap-4 md:gap-6">
      {/* Summary Cards */}
      <div className="mt-4 md:mt-6 lg:mt-8 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        <Card className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-lg text-gray-900 truncate w-full">
              Commandes aujourd'hui
            </h3>
            <div className="flex flex-col items-start gap-1 w-full min-w-0">
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-bold text-xl md:text-3xl text-gray-900 truncate">
                  {stats.commandesAujourdhui}
                </span>
              </div>
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-medium text-xs md:text-sm text-blue-500 truncate w-full">
                  Traitées ce jour
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-lg text-gray-900 truncate w-full">
              Total commandes
            </h3>
            <div className="flex flex-col items-start gap-1 w-full min-w-0">
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-bold text-xl md:text-3xl text-gray-900 truncate">
                  {stats.totalCommandes}
                </span>
              </div>
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-medium text-xs md:text-sm text-orange-500 truncate w-full">
                  Commandes traitées
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-lg text-gray-900 truncate w-full">
              Chiffre d'affaires
            </h3>
            <div className="flex flex-col items-start gap-1 w-full min-w-0">
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-bold text-xl md:text-3xl text-gray-900 truncate">
                  {formatPrice(stats.montantTotal)}
                </span>
                <span className="font-bold text-xl md:text-3xl truncate text-gray-500">
                  XOF
                </span>
              </div>
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-medium text-xs md:text-sm text-green-500 truncate w-full">
                  Recettes validées
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="shadow-md bg-white rounded-3xl overflow-hidden">
        {/* Header, Search, Tabs */}
        <div className="flex flex-col rounded-t-3xl border-b bg-white rounded border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
            <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
              Historique des commandes
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-80">
                <Input
                  className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                  placeholder="Rechercher une commande"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full"
              >
                <RefreshCw
                  className={`h-4 w-4 md:h-5 md:w-5 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu du tableau */}
        <div className="w-full">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <SearchIcon size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune commande trouvée</p>
              <p className="text-sm">
                Les commandes terminées apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-10 border-b border-slate-200">
                      <TableHead className="px-4 py-3 font-semibold text-gray-700">
                        N° Commande
                      </TableHead>
                      <TableHead className="px-4 py-3 font-semibold text-gray-700">
                        Articles
                      </TableHead>
                      <TableHead className="px-4 py-3 font-semibold text-gray-700">
                        Mode de paiement
                      </TableHead>
                      <TableHead className="px-4 py-3 font-semibold text-gray-700">
                        Total
                      </TableHead>
                      <TableHead className="px-4 py-3 font-semibold text-gray-700">
                        Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-center font-semibold text-gray-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow
                        key={order._id}
                        className="h-20 border-b bg-white hover:bg-gray-10 border-slate-200"
                      >
                        <TableCell className="px-4 py-3 font-medium">
                          {order.numeroCommande || order._id}
                          {order.numeroTable && (
                            <div className="text-sm text-gray-500">
                              Table {order.numeroTable}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="font-medium">
                            {order.items.length} article
                            {order.items.length > 1 ? "s" : ""}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items
                              .slice(0, 2)
                              .map((item) =>
                                typeof item.menuItem === "object"
                                  ? item.menuItem.nom
                                  : item.nom || "Article"
                              )
                              .join(", ")}
                            {order.items.length > 2 && "..."}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {order.modePaiement &&
                              getPaymentIcon(order.modePaiement, "md")}
                            <span>
                              {order.modePaiement
                                ? formatPaymentMethodName(order.modePaiement)
                                : "Non défini"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium">
                          {formatPrice(order.montantTotal || 0)} XOF
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {new Date(order.dateCreation).toLocaleDateString(
                            "fr-FR"
                          )}
                          <div className="text-sm text-gray-500">
                            {new Date(order.dateCreation).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <DotsThreeVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                <span>Voir détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePrintReceipt(order)}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                <span>Imprimer reçu</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredOrders.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
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

      {/* Modal d'impression de reçu */}
      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={closePrintModal}
        order={selectedOrderToPrint}
        isLoading={isPrinting}
        onConfirmPrint={handlePrintStart}
      />
    </section>
  );
};
