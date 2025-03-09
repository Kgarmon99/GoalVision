import { Button, ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";
import React, { ReactNode } from "react";

interface AnimatedButtonProps extends ButtonProps {
  icon?: ReactNode;
  animation?: "bounce" | "pulse" | "expand" | "shine" | "twist" | "hover" | "shadow" | "none";
  iconPosition?: "left" | "right";
  label?: string;
}

const buttonAnimations = {
  bounce: {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.98 }
  },
  pulse: {
    initial: { scale: 1 },
    hover: { scale: [1, 1.05, 1], transition: { duration: 0.8, repeat: Infinity, repeatType: "loop" as const } },
    tap: { scale: 0.98 }
  },
  expand: {
    initial: { width: "auto" },
    hover: { width: "auto", scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  },
  shine: {
    initial: { backgroundPosition: "-100% 0" },
    hover: { 
      backgroundPosition: "200% 0", 
      transition: { duration: 1.2, ease: "linear" },
      background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%) var(--primary)"
    },
    tap: { scale: 0.98 }
  },
  twist: {
    initial: { rotate: 0 },
    hover: { rotate: [0, -1, 1, -1, 0], transition: { duration: 0.5, ease: "easeInOut" } },
    tap: { scale: 0.98, rotate: 0 }
  },
  hover: {
    initial: { y: 0, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
    hover: { y: -3, boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.15)", transition: { duration: 0.2 } },
    tap: { y: 0, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }
  },
  shadow: {
    initial: { boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
    hover: { 
      boxShadow: [
        "0px 0px 0px rgba(22, 163, 74, 0)", 
        "0px 0px 15px rgba(22, 163, 74, 0.5)", 
        "0px 0px 0px rgba(22, 163, 74, 0)"
      ],
      transition: { duration: 1.5, repeat: Infinity, repeatType: "loop" as const }
    },
    tap: { scale: 0.98 }
  },
  none: {
    initial: {},
    hover: {},
    tap: { scale: 0.98 }
  }
};

export function AnimatedButton({
  children,
  icon,
  animation = "bounce",
  className = "",
  iconPosition = "left",
  label,
  asChild = false,
  ...props
}: AnimatedButtonProps) {
  // If using asChild, we need to properly handle single children only
  if (asChild) {
    // When asChild is true, just pass the child directly with properties
    return (
      <motion.div
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={buttonAnimations[animation]}
        className="inline-block"
      >
        <Button 
          className={`${className} relative overflow-hidden`}
          asChild={true}
          {...props}
        >
          {React.Children.only(children)}
        </Button>
      </motion.div>
    );
  }
  
  // Default usage when not using asChild
  const content = label || children;
  
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonAnimations[animation]}
      className="inline-block"
    >
      <Button 
        className={`${className} relative overflow-hidden`}
        {...props}
      >
        {iconPosition === "left" && icon && <span className="mr-2">{icon}</span>}
        {content}
        {iconPosition === "right" && icon && <span className="ml-2">{icon}</span>}
      </Button>
    </motion.div>
  );
}