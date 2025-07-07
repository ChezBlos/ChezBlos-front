import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface YearPickerProps {
  year?: string;
  onSelect?: (year: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

export function YearPicker({
  year,
  onSelect,
  placeholder = "Sélectionner une année",
  disabled = false,
  className,
  minYear = 2020,
  maxYear = new Date().getFullYear() + 5,
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(
    year ? parseInt(year) : new Date().getFullYear()
  );

  const handleYearSelect = (selectedYear: number) => {
    onSelect?.(selectedYear.toString());
    setOpen(false);
  };

  const displayValue = year || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200 focus:border-orange-300 focus:ring-orange-200",
            !year && "text-muted-foreground",
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
          {/* Navigation rapide */}
          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentYear((prev) => Math.max(prev - 10, minYear))
              }
              className="hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200"
            >
              «
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentYear((prev) => Math.max(prev - 1, minYear))
              }
              className="hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200"
            >
              ‹
            </Button>
            <span className="font-semibold text-lg min-w-[4rem] text-center">
              {currentYear}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentYear((prev) => Math.min(prev + 1, maxYear))
              }
              className="hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200"
            >
              ›
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentYear((prev) => Math.min(prev + 10, maxYear))
              }
              className="hover:bg-orange-50 hover:text-orange-900 hover:border-orange-200"
            >
              »
            </Button>
          </div>

          {/* Grille des années autour de l'année courante */}
          <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
            {Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
              .filter((y) => y >= minYear && y <= maxYear)
              .map((yearValue) => (
                <Button
                  key={yearValue}
                  variant={year === yearValue.toString() ? "default" : "ghost"}
                  className={cn(
                    "h-9 text-sm",
                    year === yearValue.toString()
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "hover:bg-orange-50 hover:text-orange-900"
                  )}
                  onClick={() => handleYearSelect(yearValue)}
                >
                  {yearValue}
                </Button>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
