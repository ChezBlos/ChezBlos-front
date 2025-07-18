import React, { useState, useMemo } from "react";
import { Order } from "../../../../types/order";
import { usePrintReceipt } from "../../../../hooks/usePrintReceipt";
import { PrintReceiptModal } from "../../../../components/modals/PrintReceiptModal";
import { OrderDetailsModal } from "../../../../components/modals/OrderDetailsModal";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { SearchIcon, RefreshCw } from "lucide-react";
import { SummaryCard } from "../../../../components/ui/SummaryCard";
import { useOrders } from "../../../../hooks/useOrderAPI";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

export const CaissierHistoriqueSection: React.FC<{
  onRefresh?: () => Promise<void>;
}> = ({ onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    return filtered;
  }, [completedOrders, searchTerm]);

  // Statistiques summary cards
  const stats = useMemo(() => {
    if (!completedOrders.length)
      return {
        totalCommandes: 0,
        montantTotal: 0,
        moyenneCommande: 0,
      };

    const totalCommandes = completedOrders.length;
    const montantTotal = completedOrders.reduce(
      (total, o) => total + (o.montantTotal || 0),
      0
    );
    const moyenneCommande = montantTotal / totalCommandes;

    return {
      totalCommandes,
      montantTotal,
      moyenneCommande,
    };
  }, [completedOrders]);

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
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'historique...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col w-full mb-10 px-3 md:px-6 lg:px-12 gap-4 md:gap-6">
      {/* Summary Cards */}
      <div className="mt-4 md:mt-6 lg:mt-8 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0 overflow-x-auto pb-2">
        <SummaryCard
          title="Total commandes"
          value={stats.totalCommandes.toString()}
          subtitle="Commandes traitées"
          subtitleColor="text-orange-500"
        />
        <SummaryCard
          title="Chiffre d'affaires"
          value={formatPrice(stats.montantTotal)}
          currency="XOF"
          subtitle="Recettes validées"
          subtitleColor="text-green-500"
        />
        <SummaryCard
          title="Panier moyen"
          value={formatPrice(stats.moyenneCommande)}
          currency="XOF"
          subtitle="Par commande"
          subtitleColor="text-blue-500"
        />
      </div>

      <div className="shadow-md bg-white rounded-3xl overflow-hidden">
        {/* En-tête avec titre et recherche */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Historique des commandes
            </h2>
            <p className="text-gray-600">
              Consultez toutes les commandes terminées et réimprimez les reçus
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
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par numéro de commande, plat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="p-4">
          <Card>
            <CardContent className="p-0">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune commande dans l'historique
                  </h3>
                  <p className="text-gray-600">
                    Les commandes terminées apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Commande</TableHead>
                        <TableHead>Articles</TableHead>
                        <TableHead>Mode de paiement</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">
                            {order.numeroCommande || order._id}
                            {order.numeroTable && (
                              <div className="text-sm text-gray-500">
                                Table {order.numeroTable}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.items.length} article(s)
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
                          <TableCell>
                            {order.modePaiement
                              ? formatPaymentMethodName(order.modePaiement)
                              : "Non défini"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(order.montantTotal || 0)} XOF
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
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                Détails
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600"
                                onClick={() => handlePrintReceipt(order)}
                              >
                                Imprimer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
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
