import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Sélectionner une date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

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
          <div className="flex items-center">
            {date ? format(date, "dd/MM/yyyy", { locale: fr }) : placeholder}
          </div>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
