import { PlusIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { User, ListBullets, Users, Camera } from "@phosphor-icons/react";
import React, { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { Button } from "../../../../components/ui/button";
import { ButtonSpinner } from "../../../../components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { ChangeProfilePictureModal } from "../../../../components/modals/ChangeProfilePictureModal";
import { ProfileService } from "../../../../services/profileService";
import NewOrderModal from "../ServeurOrdersSection/NewOrderModal";
import { logger } from "../../../../utils/logger";

interface ServeurHeaderSectionProps {
  onOrdersRefresh?: () => void;
  onStatsRefresh?: () => void;
  selectedSection?: "commandes" | "historique";
  onSectionSelect?: (section: "commandes" | "historique") => void;
}

export const ServeurHeaderSection: React.FC<ServeurHeaderSectionProps> = ({
  onOrdersRefresh,
  onStatsRefresh,
  selectedSection,
  onSectionSelect,
}) => {
  const { user, logout } = useAuth();
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isChangePictureModalOpen, setIsChangePictureModalOpen] =
    useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  return (
    <header className="flex flex-col w-full items-start">
      {" "}
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
                {" "}
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "SERVEUR" ? "Serveur" : "Serveur"}
                    {user?.isCaissier && " • Caissier"}
                  </p>
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
                  className="text-red-600"
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Menu burger */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-lg hover:bg-gray-10"
                >
                  <MenuIcon className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                    selectedSection === "commandes"
                      ? "bg-orange-50 text-orange-600"
                      : ""
                  }`}
                  onClick={() => onSectionSelect?.("commandes")}
                >
                  <ListBullets size={20} />
                  <span>Commandes</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${
                    selectedSection === "historique"
                      ? "bg-orange-50 text-orange-600"
                      : ""
                  }`}
                  onClick={() => onSectionSelect?.("historique")}
                >
                  <Users size={20} />
                  <span>Historique</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>{" "}
        {/* Bottom part: Greeting only */}
        <div className="flex items-center justify-start px-4 py-4 border-b border-slate-200">
          <div className="flex flex-col items-start gap-1">
            <h1 className="font-gilroy font-bold text-[#181818] text-2xl">
              Bonjour {user?.prenom}
            </h1>
            <p className="font-title-t5-medium text-slate-400 text-sm">
              {formattedDate} - {formattedTime}
            </p>
          </div>
        </div>
      </div>{" "}
      {/* Desktop Header - visible only on desktop */}
      <div className="hidden lg:flex items-center justify-between px-3 md:px-6 lg:px-12 xl:px-20 py-6 w-full bg-white border-b border-slate-200">
        <div className="flex flex-col items-start gap-1">
          <h1 className="font-gilroy font-bold text-4xl text-[#181818] ">
            Bonjour {user?.prenom}
          </h1>
          <p className="font-title-t5-medium text-slate-400 text-[length:var(--title-t5-medium-font-size)] tracking-[var(--title-t5-medium-letter-spacing)] leading-[var(--title-t5-medium-line-height)]">
            {formattedDate} - {formattedTime}
          </p>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-4">
          {/* Bouton Ajouter une commande */}
          <Button
            onClick={() => setIsNewOrderModalOpen(true)}
            disabled={isRefreshing}
            className="bg-brand-primary-500 hover:bg-brand-primary-600 disabled:bg-brand-primary-300 text-white px-4 py-5 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200"
          >
            {isRefreshing ? (
              <>
                <ButtonSpinner />
                <span>Actualisation...</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-5 h-5" />
                <span>Ajouter une commande</span>
              </>
            )}
          </Button>{" "}
          {/* Avatar utilisateur avec menu déroulant */}{" "}
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
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === "SERVEUR" ? "Serveur" : "Serveur"}
                  {user?.isCaissier && " • Caissier"}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsChangePictureModalOpen(true)}
                className="cursor-pointer"
              >
                <Camera size={20} className="mr-2" />
                Changer de photo de profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOutIcon className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={async () => {
          setIsNewOrderModalOpen(false);
          // Actualiser les données après fermeture du modal
          if (onOrdersRefresh || onStatsRefresh) {
            setIsRefreshing(true);
            try {
              await Promise.all([onOrdersRefresh?.(), onStatsRefresh?.()]);
            } catch (error) {
              logger.error("Erreur lors du rafraîchissement:", error);
            } finally {
              setIsRefreshing(false);
            }
          }
        }}
      />
      {/* Change Profile Picture Modal */}
      <ChangeProfilePictureModal
        isOpen={isChangePictureModalOpen}
        onClose={() => setIsChangePictureModalOpen(false)}
      />
    </header>
  );
};
