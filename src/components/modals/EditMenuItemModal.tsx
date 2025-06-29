import React, { useState } from "react";
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
import { Switch } from "../ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Spinner } from "../ui/spinner";
import {
  ForkKnife,
  Image as ImageIcon,
  CurrencyCircleDollar,
  FileText,
  Tag,
} from "@phosphor-icons/react";
import { MenuItemResponse } from "../../types/menu";

interface MenuItemFormData {
  nom: string;
  description: string;
  prix: string;
  categorie: string;
  disponible: boolean;
  image: File | null;
}

interface EditMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, formData: FormData) => Promise<void>;
  isLoading?: boolean;
  menuItem: MenuItemResponse | null;
}

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  menuItem,
}) => {
  const [formData, setFormData] = useState<MenuItemFormData>({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    disponible: true,
    image: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with menu item data
  React.useEffect(() => {
    if (isOpen && menuItem) {
      setFormData({
        nom: menuItem.nom || "",
        description: menuItem.description || "",
        prix: menuItem.prix?.toString() || "",
        categorie: menuItem.categorie || "",
        disponible: menuItem.disponible ?? true,
        image: null,
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        nom: "",
        description: "",
        prix: "",
        categorie: "",
        disponible: true,
        image: null,
      });
      setErrors({});
    }
  }, [isOpen, menuItem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom du plat est requis";
    } else if (formData.nom.trim().length > 100) {
      newErrors.nom = "Le nom ne peut pas dépasser 100 caractères";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (formData.description.trim().length > 500) {
      newErrors.description =
        "La description ne peut pas dépasser 500 caractères";
    }

    if (!formData.prix.trim()) {
      newErrors.prix = "Le prix est requis";
    } else {
      const prix = parseFloat(formData.prix);
      if (isNaN(prix) || prix < 0) {
        newErrors.prix = "Le prix doit être un nombre positif";
      }
    }

    if (!formData.categorie) {
      newErrors.categorie = "La catégorie est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !menuItem) {
      return;
    }

    // Préparer FormData pour l'envoi
    const submitFormData = new FormData();
    submitFormData.append("nom", formData.nom.trim());
    submitFormData.append("description", formData.description.trim());
    submitFormData.append("prix", formData.prix.trim());
    submitFormData.append("categorie", formData.categorie);
    submitFormData.append("disponible", formData.disponible.toString());

    if (formData.image) {
      submitFormData.append("image", formData.image);
    }

    await onSubmit(menuItem._id, submitFormData);
  };

  const handleInputChange = (field: keyof MenuItemFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const categories = [
    {
      id: "PLAT_PRINCIPAL",
      label: "Plat principal",
      description: "Plats principaux, viandes, poissons",
      icon: "🍽️",
    },
    {
      id: "ENTREE",
      label: "Entrée",
      description: "Entrées, salades, amuse-bouches",
      icon: "🥗",
    },
    {
      id: "DESSERT",
      label: "Dessert",
      description: "Desserts, pâtisseries, fruits",
      icon: "🍰",
    },
    {
      id: "BOISSON",
      label: "Boisson",
      description: "Boissons chaudes, froides, alcoolisées",
      icon: "🥤",
    },
    {
      id: "ACCOMPAGNEMENT",
      label: "Accompagnement",
      description: "Garnitures, sauces, suppléments",
      icon: "🍟",
    },
  ];

  if (!menuItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[90vh] max-h-[90vh] gap-0 flex flex-col p-0 overflow-hidden bg-white border border-gray-200 shadow-xl">
        {/* Header fixe */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <DialogTitle className="flex text-2xl items-center gap-2">
            <ForkKnife className="h-5 w-5" />
            Modifier "{menuItem.nom}"
          </DialogTitle>
        </DialogHeader>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image actuelle */}
            {menuItem.imageUrl && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    Image actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img
                      src={menuItem.imageUrl}
                      alt={menuItem.nom}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div>
                      <p className="text-sm text-gray-600">
                        Image actuelle du plat
                      </p>
                      <p className="text-xs text-gray-500">
                        Vous pouvez sélectionner une nouvelle image ci-dessous
                        pour la remplacer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations générales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nom" className="text-sm font-medium">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Nom du plat *
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    placeholder="Entrez le nom du plat"
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

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Décrivez le plat, ses ingrédients, sa préparation..."
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 resize-none ${
                      errors.description ? "border-red-500" : ""
                    }`}
                    rows={4}
                    maxLength={500}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 caractères
                  </p>
                </div>

                <div>
                  <Label htmlFor="prix" className="text-sm font-medium">
                    <CurrencyCircleDollar className="h-4 w-4 inline mr-1" />
                    Prix (XOF) *
                  </Label>
                  <Input
                    id="prix"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prix}
                    onChange={(e) => handleInputChange("prix", e.target.value)}
                    placeholder="0.00"
                    className={errors.prix ? "border-red-500" : ""}
                  />
                  {errors.prix && (
                    <p className="text-xs text-red-500 mt-1">{errors.prix}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Catégorie */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Catégorie *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() =>
                        handleInputChange("categorie", category.id)
                      }
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.categorie === category.id
                          ? "border-brand-primary-500 bg-brand-primary-50 shadow-sm"
                          : "border-gray-200 hover:border-brand-primary-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full text-2xl ${
                            formData.categorie === category.id
                              ? "bg-brand-primary-500 text-brand-primary-50"
                              : "bg-gray-10"
                          }`}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {category.label}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.categorie === category.id
                              ? "border-brand-primary-500 bg-brand-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.categorie === category.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.categorie && (
                  <p className="text-xs text-red-500 mt-2">
                    {errors.categorie}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Image et paramètres */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Nouvelle image et paramètres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {" "}
                <div>
                  <Label
                    htmlFor="image"
                    className="text-sm font-medium mb-3 block"
                  >
                    <ImageIcon className="h-4 w-4 inline mr-1" />
                    Nouvelle image (optionnel)
                  </Label>

                  {/* Zone de drop moderne */}
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleInputChange("image", e.target.files?.[0] || null)
                      }
                      className="absolute  inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 hover:border-brand-primary-500 hover:bg-brand-primary-50 ${
                        formData.image
                          ? "border-green-500 bg-green-50"
                          : "border-brand-primary-300 bg-brand-primary-50"
                      }`}
                    >
                      {formData.image ? (
                        <div className="space-y-3">
                          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800">
                              {formData.image.name}
                            </p>
                            <p className="text-sm text-green-600">
                              {(formData.image.size / 1024 / 1024).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInputChange("image", null);
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 mx-auto bg-brand-primary-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-brand-primary-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              Cliquez pour changer l'image
                            </p>
                            <p className="text-sm text-gray-500">
                              ou glissez-déposez votre nouveau fichier ici
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="inline-flex items-center px-3 py-1.5 bg-brand-primary-100 text-brand-primary-700 rounded-full text-xs font-medium">
                              JPG, PNG, WEBP (max 5MB)
                            </div>
                            <p className="text-xs text-gray-500">
                              Laissez vide pour conserver l'image actuelle
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="disponible" className="text-sm">
                    Article disponible à la vente
                  </Label>
                  <Switch
                    id="disponible"
                    checked={formData.disponible}
                    onCheckedChange={(checked: boolean) =>
                      handleInputChange("disponible", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Footer fixe */}
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
                "Modifier l'article"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
