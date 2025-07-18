import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ReceiptComponent } from "./ReceiptComponent";
import { Order } from "../../types/order";
import { useAuth } from "../../contexts/AuthContext";
import { Printer, Eye, Calculator } from "lucide-react";

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmPrint: () => void;
  isLoading?: boolean;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmPrint,
  isLoading = false,
}) => {
  const [montantRecu, setMontantRecu] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Calculer la monnaie rendue
  const montantRecuNumber = parseFloat(montantRecu) || 0;
  const monnaiRendue = Math.max(
    0,
    montantRecuNumber - (order?.montantTotal || 0)
  );

  // Configuration de l'impression
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Reçu-${order?.numeroCommande || "commande"}`,
    onAfterPrint: () => {
      // Traitement après impression
      try {
        onConfirmPrint(); // Marquer la commande comme terminée
      } catch (error) {
        console.error("Erreur lors de la confirmation de l'impression:", error);
      }
      onClose(); // Fermer le modal
      resetForm();
    },
  });

  const resetForm = () => {
    setMontantRecu("");
    setShowPreview(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePreview = () => {
    if (!order) return;

    // Pour les commandes terminées, pré-remplir avec le montant total (déjà payé)
    if (order.statut === "TERMINE") {
      setMontantRecu(order.montantTotal.toString());
    }
    // Pour les paiements mobiles, pas besoin de montant reçu
    else if (
      order.modePaiement &&
      ["WAVE", "MTN_MONEY", "ORANGE_MONEY", "MOOV_MONEY"].includes(
        order.modePaiement.toUpperCase()
      )
    ) {
      setMontantRecu(order.montantTotal.toString());
    }

    setShowPreview(true);
  };

  const handleConfirmAndPrint = async () => {
    try {
      if (handlePrint) {
        await handlePrint();
      }
    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      // En cas d'erreur d'impression, on continue quand même le processus
      try {
        onConfirmPrint(); // Marquer la commande comme terminée
      } catch (confirmError) {
        console.error("Erreur lors de la confirmation:", confirmError);
      }
      onClose();
      resetForm();
    }
  };

  // Vérification des modes de paiement, en tenant compte des valeurs undefined/null
  const isEspeces = order?.modePaiement?.toUpperCase() === "ESPECES";
  const isMobileMoney =
    order?.modePaiement &&
    ["WAVE", "MTN_MONEY", "ORANGE_MONEY", "MOOV_MONEY"].includes(
      order.modePaiement.toUpperCase()
    );
  const isPaymentMethodDefined = !!order?.modePaiement;

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const formatPaymentMethod = (modePaiement: string | undefined): string => {
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

  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Impression du reçu
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informations de base */}
            <div className="bg-gray-5 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Commande:</span>
                <span>#{order.numeroCommande}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Table:</span>
                <span>N° {order.numeroTable}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">
                  {formatPrice(order.montantTotal)} XOF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Mode de paiement:</span>
                <span>{formatPaymentMethod(order.modePaiement)}</span>
              </div>
            </div>

            {/* Saisie du montant reçu pour les espèces - seulement si un mode de paiement est défini et c'est "espèces" */}
            {isPaymentMethodDefined && isEspeces && (
              <div className="space-y-2">
                <Label htmlFor="montantRecu">Montant reçu (XOF)</Label>
                <Input
                  id="montantRecu"
                  type="number"
                  placeholder="Saisir le montant reçu..."
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  min="0"
                  step="1"
                />
                {montantRecuNumber > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calculator className="h-4 w-4" />
                    <span>
                      Monnaie à rendre:{" "}
                      <span className="font-bold">
                        {formatPrice(monnaiRendue)} XOF
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Info pour mobile money - seulement si un mode de paiement est défini et c'est du mobile money */}
            {isPaymentMethodDefined && isMobileMoney && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <p>Paiement mobile confirmé - Montant exact reçu</p>
              </div>
            )}

            {/* Info pour commandes terminées */}
            {order.statut === "TERMINE" && (
              <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                <p>Commande déjà payée et terminée - Réimpression du reçu</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1"
                disabled={
                  isPaymentMethodDefined &&
                  isEspeces &&
                  order.statut !== "TERMINE" &&
                  (!montantRecu || montantRecuNumber < order.montantTotal)
                }
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>

              <Button onClick={handleClose} variant="outline">
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation */}
      <Dialog open={showPreview} onOpenChange={() => setShowPreview(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu du reçu
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Aperçu du reçu */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-5 max-h-96 overflow-y-auto">
              <ReceiptComponent
                ref={receiptRef}
                order={order}
                montantRecu={
                  montantRecuNumber > 0 ? montantRecuNumber : undefined
                }
                monnaiRendue={monnaiRendue > 0 ? monnaiRendue : undefined}
                nomCaissier={user?.prenom || user?.nom || "Caissier"}
              />
            </div>

            {/* Boutons de confirmation */}
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmAndPrint}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <Printer className="h-4 w-4 mr-2" />
                {isLoading ? "Impression..." : "Confirmer et imprimer"}
              </Button>

              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
                disabled={isLoading}
              >
                Retour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
