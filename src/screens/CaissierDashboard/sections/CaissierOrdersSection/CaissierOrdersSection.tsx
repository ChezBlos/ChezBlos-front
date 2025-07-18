import { SearchIcon, RefreshCw, Printer, Eye } from "lucide-react";
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
import { OrderService } from "../../../../services/orderService";
import { Order, OrderItem } from "../../../../types/order";
import { useAlert } from "../../../../contexts/AlertContext";
import { useOrders, useOrderStats } from "../../../../hooks/useOrderAPI";
import { CreditCard, DotsThreeVertical } from "@phosphor-icons/react";
import { OrderDetailsModal } from "../../../../components/modals/OrderDetailsModal";
import { PrintReceiptModal } from "../../../../components/modals/PrintReceiptModal";
import { PaymentValidationModal } from "../../../../components/modals/PaymentValidationModal";

// Type pour l'élément de commande du caissier
interface CashierOrderItem {
  _id: string;
  menuItem: {
    _id: string;
    nom: string;
    prix: number;
    image?: string;
    categorie?: string; // Ajout de la propriété manquante
  };
  nom: string;
  quantite: number;
  prix: number;
}

// Type pour les commandes du caissier
interface CashierOrder extends Omit<Order, "items" | "numeroTable"> {
  numero: string;
  items: CashierOrderItem[];
  serveur: any;
  modePaiement?: string;
  numeroTable?: string; // Redéfini comme string pour éviter le conflit avec number
}

// Type pour les statistiques du caissier
interface CashierStats {
  en_attente_paiement: number;
  termine: number;
  total: number;
}

// Composant pour l'image d'une commande
const OrderImage: React.FC<{
  imagePath?: string;
  altText: string;
  className: string;
}> = ({ imagePath, altText, className }) => {
  const imageUrl = imagePath
    ? `${import.meta.env.VITE_IMAGE_BASE_URL || ""}${imagePath}`
    : "/img/plat_petit.png";

  return <img src={imageUrl} alt={altText} className={className} />;
};

// Mémorisation du composant d'image pour éviter les re-rendus inutiles
const MemoizedOrderImage = React.memo(OrderImage);

