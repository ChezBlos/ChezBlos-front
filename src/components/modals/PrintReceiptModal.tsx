import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ReceiptComponent } from "./ReceiptComponent";
import { Order } from "../../types/order";
import { useAuth } from "../../contexts/AuthContext";
import { Printer, Eye, Calculator, Edit3 } from "lucide-react";

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
  const [allowManualEdit, setAllowManualEdit] = useState<boolean>(false);
  const { user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);

  // Effet pour pré-remplir le montant automatiquement pour les paiements mobiles
  React.useEffect(() => {
    if (order && isOpen) {
      const isMobilePayment =
        order.modePaiement &&
        ["WAVE", "MTN_MONEY", "ORANGE_MONEY", "MOOV_MONEY"].includes(
          order.modePaiement.toUpperCase()
        );

      // Pré-remplir automatiquement pour les paiements mobiles et commandes terminées
      if ((isMobilePayment && !allowManualEdit) || order.statut === "TERMINE") {
        setMontantRecu(order.montantTotal.toString());
      }
    }
  }, [order, isOpen, allowManualEdit]);

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
    setAllowManualEdit(false);
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
    // Pour les nouveaux paiements, pré-remplir automatiquement sauf si l'édition manuelle est activée
    else if (!allowManualEdit) {
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

            {/* Saisie du montant reçu - pour tous les modes de paiement définis */}
            {isPaymentMethodDefined && (
              <div className="space-y-3">
                {/* Option pour activer l'édition manuelle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="montantRecu">
                    Montant reçu (XOF)
                    {!isEspeces && (
                      <span className="text-sm text-gray-500 ml-2">
                        - Paiement {formatPaymentMethod(order.modePaiement)}
                      </span>
                    )}
                  </Label>
                  {!isEspeces && order.statut !== "TERMINE" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAllowManualEdit(!allowManualEdit);
                        if (!allowManualEdit) {
                          // Si on active l'édition manuelle, vider le champ
                          setMontantRecu("");
                        } else {
                          // Si on désactive, pré-remplir avec le total
                          setMontantRecu(order.montantTotal.toString());
                        }
                      }}
                      className={`text-xs px-2 py-1 h-auto ${
                        allowManualEdit
                          ? "text-orange-600 bg-orange-50"
                          : "text-blue-600 bg-blue-50"
                      }`}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      {allowManualEdit ? "Montant exact" : "Modifier"}
                    </Button>
                  )}
                </div>

                <Input
                  id="montantRecu"
                  type="number"
                  placeholder={
                    allowManualEdit || isEspeces
                      ? "Saisir le montant reçu..."
                      : `Montant automatique: ${formatPrice(
                          order.montantTotal
                        )} XOF`
                  }
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  disabled={
                    !allowManualEdit && !isEspeces && order.statut !== "TERMINE"
                  }
                  min="0"
                  step="1"
                />
                {montantRecuNumber > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calculator className="h-4 w-4" />
                    <span>
                      {monnaiRendue > 0
                        ? "Monnaie à rendre"
                        : monnaiRendue < 0
                        ? "Montant manquant"
                        : "Montant exact"}
                      :{" "}
                      <span
                        className={`font-bold ${
                          monnaiRendue > 0
                            ? "text-green-600"
                            : monnaiRendue < 0
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {formatPrice(Math.abs(monnaiRendue))} XOF
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Info contextuelle selon le mode de paiement */}
            {/* {isPaymentMethodDefined && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  isMobileMoney
                    ? "bg-blue-50 text-blue-800"
                    : isEspeces
                    ? "bg-yellow-50 text-yellow-800"
                    : "bg-gray-50 text-gray-800"
                }`}
              >
                {isMobileMoney ? (
                  allowManualEdit ? (
                    <p>
                      ✏️ Mode édition activé : Saisissez le montant exact reçu
                      via {formatPaymentMethod(order.modePaiement)}
                    </p>
                  ) : (
                    <p>
                      💡 Montant total pré-rempli. Cliquez sur "Modifier" pour
                      un paiement partiel
                    </p>
                  )
                ) : isEspeces ? (
                  <p>
                    💰 Saisissez le montant en espèces reçu pour calculer la
                    monnaie
                  </p>
                ) : (
                  <p>
                    💳 Saisissez le montant reçu via{" "}
                    {formatPaymentMethod(order.modePaiement)}
                  </p>
                )}
              </div>
            )} */}

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
                  order.statut !== "TERMINE" &&
                  // Pour les espèces : montant requis
                  ((isEspeces && !montantRecu) ||
                    // Pour mobile money en mode édition manuelle : montant requis
                    (isMobileMoney && allowManualEdit && !montantRecu) ||
                    // Pour mobile money en mode automatique : toujours activé (montant pré-rempli)
                    false)
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
