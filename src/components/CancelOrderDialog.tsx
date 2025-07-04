import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { XCircle, AlertTriangle } from "lucide-react";

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber?: string;
  isLoading?: boolean;
}

const CANCEL_REASONS = [
  "Client absent lors de la livraison",
  "Problème de paiement",
  "Rupture de stock d'un ingrédient",
  "Demande spéciale du client",
  "Problème technique",
  "Autre",
];

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    setError("");
    if (value !== "Autre") {
      setCustomReason("");
    }
  };

  const handleCustomReasonChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    if (value.length <= 50) {
      setCustomReason(value);
      setError("");
    }
  };

  const handleConfirm = () => {
    if (!selectedReason) {
      setError("Veuillez sélectionner un motif d'annulation");
      return;
    }

    if (selectedReason === "Autre" && !customReason.trim()) {
      setError("Veuillez préciser le motif d'annulation");
      return;
    }

    const finalReason =
      selectedReason === "Autre" ? customReason.trim() : selectedReason;
    onConfirm(finalReason);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle size={24} />
            Annuler la commande
          </DialogTitle>
          {orderNumber && (
            <p className="text-sm text-gray-600">Commande #{orderNumber}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
            <p className="text-sm text-yellow-800">
              Cette action est irréversible. Veuillez indiquer le motif de
              l'annulation.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Motif d'annulation :</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={handleReasonChange}
              className=""
            >
              {CANCEL_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label
                    htmlFor={reason}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "Autre" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Précisez le motif :
              </Label>
              <Textarea
                id="custom-reason"
                placeholder="Décrivez le motif d'annulation..."
                value={customReason}
                onChange={handleCustomReasonChange}
                className="min-h-[80px] resize-none"
                maxLength={50}
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Maximum 50 caractères</span>
                <span>{customReason.length}/50</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            className="flex-1"
          >
            {isLoading ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
