import React, { useState } from "react";
import { Button } from "../ui/button";
import { CalendarIcon, FilterIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

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
  const [singleDate, setSingleDate] = useState(
    value.mode === "single" ? value.date : ""
  );
  const [startDate, setStartDate] = useState(
    value.mode === "period" ? value.startDate : ""
  );
  const [endDate, setEndDate] = useState(
    value.mode === "period" ? value.endDate : ""
  );

  // Sync props <-> state
  React.useEffect(() => {
    setMode(value.mode);
    if (value.mode === "single") {
      setSingleDate(value.date);
    } else {
      setStartDate(value.startDate);
      setEndDate(value.endDate);
    }
  }, [value]);

  const handleApply = () => {
    if (mode === "single") {
      onChange({ mode: "single", date: singleDate });
    } else {
      onChange({ mode: "period", startDate, endDate });
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
    filterLabel = `Le ${singleDate.split("-").reverse().join("/")}`;
  } else if (mode === "period" && (startDate || endDate)) {
    filterLabel = `Du ${startDate || "..."} au ${endDate || "..."}`;
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
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setStartDate(e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEndDate(e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={singleDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSingleDate(e.target.value)
                    }
                    className="w-full"
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