export const CaissierOrdersSection: React.FC<{
  onRefresh?: () => Promise<void>;
}> = ({ onRefresh }) => {
  // État pour stocker le terme de recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    "EN_ATTENTE_PAIEMENT"
  );

  // Effect pour le debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de délai

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Effect pour déclencher la recherche après le debounce
  useEffect(() => {
    if (debouncedSearchTerm !== "") {
      loadOrders();
    }
  }, [debouncedSearchTerm]);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CashierOrder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintReceiptModal, setShowPrintReceiptModal] = useState(false);
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [orders, setOrders] = useState<CashierOrder[]>([]);
  const [stats, setStats] = useState<CashierStats>({
    en_attente_paiement: 0,
    termine: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Récupération des alertes
  const { showAlert } = useAlert();

  // Récupération et traitement des données des commandes
  const { data: allOrders, refetch } = useOrders();

  // Stats API
  const { data: apiStats, refetch: refetchStats } = useOrderStats();

  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Effet pour mettre à jour les statistiques lorsque les données changent
  useEffect(() => {
    if (apiStats) {
      const cashierStats: CashierStats = {
        en_attente_paiement: apiStats.enAttentePaiement || 0,
        termine: apiStats.termine || 0,
        total: apiStats.total,
      };
      setStats(cashierStats);
      setStatsLoading(false);
    }
  }, [apiStats]);

  // Définition des onglets pour le filtrage des commandes avec les vrais nombres d'éléments
  const statusTabs = useMemo(() => {
    // Calculer les commandes de chaque type pour aujourd'hui
    let allTodayOrders: CashierOrder[] = [];
    let pendingOrders: CashierOrder[] = [];
    let completedOrders: CashierOrder[] = [];

    if (allOrders) {
      // Filtrer pour obtenir toutes les commandes du jour, indépendamment du statut sélectionné
      allTodayOrders = allOrders
        .filter((order: Order) => isToday(order.dateCreation))
        .map((order: Order) => order as unknown as CashierOrder);
      pendingOrders = allTodayOrders.filter(
        (order) => order.statut === "EN_ATTENTE_PAIEMENT"
      );
      completedOrders = allTodayOrders.filter(
        (order) => order.statut === "TERMINE"
      );
    }

    return [
      {
        id: null,
        label: "Toutes",
        count: allTodayOrders.length,
        active: selectedStatus === null,
      },
      {
        id: "EN_ATTENTE_PAIEMENT",
        label: "En attente",
        count: pendingOrders.length,
        active: selectedStatus === "EN_ATTENTE_PAIEMENT",
      },
      {
        id: "TERMINE",
        label: "Terminées",
        count: completedOrders.length,
        active: selectedStatus === "TERMINE",
      },
    ];
  }, [allOrders, selectedStatus]);

  // Gestionnaire de changement d'onglet
  const handleTabChange = (value: string | null) => {
    setSelectedStatus(value === "null" ? null : value);
  };

  // Effet pour filtrer et adapter les commandes lorsque les données changent
  useEffect(() => {
    if (allOrders) {
      setIsLoading(true);
      try {
        // Adapter les données du backend au format attendu par le caissier
        const adaptedOrders = allOrders.map(
          (order: Order) =>
            ({
              ...order,
              numero: order.numeroCommande || order._id,
              numeroTable: order.numeroTable
                ? String(order.numeroTable)
                : undefined,
              items: order.items.map((item: OrderItem, index: number) => ({
                _id: `${order._id}-item-${index}`,
                menuItem:
                  typeof item.menuItem === "string"
                    ? {
                        _id: item.menuItem,
                        nom: item.nom || "",
                        prix: item.prixUnitaire || 0,
                      }
                    : item.menuItem,
                nom: item.nom || "",
                quantite: item.quantite,
                prix: item.prixUnitaire || 0,
              })),
            } as CashierOrder)
        );

        // Séparer les commandes du jour
        const todayOrders: CashierOrder[] = [];

        adaptedOrders.forEach((order) => {
          if (isToday(order.dateCreation)) {
            // Filtrer également par statut si nécessaire
            if (!selectedStatus || order.statut === selectedStatus) {
              // Filtrer par terme de recherche
              if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                if (
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
                    order.numeroTable.toString().includes(debouncedSearchTerm))
                ) {
                  todayOrders.push(order);
                }
              } else {
                todayOrders.push(order);
              }
            }
          } else {
            // On ignore les commandes historiques
            // oldOrders.push(order);
          }
        });

        setOrders(todayOrders);
        // setHistoricalOrders(oldOrders); // Variable supprimée

        // Simulations pour la pagination (à adapter selon l'API)
        setTotalPages(Math.ceil(todayOrders.length / 10));
        setTotalOrders(todayOrders.length);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [allOrders, selectedStatus, debouncedSearchTerm]);

  // Fonction pour formater le prix
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

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

  // Fonction pour obtenir l'icône de paiement
  const getPaymentIcon = (modePaiement: string) => {
    switch (modePaiement?.toLowerCase()) {
      case "wave":
        return (
          <img
            src="/img/wave.jpg"
            alt="Wave"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      case "mtn_money":
        return (
          <img
            src="/img/mtn_money.jpg"
            alt="MTN Money"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      case "orange_money":
        return (
          <img
            src="/img/orange_money.jpg"
            alt="Orange Money"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      case "moov_money":
        return (
          <img
            src="/img/moov_money.jpg"
            alt="Moov Money"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      default:
        return (
          <div className="flex w-8 h-8 bg-orange-100 text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0">
            <CreditCard size={16} />
          </div>
        );
    }
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

  // Mise à jour automatique des données toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      refetchStats();
    }, 60000); // 60 secondes

    return () => clearInterval(interval);
  }, [refetch, refetchStats]);

  // Fonction pour charger les commandes
  const loadOrders = useCallback(
    async (page: number = 1, status?: string) => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        // Utiliser la méthode statique correcte
        const response = await OrderService.getOrders();

        // Adapter les données du backend au format attendu par le caissier
        const adaptedOrders = response.map(
          (order: Order) =>
            ({
              ...order,
              numero: order.numeroCommande || order._id,
              numeroTable: order.numeroTable
                ? String(order.numeroTable)
                : undefined,
              items: order.items.map((item: OrderItem, index: number) => ({
                _id: `${order._id}-item-${index}`,
                menuItem:
                  typeof item.menuItem === "string"
                    ? {
                        _id: item.menuItem,
                        nom: item.nom || "",
                        prix: item.prixUnitaire || 0,
                      }
                    : item.menuItem,
                nom: item.nom || "",
                quantite: item.quantite,
                prix: item.prixUnitaire || 0,
              })),
            } as CashierOrder)
        );

        // Séparer les commandes du jour des commandes historiques
        const todayOrders: CashierOrder[] = [];
        // const oldOrders: CashierOrder[] = [];

        adaptedOrders.forEach((order) => {
          if (isToday(order.dateCreation)) {
            // Filtrer également par statut si nécessaire
            if (
              !status ||
              order.statut === status ||
              (!status && !selectedStatus) ||
              (!status && order.statut === selectedStatus)
            ) {
              // Filtrer par terme de recherche
              if (debouncedSearchTerm.trim()) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                if (
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
                    order.numeroTable.toString().includes(debouncedSearchTerm))
                ) {
                  todayOrders.push(order);
                }
              } else {
                todayOrders.push(order);
              }
            }
          } // Sinon on ignore les commandes historiques
        });

        setOrders(todayOrders);
        // setHistoricalOrders(oldOrders); // Variable supprimée

        // Simulations pour la pagination (à adapter selon l'API)
        setTotalPages(Math.ceil(todayOrders.length / 10));
        setTotalOrders(todayOrders.length);
        setCurrentPage(page);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        showAlert("error", "Erreur lors du chargement");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedStatus, debouncedSearchTerm, showAlert]
  );

  // Fonction pour valider le paiement
  const handleValidatePayment = async (orderId: string, amount: number) => {
    try {
      // Récupérer les informations de la commande pour le mode de paiement
      const order = selectedOrder;
      if (!order || !order.modePaiement) {
        throw new Error("Mode de paiement non défini pour cette commande");
      }

      // Étape 1: Traiter le paiement
      await OrderService.processPayment(orderId, {
        modePaiement: order.modePaiement,
        montant: amount,
        referenceTransaction: `PAY-${Date.now()}`,
      });

      // Étape 2: Marquer la commande comme terminée en utilisant la méthode directe
      await OrderService.updateOrderStatus(orderId, "TERMINE");

      showAlert("success", "Paiement traité avec succès");
      setShowPaymentModal(false);
      setSelectedOrder(null);
      await Promise.all([refetch(), refetchStats()]);
      if (onRefresh) await onRefresh();
    } catch (error: any) {
      showAlert(
        "error",
        error.message || "Erreur lors du traitement du paiement"
      );
    }
  };

  // Fonction pour imprimer un ticket
  const handlePrintTicket = (order: CashierOrder) => {
    // Vérifier si la commande est en attente de paiement ou terminée
    if (order.statut === "EN_ATTENTE_PAIEMENT" || order.statut === "TERMINE") {
      setSelectedOrder(order);
      setShowPrintReceiptModal(true);
    } else {
      showAlert(
        "warning",
        "Seules les commandes en attente de paiement ou terminées peuvent être imprimées"
      );
    }
  };

  // Fonction pour confirmer l'impression du reçu
  const handleConfirmPrint = async () => {
    try {
      setIsPrintLoading(true);

      // Si la commande n'est pas déjà terminée
      if (selectedOrder?.statut !== "TERMINE") {
        try {
          // Étape 1: Traiter le paiement si ce n'est pas déjà fait
          await OrderService.processPayment(selectedOrder?._id || "", {
            modePaiement: selectedOrder?.modePaiement || "ESPECES",
            montant: selectedOrder?.montantTotal || 0,
            // Ajout d'une référence de transaction pour respecter le schéma
            referenceTransaction: `TICKET-${Date.now()}`,
          });
        } catch (paymentError: any) {
          console.warn(
            "Erreur de paiement, la commande est peut-être déjà payée:",
            paymentError
          );
          // Continuons même si le paiement échoue, car la commande pourrait déjà être payée
        }

        try {
          // Étape 2: Marquer la commande comme terminée en utilisant la méthode directe
          await OrderService.updateOrderStatus(
            selectedOrder?._id || "",
            "TERMINE"
          );
        } catch (completeError: any) {
          console.warn(
            "Erreur lors du marquage de la commande comme terminée:",
            completeError
          );
          // Continuons même si cette étape échoue
          showAlert(
            "warning",
            "Le reçu a été imprimé mais le statut n'a pas été mis à jour"
          );
        }
      }

      showAlert("success", "Reçu imprimé avec succès");
      setShowPrintReceiptModal(false);
      setSelectedOrder(null);
      await Promise.all([refetch(), refetchStats()]);
      if (onRefresh) await onRefresh();
    } catch (error: any) {
      showAlert(
        "error",
        error.message || "Erreur lors de l'impression du reçu"
      );
    } finally {
      setIsPrintLoading(false);
    }
  };

  // Fonction pour afficher les actions sur une commande
  const renderOrderActions = (order: CashierOrder) => {
    const isAwaitingPayment = order.statut === "EN_ATTENTE_PAIEMENT";
    const isCompleted = order.statut === "TERMINE";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <DotsThreeVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setSelectedOrder(order);
              setIsOrderDetailsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            <span>Voir détails</span>
          </DropdownMenuItem>

          {(isAwaitingPayment || isCompleted) && (
            <DropdownMenuItem onClick={() => handlePrintTicket(order)}>
              <Printer className="h-4 w-4 mr-2" />
              <span>{isCompleted ? "Réimprimer reçu" : "Imprimer ticket"}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      await refetchStats();
      showAlert("success", "Données rafraîchies avec succès");
    } catch (error) {
      showAlert("error", "Erreur lors du rafraîchissement des données");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Affichage des cartes de résumé
  return (
    <div className="space-y-4 pb-10 px-0 md:px-6 lg:px-12 xl:px-20">
      {/* Summary Cards - Style inspiré du ServeurDashboard */}
      <div className="mt-4 flex items-start gap-3 md:gap-5 w-full min-w-0">
        <Card className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-lg text-gray-900 truncate w-full">
              En attente de paiement
            </h3>
            <div className="flex flex-col items-start gap-1 w-full min-w-0">
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-bold text-xl md:text-3xl text-gray-900 truncate">
                  {statsLoading ? "..." : stats.en_attente_paiement || 0}
                </span>
              </div>
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-medium text-xs md:text-sm text-orange-500 truncate w-full">
                  {formatDate(getToday())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-lg text-gray-900 truncate w-full">
              Commandes terminées
            </h3>
            <div className="flex flex-col items-start gap-1 w-full min-w-0">
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-bold text-xl md:text-3xl text-gray-900 truncate">
                  {statsLoading ? "..." : stats.termine || 0}
                </span>
              </div>
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-medium text-xs md:text-sm text-green-500 truncate w-full">
                  {formatDate(getToday())}
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
                  {statsLoading
                    ? "..."
                    : formatPrice(apiStats?.chiffreAffairesJour || 0)}
                </span>
                <span className="font-bold text-xl md:text-3xl truncate text-gray-500">
                  XOF
                </span>
              </div>
              <div className="flex items-start gap-1 w-full min-w-0">
                <span className="font-medium text-xs md:text-sm text-blue-500 truncate w-full">
                  {formatDate(getToday())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commandes */}
      <div className="my-0 md:mb-6 lg:mb-8 ">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and SearchIcon - Responsive */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Liste des commandes
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher une commande"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
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
            <div className="px-3 md:px-4 lg:px-6">
              {/* Status Tabs - Horizontally Scrollable */}
              <div className="overflow-x-auto scrollbar-hide w-full">
                <Tabs
                  value={selectedStatus === null ? "null" : selectedStatus}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="flex justify-start h-auto bg-transparent pl-0 py-0 w-fit min-w-full">
                    {statusTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id || "null"}
                        value={tab.id === null ? "null" : tab.id}
                        className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                      >
                        <span className="font-semibold text-xs md:text-sm">
                          {tab.label}
                        </span>
                        <Badge className="bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full px-2 py-1 font-semibold text-xs">
                          {tab.count}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Tableau des commandes */}
          <div className="overflow-x-auto scrollbar-hide w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <SpinnerMedium />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-gray-500 mb-4">
                  {selectedStatus === "EN_ATTENTE_PAIEMENT"
                    ? "Aucune commande en attente de paiement pour aujourd'hui"
                    : selectedStatus === "TERMINE"
                    ? "Aucune commande terminée pour aujourd'hui"
                    : "Aucune commande pour aujourd'hui"}
                </p>
                <p className="text-gray-400 text-sm">
                  Toutes les commandes du jour apparaîtront ici
                </p>
              </div>
            ) : (
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
                      Serveur
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-gray-700">
                      Mode de paiement
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-gray-700">
                      Total
                    </TableHead>
                    <TableHead className="px-4 py-3 font-semibold text-gray-700">
                      Statut
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
                  {orders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="h-20 border-b bg-white hover:bg-gray-10 border-slate-200"
                    >
                      <TableCell className="px-4 py-3 font-medium">
                        {order.numero}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {renderStackedImages(order.items, 3)}
                          <div>
                            <div className="font-medium">
                              {order.items.length} article
                              {order.items.length > 1 ? "s" : ""}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items
                                .slice(0, 2)
                                .map((item) => item.nom)
                                .join(", ")}
                              {order.items.length > 2 && "..."} • {}
                              {order.numeroTable && (
                                <span className="text-sm font-semibold text-gray-500">
                                  Table {order.numeroTable}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {order.serveur ? (
                          <div>
                            <div className="font-medium">
                              {order.serveur.prenom} {order.serveur.nom}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(order.modePaiement || "")}
                          <span>
                            {formatPaymentMethodName(order.modePaiement)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {formatPrice(order.montantTotal || 0)} XOF
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <OrderStatusBadge statut={order.statut} />
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
                        {renderOrderActions(order)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, totalOrders)} sur {totalOrders}{" "}
            commandes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadOrders(currentPage - 1)}
              disabled={currentPage === 1 || isRefreshing}
            >
              Précédent
            </Button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadOrders(currentPage + 1)}
              disabled={currentPage === totalPages || isRefreshing}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Modal de détails de commande */}
      {isOrderDetailsModalOpen && selectedOrder && (
        <OrderDetailsModal
          isOpen={isOrderDetailsModalOpen}
          onClose={() => {
            setIsOrderDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder as any}
        />
      )}

      {/* Modal de validation de paiement */}
      {showPaymentModal && selectedOrder && (
        <PaymentValidationModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder as any}
          onValidate={handleValidatePayment}
        />
      )}

      {/* Modal d'impression de reçu */}
      {showPrintReceiptModal && selectedOrder && (
        <PrintReceiptModal
          isOpen={showPrintReceiptModal}
          onClose={() => {
            setShowPrintReceiptModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder as any}
          onConfirmPrint={handleConfirmPrint}
          isLoading={isPrintLoading}
        />
      )}
    </div>
  );
};
