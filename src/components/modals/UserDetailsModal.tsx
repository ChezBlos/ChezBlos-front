import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { UserAvatar } from "../UserAvatar";
import {
  Envelope,
  Phone,
  Shield,
  CallBellIcon,
  ChefHatIcon,
  ShieldIcon,
  CalendarBlank,
  Key,
  CheckCircle,
  XCircle,
  X,
} from "@phosphor-icons/react";
import { logger } from "../../utils/logger";

interface StaffUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER" | "CAISSIER";
  actif: boolean;
  photoProfil?: string;
  dateCreation: string;
  dateModification?: string;
  codeAcces?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffUser | null;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "ADMIN":
      return <ShieldIcon className="w-5 h-5" />;
    case "CUISINIER":
      return <ChefHatIcon className="w-5 h-5" />;
    case "SERVEUR":
      return <CallBellIcon className="w-5 h-5" />;
    case "CAISSIER":
      return <CallBellIcon className="w-5 h-5" />;
    default:
      return <Shield className="w-5 h-5" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Administrateur";
    case "CUISINIER":
      return "Cuisinier";
    case "SERVEUR":
      return "Serveur";
    case "CAISSIER":
      return "Caissier";
    default:
      return role;
  }
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    logger.error("Erreur lors du formatage de la date:", error);
    return "Date non disponible";
  }
};

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!user) return null;

  const fullName = `${user.prenom} ${user.nom}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Détails du personnel
            </DialogTitle>
            <DialogClose asChild>
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* En-tête avec avatar et infos principales */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <UserAvatar
                  photo={user.photoProfil}
                  nom={user.nom}
                  prenom={user.prenom}
                  size="lg"
                  className="w-16 h-16 text-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{fullName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleIcon(user.role)}
                    <span className="text-gray-600">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant={user.actif ? "default" : "destructive"}
                      className="flex items-center space-x-1"
                    >
                      {user.actif ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span>{user.actif ? "Actif" : "Inactif"}</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.email && (
                <div className="flex items-center space-x-3">
                  <Envelope className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
              )}
              {user.telephone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <div className="font-medium">{user.telephone}</div>
                  </div>
                </div>
              )}
              {!user.email && !user.telephone && (
                <div className="text-gray-500 italic">
                  Aucune information de contact disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.codeAcces && (
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Code d'accès</div>
                    <div className="font-mono font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                      {user.codeAcces}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <CalendarBlank className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Date de création</div>
                  <div className="font-medium">
                    {formatDate(user.dateCreation)}
                  </div>
                </div>
              </div>
              {user.dateModification && (
                <div className="flex items-center space-x-3">
                  <CalendarBlank className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">
                      Dernière modification
                    </div>
                    <div className="font-medium">
                      {formatDate(user.dateModification)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions et rôles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permissions et rôles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className="font-medium">Rôle principal</span>
                  </div>
                  <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CallBellIcon className="w-5 h-5" />
                    <span className="font-medium">Accès caisse</span>
                  </div>
                  <Badge
                    variant={user.role === "CAISSIER" ? "default" : "secondary"}
                  >
                    {user.role === "CAISSIER" ? "Autorisé" : "Non autorisé"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
