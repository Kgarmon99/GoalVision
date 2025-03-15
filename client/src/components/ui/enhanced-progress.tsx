import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EnhancedProgressProps {
  value: number;
  maxValue?: number;
  className?: string;
  indicatorClassName?: string;
  showPercentage?: boolean;
  showValue?: boolean;
  label?: string;
  height?: string;
  variant?: "standard" | "animated";
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

// Get color class based on threshold
const getColorClass = (
  percentage: number,
  threshold: { high: number; medium: number; low: number },
  colors: { high: string; medium: string; low: string; veryLow: string }
) => {
  if (percentage >= threshold.high) return colors.high;
  if (percentage >= threshold.medium) return colors.medium;
  if (percentage >= threshold.low) return colors.low;
  return colors.veryLow;
};

// Render standard progress bar
const renderStandardProgress = (props: EnhancedProgressProps) => {
  const {
    value,
    maxValue = 100,
    className,
    indicatorClassName,
    showPercentage = false,
    showValue = false,
    label
  } = props;

  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const percentageText = Math.round(percentage);

  return (
    <div className="space-y-1.5">
      {(label || showPercentage || showValue) && (
        <div className="flex justify-between text-sm">
          {label && <span>{label}</span>}
          <span className="text-muted-foreground">
            {showPercentage && `${percentageText}%`}
            {showValue && ` ${value}/${maxValue}`}
          </span>
        </div>
      )}
      <Progress 
        value={percentage} 
        className={className}
        indicatorClassName={indicatorClassName}
      />
    </div>
  );
};

// Render animated progress bar with extra features
const renderAnimatedProgress = (props: EnhancedProgressProps) => {
  const {
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
  } = props;

  const [displayValue, setDisplayValue] = useState(0);
  const normalizedValue = (value / maxValue) * 100;
  const percentage = Math.min(100, Math.max(0, normalizedValue));
  const percentageText = Math.round(percentage);

  // Animate the value on mount/change
  useEffect(() => {
    setDisplayValue(0);
    const timer = setTimeout(() => {
      setDisplayValue(normalizedValue);
    }, 50);

    return () => clearTimeout(timer);
  }, [normalizedValue]);

  // Determine color based on threshold
  const progressBarColorClass = indicatorClassName || 
    getColorClass(percentage, threshold, thresholdColors);

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (onComplete && percentage >= 100) {
      onComplete();
    }
  };

  return (
    <div className="relative">
      {(label || showPercentage || showValue) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-medium">{percentageText}%</span>}
          {showValue && <span className="font-medium">{value} / {maxValue}</span>}
        </div>
      )}
      
      <div className={cn(`${height} bg-gray-800 rounded-full overflow-hidden relative`, className)}>
        <motion.div
          className={cn("h-full", progressBarColorClass)}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animationDuration, ease: "easeOut" }}
          onAnimationComplete={handleAnimationComplete}
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="h-full w-20 bg-white/20 skew-x-30 -translate-x-20"
              animate={{ x: ["0%", "100%"] }}
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
};

// Main component export
export function EnhancedProgress(props: EnhancedProgressProps) {
  const { variant = "standard" } = props;
  
  if (variant === "animated") {
    return renderAnimatedProgress(props);
  }
  
  return renderStandardProgress(props);
}