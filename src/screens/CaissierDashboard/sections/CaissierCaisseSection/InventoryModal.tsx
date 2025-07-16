import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import { Check, X, Package, Money } from "phosphor-react";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInventoryCompleted?: () => void;
}

interface InventoryItem {
  id: string;
  nom: string;
  stockTheorique: number;
  stockPhysique: number;
  unite: string;
  status?: "ok" | "ecart" | "pending";
}

export const InventoryModal = ({
  isOpen,
  onClose,
  onInventoryCompleted,
}: InventoryModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"stock" | "caisse">("stock");
  const [observations, setObservations] = useState("");
  const [espècesComptees, setEspècesComptées] = useState("");

  // Mock data pour l'inventaire
  const [stockItems, setStockItems] = useState<InventoryItem[]>([
    {
      id: "1",
      nom: "Riz",
      stockTheorique: 50,
      stockPhysique: 0,
      unite: "kg",
      status: "pending",
    },
    {
      id: "2",
      nom: "Poulet",
      stockTheorique: 20,
      stockPhysique: 0,
      unite: "kg",
      status: "pending",
    },
    {
      id: "3",
      nom: "Tomates",
      stockTheorique: 15,
      stockPhysique: 0,
      unite: "kg",
      status: "pending",
    },
    {
      id: "4",
      nom: "Coca Cola",
      stockTheorique: 48,
      stockPhysique: 0,
      unite: "unités",
      status: "pending",
    },
  ]);

  const handleStockPhysiqueChange = (itemId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const status = numValue === item.stockTheorique ? "ok" : "ecart";
          return { ...item, stockPhysique: numValue, status };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Ici, vous intégrerez l'API pour sauvegarder l'inventaire
      const inventoryData = {
        stock: stockItems,
        espècesComptees: parseFloat(espècesComptees) || 0,
        observations,
        dateInventaire: new Date().toISOString(),
      };

      console.log("Sauvegarde de l'inventaire:", inventoryData);

      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onInventoryCompleted?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'inventaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalEcarts = () => {
    return stockItems.filter((item) => item.status === "ecart").length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Inventaire journalier - {new Date().toLocaleDateString("fr-FR")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Navigation entre les étapes */}
          <div className="flex gap-4 border-b">
            <Button
              variant={currentStep === "stock" ? "default" : "ghost"}
              onClick={() => setCurrentStep("stock")}
              className="relative"
            >
              <Package size={16} className="mr-2" />
              Inventaire Stock
              {getTotalEcarts() > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {getTotalEcarts()}
                </Badge>
              )}
            </Button>
            <Button
              variant={currentStep === "caisse" ? "default" : "ghost"}
              onClick={() => setCurrentStep("caisse")}
            >
              <Money size={16} className="mr-2" />
              Comptage Caisse
            </Button>
          </div>

          {/* Étape Stock */}
          {currentStep === "stock" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Instructions
                </h3>
                <p className="text-blue-800 text-sm">
                  Comptez physiquement chaque article et saisissez la quantité
                  réelle. Les écarts seront automatiquement calculés.
                </p>
              </div>

              <div className="grid gap-4">
                {stockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.nom}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Stock théorique: {item.stockTheorique} {item.unite}
                      </p>
                    </div>

                    <div className="w-32">
                      <Label htmlFor={`stock-${item.id}`} className="text-sm">
                        Stock physique
                      </Label>
                      <Input
                        id={`stock-${item.id}`}
                        type="number"
                        placeholder="0"
                        value={item.stockPhysique || ""}
                        onChange={(e) =>
                          handleStockPhysiqueChange(item.id, e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="w-20 text-center">
                      {item.status === "ok" && (
                        <Badge className="bg-green-100 text-green-700">
                          <Check size={12} className="mr-1" />
                          OK
                        </Badge>
                      )}
                      {item.status === "ecart" && (
                        <Badge className="bg-red-100 text-red-700">
                          <X size={12} className="mr-1" />
                          Écart
                        </Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge variant="outline" className="text-gray-500">
                          En attente
                        </Badge>
                      )}
                    </div>

                    {item.status === "ecart" && (
                      <div className="text-sm text-red-600 font-medium">
                        {item.stockPhysique > item.stockTheorique ? "+" : ""}
                        {item.stockPhysique - item.stockTheorique} {item.unite}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Étape Caisse */}
          {currentStep === "caisse" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  Comptage de la caisse
                </h3>
                <p className="text-green-800 text-sm">
                  Comptez toutes les espèces présentes dans la caisse et
                  saisissez le montant total.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="especes">
                    Montant total des espèces comptées (XOF)
                  </Label>
                  <Input
                    id="especes"
                    type="number"
                    placeholder="0"
                    value={espècesComptees}
                    onChange={(e) => setEspècesComptées(e.target.value)}
                    className="mt-2 text-lg font-medium"
                  />
                </div>

                <div>
                  <Label htmlFor="observations">Observations (optionnel)</Label>
                  <Textarea
                    id="observations"
                    placeholder="Notez ici toute observation particulière concernant l'inventaire..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>

            {currentStep === "stock" && (
              <Button
                onClick={() => setCurrentStep("caisse")}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                disabled={stockItems.some((item) => item.status === "pending")}
              >
                Étape suivante: Comptage caisse
              </Button>
            )}

            {currentStep === "caisse" && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !espècesComptees}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? "Finalisation..." : "Finaliser l'inventaire"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
