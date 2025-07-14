import { SearchIcon, PlusIcon, RefreshCw } from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
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
import NewOrderModal from "../../../../components/modals/NewOrderModal";
import { OrderDetailsModal } from "../../../../components/modals/OrderDetailsModal";
import { CancelOrderDialog } from "../../../../components/CancelOrderDialog";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  Eye,
  X,
  PencilSimple,
  PaperPlaneTilt,
  CreditCard,
  Money,
  DotsThreeVertical,
} from "phosphor-react";
import {
  getOrderItemImage,
  handleImageError,
} from "../../../../services/imageService";
import { UserAvatar } from "../../../../components/UserAvatar";

// Composant mémorisé pour éviter les re-rendus inutiles des images avec gestion locale du fallback
const MemoizedOrderImage = React.memo(
  ({
    imagePath,
    altText,
    className = "w-full h-full object-cover",
  }: {
    imagePath?: string;
    altText: string;
    className?: string;
  }) => {
    const initialImageUrl = imagePath
      ? getOrderItemImage(imagePath)
      : "/img/plat_petit.png";

    // État local pour gérer le fallback et éviter les boucles
    const [currentSrc, setCurrentSrc] = useState(initialImageUrl);
    const [hasErrored, setHasErrored] = useState(false);

    // Réinitialiser quand l'imagePath change
    useEffect(() => {
      const newUrl = imagePath
        ? getOrderItemImage(imagePath)
        : "/img/plat_petit.png";
      setCurrentSrc(newUrl);
      setHasErrored(false);
    }, [imagePath]);

    const handleError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (!hasErrored) {
          setHasErrored(true);
          handleImageError(e);
          const fallbackUrl = "/img/plat_petit.png";
          setCurrentSrc(fallbackUrl);
        }
      },
      [hasErrored]
    );

    const handleLoad = useCallback(() => {
      // Image chargée avec succès
    }, []);

    return (
      <img
        src={currentSrc}
        alt={altText}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    );
  },
  // Comparaison personnalisée pour éviter les re-rendus inutiles
  (prevProps, nextProps) => {
    return (
      prevProps.imagePath === nextProps.imagePath &&
      prevProps.altText === nextProps.altText &&
      prevProps.className === nextProps.className
    );
  }
);

