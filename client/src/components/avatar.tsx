import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

// Core avatar props shared across all variants
interface AvatarBaseProps {
  imagePath?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withBorder?: boolean;
  borderColor?: string;
  withShadow?: boolean;
  onClick?: () => void;
}

// Extended props for animated variants
interface EnhancedAvatarProps extends AvatarBaseProps {
  variant?: "simple" | "profile" | "animated";
  animation?: "pulse" | "bounce" | "spin" | "float" | "glow" | "morph";
  isInteractive?: boolean;
}

// Size mapping utility
const getSizeClasses = (size: string) => {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };
  return sizes[size as keyof typeof sizes] || sizes.md;
};

// Border style utility
const getBorderClasses = (withBorder: boolean, borderColor: string) => {
  return withBorder ? `border-2 ${borderColor}` : "";
};

// Shadow style utility
const getShadowClasses = (withShadow: boolean) => {
  return withShadow ? "shadow-lg shadow-green-500/20" : "";
};

// Animation variants utility
const getAnimationVariants = (animation: string) => {
  switch (animation) {
    case "pulse":
      return {
        animate: {
          scale: [1, 1.05, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }
        }
      };
    case "bounce":
      return {
        animate: {
          y: [0, -10, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          }
        }
      };
    case "spin":
      return {
        animate: {
          rotate: 360,
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }
        }
      };
    case "float":
      return {
        animate: {
          y: [0, -8, 0],
          x: [0, 4, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }
        }
      };
    case "glow":
      return {
        animate: {
          boxShadow: [
            "0 0 0 rgba(74, 222, 128, 0)",
            "0 0 20px rgba(74, 222, 128, 0.5)",
            "0 0 0 rgba(74, 222, 128, 0)",
          ],
          transition: {
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }
        }
      };
    case "morph":
      return {
        animate: {
          borderRadius: ["50%", "40% 60% 60% 40% / 60% 30% 70% 40%", "50%"],
          transition: {
            duration: 5,
            repeat: Infinity,
            repeatType: "loop",
          }
        }
      };
    default:
      return {};
  }
};

// Hover animation utility
const getHoverAnimation = (isInteractive: boolean, animation: string) => {
  if (!isInteractive) return {};
  
  return {
    scale: 1.1,
    rotate: animation === "spin" ? 360 : 0,
    transition: { duration: 0.3 }
  };
};

// Simple avatar renderer
const renderSimpleAvatar = (props: EnhancedAvatarProps) => {
  const {
    imagePath = "/images/user.jpeg",
    size = "md",
    className,
    withBorder = true,
    borderColor = "border-green-400",
    withShadow = true,
    onClick,
  } = props;

  const sizeClass = getSizeClasses(size);
  const borderClass = getBorderClasses(withBorder, borderColor);
  const shadowClass = getShadowClasses(withShadow);

  return (
    <div className={cn("relative", className)}>
      <Avatar 
        onClick={onClick}
        className={cn(
          sizeClass, 
          borderClass, 
          shadowClass,
          "overflow-hidden",
          onClick && "cursor-pointer hover:scale-105 transition-transform"
        )}
      >
        <AvatarImage src={imagePath} alt="User photo" />
        <AvatarFallback>
          <User className="w-6 h-6" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

// Profile picture renderer (simpler version)
const renderProfileAvatar = (props: EnhancedAvatarProps) => {
  const { className, onClick, imagePath = "/images/profiles/user-photo.jpeg" } = props;
  
  return (
    <div 
      className={cn(
        "w-16 h-16 rounded-full border-2 border-green-400 shadow-lg shadow-green-500/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform",
        className
      )}
      onClick={onClick}
    >
      <img 
        src={imagePath}
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

// Animated avatar renderer
const renderAnimatedAvatar = (props: EnhancedAvatarProps) => {
  const {
    imagePath = "/images/profiles/user-photo.jpeg",
    size = "md",
    animation = "float",
    className,
    withBorder = true,
    borderColor = "border-green-400",
    withShadow = true,
    onClick,
    isInteractive = true,
  } = props;

  const [isHovered, setIsHovered] = useState(false);
  const sizeClass = getSizeClasses(size);
  const borderClass = getBorderClasses(withBorder, borderColor);
  const shadowClass = getShadowClasses(withShadow);
  const animationVariants = getAnimationVariants(animation || "float");
  const hoverAnimation = getHoverAnimation(isInteractive || false, animation || "float");

  return (
    <AnimatePresence>
      <motion.div
        className={cn("relative", className)}
        {...animationVariants}
        whileHover={hoverAnimation}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <Avatar className={cn(
          sizeClass, 
          borderClass, 
          shadowClass,
          "overflow-hidden",
          isInteractive && "cursor-pointer"
        )}>
          <AvatarImage src={imagePath} alt="User photo" />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        
        {animation === "glow" && (
          <div className="absolute inset-0 -z-10 bg-green-500/10 rounded-full blur-xl" />
        )}
        
        {isHovered && isInteractive && (
          <motion.div 
            className="absolute inset-0 bg-green-500/10 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Main component to export
export function EnhancedAvatar(props: EnhancedAvatarProps) {
  const { variant = "simple" } = props;
  
  switch (variant) {
    case "profile": 
      return renderProfileAvatar(props);
    case "animated": 
      return renderAnimatedAvatar(props);
    case "simple":
    default:
      return renderSimpleAvatar(props);
  }
}