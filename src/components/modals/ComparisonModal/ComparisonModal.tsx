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
  onCompare: (period1: string, period2: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  onCompare,
}) => {
  const [period1, setPeriod1] = useState("");
  const [period2, setPeriod2] = useState("");

  const handleCompare = () => {
    if (period1 && period2) {
      onCompare(period1, period2);
      onClose();
    }
  };

  const handleClose = () => {
    setPeriod1("");
    setPeriod2("");
    onClose();
  };

  const periods = [
    { value: "today", label: "Aujourd'hui" },
    { value: "yesterday", label: "Hier" },
    { value: "this_week", label: "Cette semaine" },
    { value: "last_week", label: "Semaine dernière" },
    { value: "this_month", label: "Ce mois" },
    { value: "last_month", label: "Mois dernier" },
    { value: "this_quarter", label: "Ce trimestre" },
    { value: "last_quarter", label: "Trimestre dernier" },
    { value: "this_year", label: "Cette année" },
    { value: "last_year", label: "Année dernière" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-orange-500" />
              Comparer les Périodes
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
          {/* Première période */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Première période
            </label>
            <select
              value={period1}
              onChange={(e) => setPeriod1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Sélectionner une période</option>
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Deuxième période */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Deuxième période
            </label>
            <select
              value={period2}
              onChange={(e) => setPeriod2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Sélectionner une période</option>
              {periods
                .filter((period) => period.value !== period1)
                .map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              Comparez les performances entre deux périodes différentes pour
              analyser l'évolution de votre activité.
            </p>
          </div>
        </div>

        {/* Actions */}
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
            disabled={!period1 || !period2}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            Comparer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
