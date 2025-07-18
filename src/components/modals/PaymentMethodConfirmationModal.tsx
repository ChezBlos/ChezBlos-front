import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { CreditCard, CheckCircle, Edit3, AlertCircle } from "lucide-react";

interface PaymentMethodConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Type flexible pour accepter différents types de commandes
  onConfirm: (order: any, confirmedPaymentMethod: string) => void;
  onUpdatePaymentMethod: (
    orderId: string,
    newPaymentMethod: string
  ) => Promise<void>;
}

export const PaymentMethodConfirmationModal: React.FC<
  PaymentMethodConfirmationModalProps
> = ({ isOpen, onClose, order, onConfirm, onUpdatePaymentMethod }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    order.modePaiement || ""
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>("");

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // Fonction pour formater les noms des modes de paiement (identique à PaymentValidationModal)
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

  // Fonction pour obtenir l'icône de paiement (identique à PaymentValidationModal)
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

  // Modes de paiement disponibles
  const paymentMethods = [
    { id: "ESPECES", label: "Espèces" },
    { id: "CARTE_BANCAIRE", label: "Carte bancaire" },
    { id: "WAVE", label: "Wave" },
    { id: "MTN_MONEY", label: "MTN Money" },
    { id: "ORANGE_MONEY", label: "Orange Money" },
    { id: "MOOV_MONEY", label: "Moov Money" },
  ];

  const hasPaymentMethodChanged = selectedPaymentMethod !== order.modePaiement;

  const handleConfirm = async () => {
    try {
      setIsUpdating(true);
      setError("");

      // Si le mode de paiement a changé, on le met à jour d'abord
      if (hasPaymentMethodChanged) {
        await onUpdatePaymentMethod(order._id, selectedPaymentMethod);
      }

      // Ensuite on confirme pour passer à l'impression
      const updatedOrder = {
        ...order,
        modePaiement: selectedPaymentMethod,
      };

      onConfirm(updatedOrder, selectedPaymentMethod);
    } catch (error) {
      setError("Erreur lors de la mise à jour du mode de paiement");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedPaymentMethod(order.modePaiement || "");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-brand-primary-600" />
            Confirmation du mode de paiement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations de la commande */}
          <div className="bg-gray-5 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">N° Commande:</span>
              <Badge variant="outline">
                {order.numeroCommande || order.numero}
              </Badge>
            </div>

            {order.numeroTable && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Table:</span>
                <span>N° {order.numeroTable}</span>
              </div>
            )}

            {order.serveur && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Serveur:</span>
                <span>
                  {order.serveur.prenom} {order.serveur.nom}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-600">
                {formatPrice(order.montantTotal || order.total)} XOF
              </span>
            </div>
          </div>

          {/* Mode de paiement actuel */}
          <div className="bg-brand-primary-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-brand-primary-800">
              <span className="text-sm">Mode de paiement actuel:</span>
              <div className="flex items-center gap-2">
                {getPaymentIcon(order.modePaiement || "")}
                <span className="font-medium">
                  {formatPaymentMethodName(order.modePaiement || "")}
                </span>
              </div>
            </div>
          </div>

          {/* Sélection du mode de paiement avec le système de cards */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Sélectionnez le mode de paiement :
            </Label>

            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? "ring-2 ring-brand-primary-500 bg-brand-primary-50"
                      : "hover:bg-gray-5"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(method.id)}
                      <span className="font-medium text-sm">
                        {method.label}
                      </span>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="h-4 w-4 text-brand-primary-600 ml-auto" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Information sur la modification */}
          {hasPaymentMethodChanged && (
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 text-sm">
                <Edit3 className="h-4 w-4" />
                <span>
                  Le mode de paiement sera mis à jour vers:{" "}
                  <span className="font-medium">
                    {formatPaymentMethodName(selectedPaymentMethod)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUpdating}
            className="bg-brand-primary-600 hover:bg-brand-primary-700"
          >
            {isUpdating
              ? "Mise à jour..."
              : hasPaymentMethodChanged
              ? "Confirmer et mettre à jour"
              : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
