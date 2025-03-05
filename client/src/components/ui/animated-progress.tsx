import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedProgressProps {
  value: number;
  maxValue?: number;
  className?: string;
  indicatorClassName?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  label?: string;
  height?: string;
  animationDuration?: number;
  threshold?: {
    high: number;
    medium: number;
    low: number;
  };
  thresholdColors?: {
    high: string;
    medium: string;
    low: string;
    veryLow: string;
  };
  onComplete?: () => void;
}

export function AnimatedProgress({
  value,
  maxValue = 100,
  className = "",
  indicatorClassName = "",
  showPercentage = false,
  showValue = false,
  label = "",
  height = "h-2",
  animationDuration = 1,
  threshold = { high: 75, medium: 50, low: 25 },
  thresholdColors = {
    high: "bg-green-500",
    medium: "bg-yellow-500",
    low: "bg-orange-500",
    veryLow: "bg-red-500"
  },
  onComplete
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const normalizedValue = (value / maxValue) * 100;
  const percentage = Math.min(100, Math.max(0, normalizedValue));
  const percentageText = Math.round(percentage);

  useEffect(() => {
    // Animate the value
    setDisplayValue(0);
    const timer = setTimeout(() => {
      setDisplayValue(normalizedValue);
    }, 50);

    return () => clearTimeout(timer);
  }, [normalizedValue]);

  // Determine color based on threshold
  const getColorClass = () => {
    if (percentage >= threshold.high) return thresholdColors.high;
    if (percentage >= threshold.medium) return thresholdColors.medium;
    if (percentage >= threshold.low) return thresholdColors.low;
    return thresholdColors.veryLow;
  };

  const progressBarColorClass = indicatorClassName || getColorClass();

  return (
    <div className="relative">
      {label && (
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium">{label}</span>
          {showPercentage && <span className="font-medium">{percentageText}%</span>}
          {showValue && <span className="font-medium">{value} / {maxValue}</span>}
        </div>
      )}
      
      <div className={`${height} bg-gray-800 rounded-full overflow-hidden relative ${className}`}>
        <motion.div
          className={`h-full ${progressBarColorClass}`}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animationDuration, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (onComplete && percentage >= 100) {
              onComplete();
            }
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="h-full w-20 bg-white/20 skew-x-30 -translate-x-20"
              animate={{ 
                x: ["0%", "100%"]
              }}
              transition={{ 
                duration: 1,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Milestone markers */}
      {threshold && (
        <div className="relative h-0">
          <div 
            className="absolute top-0 w-px h-2 bg-gray-400" 
            style={{ left: `${threshold.low}%`, marginTop: "-4px" }}
          />
          <div 
            className="absolute top-0 w-px h-2 bg-gray-400" 
            style={{ left: `${threshold.medium}%`, marginTop: "-4px" }}
          />
          <div 
            className="absolute top-0 w-px h-2 bg-gray-400" 
            style={{ left: `${threshold.high}%`, marginTop: "-4px" }}
          />
        </div>
      )}
      
      {/* Celebration at 100% */}
      <AnimatePresence>
        {percentage >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-0 right-0 text-2xl"
          >
            🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}