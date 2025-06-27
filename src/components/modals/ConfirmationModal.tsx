import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { WarningCircle, Info } from "@phosphor-icons/react";
import { ButtonSpinner } from "../ui/spinner";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "info" | "danger";
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "info",
  isLoading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          icon: <WarningCircle className="h-6 w-6 text-orange-500" />,
          iconBg: "bg-orange-100",
          confirmButton: "bg-orange-600 hover:bg-orange-700 text-white",
        };
      case "danger":
        return {
          icon: <WarningCircle className="h-6 w-6 text-red-500" />,
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "info":
      default:
        return {
          icon: <Info className="h-6 w-6 text-blue-500" />,
          iconBg: "bg-blue-100",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${styles.confirmButton}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <ButtonSpinner />
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
