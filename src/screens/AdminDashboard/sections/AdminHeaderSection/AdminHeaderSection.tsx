import { LogOutIcon, MenuIcon } from "lucide-react";
import {
  Users,
  ForkKnife,
  ChartBar,
  Package,
  Camera,
  Receipt,
  Gear,
} from "@phosphor-icons/react";
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
import { UserAvatar } from "../../../../components/UserAvatar";
import { House } from "phosphor-react";

interface AdminHeaderSectionProps {
  onRefresh?: () => void;
  selectedSection?:
    | "home"
    | "staff"
    | "menu"
    | "historique"
    | "stock"
    | "statistiques"
    | "settings"
    | "caisse";
  onSectionSelect?: (
    section:
      | "home"
      | "staff"
      | "menu"
      | "historique"
      | "stock"
      | "statistiques"
      | "settings"
      | "caisse"
  ) => void;
}

export const AdminHeaderSection: React.FC<AdminHeaderSectionProps> = ({
  selectedSection = "dashboard",
  onSectionSelect,
}) => {
  const { user, logout } = useAuth();
  const [isChangePictureModalOpen, setIsChangePictureModalOpen] =
    useState(false);

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
  const menuItems = [
    { id: "home", label: "Accueil", icon: House },
    { id: "staff", label: "Gestion Staff", icon: Users },
    { id: "menu", label: "Gestion Menu", icon: Receipt },
    { id: "historique", label: "Historique des commandes", icon: ForkKnife },
    { id: "stock", label: "Gestion du stock", icon: Package },
    { id: "statistiques", label: "Statistiques", icon: ChartBar },
    { id: "caisse", label: "Caisse", icon: Receipt },
    { id: "settings", label: "Paramètres", icon: Gear },
  ] as const;

  return (
    <header className="flex flex-col w-full items-start">
      {/* Mobile Header - visible only on mobile/tablet */}
      <div className="lg:hidden w-full bg-white">
        {/* Top part: Logo + Avatar + Menu burger */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <img src="/img/logo.png" alt="Logo" className="h-8" />

          <div className="flex items-center gap-3">
            {/* Mobile user avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative cursor-pointer">
                  <UserAvatar
                    photo={user?.photoProfil}
                    nom={user?.nom}
                    prenom={user?.prenom}
                    size="md"
                    className="hover:ring-2 hover:ring-orange-200 transition-all"
                  />
                  <div className="absolute w-3 h-3 -bottom-0.5 -right-0.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Administrateur
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
                {menuItems.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onSectionSelect?.(item.id as any)}
                    className={`flex items-center gap-2 ${
                      selectedSection === item.id
                        ? "bg-orange-50 text-orange-600"
                        : "bg-white"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom part: Greeting only */}
        <div className="flex items-center justify-start px-4 py-4 border-b border-slate-200">
          <div className="flex flex-col items-start gap-1">
            <h1 className="font-gilroy font-bold text-[#181818] text-2xl">
              {user?.role
                ? user.role.charAt(0).toUpperCase() +
                  user.role.slice(1).toLowerCase()
                : "Utilisateur"}{" "}
              {user?.prenom}
            </h1>
            <p className="font-title-t5-medium text-slate-400 text-sm">
              {formattedDate} - {formattedTime}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Header - visible only on desktop */}
      <div className="hidden lg:flex items-center justify-between px-3 md:px-6 lg:px-12 py-6 w-full bg-white border-b border-slate-200">
        <div className="flex flex-col items-start gap-1">
          <h1 className="font-gilroy font-bold text-4xl text-[#181818]">
            {user?.role
              ? user.role.charAt(0).toUpperCase() +
                user.role.slice(1).toLowerCase()
              : "Utilisateur"}{" "}
            {user?.prenom}
          </h1>
          <p className="font-title-t5-medium text-slate-400 text-[length:var(--title-t5-medium-font-size)] tracking-[var(--title-t5-medium-letter-spacing)] leading-[var(--title-t5-medium-line-height)]">
            {formattedDate} - {formattedTime}
          </p>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-4">
          {/* Avatar utilisateur avec menu déroulant */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <UserAvatar
                  photo={user?.photoProfil}
                  nom={user?.nom}
                  prenom={user?.prenom}
                  size="lg"
                  className="hover:ring-2 hover:ring-orange-200 transition-all"
                />
                <div className="absolute w-4 h-4 -bottom-0.5 -right-0.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <div className="px-4 py-3">
                <p className="text-base font-medium">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-sm text-muted-foreground">Administrateur</p>
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
      </div>

      {/* Modal pour changer la photo de profil */}
      <ChangeProfilePictureModal
        isOpen={isChangePictureModalOpen}
        onClose={() => setIsChangePictureModalOpen(false)}
      />
    </header>
  );
};
