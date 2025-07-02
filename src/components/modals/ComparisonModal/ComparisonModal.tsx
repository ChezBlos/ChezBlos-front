import React, { useState } from "react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { X, Calendar } from "@phosphor-icons/react";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompare: (date1: string, date2?: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  onCompare,
}) => {
  // Mode: "single" pour filtrer une date, "compare" pour comparer deux dates
  const [mode, setMode] = useState<"single" | "compare">("single");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const handleCompare = () => {
    if (mode === "single" && date1) {
      onCompare(date1);
      onClose();
    } else if (mode === "compare" && date1 && date2) {
      onCompare(date1, date2);
      onClose();
    }
  };

  const handleClose = () => {
    setMode("single");
    setDate1("");
    setDate2("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
              {mode === "single" ? "Filtrer par date" : "Comparer deux dates"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />
              Filtrer par date
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={mode === "compare"}
                onChange={() => setMode("compare")}
              />
              Comparer deux dates
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {mode === "single" ? "Date" : "Première date"}
            </label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          {mode === "compare" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Deuxième date
              </label>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              {mode === "single"
                ? "Filtrez les statistiques pour une date précise."
                : "Comparez les performances entre deux dates différentes."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCompare}
            disabled={mode === "single" ? !date1 : !date1 || !date2}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            {mode === "single" ? "Filtrer" : "Comparer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
