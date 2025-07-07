import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface MonthPickerProps {
  date?: string; // Format: "YYYY-MM"
  onSelect?: (month: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function MonthPicker({
  date,
  onSelect,
  placeholder = "Sélectionner un mois",
  disabled = false,
  className,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(
    date ? parseInt(date.split("-")[0]) : new Date().getFullYear()
  );

  const selectedMonth = date ? parseInt(date.split("-")[1]) - 1 : null;

  const handleMonthSelect = (monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const dateStr = `${selectedYear}-${monthStr}`;
    onSelect?.(dateStr);
    setOpen(false);
  };

  const displayValue = date
    ? `${months[selectedMonth!]} ${selectedYear}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200 focus:border-orange-300 focus:ring-orange-200",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          {/* Sélecteur d'année */}
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedYear((prev) => prev - 1)}
              className="hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200"
            >
              ‹
            </Button>
            <span className="font-semibold text-lg min-w-[4rem] text-center">
              {selectedYear}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedYear((prev) => prev + 1)}
              className="hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200"
            >
              ›
            </Button>
          </div>

          {/* Grille des mois */}
          <div className="grid grid-cols-3 gap-1">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={selectedMonth === index ? "default" : "ghost"}
                className={cn(
                  "h-9 text-sm",
                  selectedMonth === index
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "hover:bg-orange-50 hover:text-orange-900"
                )}
                onClick={() => handleMonthSelect(index)}
              >
                {month.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
