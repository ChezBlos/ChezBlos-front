import {
  SearchIcon,
  RefreshCw,
  CreditCard,
  Printer,
  CheckCircle,
} from "lucide-react";
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
import { PaymentValidationModal } from "./PaymentValidationModal";

// Interface pour les commandes du caissier (compatible avec le backend)
interface CashierOrderItem {
  _id: string;
  menuItem: {
    _id: string;
    nom: string;
    image?: string;
    prix: number;
  };
  nom: string;
  quantite: number;
  prix: number;
  instructions?: string;
}

interface CashierOrder {
  _id: string;
  numero: string;
  statut: string;
  total: number;
  items: CashierOrderItem[];
  serveur?: {
    _id: string;
    nom: string;
    prenom: string;
  };
  modePaiement?: string;
  dateCreation: string;
  dateModification?: string;
  table?: string;
  numeroTable?: number;
  commentaire?: string;
}

// Interface pour les statistiques
interface CashierStats {
  en_attente_paiement: number;
  termine: number;
  total: number;
}

// Composant image mémorisé pour éviter les re-rendus inutiles
const MemoizedOrderImage = React.memo(
  ({
    imagePath,
    altText,
    className,
  }: {
    imagePath?: string;
    altText: string;
    className: string;
  }) => {
    return (
      <img
        src={imagePath || "/img/plat_petit.png"}
        alt={altText}
        className={className}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/img/plat_petit.png";
        }}
      />
    );
  }
);

