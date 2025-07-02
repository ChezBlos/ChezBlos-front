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
import { Switch } from "../ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Spinner } from "../ui/spinner";
import {
  Envelope,
  Phone,
  Shield,
  CallBellIcon,
  ChefHatIcon,
  ShieldIcon,
  PencilSimple,
} from "@phosphor-icons/react";
import { useUpdateUser } from "../../hooks/useUserAPI";
import { logger } from "../../utils/logger";

// Type pour le formulaire local
interface EditUserFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
}

interface StaffUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
  photoProfil?: string;
  dateCreation: string;
  dateModification?: string;
  codeAcces?: string;
}

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: StaffUser | null;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}) => {
  const [formData, setFormData] = useState<EditUserFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "SERVEUR",
    isCaissier: false,
    actif: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateUser, loading, error } = useUpdateUser();

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        role: user.role,
        isCaissier: user.isCaissier || false,
        actif: user.actif,
      });
      setErrors({});
    }
  }, [user, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        role: "SERVEUR",
        isCaissier: false,
        actif: true,
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom?.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom?.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
    }

    if (formData.telephone && formData.telephone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]+$/;
      if (!phoneRegex.test(formData.telephone)) {
        newErrors.telephone = "Format de téléphone invalide";
      }
    }

    if (!formData.role) {
      newErrors.role = "Le rôle est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !validateForm()) {
      return;
    }

    // Préparer les données pour l'envoi
    const submitData: any = {
      nom: formData.nom?.trim(),
      prenom: formData.prenom?.trim(),
      role: formData.role,
      isCaissier: formData.isCaissier,
      actif: formData.actif,
    };

    // Ajouter email seulement s'il est fourni et non vide
    if (formData.email && formData.email.trim()) {
      submitData.email = formData.email.trim();
    }

    // Ajouter téléphone seulement s'il est fourni et non vide
    if (formData.telephone && formData.telephone.trim()) {
      submitData.telephone = formData.telephone.trim();
    }

    logger.debug("Données à envoyer pour modification:", submitData);

    const result = await updateUser(user._id, submitData);

    if (result) {
      // Succès
      onSuccess?.();
      onClose();
    }
  };

  const handleInputChange = (field: keyof EditUserFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Si le rôle change vers CUISINIER, désactiver automatiquement l'accès caisse
      if (field === "role" && value === "CUISINIER") {
        newData.isCaissier = false;
      }

      return newData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[90vh] gap-0 flex flex-col p-0">
        {/* Header fixe */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <DialogTitle className="flex text-2xl items-center gap-2">
            <PencilSimple className="h-5 w-5" />
            Modifier {user.prenom} {user.nom}
          </DialogTitle>
        </DialogHeader>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="prenom" className="text-sm font-medium">
                      Prénom *
                    </Label>
                    <Input
                      id="prenom"
                      value={formData.prenom || ""}
                      onChange={(e) =>
                        handleInputChange("prenom", e.target.value)
                      }
                      placeholder="Entrez le prénom"
                      className={errors.prenom ? "border-red-500" : ""}
                    />
                    {errors.prenom && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.prenom}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nom" className="text-sm font-medium">
                      Nom *
                    </Label>
                    <Input
                      id="nom"
                      value={formData.nom || ""}
                      onChange={(e) => handleInputChange("nom", e.target.value)}
                      placeholder="Entrez le nom"
                      className={errors.nom ? "border-red-500" : ""}
                    />
                    {errors.nom && (
                      <p className="text-xs text-red-500 mt-1">{errors.nom}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    <Envelope className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="exemple@email.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telephone" className="text-sm font-medium">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    value={formData.telephone || ""}
                    onChange={(e) =>
                      handleInputChange("telephone", e.target.value)
                    }
                    placeholder="+33 1 23 45 67 89"
                    className={errors.telephone ? "border-red-500" : ""}
                  />
                  {errors.telephone && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paramètres du compte */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Paramètres du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Rôle *
                  </Label>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Option Serveur */}
                    <div
                      onClick={() => handleInputChange("role", "SERVEUR")}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.role === "SERVEUR"
                          ? "border-brand-primary-500 bg-brand-primary-50 shadow-sm"
                          : "border-gray-200 hover:border-brand-primary-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            formData.role === "SERVEUR"
                              ? "bg-brand-primary-500 text-brand-primary-50"
                              : "bg-gray-10 text-gray-600"
                          }`}
                        >
                          <CallBellIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Serveur</h4>
                          <p className="text-sm text-gray-500">
                            Service en salle, prise de commandes, accès caisse
                            possible
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.role === "SERVEUR"
                              ? "border-brand-primary-500 bg-brand-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.role === "SERVEUR" && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Option Cuisinier */}
                    <div
                      onClick={() => handleInputChange("role", "CUISINIER")}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.role === "CUISINIER"
                          ? "border-brand-primary-500 bg-brand-primary-50 shadow-sm"
                          : "border-gray-200 hover:border-brand-primary-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            formData.role === "CUISINIER"
                              ? "bg-brand-primary-500 text-brand-primary-50"
                              : "bg-gray-10 text-gray-600"
                          }`}
                        >
                          <ChefHatIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Cuisinier
                          </h4>
                          <p className="text-sm text-gray-500">
                            Préparation des commandes en cuisine, pas d'accès
                            caisse
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.role === "CUISINIER"
                              ? "border-brand-primary-500 bg-brand-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.role === "CUISINIER" && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Option Administrateur */}
                    <div
                      onClick={() =>
                        user.role === "ADMIN" &&
                        handleInputChange("role", "ADMIN")
                      }
                      className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                        user.role === "ADMIN"
                          ? formData.role === "ADMIN"
                            ? "border-brand-primary-500 bg-brand-primary-50 shadow-sm cursor-pointer hover:shadow-md"
                            : "border-gray-200 hover:border-brand-primary-500 cursor-pointer hover:shadow-md"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            formData.role === "ADMIN"
                              ? "bg-brand-primary-500 text-brand-primary-50"
                              : user.role === "ADMIN"
                              ? "bg-gray-10 text-gray-600"
                              : "bg-gray-10 text-gray-400"
                          }`}
                        >
                          <ShieldIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              user.role === "ADMIN"
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            Administrateur
                          </h4>
                          <p
                            className={`text-sm ${
                              user.role === "ADMIN"
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {user.role === "ADMIN"
                              ? "Gestion complète du système"
                              : "Gestion complète du système - Réservé aux admins existants"}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            formData.role === "ADMIN"
                              ? "border-brand-primary-500 bg-brand-primary-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.role === "ADMIN" && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {errors.role && (
                    <p className="text-xs text-red-500 mt-2">{errors.role}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="isCaissier"
                    className="text-sm flex items-center"
                  >
                    Accès caisse
                    {formData.role === "CUISINIER" && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Non disponible pour les cuisiniers)
                      </span>
                    )}
                  </Label>
                  <Switch
                    id="isCaissier"
                    checked={formData.isCaissier || false}
                    onCheckedChange={(checked: boolean) =>
                      handleInputChange("isCaissier", checked)
                    }
                    disabled={formData.role === "CUISINIER"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="actif" className="text-sm">
                    Compte actif
                  </Label>
                  <Switch
                    id="actif"
                    checked={formData.actif || false}
                    onCheckedChange={(checked: boolean) =>
                      handleInputChange("actif", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Erreur globale */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer fixe */}
        <DialogFooter className="flex-shrink-0 p-6 border-t border-gray-200">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 flex-1"
            >
              {loading ? (
                <>
                  <Spinner size="20" color="#ffffff" className="h-4 w-4 mr-2" />
                  Modification...
                </>
              ) : (
                "Sauvegarder les modifications"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
