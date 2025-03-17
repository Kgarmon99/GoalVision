import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import "../ui/3d-effects.css";

interface Progress3DProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  showValue?: boolean;
  valueClassName?: string;
  height?: string;
  glowEffect?: boolean;
  pulseEffect?: boolean;
}

const Progress3D = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Progress3DProps
>(({ 
  className, 
  value = 0, 
  indicatorClassName, 
  showValue = false, 
  valueClassName,
  height = "h-2",
  glowEffect = true,
  pulseEffect = false,
  ...props 
}, ref) => {
  const numberValue = Number(value);
  
  // Generate color based on progress value
  const getProgressColor = (value: number) => {
    if (value >= 75) return "bg-gradient-to-r from-green-500 to-emerald-400";
    if (value >= 50) return "bg-gradient-to-r from-yellow-500 to-amber-400";
    if (value >= 25) return "bg-gradient-to-r from-orange-500 to-amber-400";
    return "bg-gradient-to-r from-red-600 to-red-400";
  };
  
  // Apply glow effect based on progress value
  const getGlowEffect = (value: number) => {
    if (!glowEffect) return "";
    
    if (value >= 75) return "shadow-lg shadow-green-500/20";
    if (value >= 50) return "shadow-md shadow-yellow-500/20";
    if (value >= 25) return "shadow-md shadow-orange-500/20";
    return "shadow-md shadow-red-600/20";
  };
  
  // Apply pulse animation for certain thresholds
  const getPulseEffect = (value: number) => {
    if (!pulseEffect) return "";
    
    if (value >= 100) return "animate-pulse";
    if (value <= 10) return "animate-pulse";
    return "";
  };
  
  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          "progress-bar-3d",
          height,
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-in-out",
            "progress-bar-indicator-3d",
            getProgressColor(numberValue),
            getGlowEffect(numberValue),
            getPulseEffect(numberValue),
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (numberValue || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      
      {showValue && (
        <div 
          className={cn(
            "absolute text-xs font-medium right-1 top-1/2 transform -translate-y-1/2 z-10 px-1.5 rounded",
            "text-3d",
            valueClassName
          )}
        >
          {`${Math.round(numberValue || 0)}%`}
        </div>
      )}
    </div>
  );
});

Progress3D.displayName = "Progress3D";

export { Progress3D };