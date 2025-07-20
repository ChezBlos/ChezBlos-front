import React from "react";

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value = [1],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
  disabled = false,
}) => {
  const [currentValue, setCurrentValue] = React.useState(value[0]);

  React.useEffect(() => {
    setCurrentValue(value[0]);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    onValueChange?.([newValue]);
  };

  return (
    <div className={`relative flex w-full items-center ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #f97316 0%, #f97316 ${
            ((currentValue - min) / (max - min)) * 100
          }%, #e5e7eb ${
            ((currentValue - min) / (max - min)) * 100
          }%, #e5e7eb 100%)`,
        }}
      />
    </div>
  );
};

export { Slider };
