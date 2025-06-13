import { SearchIcon, PlusIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../../../../components/ui/badge";
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
import {
  MobileBottomSheet,
  BottomSheetAction,
} from "../../../../components/ui/mobile-bottom-sheet";
import {
  NewOrderBottomSheet,
  MobileNewOrderBar,
} from "../../../../components/ui/new-order-bottom-sheet";
import { useOrders, useOrderStats } from "../../../../hooks/useOrderAPI";
import { Order } from "../../../../types/order";
import { OrderService } from "../../../../services/orderService";
import NewOrderModal from "./NewOrderModal";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { useAuth } from "../../../../contexts/AuthContext";
import { Eye, X, PencilSimple, PaperPlaneTilt } from "phosphor-react";

export const ServeurOrdersSection = (): JSX.Element => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("TOUTES");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null); // State pour le bottom sheet mobile
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedOrderForActions, setSelectedOrderForActions] =
    useState<Order | null>(null);

  // États pour le bottom sheet de création de commande mobile
  const [isNewOrderBottomSheetOpen, setIsNewOrderBottomSheetOpen] =
    useState(false);

  // Récupération de l'utilisateur connecté
  const { user } = useAuth();

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
          (order.serveur &&
            typeof order.serveur === "object" &&
            order.serveur.nom &&
            order.serveur.prenom &&
            (order.serveur.nom + " " + order.serveur.prenom)
              .toLowerCase()
              .includes(searchLower)) ||
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

  const getYesterday = (): Date => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };

  const getToday = (): Date => {
    return new Date();
  };

  // Summary cards data with real stats and improved dates
  const summaryCards = [
    {
      title: "Total commandes hier",
      value: statsLoading ? "..." : stats?.hier?.toString() || "0",
      subtitle: formatDate(getYesterday()),
      subtitleColor: "text-orange-500",
    },
    {
      title: "Total commandes d'aujourd'hui",
      value: statsLoading ? "..." : stats?.aujourdhui?.toString() || "0",
      subtitle: formatDate(getToday()),
      subtitleColor: "text-orange-500",
    },
    // Carte Total caisse - visible seulement pour les caissiers et admins
    ...(user?.role === "ADMIN" || user?.isCaissier
      ? [
          {
            title: "Total caisse",
            value: statsLoading
              ? "..."
              : stats?.chiffreAffairesJour?.toLocaleString() || "0",
            currency: statsLoading ? "" : "XOF",
            subtitle: `Recette du ${formatDate(getToday())}`,
            subtitleColor: "text-orange-500",
          },
        ]
      : []),
  ];

  // Order status tabs data with real counts
  const statusTabs = [
    {
      id: "TOUTES",
      label: "Tous",
      count: statsLoading ? null : stats?.aujourdhui || 0,
      active: selectedStatus === "TOUTES",
    },
    {
      id: "TERMINE",
      label: "Prête",
      count: statsLoading ? null : stats?.termine || 0,
      active: selectedStatus === "TERMINE",
    },
    {
      id: "EN_ATTENTE",
      label: "En attente",
      count: statsLoading ? null : stats?.enAttente || 0,
      active: selectedStatus === "EN_ATTENTE",
    },
    {
      id: "ANNULE",
      label: "Annulé",
      count: null,
      active: selectedStatus === "ANNULE",
    },
    {
      id: "EN_COURS",
      label: "En cours",
      count: statsLoading ? null : stats?.enCours || 0,
      active: selectedStatus === "EN_COURS",
    },
    {
      id: "EN_PREPARATION",
      label: "En préparation",
      count: statsLoading ? null : stats?.enPreparation || 0,
      active: selectedStatus === "EN_PREPARATION",
    },
  ];

  // Fonction pour formater le statut d'une commande
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
      case "en-attente":
        return { label: "En attente", color: "bg-warning-5 text-warning-50" };
      case "EN_PREPARATION":
      case "en-cours":
        return { label: "En préparation", color: "bg-brand-5 text-brand-60" };
      case "PRETE":
      case "prete":
        return { label: "Prête", color: "bg-blue-5 text-blue-50" };
      case "TERMINE":
      case "terminee":
        return { label: "Terminé", color: "bg-success-5 text-success-50" };
      case "ANNULE":
      case "annule":
        return {
          label: "Annulé",
          color: "bg-destructive-5 text-destructive-50",
        };
      default:
        return { label: statut, color: "bg-gray-5 text-gray-50" };
    }
  };

  // Fonction pour obtenir l'icône de paiement
  const getPaymentIcon = (modePaiement: string) => {
    switch (modePaiement?.toLowerCase()) {
      case "especes":
      case "cash":
        return "/moneywavy.svg";
      case "carte":
      case "carte_bancaire":
        return "/creditcard.svg";
      case "wave":
        return "/image-8.svg";
      case "orange_money":
        return "/image-14.png";
      default:
        return "/moneywavy.svg";
    }
  };

  // Fonction pour formater le prix
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // Gestionnaire de changement d'onglet
  const handleTabChange = (value: string) => {
    setSelectedStatus(value);
  };

  // Gestionnaire de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Mise à jour des données quand les filtres changent
  useEffect(() => {
    refetch();
  }, [selectedStatus, searchTerm]);

  // Gestion des actions sur les commandes
  const handleCancelOrder = async (orderId: string) => {
    try {
      await OrderService.cancelOrder(orderId);
      refetch(); // Actualiser la liste
      refetchStats(); // Actualiser les statistiques
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
    }
  };

  const handleSendToKitchen = async (orderId: string) => {
    try {
      await OrderService.sendToKitchen(orderId);
      refetch(); // Actualiser la liste
      refetchStats(); // Actualiser les statistiques
    } catch (error) {
      console.error("Erreur lors de l'envoi en cuisine:", error);
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
    setActiveDropdown(null); // Fermer le dropdown
  };
  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setIsEditOrderModalOpen(true);
    setActiveDropdown(null); // Fermer le dropdown
  }; // Fonction pour ouvrir le bottom sheet mobile
  const handleMobileCardClick = (order: Order) => {
    setSelectedOrderForActions(order);
    setIsBottomSheetOpen(true);
  };

  // Fonction pour fermer le bottom sheet mobile
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedOrderForActions(null);
  };

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
                  {card.currency && (
                    <span className="font-bold text-base sm:text-lg md:text-2xl text-gray-400 flex-shrink-0">
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
      {/* Orders List */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12 xl:px-20 ">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and SearchIcon - Responsive */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Liste des commandes
              </h2>
              <div className="w-full lg:w-80 lg:flex-shrink-0">
                <div className="relative">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher une commande"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
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
          </div>{" "}
          {/* Desktop Table - Hidden on mobile/tablet */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <Table className="w-full table-auto min-w-0">
              <TableHeader className="bg-gray-5">
                <TableRow>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Commande
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    ID de commande
                  </TableHead>{" "}
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Type de paiement
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Montant
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Statut
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <SpinnerMedium />
                        <div className="text-gray-500 text-sm">
                          Chargement des commandes...
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : ordersError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex items-center justify-center">
                        <div className="text-red-500 text-sm">
                          Erreur: {ordersError}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <PlusIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="font-semibold text-base md:text-lg text-gray-700">
                            Aucune commande trouvée
                          </h3>
                          <p className="font-normal text-sm text-gray-500 max-w-sm">
                            {allOrders &&
                            Array.isArray(allOrders) &&
                            allOrders.length === 0
                              ? "Commencez par créer votre première commande"
                              : "Aucune commande ne correspond à vos critères de recherche"}
                          </p>
                        </div>
                        {allOrders &&
                          Array.isArray(allOrders) &&
                          allOrders.length === 0 && (
                            <Button
                              onClick={() => setIsNewOrderModalOpen(true)}
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <PlusIcon className="w-4 h-4 mr-2" />
                              Créer une nouvelle commande
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: Order) => (
                    <TableRow
                      key={order._id}
                      className="h-20 border-b bg-white hover:bg-gray-10 border-slate-200"
                    >
                      {" "}
                      <TableCell className="px-4 py-3">
                        {/* Dish Column */}
                        <div className="flex items-center gap-3 min-w-0">
                          {" "}
                          <div className="w-10 h-10 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                            {order.items[0]?.menuItem &&
                            typeof order.items[0].menuItem === "object" &&
                            order.items[0].menuItem.image ? (
                              <img
                                src={`${"http://localhost:3000"}${
                                  order.items[0].menuItem.image
                                }`}
                                alt={order.items[0]?.nom || "Plat"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback vers l'image par défaut si l'image du produit n'existe pas
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
                          <div className="flex flex-col min-w-0 overflow-hidden">
                            <div className="font-semibold text-base text-gray-900 truncate">
                              {order.items[0]?.nom || "Commande"}
                            </div>
                            <div className="font-medium text-sm text-gray-500 truncate">
                              {order.items.length > 1 &&
                                `+${order.items.length - 1} autres éléments`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {/* Order ID Column */}
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="font-semibold text-base text-gray-900">
                            #{order.numeroCommande}
                          </div>
                          <div className="font-medium text-sm text-gray-500">
                            {order._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </TableCell>{" "}
                      <TableCell className="px-4 py-3">
                        {/* Payment Type Column */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex w-10 h-10 items-center justify-center px-2 py-2 bg-orange-100 rounded-full flex-shrink-0">
                            <img
                              className="w-5 h-5"
                              alt="Payment icon"
                              src={getPaymentIcon(
                                order.modePaiement || "especes"
                              )}
                            />
                          </div>
                          <div className="font-semibold text-base text-gray-900 truncate">
                            {order.modePaiement || "Non défini"}
                          </div>
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
                      {/* Status Column */}
                      <TableCell className="px-4 py-3">
                        <Badge
                          className={`${
                            getStatusBadge(order.statut).color
                          } px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap`}
                        >
                          {getStatusBadge(order.statut).label}
                        </Badge>
                      </TableCell>
                      {/* Action Column */}
                      <TableCell className="px-4 py-3">
                        <DropdownMenu
                          onOpenChange={(open) => {
                            if (open) {
                              setActiveDropdown(order._id);
                            } else if (activeDropdown === order._id) {
                              setActiveDropdown(null);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`w-10 h-10 rounded-full ${
                                activeDropdown === order._id
                                  ? "bg-orange-100"
                                  : ""
                              }`}
                            >
                              <img
                                className="w-6 h-6"
                                alt="Action menu"
                                src="/monotone-add.svg"
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          {activeDropdown === order._id && (
                            <DropdownMenuContent className="w-48 rounded-lg border border-gray-200">
                              {order.statut === "EN_ATTENTE" && (
                                <>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer font-medium text-sm"
                                    onClick={() => handleEditOrder(order)}
                                  >
                                    <PencilSimple size={20} />
                                    <span className="text-gray-700">
                                      Modifier
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="h-px bg-gray-200" />
                                  <DropdownMenuItem
                                    className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer font-medium text-sm"
                                    onClick={() =>
                                      handleSendToKitchen(order._id)
                                    }
                                  >
                                    <PaperPlaneTilt size={20} />
                                    <span className="text-gray-700">
                                      Envoyer en cuisine
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="h-px bg-gray-200" />
                                </>
                              )}
                              <DropdownMenuItem
                                className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer font-medium text-sm"
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <Eye size={20} />
                                <span className="text-gray-700">
                                  Voir détails
                                </span>
                              </DropdownMenuItem>
                              {(order.statut === "EN_ATTENTE" ||
                                order.statut === "EN_PREPARATION") && (
                                <>
                                  <DropdownMenuSeparator className="h-px bg-gray-200" />
                                  <DropdownMenuItem
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-red-600 cursor-pointer font-medium text-sm"
                                    onClick={() => handleCancelOrder(order._id)}
                                  >
                                    <X size={20} />
                                    <span className="text-red-600">
                                      Annuler
                                    </span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          )}
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile/Tablet Cards - Visible only on mobile/tablet */}
          <div className="block rounded-b-none lg:hidden">
            {ordersLoading ? (
              <div className="p-6 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <SpinnerMedium />
                  <div className="text-gray-500 text-sm">
                    Chargement des commandes...
                  </div>
                </div>
              </div>
            ) : ordersError ? (
              <div className="p-6 text-center">
                <div className="text-red-500 text-sm">
                  Erreur: {ordersError}
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <PlusIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold text-base text-gray-700">
                      Aucune commande trouvée
                    </h3>
                    <p className="font-normal text-sm text-gray-500 max-w-sm">
                      {allOrders &&
                      Array.isArray(allOrders) &&
                      allOrders.length === 0
                        ? "Commencez par créer votre première commande"
                        : "Aucune commande ne correspond à vos critères de recherche"}
                    </p>
                  </div>
                  {allOrders &&
                    Array.isArray(allOrders) &&
                    allOrders.length === 0 && (
                      <Button
                        onClick={() => setIsNewOrderModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Créer une nouvelle commande
                      </Button>
                    )}
                </div>
              </div>
            ) : (
              <div className="p-3 md:p-4 space-y-3">
                {filteredOrders.map((order: Order) => (
                  <Card
                    key={order._id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer transition-colors active:bg-gray-10"
                    onClick={() => handleMobileCardClick(order)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Left side: Product info */}
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          {/* Product image */}{" "}
                          <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                            {order.items[0]?.menuItem &&
                            typeof order.items[0].menuItem === "object" &&
                            order.items[0].menuItem.image ? (
                              <img
                                src={`${"http://localhost:3000"}${
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
                          {/* Product info */}
                          <div className="flex flex-col gap-1 overflow-hidden flex-1">
                            <div className="font-semibold text-base text-gray-900 truncate">
                              {order.items[0]?.nom || "Commande"}
                            </div>
                            {order.items.length > 1 && (
                              <div className="font-medium text-sm text-gray-500">
                                +{order.items.length - 1} autres
                              </div>
                            )}
                            {/* <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-sm text-gray-900">
                              #{order.numeroCommande}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="font-semibold text-sm text-gray-900 truncate">
                              {formatPrice(order.montantTotal)} XOF
                            </span>
                          </div> */}
                          </div>
                        </div>

                        {/* Right side: Status badge only */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge
                            className={`${
                              getStatusBadge(order.statut).color
                            } px-2 py-1 rounded-full font-semibold text-xs whitespace-nowrap`}
                          >
                            {getStatusBadge(order.statut).label}
                          </Badge>
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {formatPrice(order.montantTotal)} XOF
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Bottom Sheet Mobile pour les actions */}
      <MobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={handleCloseBottomSheet}
      >
        {selectedOrderForActions && (
          <>
            {/* Order Info Header */}
            <div className="flex items-center gap-3 mb-6">
              {" "}
              <div className="w-14 h-14 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                {selectedOrderForActions.items[0]?.menuItem &&
                typeof selectedOrderForActions.items[0].menuItem === "object" &&
                selectedOrderForActions.items[0].menuItem.image ? (
                  <img
                    src={`${"http://localhost:3000"}${
                      selectedOrderForActions.items[0].menuItem.image
                    }`}
                    alt={selectedOrderForActions.items[0]?.nom || "Plat"}
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
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {selectedOrderForActions.items[0]?.nom || "Commande"}
                </h3>
                <p className="text-sm text-gray-500">
                  Commande #{selectedOrderForActions.numeroCommande}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(selectedOrderForActions.montantTotal)} XOF
                </p>
              </div>
              <Badge
                className={`${
                  getStatusBadge(selectedOrderForActions.statut).color
                } px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap`}
              >
                {getStatusBadge(selectedOrderForActions.statut).label}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Voir détails - toujours disponible */}
              <BottomSheetAction
                onClick={() => {
                  handleViewOrderDetails(selectedOrderForActions);
                  handleCloseBottomSheet();
                }}
                icon={<Eye size={24} />}
                title="Voir détails"
                description="Consulter les informations complètes"
                variant="default"
              />

              {/* Actions conditionnelles selon le statut */}
              {selectedOrderForActions.statut === "EN_ATTENTE" && (
                <>
                  <BottomSheetAction
                    onClick={() => {
                      handleEditOrder(selectedOrderForActions);
                      handleCloseBottomSheet();
                    }}
                    icon={<PencilSimple size={24} />}
                    title="Modifier"
                    description="Modifier les éléments de la commande"
                    variant="default"
                  />

                  <BottomSheetAction
                    onClick={() => {
                      handleSendToKitchen(selectedOrderForActions._id);
                      handleCloseBottomSheet();
                    }}
                    icon={<PaperPlaneTilt size={24} />}
                    title="Envoyer en cuisine"
                    description="Démarrer la préparation"
                    variant="primary"
                  />
                </>
              )}

              {/* Annuler - disponible pour EN_ATTENTE et EN_PREPARATION */}
              {(selectedOrderForActions.statut === "EN_ATTENTE" ||
                selectedOrderForActions.statut === "EN_PREPARATION") && (
                <BottomSheetAction
                  onClick={() => {
                    handleCancelOrder(selectedOrderForActions._id);
                    handleCloseBottomSheet();
                  }}
                  icon={<X size={24} />}
                  title="Annuler la commande"
                  description="Cette action est irréversible"
                  variant="danger"
                />
              )}
            </div>
          </>
        )}
      </MobileBottomSheet>
      {/* Modal pour nouvelle commande */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => {
          setIsNewOrderModalOpen(false);
          // Actualiser la liste et les statistiques après fermeture du modal
          refetch();
          refetchStats();
        }}
      />
      {/* Modal pour modifier une commande */}
      <NewOrderModal
        isOpen={isEditOrderModalOpen}
        onClose={() => {
          setIsEditOrderModalOpen(false);
          setOrderToEdit(null);
          // Actualiser la liste et les statistiques après fermeture du modal
          refetch();
          refetchStats();
        }}
        orderToEdit={orderToEdit}
        isEditMode={true}
      />{" "}
      {/* Modal pour les détails de commande */}
      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => {
          setIsOrderDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />{" "}
      {/* Barre mobile fixe pour nouvelle commande */}
      <MobileNewOrderBar
        onClick={() => setIsNewOrderBottomSheetOpen(true)}
        disabled={ordersLoading}
      />
      {/* Bottom Sheet pour nouvelle commande mobile */}
      <NewOrderBottomSheet
        isOpen={isNewOrderBottomSheetOpen}
        onClose={() => setIsNewOrderBottomSheetOpen(false)}
        onOrderCreated={() => {
          // Actualiser la liste et les statistiques après création
          refetch();
          refetchStats();
        }}
      />
    </section>
  );
};
