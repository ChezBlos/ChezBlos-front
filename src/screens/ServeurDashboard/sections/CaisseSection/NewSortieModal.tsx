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
import { FileImage, Upload } from "phosphor-react";

interface NewSortieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSortieCreated?: () => void;
}

export const NewSortieModal = ({
  isOpen,
  onClose,
  onSortieCreated,
}: NewSortieModalProps) => {
  const [formData, setFormData] = useState({
    montant: "",
    motif: "",
    beneficiaire: "",
    description: "",
    justificatif: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      justificatif: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ici, vous intégrerez l'API pour créer la sortie
      console.log("Création de sortie:", formData);

      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset du formulaire
      setFormData({
        montant: "",
        motif: "",
        beneficiaire: "",
        description: "",
        justificatif: null,
      });

      onSortieCreated?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la sortie:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Nouvelle sortie d'argent
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (XOF)</Label>
              <Input
                id="montant"
                type="number"
                placeholder="0"
                value={formData.montant}
                onChange={(e) => handleInputChange("montant", e.target.value)}
                required
              />
            </div>

            {/* Motif */}
            <div className="space-y-2">
              <Label htmlFor="motif">Motif</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.motif}
                onChange={(e) => handleInputChange("motif", e.target.value)}
                required
              >
                <option value="">Sélectionner un motif</option>
                <option value="achat_fournitures">Achat de fournitures</option>
                <option value="maintenance">Maintenance</option>
                <option value="transport">Transport</option>
                <option value="remboursement">Remboursement client</option>
                <option value="frais_divers">Frais divers</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Bénéficiaire */}
          <div className="space-y-2">
            <Label htmlFor="beneficiaire">Bénéficiaire</Label>
            <Input
              id="beneficiaire"
              placeholder="Nom du bénéficiaire ou fournisseur"
              value={formData.beneficiaire}
              onChange={(e) =>
                handleInputChange("beneficiaire", e.target.value)
              }
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              placeholder="Décrivez la raison de cette sortie d'argent..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Justificatif */}
          <div className="space-y-2">
            <Label htmlFor="justificatif">
              Justificatif (Reçu, Facture, etc.)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="justificatif"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm">
                <Upload size={16} className="mr-2" />
                Parcourir
              </Button>
            </div>
            {formData.justificatif && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileImage size={16} />
                <span>{formData.justificatif.name}</span>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.montant ||
                !formData.motif ||
                !formData.beneficiaire
              }
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer la sortie"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
