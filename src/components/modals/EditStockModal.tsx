import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Spinner } from "../ui/spinner";
import { PackageIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { logger } from "../../utils/logger";

interface StockFormData {
  nom: string;
  categorie: string;
  prixAchat: string;
  unite: string;
  seuilAlerte: string;
  quantiteStock: string;
  fournisseur: string;
  datePeremption: string;
}

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, formData: StockFormData) => Promise<void>;
  isLoading?: boolean;
  stockItem: any | null;
  categories: string[]; // Liste dynamique des catégories
}

const uniteOptions = [
  { id: "KG", label: "Kg" },
  { id: "LITRE", label: "Litre" },
  { id: "UNITE", label: "Unité" },
  { id: "GRAMME", label: "Gramme" },
];

const defaultCategorySuggestions = [
  "Viande",
  "Légume",
  "Fruit",
  "Boisson",
  "Épicerie",
  "Fromage",
  "Produit laitier",
  "Herbes & épices",
  "Féculent",
  "Poisson",
  "Fruit de mer",
  "Pain & Boulangerie",
  "Surgelé",
  "Condiment",
  "Autre",
];

const EditStockModal: React.FC<EditStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  stockItem,
  categories = [],
}) => {
  const [formData, setFormData] = useState<StockFormData>({
    nom: "",
    categorie: "",
    prixAchat: "",
    unite: "",
    seuilAlerte: "",
    quantiteStock: "",
    fournisseur: "",
    datePeremption: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen && stockItem) {
      setFormData({
        nom: stockItem.nom || "",
        categorie: stockItem.categorie || "",
        prixAchat: stockItem.prixAchat ? String(stockItem.prixAchat) : "",
        unite: stockItem.unite || "",
        seuilAlerte: stockItem.seuilAlerte ? String(stockItem.seuilAlerte) : "",
        quantiteStock: stockItem.quantiteStock
          ? String(stockItem.quantiteStock)
          : "",
        fournisseur: stockItem.fournisseur || "",
        datePeremption: stockItem.datePeremption
          ? stockItem.datePeremption.slice(0, 10)
          : "",
      });
      setErrors({});
    }
    if (!isOpen) {
      setFormData({
        nom: "",
        categorie: "",
        prixAchat: "",
        unite: "",
        seuilAlerte: "",
        quantiteStock: "",
        fournisseur: "",
        datePeremption: "",
      });
      setErrors({});
    }
  }, [isOpen, stockItem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.categorie) newErrors.categorie = "La catégorie est requise";
    if (!formData.prixAchat.trim())
      newErrors.prixAchat = "Le prix d'achat est requis";
    else if (
      isNaN(Number(formData.prixAchat)) ||
      Number(formData.prixAchat) < 0
    )
      newErrors.prixAchat = "Prix invalide";
    if (!formData.unite) newErrors.unite = "L'unité est requise";
    if (!formData.seuilAlerte.trim())
      newErrors.seuilAlerte = "Le seuil d'alerte est requis";
    else if (
      isNaN(Number(formData.seuilAlerte)) ||
      Number(formData.seuilAlerte) < 0
    )
      newErrors.seuilAlerte = "Seuil invalide";
    if (!formData.quantiteStock.trim())
      newErrors.quantiteStock = "La quantité est requise";
    else if (
      isNaN(Number(formData.quantiteStock)) ||
      Number(formData.quantiteStock) < 0
    )
      newErrors.quantiteStock = "Quantité invalide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !stockItem?._id) return;
    // Préparer l'objet à envoyer : caster les champs numériques, SANS quantiteStock
    const data: any = {
      nom: formData.nom.trim(),
      categorie: formData.categorie,
      unite: formData.unite,
      prixAchat: Number(formData.prixAchat),
      seuilAlerte: Number(formData.seuilAlerte),
    };
    if (formData.fournisseur && formData.fournisseur.trim() !== "") {
      data.fournisseur = formData.fournisseur.trim();
    }
    if (formData.datePeremption && formData.datePeremption.trim() !== "") {
      data.datePeremption = formData.datePeremption;
    }
    logger.debug("[EditStockModal] Données envoyées à onSubmit:", data);
    try {
      await onSubmit(stockItem._id, data);
      logger.debug("[EditStockModal] Modification réussie");
    } catch (err) {
      logger.error("[EditStockModal] Erreur lors de la modification:", err);
    }
  };

  const handleInputChange = (field: keyof StockFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[90vh] max-h-[90vh] gap-0 flex flex-col p-0 overflow-hidden bg-white border border-gray-200 shadow-xl">
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <DialogTitle className="flex text-3xl items-center gap-2">
            <PackageIcon className="h-6 w-6" />
            Modifier l'article du stock
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nom" className="text-sm font-medium">
                    Nom de l'article *
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    placeholder="Entrez le nom de l'article"
                    className={errors.nom ? "border-red-500" : ""}
                    maxLength={100}
                  />
                  {errors.nom && (
                    <p className="text-xs text-red-500 mt-1">{errors.nom}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.nom.length}/100 caractères
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Catégorie & Unité *
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Catégorie *
                  </Label>
                  <DropdownMenu
                    open={categoryDropdownOpen}
                    onOpenChange={setCategoryDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`relative w-full border rounded-lg px-4 py-2 pr-10 text-left appearance-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all bg-white shadow-sm ${
                          errors.categorie
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.categorie || "Sélectionner une catégorie"}
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="M6 8l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[300px] p-0"
                    >
                      <div className="p-2 border-b bg-white sticky top-0 z-10">
                        <Input
                          type="text"
                          placeholder="Rechercher ou filtrer..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto bg-white">
                        {/* Suggestions par défaut filtrées */}
                        {defaultCategorySuggestions
                          .filter((cat) =>
                            cat
                              .toLowerCase()
                              .includes(categorySearch.toLowerCase())
                          )
                          .map((cat) => (
                            <DropdownMenuItem
                              key={cat}
                              onSelect={() => {
                                handleInputChange("categorie", cat);
                                setCategoryDropdownOpen(false);
                              }}
                              className={
                                formData.categorie === cat
                                  ? "bg-orange-100 text-orange-700"
                                  : ""
                              }
                            >
                              {cat}
                            </DropdownMenuItem>
                          ))}
                        {/* Puis les catégories dynamiques non déjà dans la liste, filtrées */}
                        {categories
                          .filter(
                            (cat) =>
                              !defaultCategorySuggestions.includes(cat) &&
                              cat
                                .toLowerCase()
                                .includes(categorySearch.toLowerCase())
                          )
                          .map((cat) => (
                            <DropdownMenuItem
                              key={cat}
                              onSelect={() => {
                                handleInputChange("categorie", cat);
                                setCategoryDropdownOpen(false);
                              }}
                              className={
                                formData.categorie === cat
                                  ? "bg-orange-100 text-orange-700"
                                  : ""
                              }
                            >
                              {cat}
                            </DropdownMenuItem>
                          ))}
                        {/* Si aucune option */}
                        {defaultCategorySuggestions
                          .concat(
                            categories.filter(
                              (cat) => !defaultCategorySuggestions.includes(cat)
                            )
                          )
                          .filter((cat) =>
                            cat
                              .toLowerCase()
                              .includes(categorySearch.toLowerCase())
                          ).length === 0 && (
                          <div className="px-4 py-2 text-gray-400 text-sm">
                            Aucune catégorie trouvée
                          </div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.categorie && (
                    <p className="text-xs text-red-500 mt-2">
                      {errors.categorie}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Unité *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {uniteOptions.map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => handleInputChange("unite", u.id)}
                        className={`border-2 rounded-lg p-2 w-full transition-all duration-200 font-medium ${
                          formData.unite === u.id
                            ? "border-brand-primary-500 bg-brand-primary-50"
                            : "border-gray-200 hover:border-brand-primary-500"
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                  {errors.unite && (
                    <p className="text-xs text-red-500 mt-2">{errors.unite}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prixAchat" className="text-sm font-medium">
                      Prix d'achat (XOF) *
                    </Label>
                    <Input
                      id="prixAchat"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.prixAchat}
                      onChange={(e) =>
                        handleInputChange("prixAchat", e.target.value)
                      }
                      placeholder="0.00"
                      className={errors.prixAchat ? "border-red-500" : ""}
                    />
                    {errors.prixAchat && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.prixAchat}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="quantiteStock"
                      className="text-sm font-medium"
                    >
                      Quantité *
                    </Label>
                    <Input
                      id="quantiteStock"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantiteStock}
                      onChange={(e) =>
                        handleInputChange("quantiteStock", e.target.value)
                      }
                      placeholder="0"
                      className={errors.quantiteStock ? "border-red-500" : ""}
                    />
                    {errors.quantiteStock && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.quantiteStock}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="seuilAlerte"
                      className="text-sm font-medium"
                    >
                      Seuil d'alerte *
                    </Label>
                    <Input
                      id="seuilAlerte"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.seuilAlerte}
                      onChange={(e) =>
                        handleInputChange("seuilAlerte", e.target.value)
                      }
                      placeholder="0"
                      className={errors.seuilAlerte ? "border-red-500" : ""}
                    />
                    {errors.seuilAlerte && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.seuilAlerte}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="fournisseur"
                      className="text-sm font-medium"
                    >
                      Fournisseur
                    </Label>
                    <Input
                      id="fournisseur"
                      value={formData.fournisseur}
                      onChange={(e) =>
                        handleInputChange("fournisseur", e.target.value)
                      }
                      placeholder="Nom du fournisseur"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="datePeremption"
                      className="text-sm font-medium"
                    >
                      Date de péremption
                    </Label>
                    <Input
                      id="datePeremption"
                      type="date"
                      value={formData.datePeremption}
                      onChange={(e) =>
                        handleInputChange("datePeremption", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
        <DialogFooter className="flex-shrink-0 p-6 border-t border-gray-200">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 flex-1"
            >
              {isLoading ? (
                <>
                  <Spinner size="20" color="#ffffff" className="h-4 w-4 mr-2" />
                  Modification...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockModal;
