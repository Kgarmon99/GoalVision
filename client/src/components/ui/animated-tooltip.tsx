import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
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

const getTooltipPosition = (
  position: "top" | "bottom" | "left" | "right",
  offset: number,
  arrowSize: number
) => {
  switch (position) {
    case "top":
      return {
        tooltip: { bottom: `calc(100% + ${offset}px)`, left: "50%", transform: "translateX(-50%)" },
        arrow: { bottom: `-${arrowSize - 1}px`, left: "50%", transform: "translateX(-50%) rotate(45deg)" }
      };
    case "bottom":
      return {
        tooltip: { top: `calc(100% + ${offset}px)`, left: "50%", transform: "translateX(-50%)" },
        arrow: { top: `-${arrowSize - 1}px`, left: "50%", transform: "translateX(-50%) rotate(45deg)" }
      };
    case "left":
      return {
        tooltip: { right: `calc(100% + ${offset}px)`, top: "50%", transform: "translateY(-50%)" },
        arrow: { right: `-${arrowSize - 1}px`, top: "50%", transform: "translateY(-50%) rotate(45deg)" }
      };
    case "right":
      return {
        tooltip: { left: `calc(100% + ${offset}px)`, top: "50%", transform: "translateY(-50%)" },
        arrow: { left: `-${arrowSize - 1}px`, top: "50%", transform: "translateY(-50%) rotate(45deg)" }
      };
  }
};

const getInitialAnimation = (
  position: "top" | "bottom" | "left" | "right",
  animation: "fade" | "scale" | "slide" | "bounce" | "rotate"
) => {
  const baseAnimation = { opacity: 0 };
  
  if (animation === "fade") return baseAnimation;
  
  if (animation === "scale") return { ...baseAnimation, scale: 0.8 };
  
  if (animation === "slide") {
    switch (position) {
      case "top": return { ...baseAnimation, y: 10 };
      case "bottom": return { ...baseAnimation, y: -10 };
      case "left": return { ...baseAnimation, x: 10 };
      case "right": return { ...baseAnimation, x: -10 };
    }
  }
  
  if (animation === "bounce") {
    switch (position) {
      case "top": return { ...baseAnimation, y: 10 };
      case "bottom": return { ...baseAnimation, y: -10 };
      case "left": return { ...baseAnimation, x: 10 };
      case "right": return { ...baseAnimation, x: -10 };
    }
  }
  
  if (animation === "rotate") {
    return { ...baseAnimation, rotate: 15, scale: 0.8 };
  }
  
  return baseAnimation;
};

const getExitAnimation = (
  position: "top" | "bottom" | "left" | "right",
  animation: "fade" | "scale" | "slide" | "bounce" | "rotate"
) => {
  const baseAnimation = { opacity: 0 };
  
  if (animation === "fade") return baseAnimation;
  
  if (animation === "scale") return { ...baseAnimation, scale: 0.8 };
  
  if (animation === "slide") {
    switch (position) {
      case "top": return { ...baseAnimation, y: -10 };
      case "bottom": return { ...baseAnimation, y: 10 };
      case "left": return { ...baseAnimation, x: -10 };
      case "right": return { ...baseAnimation, x: 10 };
    }
  }
  
  if (animation === "bounce") {
    return baseAnimation;
  }
  
  if (animation === "rotate") {
    return { ...baseAnimation, rotate: -15, scale: 0.8 };
  }
  
  return baseAnimation;
};

const getAnimateAnimation = (
  position: "top" | "bottom" | "left" | "right",
  animation: "fade" | "scale" | "slide" | "bounce" | "rotate"
) => {
  const baseAnimation = { opacity: 1 };
  
  if (animation === "fade") return baseAnimation;
  
  if (animation === "scale") return { ...baseAnimation, scale: 1 };
  
  if (animation === "slide") {
    return { ...baseAnimation, x: 0, y: 0 };
  }
  
  if (animation === "bounce") {
    return { ...baseAnimation, x: 0, y: 0 };
  }
  
  if (animation === "rotate") {
    return { ...baseAnimation, rotate: 0, scale: 1 };
  }
  
  return baseAnimation;
};

const getTransition = (
  animation: "fade" | "scale" | "slide" | "bounce" | "rotate",
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

export function AnimatedTooltip({
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
}: AnimatedTooltipProps) {
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
              animate={getAnimateAnimation(position, animation)}
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
              <div className={`p-2 rounded-md bg-gray-900 text-white text-xs shadow-lg text-center ${contentClassName}`}>
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
}