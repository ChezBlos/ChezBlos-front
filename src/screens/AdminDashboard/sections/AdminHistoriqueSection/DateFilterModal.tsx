import React from "react";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";

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
  const [startDate, setStartDate] = React.useState(currentStartDate);
  const [endDate, setEndDate] = React.useState(currentEndDate);
  const [singleDate, setSingleDate] = React.useState(currentDate);

  React.useEffect(() => {
    setMode(currentMode);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setSingleDate(currentDate);
  }, [currentStartDate, currentEndDate, currentMode, currentDate, isOpen]);

  const handleApply = () => {
    if (mode === "single") {
      onApplyFilter({ mode: "single", date: singleDate });
    } else {
      onApplyFilter({ mode: "period", startDate, endDate });
    }
    onClose();
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setSingleDate("");
    onClearFilter();
    onClose();
  };

  const handleClose = () => {
    setMode(currentMode);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setSingleDate(currentDate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto p-0 gap-0 rounded-3xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-title-t3-semibold text-gray-900 flex items-center gap-2">
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
                {/* Start Date */}
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
                {/* End Date */}
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
          <Button variant="ghost" onClick={handleClear}>
            Réinitialiser
          </Button>
          <Button
            onClick={handleApply}
            disabled={mode === "single" ? !singleDate : !startDate || !endDate}
          >
            Appliquer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
