import { LogOutIcon, MenuIcon } from "lucide-react";
import { User, ListBullets, Package, Camera } from "@phosphor-icons/react";
import React, { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { ChangeProfilePictureModal } from "../../../../components/modals/ChangeProfilePictureModal";
import { ProfileService } from "../../../../services/profileService";

interface CuisinierHeaderSectionProps {
  onOrdersRefresh?: () => void;
  onStatsRefresh?: () => void;
  selectedSection?: "commandes" | "stock";
  onSectionSelect?: (section: "commandes" | "stock") => void;
}

export const CuisinierHeaderSection: React.FC<CuisinierHeaderSectionProps> = ({
  // onOrdersRefresh,
  // onStatsRefresh,
  selectedSection,
  onSectionSelect,
}) => {
  const { user, logout } = useAuth();
  const [isChangePictureModalOpen, setIsChangePictureModalOpen] =
    useState(false);
  const [profilePictureKey, setProfilePictureKey] = useState(Date.now()); // Pour forcer le rechargement de l'image

  // Fonction pour rafraîchir l'image de profil
  const handleProfileUpdated = () => {
    setProfilePictureKey(Date.now()); // Change la clé pour forcer le rechargement
  };
  // const [isRefreshing, setIsRefreshing] = useState(false);

  // Données pour l'en-tête
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLogout = () => {
    logout();
  };

  // const handleRefresh = async () => {
  //   setIsRefreshing(true);
  //   try {
  //     if (onOrdersRefresh) await onOrdersRefresh();
  //     if (onStatsRefresh) await onStatsRefresh();
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  return (
    <header className="flex flex-col w-full items-start">
      {/* Mobile Header - visible only on mobile/tablet */}
      <div className="lg:hidden w-full bg-white">
        {/* Top part: Logo + Avatar + Menu burger */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <img src="/img/logo.png" alt="Logo" className="h-8" />

          <div className="flex items-center gap-3">
            {" "}
            {/* Mobile user avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative w-10 h-10 cursor-pointer">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors overflow-hidden">
                    {user?.photoProfil ? (
                      <img
                        src={ProfileService.getProfilePictureUrl(
                          user.photoProfil
                        )}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-600" />
                    )}
                  </div>
                  <div className="absolute w-3 h-3 -bottom-0.5 -right-0.5 bg-success-50 rounded-full border-2 border-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">Cuisinier</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsChangePictureModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Camera size={16} />
                  Changer la photo de profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600"
                >
                  <LogOutIcon size={16} />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile Menu Burger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <MenuIcon className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem
                  onClick={() => onSectionSelect?.("commandes")}
                  className={`flex items-center gap-2 ${
                    selectedSection === "commandes" ? "bg-gray-10" : "bg-white"
                  }`}
                >
                  <ListBullets size={16} />
                  Commandes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSectionSelect?.("stock")}
                  className={`flex items-center gap-2 ${
                    selectedSection === "stock" ? "bg-gray-10" : "bg-white"
                  }`}
                >
                  <Package size={16} />
                  Gestion des stocks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between w-full bg-white px-6 lg:px-12 xl:px-20 py-6 border-b border-slate-100">
        {/* Left: Date and greeting */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {user?.role
              ? user.role.charAt(0).toUpperCase() +
                user.role.slice(1).toLowerCase()
              : "Utilisateur"}{" "}
            {user?.prenom}
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            {formattedDate} • {formattedTime}
          </p>
        </div>

        {/* Right: User avatar and actions */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative w-12 h-12 cursor-pointer">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors overflow-hidden">
                  {user?.photoProfil ? (
                    <img
                      src={ProfileService.getProfilePictureUrl(
                        user.photoProfil
                      )}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-gray-600" />
                  )}
                </div>
                <div className="absolute w-4 h-4 -bottom-0.5 -right-0.5 bg-success-50 rounded-full border-2 border-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <div className="px-4 py-3">
                <p className="text-base font-medium">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-muted-foreground">Cuisinier</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsChangePictureModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Camera size={18} />
                Changer la photo de profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600"
              >
                <LogOutIcon size={18} />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>{" "}
      {/* Modal pour changer la photo de profil */}
      <ChangeProfilePictureModal
        isOpen={isChangePictureModalOpen}
        onClose={() => setIsChangePictureModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </header>
  );
};
