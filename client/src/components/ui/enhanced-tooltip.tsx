import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EnhancedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  variant?: "standard" | "animated";
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
  contentClassName?: string;
  arrowSize?: number;
  offset?: number;
  maxWidth?: string;
  animation?: "fade" | "scale" | "slide" | "bounce" | "rotate";
}

// Get position styles for animated tooltip
const getTooltipPosition = (
  position: string,
  offset: number,
  arrowSize: number
) => {
  const positions: Record<string, any> = {
    top: {
      tooltip: { bottom: `calc(100% + ${offset}px)`, left: "50%", transform: "translateX(-50%)" },
      arrow: { bottom: `-${arrowSize - 1}px`, left: "50%", transform: "translateX(-50%) rotate(45deg)" }
    },
    bottom: {
      tooltip: { top: `calc(100% + ${offset}px)`, left: "50%", transform: "translateX(-50%)" },
      arrow: { top: `-${arrowSize - 1}px`, left: "50%", transform: "translateX(-50%) rotate(45deg)" }
    },
    left: {
      tooltip: { right: `calc(100% + ${offset}px)`, top: "50%", transform: "translateY(-50%)" },
      arrow: { right: `-${arrowSize - 1}px`, top: "50%", transform: "translateY(-50%) rotate(45deg)" }
    },
    right: {
      tooltip: { left: `calc(100% + ${offset}px)`, top: "50%", transform: "translateY(-50%)" },
      arrow: { left: `-${arrowSize - 1}px`, top: "50%", transform: "translateY(-50%) rotate(45deg)" }
    }
  };
  
  return positions[position] || positions.top;
};

// Get initial animation based on position and animation type
const getInitialAnimation = (
  position: string,
  animation: string
) => {
  const baseAnimation = { opacity: 0 };
  
  if (animation === "fade") return baseAnimation;
  if (animation === "scale") return { ...baseAnimation, scale: 0.8 };
  
  if (animation === "slide") {
    const slidePositions: Record<string, any> = {
      top: { ...baseAnimation, y: 10 },
      bottom: { ...baseAnimation, y: -10 },
      left: { ...baseAnimation, x: 10 },
      right: { ...baseAnimation, x: -10 }
    };
    return slidePositions[position] || slidePositions.top;
  }
  
  if (animation === "bounce") {
    const bouncePositions: Record<string, any> = {
      top: { ...baseAnimation, y: 10 },
      bottom: { ...baseAnimation, y: -10 },
      left: { ...baseAnimation, x: 10 },
      right: { ...baseAnimation, x: -10 }
    };
    return bouncePositions[position] || bouncePositions.top;
  }
  
  if (animation === "rotate") {
    return { ...baseAnimation, rotate: 15, scale: 0.8 };
  }
  
  return baseAnimation;
};

// Get exit animation based on position and animation type
const getExitAnimation = (
  position: string,
  animation: string
) => {
  const baseAnimation = { opacity: 0 };
  
  if (animation === "fade") return baseAnimation;
  if (animation === "scale") return { ...baseAnimation, scale: 0.8 };
  
  if (animation === "slide") {
    const slidePositions: Record<string, any> = {
      top: { ...baseAnimation, y: -10 },
      bottom: { ...baseAnimation, y: 10 },
      left: { ...baseAnimation, x: -10 },
      right: { ...baseAnimation, x: 10 }
    };
    return slidePositions[position] || slidePositions.top;
  }
  
  if (animation === "bounce") return baseAnimation;
  
  if (animation === "rotate") {
    return { ...baseAnimation, rotate: -15, scale: 0.8 };
  }
  
  return baseAnimation;
};

// Get animate properties for tooltip
const getAnimateAnimation = (animation: string) => {
  const baseAnimation = { opacity: 1 };
  
  if (animation === "fade") return baseAnimation;
  if (animation === "scale") return { ...baseAnimation, scale: 1 };
  if (animation === "slide") return { ...baseAnimation, x: 0, y: 0 };
  if (animation === "bounce") return { ...baseAnimation, x: 0, y: 0 };
  if (animation === "rotate") return { ...baseAnimation, rotate: 0, scale: 1 };
  
  return baseAnimation;
};

// Get transition properties for animation
const getTransition = (
  animation: string,
  duration: number
) => {
  if (animation === "bounce") {
    return {
      type: "spring",
      stiffness: 500,
      damping: 15,
      duration
    };
  }
  
  return {
    duration,
    ease: "easeOut"
  };
};

// Render standard tooltip using Radix UI
const renderStandardTooltip = (props: EnhancedTooltipProps) => {
  const {
    content,
    children,
    position = "top",
    delay = 0.2,
    className = "",
    contentClassName = "",
  } = props;

  return (
    <TooltipProvider delayDuration={delay * 1000}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={position as any} 
          className={contentClassName}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Render animated custom tooltip
const renderAnimatedTooltip = (props: EnhancedTooltipProps) => {
  const {
    content,
    children,
    position = "top",
    delay = 0.2,
    duration = 0.2,
    className = "",
    contentClassName = "",
    arrowSize = 6,
    offset = 8,
    maxWidth = "250px",
    animation = "fade"
  } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const positions = getTooltipPosition(position, offset, arrowSize);
  let tooltipTimer: number;
  
  const handleMouseEnter = () => {
    if (tooltipTimer) clearTimeout(tooltipTimer);
    setIsVisible(true);
    tooltipTimer = window.setTimeout(() => {
      setShowTooltip(true);
    }, delay * 1000);
  };
  
  const handleMouseLeave = () => {
    if (tooltipTimer) clearTimeout(tooltipTimer);
    setShowTooltip(false);
    tooltipTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };
  
  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={getInitialAnimation(position, animation)}
              animate={getAnimateAnimation(animation)}
              exit={getExitAnimation(position, animation)}
              transition={getTransition(animation, duration)}
              style={{
                position: "absolute",
                zIndex: 50,
                ...positions.tooltip,
                maxWidth
              }}
              className="pointer-events-none"
            >
              <div className={cn(
                "p-2 rounded-md bg-gray-900 text-white text-xs shadow-lg text-center", 
                contentClassName
              )}>
                {content}
                <div
                  style={{
                    position: "absolute",
                    width: `${arrowSize * 2}px`,
                    height: `${arrowSize * 2}px`,
                    backgroundColor: "inherit",
                    ...positions.arrow,
                    zIndex: -1
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Main component export
export function EnhancedTooltip(props: EnhancedTooltipProps) {
  const { variant = "standard" } = props;
  
  if (variant === "animated") {
    return renderAnimatedTooltip(props);
  }
  
  return renderStandardTooltip(props);
}