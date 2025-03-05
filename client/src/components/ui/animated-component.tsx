import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variant } from "framer-motion";

type AnimationType = 
  | "fadeIn" 
  | "slideIn" 
  | "popIn" 
  | "bounceIn" 
  | "expandIn" 
  | "pulseIn"
  | "shimmer"
  | "wiggle"
  | "heartbeat"
  | "highlight";

type AnimationDirection = "up" | "down" | "left" | "right";

interface AnimatedComponentProps {
  children: React.ReactNode;
  animation: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  className?: string;
  isVisible?: boolean;
  onClick?: () => void;
  iterationCount?: number | "infinite";
  animateOnHover?: boolean;
  onAnimationComplete?: () => void;
}

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const slideVariants = {
  up: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 }
  },
  down: {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 }
  },
  left: {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  },
  right: {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 }
  }
};

const popVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

const bounceVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  exit: { y: 20, opacity: 0 }
};

const expandVariants = {
  hidden: { scaleX: 0, opacity: 0, originX: 0 },
  visible: { scaleX: 1, opacity: 1, originX: 0 },
  exit: { scaleX: 0, opacity: 0, originX: 0 }
};

const pulseVariants = {
  hidden: { scale: 1 },
  visible: { 
    scale: [1, 1.05, 1],
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 1.5
    }
  },
  exit: { scale: 1 }
};

const shimmerVariants = {
  hidden: { 
    backgroundPosition: "0% 50%",
    backgroundSize: "200% 100%",
    backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)"
  },
  visible: { 
    backgroundPosition: "100% 50%",
    backgroundSize: "200% 100%",
    backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)",
    transition: {
      repeat: Infinity,
      duration: 1.5
    }
  },
  exit: { 
    backgroundPosition: "0% 50%",
    backgroundSize: "200% 100%",
    backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)"
  }
};

const wiggleVariants = {
  hidden: { rotate: 0 },
  visible: { 
    rotate: [0, -3, 3, -3, 0],
    transition: {
      repeat: Infinity,
      repeatType: "mirror",
      duration: 0.5,
      repeatDelay: 5
    }
  },
  exit: { rotate: 0 }
};

const heartbeatVariants = {
  hidden: { scale: 1 },
  visible: { 
    scale: [1, 1.12, 1, 1.08, 1],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 1,
      repeatDelay: 1.5,
      times: [0, 0.25, 0.35, 0.45, 0.55]
    }
  },
  exit: { scale: 1 }
};

const highlightVariants = {
  hidden: { 
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    backgroundColor: "rgba(74, 222, 128, 0)"
  },
  visible: { 
    boxShadow: "0 0 15px rgba(74, 222, 128, 0.5)",
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    transition: {
      repeat: 3,
      repeatType: "reverse",
      duration: 0.7
    }
  },
  exit: { 
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    backgroundColor: "rgba(74, 222, 128, 0)"
  }
};

export function AnimatedComponent({
  children,
  animation,
  direction = "up",
  duration = 0.5,
  delay = 0,
  className = "",
  isVisible = true,
  onClick,
  iterationCount = 1,
  animateOnHover = false,
  onAnimationComplete
}: AnimatedComponentProps) {
  const [shouldAnimate, setShouldAnimate] = useState(!animateOnHover);
  const [currentVariant, setCurrentVariant] = useState<"hidden" | "visible" | "exit">(
    isVisible ? "visible" : "hidden"
  );

  // Update variant when isVisible changes
  useEffect(() => {
    setCurrentVariant(isVisible ? "visible" : "hidden");
  }, [isVisible]);

  // Get the appropriate animation variants based on the animation type
  const getVariants = () => {
    switch (animation) {
      case "fadeIn":
        return fadeVariants;
      case "slideIn":
        return slideVariants[direction];
      case "popIn":
        return popVariants;
      case "bounceIn":
        return bounceVariants;
      case "expandIn":
        return expandVariants;
      case "pulseIn":
        return pulseVariants;
      case "shimmer":
        return shimmerVariants;
      case "wiggle":
        return wiggleVariants;
      case "heartbeat":
        return heartbeatVariants;
      case "highlight":
        return highlightVariants;
      default:
        return fadeVariants;
    }
  };

  const getCustomTransition = () => {
    const baseTransition = {
      duration,
      delay,
      ease: "easeOut"
    };

    if (iterationCount === "infinite") {
      return {
        ...baseTransition,
        repeat: Infinity,
        repeatType: "loop" as const
      };
    } else if (iterationCount > 1) {
      return {
        ...baseTransition,
        repeat: iterationCount - 1,
        repeatType: "loop" as const
      };
    }

    return baseTransition;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial="hidden"
        animate={shouldAnimate ? currentVariant : "hidden"}
        exit="exit"
        variants={getVariants()}
        transition={getCustomTransition()}
        onClick={onClick}
        onHoverStart={() => animateOnHover && setShouldAnimate(true)}
        onHoverEnd={() => animateOnHover && setShouldAnimate(false)}
        onAnimationComplete={() => {
          if (onAnimationComplete && currentVariant === "visible") {
            onAnimationComplete();
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}