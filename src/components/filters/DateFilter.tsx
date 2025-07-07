import React, { useState } from "react";
import { Button } from "../ui/button";
import { CalendarIcon, FilterIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DatePicker } from "../ui/date-picker";

export type DateFilterValue =
  | { mode: "single"; date: string }
  | { mode: "period"; startDate: string; endDate: string };

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  onClear?: () => void;
  label?: string;
  buttonClassName?: string;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  value,
  onChange,
  onClear,
  label = "Filtrer par date",
  buttonClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DateFilterValue["mode"]>(value.mode);
  const [singleDate, setSingleDate] = useState<Date | undefined>(
    value.mode === "single" && value.date ? new Date(value.date) : undefined
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    value.mode === "period" && value.startDate
      ? new Date(value.startDate)
      : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    value.mode === "period" && value.endDate
      ? new Date(value.endDate)
      : undefined
  );

  // Sync props <-> state
  React.useEffect(() => {
    setMode(value.mode);
    if (value.mode === "single") {
      setSingleDate(value.date ? new Date(value.date) : undefined);
    } else {
      setStartDate(value.startDate ? new Date(value.startDate) : undefined);
      setEndDate(value.endDate ? new Date(value.endDate) : undefined);
    }
  }, [value]);

  const handleApply = () => {
    if (mode === "single") {
      const dateStr = singleDate ? singleDate.toISOString().split("T")[0] : "";
      onChange({ mode: "single", date: dateStr });
    } else {
      const startDateStr = startDate
        ? startDate.toISOString().split("T")[0]
        : "";
      const endDateStr = endDate ? endDate.toISOString().split("T")[0] : "";
      onChange({
        mode: "period",
        startDate: startDateStr,
        endDate: endDateStr,
      });
    }
    setOpen(false);
  };

  const handleClear = () => {
    if (onClear) onClear();
    setOpen(false);
  };

  // Affichage du résumé du filtre
  let filterLabel = "Aucun filtre";
  if (mode === "single" && singleDate) {
    const dateStr = singleDate.toISOString().split("T")[0];
    filterLabel = `Le ${dateStr.split("-").reverse().join("/")}`;
  } else if (mode === "period" && (startDate || endDate)) {
    const startStr = startDate ? startDate.toISOString().split("T")[0] : "...";
    const endStr = endDate ? endDate.toISOString().split("T")[0] : "...";
    filterLabel = `Du ${startStr} au ${endStr}`;
  }

  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 ${buttonClassName}`}
        onClick={() => setOpen(true)}
      >
        <FilterIcon className="h-4 w-4" />
        <span>{label}</span>
        {filterLabel !== "Aucun filtre" && (
          <span className="ml-2 text-xs text-orange-600">{filterLabel}</span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md mx-auto p-0 gap-0 rounded-3xl overflow-hidden">
          <DialogHeader className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-title-t3-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {label}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {/* Toggle mode */}
          <div className="px-6 pt-5 flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === "period"}
                onChange={() => setMode("period")}
              />
              <span>Période</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />
              <span>Date précise</span>
            </label>
          </div>
          {/* Content */}
          <div className="px-6 py-5">
            <div className="space-y-4">
              {mode === "period" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début
                    </label>
                    <DatePicker
                      date={startDate}
                      onSelect={setStartDate}
                      placeholder="Sélectionner une date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <DatePicker
                      date={endDate}
                      onSelect={setEndDate}
                      placeholder="Sélectionner une date"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <DatePicker
                    date={singleDate}
                    onSelect={setSingleDate}
                    placeholder="Sélectionner une date"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 pb-5">
            {onClear && (
              <Button variant="ghost" onClick={handleClear}>
                Réinitialiser
              </Button>
            )}
            <Button
              onClick={handleApply}
              disabled={
                mode === "single" ? !singleDate : !startDate || !endDate
              }
            >
              Appliquer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
