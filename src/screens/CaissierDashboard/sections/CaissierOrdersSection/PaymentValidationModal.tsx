import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";

interface OrderItem {
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
  items: OrderItem[];
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

interface PaymentValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CashierOrder;
  onValidate: (orderId: string, amount: number) => Promise<void>;
}

export const PaymentValidationModal: React.FC<PaymentValidationModalProps> = ({
  isOpen,
  onClose,
  order,
  onValidate,
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>(
    order.total.toString()
  );
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string>("");

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

  const handleAmountChange = (value: string) => {
    // Permettre uniquement les nombres
    const numericValue = value.replace(/[^0-9]/g, "");
    setPaymentAmount(numericValue);
    setError("");
  };

  const handleValidate = async () => {
    const amount = parseFloat(paymentAmount);

    // Validation du montant
    if (isNaN(amount) || amount <= 0) {
      setError("Veuillez saisir un montant valide");
      return;
    }

    if (amount !== order.total) {
      setError(
        `Le montant doit être exactement ${formatPrice(order.total)} XOF`
      );
      return;
    }

    try {
      setIsValidating(true);
      await onValidate(order._id, amount);
    } catch (error) {
      setError("Erreur lors de la validation du paiement");
    } finally {
      setIsValidating(false);
    }
  };

  const paymentAmountNumber = parseFloat(paymentAmount) || 0;
  const isAmountCorrect = paymentAmountNumber === order.total;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Validation du paiement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations de la commande */}
          <div className="bg-gray-5 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">N° Commande:</span>
              <Badge variant="outline">{order.numero}</Badge>
            </div>

            {order.numeroTable && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Table:</span>
                <span>{order.numeroTable}</span>
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

            <div className="flex justify-between items-center">
              <span className="font-medium">Mode de paiement:</span>
              <div className="flex items-center gap-2">
                {getPaymentIcon(order.modePaiement || "")}
                <span>{formatPaymentMethodName(order.modePaiement)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total à payer:</span>
              <span className="text-green-600">
                {formatPrice(order.total)} XOF
              </span>
            </div>
          </div>

          {/* Articles de la commande */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Articles commandés ({order.items.length})
            </Label>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {order.items.map((item: OrderItem, index: number) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>
                    {item.quantite}x {item.nom}
                  </span>
                  <span>{formatPrice(item.prix * item.quantite)} XOF</span>
                </div>
              ))}
            </div>
          </div>

          {/* Saisie du montant */}
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Montant reçu (XOF)</Label>
            <div className="relative">
              <Input
                id="payment-amount"
                type="text"
                value={paymentAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAmountChange(e.target.value)
                }
                placeholder="Saisir le montant reçu"
                className={
                  error
                    ? "border-red-500"
                    : isAmountCorrect
                    ? "border-green-500"
                    : ""
                }
              />
              {isAmountCorrect && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Informations de validation */}
          {paymentAmountNumber > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Montant reçu:</span>
                <span className="font-medium">
                  {formatPrice(paymentAmountNumber)} XOF
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Montant dû:</span>
                <span className="font-medium">
                  {formatPrice(order.total)} XOF
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-1 border-t border-blue-200 mt-2">
                <span>Différence:</span>
                <span
                  className={
                    paymentAmountNumber >= order.total
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {formatPrice(paymentAmountNumber - order.total)} XOF
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isValidating}>
            Annuler
          </Button>
          <Button
            onClick={handleValidate}
            disabled={!isAmountCorrect || isValidating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isValidating ? "Validation..." : "Valider le paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
