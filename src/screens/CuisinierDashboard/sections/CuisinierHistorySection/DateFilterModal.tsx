import React from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { DatePicker } from "../../../../components/ui/date-picker";
import { format } from "date-fns";

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filter: {
    mode: "period" | "single";
    startDate?: string;
    endDate?: string;
    date?: string;
  }) => void;
  onClearFilter: () => void;
  currentStartDate?: string;
  currentEndDate?: string;
  currentMode?: "period" | "single";
  currentDate?: string;
}

export const DateFilterModal = ({
  isOpen,
  onClose,
  onApplyFilter,
  onClearFilter,
  currentStartDate = "",
  currentEndDate = "",
  currentMode = "period",
  currentDate = "",
}: DateFilterModalProps): JSX.Element => {
  const [mode, setMode] = React.useState<"period" | "single">(currentMode);
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    currentStartDate ? new Date(currentStartDate) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    currentEndDate ? new Date(currentEndDate) : undefined
  );
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(
    currentDate ? new Date(currentDate) : undefined
  );

  React.useEffect(() => {
    setMode(currentMode);
    setStartDate(currentStartDate ? new Date(currentStartDate) : undefined);
    setEndDate(currentEndDate ? new Date(currentEndDate) : undefined);
    setSingleDate(currentDate ? new Date(currentDate) : undefined);
  }, [currentStartDate, currentEndDate, currentMode, currentDate, isOpen]);

  const handleApply = () => {
    if (mode === "single") {
      onApplyFilter({
        mode: "single",
        date: singleDate ? format(singleDate, "yyyy-MM-dd") : undefined,
      });
    } else {
      onApplyFilter({
        mode: "period",
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      });
    }
    onClose();
  };

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSingleDate(undefined);
    onClearFilter();
    onClose();
  };

  const handleClose = () => {
    setMode(currentMode);
    setStartDate(currentStartDate ? new Date(currentStartDate) : undefined);
    setEndDate(currentEndDate ? new Date(currentEndDate) : undefined);
    setSingleDate(currentDate ? new Date(currentDate) : undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto p-0 gap-0 rounded-3xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Filtrer par date
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-gray-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toggle mode */}
        <div className="px-6 pt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de filtre
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => setMode("period")}
                className={
                  mode === "period"
                    ? "w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white"
                    : "w-full bg-white hover:bg-gray-5 border border-gray-200 text-black"
                }
              >
                Période
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setMode("single")}
                className={
                  mode === "single"
                    ? "w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white"
                    : "w-full bg-white hover:bg-gray-5 border border-gray-200 text-black"
                }
              >
                Date précise
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {mode === "period"
                ? "Filtrer sur une plage de dates"
                : "Filtrer sur une date spécifique"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="space-y-4">
            {mode === "period" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <DatePicker
                    date={startDate}
                    onSelect={setStartDate}
                    placeholder="Date de début"
                  />
                </div>
                {/* End Date */}
                <div>
                  <DatePicker
                    date={endDate}
                    onSelect={setEndDate}
                    placeholder="Date de fin"
                  />
                </div>
              </div>
            ) : (
              <div>
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
          <Button variant="ghost" onClick={handleClear}>
            Réinitialiser
          </Button>
          <Button
            onClick={handleApply}
            disabled={mode === "single" ? !singleDate : !startDate || !endDate}
            className="bg-brand-primary-500 hover:bg-brand-primary-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            Appliquer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
