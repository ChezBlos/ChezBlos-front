import React, { useState, useMemo } from "react";
import {
  SearchIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import { OrderStatusBadge } from "../../../../components/ui/order-status-badge";
import { useOrders } from "../../../../hooks/useOrderAPI";
import { ProfileService } from "../../../../services/profileService";
import { ExportService } from "../../../../services/exportService";
import { CreditCard, Money, User } from "phosphor-react";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { AdminOrderDetailsModal } from "./AdminOrderDetailsModal";
import { DateFilterModal } from "./DateFilterModal";
import { Order } from "../../../../types/order";
import { useAlert } from "../../../../contexts/AlertContext";

export const AdminHistoriqueSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TOUTES");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const { data: orders, loading, error } = useOrders();
  const { showAlert } = useAlert();

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    let filtered = orders.filter(
      (order) =>
        order.numeroCommande
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        `${order.serveur?.nom} ${order.serveur?.prenom}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.numeroTable?.toString().includes(searchTerm)
    );

    // Filtrage par statut
    if (selectedStatus !== "TOUTES") {
      filtered = filtered.filter((order) => order.statut === selectedStatus);
    }

    // Filtrage par date
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.dateCreation);
        const startDate = dateFilter.startDate
          ? new Date(dateFilter.startDate)
          : null;
        const endDate = dateFilter.endDate
          ? new Date(dateFilter.endDate)
          : null;

        // Set time to start of day for start date and end of day for end date
        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
        }
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }

        if (startDate && endDate) {
          return orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
          return orderDate >= startDate;
        } else if (endDate) {
          return orderDate <= endDate;
        }
        return true;
      });
    }

    return filtered;
  }, [orders, searchTerm, selectedStatus, dateFilter]);

  // Calculs de statistiques
  const stats = useMemo(() => {
    if (!orders || !Array.isArray(orders))
      return {
        totalCommandes: 0,
        commandesTerminees: 0,
        commandesAnnulees: 0,
        chiffreAffaires: 0,
      };

    const totalCommandes = orders.length;
    const commandesTerminees = orders.filter(
      (order) => order.statut === "TERMINE"
    ).length;
    const commandesAnnulees = orders.filter(
      (order) => order.statut === "ANNULE"
    ).length;
    const chiffreAffaires = orders
      .filter((order) => order.statut === "TERMINE")
      .reduce((total, order) => total + (order.montantTotal || 0), 0);

    return {
      totalCommandes,
      commandesTerminees,
      commandesAnnulees,
      chiffreAffaires,
    };
  }, [orders]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Fonction pour obtenir l'icône de paiement (composant React) - identique à ServeurOrdersSection
  const getPaymentIcon = (modePaiement: string, size: "sm" | "md" = "md") => {
    const iconProps = {
      size: size === "sm" ? 16 : 20,
      strokeweigh: "1.5",
      color: "#F97316" as const,
    };

    const containerSize = size === "sm" ? "w-6 h-6" : "w-10 h-10";
    const imageSize = size === "sm" ? "w-6 h-6" : "w-10 h-10";

    switch (modePaiement?.toLowerCase()) {
      case "especes":
        return (
          <>
            <div
              className={`flex ${containerSize} text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0`}
            >
              <Money {...iconProps} />
            </div>
          </>
        );

      case "carte_bancaire":
      case "carte":
        return (
          <>
            <div
              className={`flex ${containerSize} text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0`}
            >
              <CreditCard {...iconProps} />
            </div>
          </>
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
          <>
            <div
              className={`flex ${containerSize} items-center justify-center px-2 py-2 bg-orange-100 rounded-full flex-shrink-0`}
            >
              <Money {...iconProps} />
            </div>
          </>
        );
    }
  };

  // Fonction pour formater les noms des modes de paiement - identique à ServeurOrdersSection
  const formatPaymentMethodName = (
    modePaiement: string | undefined
  ): string => {
    if (!modePaiement) return "Non défini";

    switch (modePaiement.toUpperCase()) {
      case "ESPECES":
        return "Espèces";
      case "CARTE_BANCAIRE":
      case "CARTE":
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
  // Transformation des données pour l'export
  const transformOrdersForExport = (orders: any[]): any[] => {
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item: any) => ({
        nom: item.nom,
        quantite: item.quantite,
        menuItem:
          typeof item.menuItem === "object" && item.menuItem !== null
            ? { nom: item.menuItem.nom }
            : undefined,
      })),
    }));
  };
  // Fonctions d'exportation
  const handleExportToExcel = async () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      showAlert(
        "warning",
        "Aucune commande à exporter. Veuillez d'abord charger ou filtrer les commandes."
      );
      return;
    }

    setIsExporting(true);
    try {
      const exportableOrders = transformOrdersForExport(filteredOrders);
      await ExportService.exportToExcel(exportableOrders);
      showAlert(
        "success",
        `Export Excel terminé avec succès ! ${filteredOrders.length} commandes exportées.`
      );
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      showAlert("error", "Erreur lors de l'export Excel. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportToPDF = async () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      showAlert(
        "warning",
        "Aucune commande à exporter. Veuillez d'abord charger ou filtrer les commandes."
      );
      return;
    }

    setIsExporting(true);
    try {
      const exportableOrders = transformOrdersForExport(filteredOrders);
      await ExportService.exportToPDF(exportableOrders);
      showAlert(
        "success",
        `Export PDF terminé avec succès ! ${filteredOrders.length} commandes exportées.`
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      showAlert("error", "Erreur lors de l'export PDF. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStats = async () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      showAlert(
        "warning",
        "Aucune commande pour générer des statistiques. Veuillez d'abord charger ou filtrer les commandes."
      );
      return;
    }

    setIsExporting(true);
    try {
      const exportableOrders = transformOrdersForExport(filteredOrders);
      await ExportService.exportStats(exportableOrders, "excel");
      showAlert(
        "success",
        `Export des statistiques terminé avec succès ! ${filteredOrders.length} commandes analysées.`
      );
    } catch (error) {
      console.error("Erreur lors de l'export des statistiques:", error);
      showAlert(
        "error",
        "Erreur lors de l'export des statistiques. Veuillez réessayer."
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Fonctions pour les modals
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  // Correction : adapter la signature pour accepter deux string OU un objet (compatibilité descendante)
  // On gère les deux cas : (startDate, endDate) OU ({mode, ...})
  const handleApplyDateFilter = (arg1: any, arg2?: any) => {
    if (typeof arg1 === "object" && arg1 !== null) {
      // Appel depuis le nouveau modal (objet)
      if (arg1.mode === "single") {
        setDateFilter({ startDate: arg1.date || "", endDate: arg1.date || "" });
      } else {
        setDateFilter({
          startDate: arg1.startDate || "",
          endDate: arg1.endDate || "",
        });
      }
    } else {
      // Ancien appel (deux string)
      setDateFilter({ startDate: arg1 || "", endDate: arg2 || "" });
    }
  };

  const handleClearDateFilter = () => {
    setDateFilter({ startDate: "", endDate: "" });
  };

  // Vérifier si un filtre par date est actif
  const hasActiveFilter = dateFilter.startDate || dateFilter.endDate;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <SpinnerMedium />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Erreur lors du chargement: {error}</p>
      </div>
    );
  } // Summary cards data adaptées pour l'historique
  const summaryCards = [
    {
      title: "Total commandes",
      mobileTitle: "Total",
      value: loading ? "..." : stats.totalCommandes.toString(),
      subtitle: "Toutes périodes confondues",
      subtitleColor: "text-orange-500",
    },
    {
      title: "Commandes terminées",
      mobileTitle: "Terminées",
      value: loading ? "..." : stats.commandesTerminees.toString(),
      subtitle: `${
        Math.round((stats.commandesTerminees / stats.totalCommandes) * 100) || 0
      }% du total`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Commandes annulées",
      mobileTitle: "Annulées",
      value: loading ? "..." : stats.commandesAnnulees.toString(),
      subtitle: `${
        Math.round((stats.commandesAnnulees / stats.totalCommandes) * 100) || 0
      }% du total`,
      subtitleColor: "text-red-500",
    },
    {
      title: "Chiffre d'affaires total",
      mobileTitle: "CA Total",
      value: loading ? "..." : formatPrice(stats.chiffreAffaires),
      currency: loading ? "" : "XOF",
      subtitle: `Recettes validées`,
      subtitleColor: "text-orange-500",
    },
  ];

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards - Horizontal Flex Layout */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 lg:px-12 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                <span className="hidden md:block">{card.title}</span>
                <span className="block md:hidden">
                  {card.mobileTitle || card.title}
                </span>
              </h3>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <div className="flex items-start gap-1 w-full min-w-0">
                  <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
                    {card.value}
                  </span>{" "}
                  {card.currency && (
                    <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-600 flex-shrink-0">
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
      </div>{" "}
      {/* Carte principale */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12">
        {" "}
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and Search - Responsive */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Historique des Commandes
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher une commande"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />{" "}
                </div>{" "}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDateFilterOpen(true)}
                  className={`flex items-center rounded-full gap-2 h-10 md:h-12 px-3 md:px-4 ${
                    hasActiveFilter
                      ? "border-orange-500 text-orange-600 bg-orange-50"
                      : ""
                  }`}
                >
                  <FilterIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {hasActiveFilter ? "Filtré" : "Filtrer"}
                  </span>
                  {hasActiveFilter && (
                    <span className="bg-orange-500 text-white text-xs rounded-full w-2 h-2"></span>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 flex rounded-full items-center gap-2 h-10 md:h-12 px-3 md:px-4"
                      disabled={
                        isExporting ||
                        !filteredOrders ||
                        filteredOrders.length === 0
                      }
                    >
                      {isExporting ? (
                        <SpinnerMedium />
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Exporter</span>
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleExportToExcel}
                      disabled={isExporting}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exporter en Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportToPDF}
                      disabled={isExporting}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportStats}
                      disabled={isExporting}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Statistiques Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>{" "}
                </DropdownMenu>
              </div>{" "}
            </div>

            {/* Status Tabs - Horizontally Scrollable */}
            <div className="overflow-x-auto scrollbar-hide w-full">
              <Tabs
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                className="w-full"
              >
                <TabsList className="flex justify-start h-auto bg-transparent pl-3 md:pl-4 lg:pl-6 py-0 w-fit min-w-full">
                  <TabsTrigger
                    value="TOUTES"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Toutes
                    </span>
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
                    <span className="font-semibold text-xs md:text-sm">
                      Prête
                    </span>
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
          </div>{" "}
          {/* Table Content */}
          <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <SpinnerMedium />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <SearchIcon size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucune commande trouvée</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Essayez de modifier vos critères de recherche"
                    : "L'historique des commandes apparaîtra ici"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-10 border-b border-slate-200">
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          N° Commande
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Serveur
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          N° Table
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Articles
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Montant
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Statut
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Paiement
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Date
                        </TableHead>
                        <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>{" "}
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow
                          key={order._id}
                          className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                        >
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span className="font-medium text-gray-900">
                              {order.numeroCommande}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {/* Photo de profil du serveur */}
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {order.serveur?.photoProfil ? (
                                  <img
                                    src={ProfileService.getProfilePictureUrl(
                                      order.serveur.photoProfil
                                    )}
                                    alt={order.serveur?.prenom || "Serveur"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      // Remplacer par l'icône User de Phosphor
                                      const iconElement =
                                        document.createElement("div");
                                      iconElement.innerHTML =
                                        '<div class="w-5 h-5 text-gray-600"><svg fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg></div>';
                                      target.parentElement!.appendChild(
                                        iconElement.firstChild!
                                      );
                                    }}
                                  />
                                ) : (
                                  <User size={20} className="text-gray-600" />
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="font-semibold text-base text-gray-900">
                                  {order.serveur
                                    ? order.serveur.prenom
                                    : "Non défini"}
                                </div>
                                <div className="font-medium text-sm text-gray-500">
                                  Serveur
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span className="font-semibold text-lg text-gray-900">
                              {order.numeroTable || "Non définie"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <div className="text-sm">
                              {order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="text-gray-900">
                                  {typeof item.menuItem === "object" &&
                                  item.menuItem !== null
                                    ? item.menuItem.nom
                                    : item.nom || "Article"}{" "}
                                  x{item.quantite}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-gray-500">
                                  +{order.items.length - 2} autres...
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {/* Amount Column */}
                            <div className="font-semibold text-base">
                              <span className="text-gray-900">
                                {formatPrice(order.montantTotal)}{" "}
                              </span>
                              <span className="text-gray-400">XOF</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <OrderStatusBadge statut={order.statut as any} />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {/* Payment Type Column */}
                            <div className="flex items-center gap-3 min-w-0">
                              {getPaymentIcon(order.modePaiement || "especes")}
                              <div className="font-semibold text-base text-gray-900 truncate">
                                {formatPaymentMethodName(order.modePaiement)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6">
                            <div className="text-sm text-gray-600">
                              {formatDateTime(order.dateCreation)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {" "}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <DotsThreeVerticalIcon
                                      size={24}
                                      className="h-8 w-8"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewOrderDetails(order)
                                    }
                                  >
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    Voir détails
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>{" "}
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden">
                  {filteredOrders.map((order) => (
                    <Card
                      key={order._id}
                      className="mb-4 overflow-hidden border-none"
                    >
                      <CardContent className="p-0">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          {/* Left side content */}
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg text-gray-900 truncate">
                                  #{order.numeroCommande}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="font-medium text-sm text-gray-600">
                                  Table {order.numeroTable || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="font-medium text-sm text-gray-600">
                                  Par:{" "}
                                </span>
                                {/* Photo de profil du serveur */}
                                <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {order.serveur?.photoProfil ? (
                                    <img
                                      src={ProfileService.getProfilePictureUrl(
                                        order.serveur.photoProfil
                                      )}
                                      alt={order.serveur?.prenom || "Serveur"}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target =
                                          e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        // Remplacer par l'icône User de Phosphor
                                        const iconElement =
                                          document.createElement("div");
                                        iconElement.innerHTML =
                                          '<div class="w-3 h-3 text-gray-600"><svg fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg></div>';
                                        target.parentElement!.appendChild(
                                          iconElement.firstChild!
                                        );
                                      }}
                                    />
                                  ) : (
                                    <User size={12} className="text-gray-600" />
                                  )}
                                </div>
                                <span className="font-medium text-sm text-orange-600">
                                  {order.serveur
                                    ? order.serveur.prenom
                                    : "Non défini"}
                                </span>
                              </div>
                              <div className="text-sm space-y-1">
                                {order.items.slice(0, 2).map((item, index) => (
                                  <div key={index} className="text-gray-900">
                                    {typeof item.menuItem === "object" &&
                                    item.menuItem !== null
                                      ? item.menuItem.nom
                                      : item.nom || "Article"}{" "}
                                    x{item.quantite}
                                  </div>
                                ))}
                                {order.items.length > 2 && (
                                  <div className="text-gray-500">
                                    +{order.items.length - 2} autres...
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <span className="font-medium text-xs text-gray-500">
                                  {formatDateTime(order.dateCreation)}
                                </span>
                                <span className="text-gray-400">•</span>{" "}
                                <div className="flex items-center gap-1">
                                  {getPaymentIcon(
                                    order.modePaiement || "especes",
                                    "sm"
                                  )}
                                  <span className="font-medium text-sm text-gray-900">
                                    {formatPaymentMethodName(
                                      order.modePaiement
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>{" "}
                            {/* Right side: Status badge and amount */}
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <OrderStatusBadge statut={order.statut as any} />
                              <span className="font-semibold text-sm text-gray-900 truncate">
                                {formatPrice(order.montantTotal)}{" "}
                                <span className="text-gray-500">XOF</span>
                              </span>
                            </div>
                          </div>
                          {/* Action Button */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrderDetails(order)}
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Voir détails
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>{" "}
        </Card>
      </div>
      {/* Modals */}
      <AdminOrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        order={selectedOrder}
      />
      <DateFilterModal
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        onApplyFilter={handleApplyDateFilter}
        onClearFilter={handleClearDateFilter}
        currentStartDate={dateFilter.startDate}
        currentEndDate={dateFilter.endDate}
      />
    </section>
  );
};