export const CaissierOrdersSection: React.FC = () => {
  // États pour les commandes et le chargement
  const [orders, setOrders] = useState<CashierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    "EN_ATTENTE_PAIEMENT"
  );

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // États pour les statistiques
  const [stats, setStats] = useState<CashierStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // États pour les modals
  const [selectedOrder, setSelectedOrder] = useState<CashierOrder | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { showAlert } = useAlert();

  // Configuration des onglets
  const statusTabs = [
    {
      id: "EN_ATTENTE_PAIEMENT",
      label: "En attente paiement",
      count: statsLoading ? null : stats?.en_attente_paiement || 0,
      active: selectedStatus === "EN_ATTENTE_PAIEMENT",
    },
    {
      id: "TERMINE",
      label: "Historique",
      count: statsLoading ? null : stats?.termine || 0,
      active: selectedStatus === "TERMINE",
    },
  ];

  // Fonction pour formater le prix
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
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

  // Fonction pour charger les statistiques
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await OrderService.getOrderStats();
      // Adapter les stats aux besoins du caissier
      const cashierStats: CashierStats = {
        en_attente_paiement: response.enAttentePaiement || 0,
        termine: response.termine || 0,
        total: response.total,
      };
      setStats(cashierStats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

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

        // Filtrer les commandes selon le statut sélectionné
        const filteredOrders = response.filter((order: Order) => {
          if (status && status !== selectedStatus) return false;
          const orderStatus = status || selectedStatus;
          return order.statut === orderStatus;
        });

        // Adapter les données du backend au format attendu par le caissier
        const adaptedOrders: CashierOrder[] = filteredOrders.map(
          (order: Order) => ({
            _id: order._id,
            numero: order.numeroCommande || order._id,
            statut: order.statut,
            total: order.montantTotal || 0,
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
            serveur: order.serveur,
            modePaiement: order.modePaiement,
            dateCreation: order.dateCreation,
            numeroTable: order.numeroTable,
          })
        );

        setOrders(adaptedOrders);
        // Simulations pour la pagination (à adapter selon l'API)
        setTotalPages(Math.ceil(adaptedOrders.length / 10));
        setTotalOrders(adaptedOrders.length);
        setCurrentPage(page);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes:", error);
        showAlert("error", "Erreur lors du chargement");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedStatus, searchTerm, showAlert]
  );

  // Fonction pour valider le paiement
  const handleValidatePayment = async (orderId: string, amount: number) => {
    try {
      // Récupérer les informations de la commande pour le mode de paiement
      const order = selectedOrder;
      if (!order || !order.modePaiement) {
        throw new Error("Mode de paiement non défini pour cette commande");
      }

      await OrderService.processPayment(orderId, {
        modePaiement: order.modePaiement,
        montant: amount,
      });

      showAlert("success", "Paiement traité avec succès");
      setShowPaymentModal(false);
      setSelectedOrder(null);
      await Promise.all([loadOrders(currentPage), loadStats()]);
    } catch (error: any) {
      showAlert(
        "error",
        error.message || "Erreur lors du traitement du paiement"
      );
    }
  };

  // Fonction pour imprimer un ticket
  const handlePrintTicket = (order: CashierOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ticketContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - Commande ${order.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .order-info { margin-bottom: 15px; }
            .items { margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; text-align: right; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>CHEZ BLOS</h2>
            <p>Ticket de Caisse</p>
          </div>
          
          <div class="order-info">
            <p><strong>N° Commande:</strong> ${order.numero}</p>
            <p><strong>Date:</strong> ${new Date(
              order.dateCreation
            ).toLocaleString("fr-FR")}</p>
            ${
              order.numeroTable
                ? `<p><strong>Table:</strong> ${order.numeroTable}</p>`
                : ""
            }
            ${
              order.serveur
                ? `<p><strong>Serveur:</strong> ${order.serveur.prenom} ${order.serveur.nom}</p>`
                : ""
            }
            <p><strong>Mode de paiement:</strong> ${formatPaymentMethodName(
              order.modePaiement
            )}</p>
          </div>

          <div class="items">
            <h3>Articles commandés:</h3>
            ${order.items
              .map(
                (item: CashierOrderItem) => `
              <div class="item">
                <span>${item.quantite}x ${item.nom}</span>
                <span>${formatPrice(item.prix * item.quantite)} XOF</span>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="total">
            <p>TOTAL: ${formatPrice(order.total)} XOF</p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <p>Merci de votre visite !</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(ticketContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Fonction pour actualiser les données
  const handleRefresh = useCallback(async () => {
    await Promise.all([loadOrders(1), loadStats()]);
  }, [loadOrders, loadStats]);

  // Gestionnaire de changement de statut
  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  // Gestionnaire de recherche
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Effets pour charger les données initiales
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadOrders(1);
  }, [selectedStatus, searchTerm]);

  // Rendu des actions pour chaque commande
  const renderOrderActions = (order: CashierOrder) => {
    const isAwaitingPayment = order.statut === "EN_ATTENTE_PAIEMENT";
    const isPaid = order.statut === "TERMINE" || order.statut === "PRET";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAwaitingPayment && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrder(order);
                  setShowPaymentModal(true);
                }}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Valider le paiement
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {(isPaid || isAwaitingPayment) && (
            <DropdownMenuItem
              onClick={() => handlePrintTicket(order)}
              className="text-blue-600"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer le ticket
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Paiements
          </h1>
          <p className="text-gray-600">
            Validez les paiements et imprimez les tickets
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Actualiser
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par numéro de commande, serveur..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Onglets de statut */}
      <Tabs value={selectedStatus} onValueChange={handleStatusChange}>
        <TabsList className="grid w-full grid-cols-2">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              {tab.label}
              {tab.count !== null && (
                <Badge variant="secondary" className="ml-auto">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tableau des commandes */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <SpinnerMedium />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Serveur</TableHead>
                    <TableHead>Mode de paiement</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order.numero}
                        {order.numeroTable && (
                          <div className="text-sm text-gray-500">
                            Table {order.numeroTable}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
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
                              {order.items.length > 2 && "..."}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentIcon(order.modePaiement || "")}
                          <span>
                            {formatPaymentMethodName(order.modePaiement)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total)} XOF
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge statut={order.statut} />
                      </TableCell>
                      <TableCell>
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
                      <TableCell className="text-center">
                        {renderOrderActions(order)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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

      {/* Modal de validation de paiement */}
      {showPaymentModal && selectedOrder && (
        <PaymentValidationModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onValidate={handleValidatePayment}
        />
      )}
    </div>
  );
};
