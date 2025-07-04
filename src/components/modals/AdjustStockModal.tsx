import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { StockItem, StockAdjustment } from "../../services/stockService";
import { useStockAdjustment } from "../../hooks/useStockAPI";
import { ButtonSpinner } from "../ui/spinner";
import { Minus, Plus, X } from "lucide-react";
import { formatUnite } from "../../utils/uniteUtils";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem: StockItem | null;
  onSuccess: () => void;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  stockItem,
  onSuccess,
}) => {
  // Initialiser avec la quantité actuelle du stock
  const [quantiteActuelle, setQuantiteActuelle] = useState<number>(
    stockItem?.quantiteStock || 0
  );

  // Calculer l'ajustement par rapport au stock initial
  const ajustement = stockItem ? quantiteActuelle - stockItem.quantiteStock : 0;
  const typeAjustement: "ENTREE" | "SORTIE" =
    ajustement >= 0 ? "ENTREE" : "SORTIE";
  // Mettre à jour la quantité quand le stockItem change
  useEffect(() => {
    if (stockItem) {
      setQuantiteActuelle(stockItem.quantiteStock);
    }
  }, [stockItem]);

  const { adjustStock, loading, error } = useStockAdjustment();
  const handleSubmit = async () => {
    if (!stockItem || ajustement === 0) return;

    const formData: StockAdjustment = {
      type: typeAjustement,
      quantite: Math.abs(ajustement),
      motif:
        typeAjustement === "ENTREE"
          ? `Entrée de stock (+${Math.abs(ajustement)})`
          : `Sortie de stock (-${Math.abs(ajustement)})`,
    };

    try {
      await adjustStock(stockItem._id, formData);
      onSuccess();
      onClose();
      setQuantiteActuelle(stockItem.quantiteStock);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    onClose();
    if (stockItem) {
      setQuantiteActuelle(stockItem.quantiteStock);
    }
  };

  const incrementQuantite = () => {
    setQuantiteActuelle((prev: number) => prev + 1);
  };
  const decrementQuantite = () => {
    setQuantiteActuelle((prev: number) => prev - 1);
  };

  if (!stockItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] gap-0 p-0 bg-white rounded-[32px]">
        {/* Header avec bouton de fermeture */}
        <DialogHeader className="relative p-6 border-b border-gray-200">
          {" "}
          <DialogTitle className="text-3xl font-bold text-gray-800">
            {ajustement >= 0 ? "Ajout de stock" : "Sortie de stock"}
          </DialogTitle>
          <div className="text-gray-600 text-sm m-0">{stockItem.nom}</div>{" "}
          <button
            onClick={handleClose}
            aria-label="Fermer le modal"
            className="absolute right-6 top-6 mt-0 p-3 hover:bg-gray-200 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </DialogHeader>

        {/* Contenu principal */}
        <div className="space-y-6 p-6 bg-gray-10">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Section Entrée */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-800">Entrée</h3>
            {/* Contrôles de quantité */}
            <div className="flex items-center p-6 border bg-white rounded-full justify-between space-x-8">
              {/* Bouton moins */}{" "}
              <button
                onClick={decrementQuantite}
                disabled={loading}
                aria-label="Diminuer la quantité"
                className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Minus className="h-4 w-4 text-white" />
              </button>
              {/* Quantité */}{" "}
              <div className="text-4xl font-bold text-gray-800 min-w-[80px] text-center">
                {quantiteActuelle.toString().padStart(2, "0")}
              </div>
              {/* Bouton plus */}{" "}
              <button
                onClick={incrementQuantite}
                disabled={loading}
                aria-label="Augmenter la quantité"
                className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
            </div>{" "}
            {/* Stock actuel et prévu */}
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">
                Stock actuel :{" "}
                <span className="font-medium">
                  {stockItem.quantiteStock} {formatUnite(stockItem.unite)}
                </span>
              </div>{" "}
              {ajustement !== 0 && (
                <div
                  className={`text-sm font-medium ${
                    quantiteActuelle >= stockItem.quantiteStock
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Nouveau stock : {quantiteActuelle}{" "}
                  {formatUnite(stockItem.unite)}
                  <span className="text-xs ml-1">
                    ({ajustement > 0 ? "+" : ""}
                    {ajustement})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Annuler
          </Button>{" "}
          <Button
            onClick={handleSubmit}
            disabled={loading || ajustement === 0}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <ButtonSpinner />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
