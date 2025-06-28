import { SearchIcon, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "../../../../components/ui/badge";
import { OrderStatusBadge } from "../../../../components/ui/order-status-badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { SpinnerMedium } from "../../../../components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { MobileBottomSheet } from "../../../../components/ui/mobile-bottom-sheet";
import { useOrders, useOrderStats } from "../../../../hooks/useOrderAPI";
import { Order } from "../../../../types/order";
import { updateOrderStatus } from "../../../../services/api";
import { ProfileService } from "../../../../services/profileService";
import { OrderDetailsModal } from "../../../ServeurDashboard/sections/ServeurOrdersSection/OrderDetailsModal";
import { Eye, DotsThreeVertical, CookingPot, User } from "phosphor-react";

export const CuisinierOrdersSection = (): JSX.Element => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("TOUTES");
  const [searchTerm, setSearchTerm] = useState("");

  // State pour le bottom sheet mobile
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedOrderForActions, setSelectedOrderForActions] =
    useState<Order | null>(null);
  // État pour le rafraîchissement
  const [isRefreshing, setIsRefreshing] = useState(false);

  // États pour le modal de détails de commande
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Récupération des données des commandes et statistiques
  const {
    data: allOrders,
    loading: ordersLoading,
    error: ordersError,
    refetch,
  } = useOrders();

  const {
    data: stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useOrderStats();

  // Filtrage des commandes côté frontend
  const filteredOrders = useMemo(() => {
    // S'assurer qu'allOrders est un tableau
    if (!allOrders || !Array.isArray(allOrders) || allOrders.length === 0) {
      return [];
    }

    let filtered = [...allOrders];

    // Filtrer d'abord par date (uniquement les commandes d'aujourd'hui)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filtered = filtered.filter((order) => {
      const orderDate = new Date(order.dateCreation);
      return orderDate >= today && orderDate < tomorrow;
    });

    // Filtrage par statut
    if (selectedStatus !== "TOUTES") {
      filtered = filtered.filter((order) => order.statut === selectedStatus);
    }

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.numeroCommande?.toLowerCase().includes(searchLower) ||
          (order.items &&
            Array.isArray(order.items) &&
            order.items.some((item) =>
              item.nom?.toLowerCase().includes(searchLower)
            )) ||
          (order.numeroTable &&
            order.numeroTable.toString().includes(searchTerm))
      );
    }
    return filtered;
  }, [allOrders, selectedStatus, searchTerm]);

  // Fonctions utilitaires pour les dates
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  const getToday = (): Date => {
    return new Date();
  };

  // Calcul du nombre de menus terminés aujourd'hui
  const menusTerminesAujourdhui = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders)) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allOrders
      .filter((order) => {
        const orderDate = new Date(order.dateCreation);
        return (
          orderDate >= today &&
          orderDate < tomorrow &&
          order.statut === "TERMINE"
        );
      })
      .reduce((total, order) => {
        return total + (order.items?.length || 0);
      }, 0);
  }, [allOrders]);

  // Summary cards data avec les stats spécifiques au cuisinier
  const summaryCards = [
    {
      title: "Total commandes",
      mobileTitle: "Commandes",
      value: statsLoading ? "..." : stats?.aujourdhui?.toString() || "0",
      subtitle: formatDate(getToday()),
      subtitleColor: "text-orange-500",
    },
    {
      title: "Nombre menu terminé",
      mobileTitle: "Terminés",
      value: statsLoading ? "..." : menusTerminesAujourdhui.toString(),
      subtitle: `Menus du ${formatDate(getToday())}`,
      subtitleColor: "text-green-500",
    },
  ];
  // Order status tabs data avec les onglets spécifiques au cuisinier
  const statusTabs = [
    {
      id: "TOUTES",
      label: "Toutes",
      count: statsLoading ? null : stats?.aujourdhui || 0,
      active: selectedStatus === "TOUTES",
    },
    {
      id: "EN_COURS",
      label: "En cours",
      count: statsLoading ? null : stats?.enCours || 0,
      active: selectedStatus === "EN_COURS",
    },
    {
      id: "ANNULE",
      label: "Annulée",
      count: statsLoading ? null : 0,
      active: selectedStatus === "ANNULE",
    },
    {
      id: "TERMINE",
      label: "Terminée",
      count: statsLoading ? null : stats?.termine || 0,
      active: selectedStatus === "TERMINE",
    },
  ]; // Fonction pour calculer le temps écoulé depuis la commande
  const getTimeElapsed = (dateCreation: string): string => {
    const now = new Date();
    const orderDate = new Date(dateCreation);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      return `${diffDays}j`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
    } else {
      return "moins d'une minute";
    }
  }; // Fonction pour rendre les images empilées
  const renderStackedImages = (
    items: any[],
    maxImages: number = 3,
    isMobile: boolean = false
  ) => {
    const imagesToShow = items.slice(0, maxImages);
    const size = isMobile ? "w-12 h-12" : "w-10 h-10";
    const translateClass = isMobile ? "translate-x-1.5" : "translate-x-1";
    const translateClass2 = isMobile ? "translate-x-3" : "translate-x-2";

    return (
      <div className={`relative ${size} flex-shrink-0`}>
        {imagesToShow.map((item, index) => {
          const imageUrl =
            item.menuItem &&
            typeof item.menuItem === "object" &&
            item.menuItem.image
              ? `${import.meta.env.VITE_IMAGE_BASE_URL}${item.menuItem.image}`
              : "/img/plat_petit.png";

          // Classes pour le décalage et la transparence
          const positionClasses = [
            "translate-x-0 translate-y-0 opacity-100 z-30", // Premier élément
            `${translateClass} translate-y-0.5 opacity-70 z-20`, // Deuxième élément
            `${translateClass2} translate-y-1 opacity-40 z-10`, // Troisième élément
          ];

          return (
            <div
              key={index}
              className={`absolute ${size} rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden border-2 border-white shadow-sm ${
                positionClasses[index] || ""
              }`}
            >
              <img
                src={imageUrl}
                alt={item.nom || "Plat"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/img/plat_petit.png";
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Fonction pour démarrer la préparation d'une commande (EN_COURS → EN_PREPARATION)
  const handleStartPreparation = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "EN_PREPARATION");
      refetch();
      refetchStats();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };
  // Fonction pour marquer une commande comme prête (EN_PREPARATION → TERMINE)
  const handleMarkAsReady = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "TERMINE");
      refetch();
      refetchStats();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  // Fonction pour ouvrir le modal de détails de commande
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
    setActiveDropdown(null); // Fermer le dropdown
  };
  // Fonction pour obtenir le bouton d'action principal selon le statut
  const getMainActionButton = (order: Order) => {
    switch (order.statut) {
      case "EN_COURS":
        return (
          <Button
            onClick={() => handleStartPreparation(order._id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <CookingPot size={16} />
            Commencer préparation
          </Button>
        );
      case "EN_PREPARATION":
        return (
          <Button
            onClick={() => handleMarkAsReady(order._id)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Marquer comme prête
          </Button>
        );
      default:
        return null;
    }
  };

  // Handlers pour les interactions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchStats()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMobileActionClick = (order: Order) => {
    setSelectedOrderForActions(order);
    setIsBottomSheetOpen(true);
  };
  const closeMobileBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedOrderForActions(null);
  };

  if (ordersError) {
    return (
      <div className="flex items-center justify-center h-64">
        {" "}
        <p className="text-red-500">
          Erreur lors du chargement des commandes: {ordersError}
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards - Horizontal Flex Layout */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 lg:px-12 xl:px-20 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
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
                  </span>
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
      {/* Orders List */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12 xl:px-20">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and Search - Responsive */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Liste des commandes
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher une commande"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full border-[#eff1f3] hover:bg-gray-20 flex-shrink-0"
                >
                  <RefreshCw
                    className={`h-4 w-4 md:h-5 md:w-5 text-gray-600 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </div>
            </div>

            {/* Status Tabs - Horizontally Scrollable */}
            <div className="overflow-x-auto scrollbar-hide w-full">
              <Tabs
                value={selectedStatus}
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="flex justify-start h-auto bg-transparent pl-3 md:pl-4 lg:pl-6 py-0 w-fit min-w-full">
                  {statusTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                    >
                      <span className="font-semibold text-xs md:text-sm">
                        {tab.label}
                      </span>
                      {tab.count !== null && tab.count > 0 && (
                        <Badge className="bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full px-2 py-1 font-semibold text-xs">
                          {tab.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Table Content */}
          <div className="w-full">
            {ordersLoading ? (
              <div className="flex items-center justify-center h-40">
                <SpinnerMedium />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <CookingPot size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucune commande trouvée</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Essayez de modifier vos critères de recherche"
                    : "Les commandes apparaîtront ici"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    {" "}
                    <TableHeader>
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Plats
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          N° Table
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          ID de commande
                        </TableHead>{" "}
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Temps
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Fait par
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Statut
                        </TableHead>
                        <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>{" "}
                    <TableBody>
                      {filteredOrders.map((order) => {
                        return (
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
                                    {renderStackedImages(order.items, 3, false)}
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                                    {order.items?.[0]?.menuItem &&
                                    typeof order.items[0].menuItem ===
                                      "object" &&
                                    order.items[0].menuItem.image ? (
                                      <img
                                        src={`${
                                          import.meta.env.VITE_IMAGE_BASE_URL
                                        }${order.items[0].menuItem.image}`}
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
                                        {order.items[0]?.nom || "Plat inconnu"}
                                      </span>
                                      {order.items.length > 1 && (
                                        <span className="text-xs text-gray-500">
                                          +{order.items.length - 1} autre(s)
                                          plat(s)
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
                                  {order.numeroTable}
                                </span>
                              </div>
                            </TableCell>
                            {/* Colonne ID de commande */}
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="font-normal text-sm text-gray-700">
                                {order.numeroCommande}
                              </span>
                            </TableCell>
                            {/* Colonne Temps */}
                            <TableCell className="py-4 px-4 lg:px-6">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  il y a{" "}
                                  <span className="font-bold">
                                    {getTimeElapsed(order.dateCreation)}
                                  </span>
                                </span>
                              </div>{" "}
                            </TableCell>
                            {/* Colonne Fait par */}
                            <TableCell className="py-4 px-4 lg:px-6">
                              <div className="flex items-center gap-2">
                                {" "}
                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                                        const iconElement =
                                          document.createElement("div");
                                        iconElement.innerHTML =
                                          '<div class="w-4 h-4 text-gray-600"><svg fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg></div>';
                                        target.parentElement!.appendChild(
                                          iconElement.firstChild!
                                        );
                                      }}
                                    />
                                  ) : (
                                    <User size={16} className="text-gray-600" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm text-gray-900">
                                    {order.serveur?.prenom || "Non défini"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Serveur
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            {/* Colonne Statut */}
                            <TableCell className="py-4 px-4 lg:px-6">
                              <OrderStatusBadge statut={order.statut} />
                            </TableCell>{" "}
                            <TableCell className="py-4 px-4 lg:px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Menu dropdown pour autres actions */}
                                <DropdownMenu
                                  open={activeDropdown === order._id}
                                  onOpenChange={(open) =>
                                    setActiveDropdown(open ? order._id : null)
                                  }
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <DotsThreeVertical size={16} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    {" "}
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleViewOrderDetails(order)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <Eye size={16} />
                                      Voir les détails
                                    </DropdownMenuItem>
                                    {order.statut === "EN_COURS" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleStartPreparation(order._id)
                                          }
                                          className="flex items-center gap-2 text-blue-600"
                                        >
                                          <CookingPot size={16} />
                                          Commencer préparation
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {order.statut === "EN_PREPARATION" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleMarkAsReady(order._id)
                                          }
                                          className="flex items-center gap-2 text-green-600"
                                        >
                                          <CheckCircle size={16} />
                                          Marquer comme prête
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>{" "}
                {/* Mobile Cards */}
                <div className="md:hidden">
                  {filteredOrders.map((order) => {
                    return (
                      <div
                        key={order._id}
                        className="border-b border-slate-100 p-4 bg-white hover:bg-gray-10 transition-colors"
                        onClick={() => handleMobileActionClick(order)}
                      >
                        {/* Header avec informations de base */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Images des plats */}
                            {order.items && order.items.length > 1 ? (
                              <div className="w-16 h-12">
                                {renderStackedImages(order.items, 3, true)}
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                                {order.items?.[0]?.menuItem &&
                                typeof order.items[0].menuItem === "object" &&
                                order.items[0].menuItem.image ? (
                                  <img
                                    src={`${
                                      import.meta.env.VITE_IMAGE_BASE_URL
                                    }${order.items[0].menuItem.image}`}
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
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  Table {order.numeroTable}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {order.numeroCommande}
                              </p>{" "}
                              {/* Nom du premier plat */}
                              {order.items && order.items.length > 0 && (
                                <p className="text-sm font-medium text-gray-800">
                                  {order.items[0]?.nom || "Plat inconnu"}
                                  {order.items.length > 1 && (
                                    <span className="text-gray-500 font-normal">
                                      {" "}
                                      +{order.items.length - 1} autre(s)
                                    </span>
                                  )}
                                </p>
                              )}
                              {/* Serveur */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  Fait par:
                                </span>{" "}
                                <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
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
                                <span className="text-xs text-gray-600 font-medium">
                                  {order.serveur?.prenom || "Non défini"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <OrderStatusBadge statut={order.statut} />
                        </div>{" "}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{order.items?.length || 0} plat(s)</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock size={14} />
                              il y a{" "}
                              <span className="font-bold">
                                {getTimeElapsed(order.dateCreation)}
                              </span>
                            </div>
                            {/* Bouton d'action rapide mobile */}
                            <div onClick={(e) => e.stopPropagation()}>
                              {getMainActionButton(order)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>{" "}
      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={closeMobileBottomSheet}
        title={
          selectedOrderForActions
            ? `Commande ${selectedOrderForActions.numeroCommande} • Par ${
                selectedOrderForActions.serveur?.prenom || "Non défini"
              }`
            : "Actions"
        }
      >
        <div className="p-4 space-y-3">
          {" "}
          <button
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg"
            onClick={() => {
              if (selectedOrderForActions) {
                handleViewOrderDetails(selectedOrderForActions);
              }
              closeMobileBottomSheet();
            }}
          >
            <Eye size={20} />
            <span>Voir les détails</span>
          </button>{" "}
          {selectedOrderForActions?.statut === "EN_COURS" && (
            <button
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg text-blue-600"
              onClick={() => {
                if (selectedOrderForActions?._id) {
                  handleStartPreparation(selectedOrderForActions._id);
                }
                closeMobileBottomSheet();
              }}
            >
              <CookingPot size={20} />
              <span>Commencer la préparation</span>
            </button>
          )}
          {selectedOrderForActions?.statut === "EN_PREPARATION" && (
            <button
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg text-green-600"
              onClick={() => {
                if (selectedOrderForActions?._id) {
                  handleMarkAsReady(selectedOrderForActions._id);
                }
                closeMobileBottomSheet();
              }}
            >
              <CheckCircle size={20} />
              <span>Marquer comme prête</span>
            </button>
          )}{" "}
        </div>
      </MobileBottomSheet>
      {/* Modal de détails de commande */}
      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        order={selectedOrder}
      />
    </section>
  );
};