MemoizedOrderImage.displayName = "MemoizedOrderImage";

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
    useState<Order | null>(null); // États pour le bottom sheet de création de commande mobile
  const [isNewOrderBottomSheetOpen, setIsNewOrderBottomSheetOpen] =
    useState(false);

  // État pour le rafraîchissement
  const [isRefreshing, setIsRefreshing] = useState(false);

  // États pour la gestion de l'annulation avec motif
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // États pour l'envoi en caisse
  const [isSendToCashierModalOpen, setIsSendToCashierModalOpen] =
    useState(false);
  const [orderToSendToCashier, setOrderToSendToCashier] =
    useState<Order | null>(null);
  const [selectedPaymentMethodForCashier, setSelectedPaymentMethodForCashier] =
    useState<string>("");
  const [isSendingToCashier, setIsSendingToCashier] = useState(false);

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
      mobileTitle: "Hier",
      value: statsLoading ? "..." : stats?.hier?.toString() || "0",
      subtitle: formatDate(getYesterday()),
      subtitleColor: "text-orange-500",
    },
    {
      title: "Total commandes d'aujourd'hui",
      mobileTitle: "Aujourd'hui",
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
  ]; // Order status tabs data with real counts
  const statusTabs = [
    {
      id: "TOUTES",
      label: "Tous",
      count: statsLoading ? null : stats?.aujourdhui || 0,
      active: selectedStatus === "TOUTES",
    },
    {
      id: "EN_ATTENTE",
      label: "En attente",
      count: statsLoading ? null : stats?.enAttente || 0,
      active: selectedStatus === "EN_ATTENTE",
    },
    {
      id: "EN_PREPARATION",
      label: "En préparation",
      count: statsLoading ? null : stats?.enPreparation || 0,
      active: selectedStatus === "EN_PREPARATION",
    },
    {
      id: "EN_COURS",
      label: "En cours",
      count: statsLoading ? null : stats?.enCours || 0,
      active: selectedStatus === "EN_COURS",
    },
    {
      id: "TERMINE",
      label: "Prête",
      count: statsLoading ? null : stats?.termine || 0,
      active: selectedStatus === "TERMINE",
    },
    {
      id: "ANNULE",
      label: "Annulé",
      count: statsLoading ? null : stats?.annule || 0,
      active: selectedStatus === "ANNULE",
    },
  ];
  // Fonction pour obtenir l'icône de paiement (composant React)
  const getPaymentIcon = (modePaiement: string) => {
    const iconProps = {
      size: 20,
      strokeweigh: "1.5",
      color: "#F97316" as const,
    };

    switch (modePaiement?.toLowerCase()) {
      case "especes":
        return (
          <>
            <div className="flex w-10 h-10 bg-orange-100 text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0">
              <Money {...iconProps} />
            </div>
          </>
        );

      case "carte_bancaire":
      case "carte":
        return (
          <>
            <div className="flex w-10 h-10 bg-orange-100 text-brand-primary-500 items-center justify-centerrounded-full flex-shrink-0">
              <CreditCard {...iconProps} />
            </div>
          </>
        );
      case "wave":
        return (
          <img
            src="/img/wave.jpg"
            alt="Wave"
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      case "mtn_money":
        return (
          <img
            src="/img/mtn_money.jpg"
            alt="MTN Money"
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      case "orange_money":
        return (
          <img
            src="/img/orange_money.jpg"
            alt="Orange Money"
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      case "moov_money":
        return (
          <img
            src="/img/moov_money.jpg"
            alt="Moov Money"
            className="w-10 h-10 rounded-full object-cover"
          />
        );
      default:
        return (
          <>
            <div className="flex w-10 h-10 items-center justify-center px-2 py-2 bg-orange-100 rounded-full flex-shrink-0">
              <Money {...iconProps} />
            </div>
          </>
        );
    }
  };

  // Fonction pour formater les noms des modes de paiement
  const formatPaymentMethodName = (
    modePaiement: string | undefined
  ): string => {
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

  // Fonction pour formater le prix
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // Fonction simple pour rendre les images empilées avec mémorisation des URLs
  const renderStackedImages = useMemo(() => {
    return (items: any[], maxImages: number = 3, isMobile: boolean = false) => {
      const imagesToShow = items.slice(0, maxImages);
      const size = isMobile ? "w-12 h-12" : "w-10 h-10";
      const translateClass = isMobile ? "translate-x-1.5" : "translate-x-1";
      const translateClass2 = isMobile ? "translate-x-3" : "translate-x-2";

      return (
        <div className={`relative ${size} flex-shrink-0`}>
          {imagesToShow.map((item, index) => {
            const positionClasses = [
              "translate-x-0 translate-y-0 opacity-100 z-30",
              `${translateClass} translate-y-0.5 opacity-70 z-20`,
              `${translateClass2} translate-y-1 opacity-40 z-10`,
            ];

            return (
              <div
                key={`${item._id || item.nom || "item"}-${index}`}
                className={`absolute ${size} rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden border-2 border-white shadow-sm ${
                  positionClasses[index] || ""
                }`}
              >
                <MemoizedOrderImage
                  imagePath={item.menuItem?.image}
                  altText={item.nom || "Plat"}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      );
    };
  }, []); // Fonction mémorisée, ne se recréée jamais

  // Gestionnaire de changement d'onglet
  const handleTabChange = (value: string) => {
    setSelectedStatus(value);
  };
  // Gestionnaire de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Gestionnaire de rafraîchissement
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchStats()]);
    } catch (error) {
      // Erreur silencieuse pour éviter les logs répétitifs
    } finally {
      setIsRefreshing(false);
    }
  };

  // Rafraîchissement automatique toutes les 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      refetchStats();
    }, 60000); // 60 000 ms = 1 minute
    return () => clearInterval(interval);
  }, [refetch, refetchStats]);

  // Mise à jour des données quand les filtres changent
  useEffect(() => {
    refetch();
  }, [selectedStatus, searchTerm]);

  // Gestion des actions sur les commandes
  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelDialogOpen(true);
    setActiveDropdown(null); // Fermer le dropdown
  };

  const handleConfirmCancelOrder = async (motifAnnulation: string) => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      await OrderService.cancelOrder(orderToCancel._id, motifAnnulation);
      refetch(); // Actualiser la liste
      refetchStats(); // Actualiser les statistiques
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsCancelling(false);
      setOrderToCancel(null);
    }
  };
  const handleSendToKitchen = async (orderId: string) => {
    try {
      await OrderService.sendToKitchen(orderId);
      refetch(); // Actualiser la liste
      refetchStats(); // Actualiser les statistiques
    } catch (error) {
      // Erreur silencieuse
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
  }; // Fonction pour gérer l'envoi en caisse
  const handleSendToCashier = (order: Order) => {
    setOrderToSendToCashier(order);
    setSelectedPaymentMethodForCashier(""); // Réinitialiser la sélection
    setIsSendToCashierModalOpen(true);
    setActiveDropdown(null); // Fermer le dropdown
  };

  // Fonction pour traiter l'envoi en caisse
  const handleProcessSendToCashier = async () => {
    if (!orderToSendToCashier || !selectedPaymentMethodForCashier) return;

    setIsSendingToCashier(true);
    try {
      // Mettre à jour la commande avec le mode de paiement
      await OrderService.updateOrder(orderToSendToCashier._id, {
        modePaiement: selectedPaymentMethodForCashier as
          | "ESPECES"
          | "CARTE_BANCAIRE"
          | "WAVE"
          | "MTN_MONEY"
          | "ORANGE_MONEY"
          | "MOOV_MONEY",
      });

      // Note: Il faudra ajouter une méthode spécifique pour envoyer en caisse avec nouveau statut
      // Pour l'instant, on met juste à jour le mode de paiement

      setIsSendToCashierModalOpen(false);
      setOrderToSendToCashier(null);
      setSelectedPaymentMethodForCashier("");
      refetch(); // Actualiser la liste
      refetchStats(); // Actualiser les statistiques
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setIsSendingToCashier(false);
    }
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
                    <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-400 flex-shrink-0">
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
          {/* Desktop Table - Hidden on mobile/tablet */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <Table className="w-full table-auto min-w-0">
              <TableHeader className="bg-gray-5">
                <TableRow>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Commande
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    N° Table
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    ID de commande
                  </TableHead>
                  <TableHead className="h-[60px] px-4 py-3 text-sm text-gray-700 whitespace-nowrap min-w-0">
                    Serveur
                  </TableHead>
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
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <SpinnerMedium />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : ordersError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-40 text-center">
                      <div className="flex items-center justify-center">
                        <div className="text-red-500 text-sm">
                          Erreur: {ordersError}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
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
                      <TableCell className="px-4 py-3">
                        {/* Dish Column */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Images empilées pour commandes multiples */}
                          {order.items.length > 1 ? (
                            <div className="w-14 h-10 flex-shrink-0">
                              {renderStackedImages(order.items)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl mr-4 bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                              {order.items?.[0]?.menuItem &&
                              typeof order.items[0].menuItem === "object" &&
                              order.items[0].menuItem.image ? (
                                <MemoizedOrderImage
                                  imagePath={order.items[0].menuItem.image}
                                  altText={order.items[0]?.nom || "Plat"}
                                  className="w-full h-full object-cover"
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
                      {/* N° Table Column */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-gray-900">
                            {order.numeroTable}
                          </span>
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
                      </TableCell>
                      {/* Serveur Column */}
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Photo de profil du serveur */}
                          <UserAvatar
                            photo={order.serveur?.photoProfil}
                            nom={order.serveur?.nom}
                            prenom={order.serveur?.prenom}
                            size="md"
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="font-semibold text-base text-gray-900">
                              {order.serveur
                                ? user &&
                                  (user.id === order.serveur._id ||
                                    user._id === order.serveur._id)
                                  ? "Moi"
                                  : order.serveur.prenom
                                : "Non défini"}
                            </div>
                            <div className="font-medium text-sm text-gray-500">
                              Serveur
                            </div>
                          </div>
                        </div>
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
                      <TableCell className="px-4 py-3">
                        {/* Amount Column */}
                        <div className="font-semibold text-base">
                          <span className="text-gray-900">
                            {formatPrice(order.montantTotal)}
                          </span>
                          <span className="text-gray-400">XOF</span>
                        </div>
                      </TableCell>
                      {/* Status Column */}
                      <TableCell className="px-4 py-3">
                        <OrderStatusBadge statut={order.statut} />
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
                              <DotsThreeVertical size={32} />
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
                              {/* Option Envoyer en caisse pour les commandes prêtes */}
                              {order.statut === "PRET" && (
                                <>
                                  <DropdownMenuSeparator className="h-px bg-gray-200" />
                                  <DropdownMenuItem
                                    className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer font-medium text-sm"
                                    onClick={() => handleSendToCashier(order)}
                                  >
                                    <CreditCard size={20} />
                                    <span className="text-gray-700">
                                      Envoyer en caisse
                                    </span>
                                  </DropdownMenuItem>
                                </>
                              )}
                              {/* Option Annuler pour EN_ATTENTE, EN_COURS et EN_PREPARATION */}
                              {(order.statut === "EN_ATTENTE" ||
                                order.statut === "EN_COURS" ||
                                order.statut === "EN_PREPARATION") && (
                                <>
                                  <DropdownMenuSeparator className="h-px bg-gray-200" />
                                  <DropdownMenuItem
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-red-600 cursor-pointer font-medium text-sm"
                                    onClick={() => handleCancelOrder(order)}
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
                          {/* Product image */}
                          {order.items.length > 1 ? (
                            <div className="w-16 h-12 flex-shrink-0">
                              {renderStackedImages(order.items, 3, true)}
                            </div>
                          ) : (
                            <div className="w-12 h-12 mr-4 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                              {order.items?.[0]?.menuItem &&
                              typeof order.items[0].menuItem === "object" &&
                              order.items[0].menuItem.image ? (
                                <MemoizedOrderImage
                                  imagePath={order.items[0].menuItem.image}
                                  altText={order.items[0]?.nom || "Plat"}
                                  className="w-full h-full object-cover"
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
                          {/* Product info */}
                          <div className="flex flex-col gap-1 overflow-hidden flex-1">
                            <div className="font-semibold text-base text-gray-900 truncate">
                              {order.items[0]?.nom || "Commande"}
                              {order.items.length > 1 && (
                                <span className="font-medium text-sm text-gray-500">
                                  + {order.items.length - 1} autres
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900">
                                Table {order.numeroTable}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="font-semibold text-sm text-gray-900">
                                #{order.numeroCommande}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-medium text-sm text-orange-600">
                                Serveur:
                              </span>
                              {/* Photo de profil du serveur */}
                              <UserAvatar
                                photo={order.serveur?.photoProfil}
                                nom={order.serveur?.nom}
                                prenom={order.serveur?.prenom}
                                size="sm"
                              />
                              <span className="font-medium text-sm text-orange-600">
                                {order.serveur
                                  ? user &&
                                    (user.id === order.serveur._id ||
                                      user._id === order.serveur._id)
                                    ? "Moi"
                                    : order.serveur.prenom
                                  : "Non défini"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Right side: Status badge only */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <OrderStatusBadge statut={order.statut} />
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {formatPrice(order.montantTotal)}
                            <span className="text-gray-500">XOF</span>
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
              {selectedOrderForActions.items.length > 1 ? (
                <div className="w-20 h-14 flex-shrink-0">
                  {renderStackedImages(selectedOrderForActions.items, 3, true)}
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                  {selectedOrderForActions.items[0]?.menuItem &&
                  typeof selectedOrderForActions.items[0].menuItem ===
                    "object" &&
                  selectedOrderForActions.items[0].menuItem.image ? (
                    <MemoizedOrderImage
                      imagePath={
                        selectedOrderForActions.items[0].menuItem.image
                      }
                      altText={selectedOrderForActions.items[0]?.nom || "Plat"}
                      className="w-full h-full object-cover"
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
                <h3 className="font-semibold text-lg text-gray-900">
                  {selectedOrderForActions.items[0]?.nom || "Commande"}
                </h3>
                <p className="text-sm text-gray-500">
                  Table {selectedOrderForActions.numeroTable} • Commande #
                  {selectedOrderForActions.numeroCommande}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(selectedOrderForActions.montantTotal)} XOF
                </p>
              </div>
              <OrderStatusBadge statut={selectedOrderForActions.statut} />
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
              {/* Envoyer en caisse - disponible pour les commandes PRET */}
              {selectedOrderForActions.statut === "PRET" && (
                <BottomSheetAction
                  onClick={() => {
                    handleSendToCashier(selectedOrderForActions);
                    handleCloseBottomSheet();
                  }}
                  icon={<CreditCard size={24} />}
                  title="Envoyer en caisse"
                  description="Transférer vers le caissier pour paiement"
                  variant="primary"
                />
              )}
              {/* Annuler - disponible pour EN_ATTENTE, EN_COURS et EN_PREPARATION */}
              {(selectedOrderForActions.statut === "EN_ATTENTE" ||
                selectedOrderForActions.statut === "EN_COURS" ||
                selectedOrderForActions.statut === "EN_PREPARATION") && (
                <BottomSheetAction
                  onClick={() => {
                    handleCancelOrder(selectedOrderForActions);
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
      />
      {/* Modal pour les détails de commande */}
      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => {
          setIsOrderDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
      {/* Modal pour l'envoi en caisse */}
      <Dialog
        open={isSendToCashierModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsSendToCashierModalOpen(false);
            setOrderToSendToCashier(null);
            setSelectedPaymentMethodForCashier("");
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0">
          <div className="px-8 py-6">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Envoyer en caisse
              </DialogTitle>
              <p className="text-gray-600 mt-2">
                Sélectionnez le mode de paiement et envoyez la commande au
                caissier
              </p>
            </DialogHeader>

            {/* Info de la commande */}
            {orderToSendToCashier && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                    {orderToSendToCashier.items?.[0]?.menuItem &&
                    typeof orderToSendToCashier.items[0].menuItem ===
                      "object" &&
                    orderToSendToCashier.items[0].menuItem.image ? (
                      <MemoizedOrderImage
                        imagePath={orderToSendToCashier.items[0].menuItem.image}
                        altText={orderToSendToCashier.items[0]?.nom || "Plat"}
                        className="w-full h-full object-cover"
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
                    <h3 className="font-semibold text-gray-900">
                      Commande #{orderToSendToCashier.numeroCommande}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Table {orderToSendToCashier.numeroTable} •{" "}
                      {formatPrice(orderToSendToCashier.montantTotal)} XOF
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid des options de paiement */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Carte bancaire */}
              <div
                onClick={() =>
                  setSelectedPaymentMethodForCashier("CARTE_BANCAIRE")
                }
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethodForCashier === "CARTE_BANCAIRE"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <CreditCard
                      size={24}
                      weight="regular"
                      className="text-orange-600"
                    />
                  </div>
                  <span className="font-medium text-gray-900">
                    Carte de crédit
                  </span>
                </div>
                {selectedPaymentMethodForCashier === "CARTE_BANCAIRE" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Orange Money */}
              <div
                onClick={() =>
                  setSelectedPaymentMethodForCashier("ORANGE_MONEY")
                }
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethodForCashier === "ORANGE_MONEY"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src="/img/orange_money.jpg"
                      alt="Orange Money"
                      className="w-12 h-12 object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-900">
                    Orange money
                  </span>
                </div>
                {selectedPaymentMethodForCashier === "ORANGE_MONEY" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* MTN Money */}
              <div
                onClick={() => setSelectedPaymentMethodForCashier("MTN_MONEY")}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethodForCashier === "MTN_MONEY"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src="/img/mtn_money.jpg"
                      alt="MTN Money"
                      className="w-12 h-12 object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-900">MTN money</span>
                </div>
                {selectedPaymentMethodForCashier === "MTN_MONEY" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Moov Money */}
              <div
                onClick={() => setSelectedPaymentMethodForCashier("MOOV_MONEY")}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethodForCashier === "MOOV_MONEY"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src="/img/moov_money.jpg"
                      alt="Moov Money"
                      className="w-12 h-12 object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-900">Moov money</span>
                </div>
                {selectedPaymentMethodForCashier === "MOOV_MONEY" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Wave */}
              <div
                onClick={() => setSelectedPaymentMethodForCashier("WAVE")}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethodForCashier === "WAVE"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src="/img/wave.jpg"
                      alt="Wave"
                      className="w-12 h-12 object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-900">Wave</span>
                </div>
                {selectedPaymentMethodForCashier === "WAVE" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Espèces */}
              <div
                onClick={() => setSelectedPaymentMethodForCashier("ESPECES")}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethodForCashier === "ESPECES"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Money
                      size={24}
                      weight="regular"
                      className="text-orange-600"
                    />
                  </div>
                  <span className="font-medium text-gray-900">Espèces</span>
                </div>
                {selectedPaymentMethodForCashier === "ESPECES" && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsSendToCashierModalOpen(false)}
                disabled={isSendingToCashier}
                className="flex-1 h-12 font-medium text-base rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleProcessSendToCashier}
                disabled={
                  !selectedPaymentMethodForCashier || isSendingToCashier
                }
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSendingToCashier ? "Envoi en cours..." : "Envoyer en caisse"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour l'annulation avec motif */}
      <CancelOrderDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancelOrder}
        orderNumber={orderToCancel?.numeroCommande}
        isLoading={isCancelling}
      />

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
