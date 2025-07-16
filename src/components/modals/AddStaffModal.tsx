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
  Envelope,
  Phone,
  Shield,
  CallBellIcon,
  ChefHatIcon,
  ShieldIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useCreateUser } from "../../hooks/useUserAPI";
import type { CreateUserRequest } from "../../services/userService";
import { logger } from "../../utils/logger";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "SERVEUR",
    actif: true,
    motDePasse: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createUser, loading, error } = useCreateUser();

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        role: "SERVEUR",
        actif: true,
        motDePasse: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
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

    if (!validateForm()) {
      return;
    } // Préparer les données pour l'envoi
    const submitData: CreateUserRequest = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      role: formData.role,
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

    // Ajouter mot de passe seulement s'il est fourni et non vide
    if (formData.motDePasse && formData.motDePasse.trim()) {
      submitData.motDePasse = formData.motDePasse.trim();
    }

    logger.debug("Données à envoyer:", submitData);

    const result = await createUser(submitData);

    if (result) {
      // Succès
      onSuccess?.();
      onClose();
    }
  };
  const handleInputChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[90vh] gap-0 flex flex-col p-0">
        {/* Header fixe */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <DialogTitle className="flex text-2xl items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Ajouter un membre du staff
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
                {/* ...existing form content... */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="prenom" className="text-sm font-medium">
                      Prénom *
                    </Label>
                    <Input
                      id="prenom"
                      value={formData.prenom}
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
                      value={formData.nom}
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
                    value={formData.email}
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
                    value={formData.telephone}
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
                {/* ...existing role selection... */}
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

                    {/* Option Administrateur (désactivée) */}
                    <div className="border-2 border-gray-200 rounded-lg p-4 opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gray-10 text-gray-400">
                          <ShieldIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-500">
                            Administrateur
                          </h4>
                          <p className="text-sm text-gray-400">
                            Gestion complète du système - Un admin existe déjà
                          </p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                      </div>
                    </div>
                  </div>

                  {errors.role && (
                    <p className="text-xs text-red-500 mt-2">{errors.role}</p>
                  )}
                </div>

                {/* ...existing switches and password field... */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="actif" className="text-sm">
                    Compte actif
                  </Label>
                  <Switch
                    id="actif"
                    checked={formData.actif}
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
              {" "}
              {loading ? (
                <>
                  <Spinner size="20" color="#ffffff" className="h-4 w-4 mr-2" />
                  Création...
                </>
              ) : (
                "Créer le compte"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
