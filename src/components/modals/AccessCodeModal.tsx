import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import {
  Copy,
  ArrowClockwise,
  User,
  Eye,
  EyeSlash,
  CheckCircle,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useUserAccessCode } from "../../hooks/useUserAPI";
import { ConfirmationModal } from "./ConfirmationModal";
import { logger } from "../../utils/logger";

interface StaffUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER" | "CAISSIER";
  actif: boolean;
  photoProfil?: string;
}

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffUser | null;
}

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [needsRegeneration, setNeedsRegeneration] = useState(false);
  const [showCode, setShowCode] = useState(true); // Par défaut visible pour l'admin
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // État pour le modal de confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const { getUserAccessCode, generateAccessCode, loading, error } =
    useUserAccessCode();

  // Charger le code d'accès quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && user) {
      loadAccessCode();
    }
  }, [isOpen, user]); // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAccessCode(null);
      setNeedsRegeneration(false);
      setShowCode(true);
      setCopied(false);
      setIsGenerating(false);
      setShowConfirmation(false);
      setConfirmationMessage("");
    }
  }, [isOpen]);

  const loadAccessCode = async () => {
    if (!user) return;

    const response = await getUserAccessCode(user._id);
    if (response) {
      setAccessCode(response.codeAcces);
      setNeedsRegeneration(response.needsRegeneration || false);
    }
  };

  const handleCopyCode = async () => {
    if (!accessCode) return;

    try {
      await navigator.clipboard.writeText(accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error("Erreur lors de la copie:", error);
    }
  };
  const handleGenerateNewCode = async () => {
    if (!user) return;

    const message = needsRegeneration
      ? "Ce code d'accès est dans l'ancien format. Voulez-vous le regénérer pour le rendre visible ?"
      : "Êtes-vous sûr de vouloir générer un nouveau code ? L'ancien code deviendra inutilisable.";

    setConfirmationMessage(message);
    setShowConfirmation(true);
  };

  const handleConfirmGeneration = async () => {
    if (!user) return;

    setShowConfirmation(false);
    setIsGenerating(true);

    const result = await generateAccessCode(user._id);
    if (result && result.codeAcces) {
      setAccessCode(result.codeAcces);
      setNeedsRegeneration(false);
      setShowCode(true);
    }
    setIsGenerating(false);
  };

  const formatRole = (role: string): string => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "Administrateur";
      case "SERVEUR":
        return "Serveur";
      case "CUISINIER":
        return "Cuisinier";
      case "CAISSIER":
        return "Caissier";
      default:
        return role;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      ADMIN: "bg-orange-100 text-orange-700",
      SERVEUR: "bg-blue-100 text-blue-700",
      CUISINIER: "bg-purple-100 text-purple-700",
      CAISSIER: "bg-yellow-100 text-yellow-700",
    };

    const colorClass = roleColors[role as keyof typeof roleColors];

    return (
      <Badge
        className={`${colorClass} rounded-full px-3 py-1 font-medium text-xs border`}
      >
        {formatRole(role)}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Code d'accès
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Informations utilisateur */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <div className="text-sm text-gray-600 font-semibold">
                    {user.prenom.charAt(0).toUpperCase()}
                    {user.nom.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {user.prenom} {user.nom}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email || "Email non défini"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getRoleBadge(user.role)}
              </div>
            </CardContent>
          </Card>

          {/* Code d'accès */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Code d'accès</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCode(!showCode)}
                  className="h-8 w-8 p-0"
                >
                  {showCode ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-sm text-center py-4">
                  Erreur: {error}
                </div>
              ) : accessCode ? (
                <div className="space-y-3">
                  {needsRegeneration ? (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <WarningCircleIcon className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium text-orange-800">
                          Code en ancien format
                        </span>
                      </div>
                      <p className="text-xs text-orange-600 mt-2">
                        Ce code doit être regénéré pour être utilisable
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-10 text-center rounded-lg p-3 border">
                      <code className="text-lg font-mono font-bold tracking-wider">
                        {showCode ? accessCode : "••••••"}
                      </code>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      disabled={!showCode || needsRegeneration}
                      className="flex-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          {needsRegeneration ? "Indisponible" : "Copier"}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateNewCode}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <ArrowClockwise className="h-4 w-4 mr-2" />
                          {needsRegeneration ? "Regénérer" : "Nouveau"}
                        </>
                      )}
                    </Button>{" "}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">
                    Aucun code d'accès trouvé
                  </p>
                  <Button
                    onClick={handleGenerateNewCode}
                    disabled={isGenerating}
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <ArrowClockwise className="h-4 w-4 mr-2" />
                        Générer un code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {!showCode && accessCode && !needsRegeneration && (
            <div className="text-xs text-gray-500 text-center">
              Cliquez sur l'œil pour révéler le code avant de le copier
            </div>
          )}
        </div>{" "}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal de confirmation pour la génération */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmGeneration}
        title={needsRegeneration ? "Regénérer le code" : "Nouveau code d'accès"}
        message={confirmationMessage}
        confirmText={needsRegeneration ? "Regénérer" : "Générer"}
        variant={needsRegeneration ? "warning" : "info"}
        isLoading={isGenerating}
      />
    </Dialog>
  );
};
