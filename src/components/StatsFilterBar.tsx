import React from "react";
import { Button } from "../components/ui/button";
import { Funnel } from "@phosphor-icons/react";

interface StatsFilterBarProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onOpenDateFilter: () => void;
  periods?: Array<{ value: string; label: string }>;
  className?: string;
}

export const StatsFilterBar: React.FC<StatsFilterBarProps> = ({
  onOpenDateFilter,

  className = "",
}) => (
  <div className={`flex items-center justify-end gap-4 ${className}`}>
    <Button
      variant="outline"
      className="flex items-center gap-2 rounded-full border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100"
      onClick={onOpenDateFilter}
    >
      <Funnel className="h-5 w-5" />
      Filtrer par date
    </Button>
  </div>
);
