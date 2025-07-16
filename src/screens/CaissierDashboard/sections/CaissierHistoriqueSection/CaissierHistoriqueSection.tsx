import React, { useState, useEffect } from "react";
import { Order } from "../../../../types/order";
import { OrderService } from "../../../../services/orderService";
import { usePrintReceipt } from "../../../../hooks/usePrintReceipt";
import { PrintReceiptModal } from "../../../../components/modals/PrintReceiptModal";
import { logger } from "../../../../utils/logger";

export const CaissierHistoriqueSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    isPrintModalOpen,
    selectedOrderToPrint,
    isPrinting,
    openPrintModal,
    closePrintModal,
    handlePrintStart,
  } = usePrintReceipt();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les commandes terminées
      const allOrders = await OrderService.getOrders();
      const completedOrders = allOrders.filter(
        (order: Order) => order.statut === "TERMINE"
      );

      // Trier par date de modification décroissante
      completedOrders.sort(
        (a: Order, b: Order) =>
          new Date(b.dateModification || b.dateCreation).getTime() -
          new Date(a.dateModification || a.dateCreation).getTime()
      );

      setOrders(completedOrders);
    } catch (err) {
      logger.error("Erreur lors du chargement de l'historique:", err);
      setError("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePrintReceipt = (order: Order) => {
    openPrintModal(order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Historique des commandes
        </h2>
        <p className="text-gray-600">
          Consultez toutes les commandes terminées et réimprimez les reçus
        </p>
      </div>

      {orders.length === 0 ? (
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
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Commande #{order.numeroCommande}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.dateCreation).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm font-medium text-orange-600">
                    Total: {order.montantTotal}€
                  </p>
                </div>
                <button
                  onClick={() => handlePrintReceipt(order)}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Imprimer reçu
                </button>
              </div>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantite}x{" "}
                      {typeof item.menuItem === "object"
                        ? item.menuItem.nom
                        : "Article"}
                    </span>
                    <span>{item.prixUnitaire || 0}€</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'impression de reçu */}
      <PrintReceiptModal
        isOpen={isPrintModalOpen}
        onClose={closePrintModal}
        order={selectedOrderToPrint}
        isLoading={isPrinting}
        onConfirmPrint={handlePrintStart}
      />
    </div>
  );
};
