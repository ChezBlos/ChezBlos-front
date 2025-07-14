import React from "react";

interface SummaryCardProps {
  title: string;
  mobileTitle?: string;
  value: string | number;
  currency?: string;
  subtitle?: string;
  subtitleColor?: string;
  icon?: React.ReactNode;
  gradientColors?: string;
  isLoading?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  mobileTitle,
  value,
  currency,
  subtitle,
  subtitleColor = "text-gray-500",
  icon,
  gradientColors = "from-orange-500 to-orange-600",
  isLoading = false,
}) => {
  return (
    <div
      className={`bg-gradient-to-r ${gradientColors} text-white rounded-lg p-4 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white/80 text-sm font-medium mb-1">
            <span className="hidden sm:inline">{title}</span>
            <span className="sm:hidden">{mobileTitle || title}</span>
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">
              {isLoading ? "..." : value}
            </span>
            {currency && !isLoading && (
              <span className="text-sm text-white/80">{currency}</span>
            )}
          </div>
          {subtitle && (
            <p
              className={`text-xs mt-1 ${subtitleColor.replace(
                "text-",
                "text-white/"
              )}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && <div className="flex-shrink-0 ml-3">{icon}</div>}
      </div>
    </div>
  );
};
