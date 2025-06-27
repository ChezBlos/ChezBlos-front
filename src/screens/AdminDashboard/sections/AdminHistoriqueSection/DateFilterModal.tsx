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
  onApplyFilter: (startDate: string, endDate: string) => void;
  onClearFilter: () => void;
  currentStartDate?: string;
  currentEndDate?: string;
}

export const DateFilterModal = ({
  isOpen,
  onClose,
  onApplyFilter,
  onClearFilter,
  currentStartDate = "",
  currentEndDate = "",
}: DateFilterModalProps): JSX.Element => {
  const [startDate, setStartDate] = React.useState(currentStartDate);
  const [endDate, setEndDate] = React.useState(currentEndDate);

  React.useEffect(() => {
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
  }, [currentStartDate, currentEndDate, isOpen]);

  const handleApply = () => {
    onApplyFilter(startDate, endDate);
    onClose();
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onClearFilter();
    onClose();
  };

  const handleClose = () => {
    // Reset to current values when closing without applying
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
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

        {/* Content */}
        <div className="px-6 py-5">
          <div className="space-y-4">
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

            {/* Info */}
            <div className="text-xs text-gray-500 bg-gray-10 p-3 rounded-lg">
              <p>• Laissez vide pour ne pas filtrer par cette date</p>
              <p>• La date de début inclut toute la journée (00:00)</p>
              <p>• La date de fin inclut toute la journée (23:59)</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              Effacer
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
