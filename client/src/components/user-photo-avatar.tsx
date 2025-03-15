import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserPhotoAvatarProps {
  imagePath?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animation?: "pulse" | "bounce" | "spin" | "float" | "glow" | "morph";
  className?: string;
  withBorder?: boolean;
  borderColor?: string;
  withShadow?: boolean;
  onClick?: () => void;
  isInteractive?: boolean;
}

export function UserPhotoAvatar({
  imagePath = "/images/user.svg",
  size = "md",
  animation = "float",
  className,
  withBorder = true,
  borderColor = "border-green-400",
  withShadow = true,
  onClick,
  isInteractive = true,
}: UserPhotoAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Reset animation when props change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [animation]);

  // Size mappings
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  // Border classes
  const borderClasses = withBorder 
    ? `border-2 ${borderColor}` 
    : "";

  // Shadow classes
  const shadowClasses = withShadow 
    ? "shadow-lg shadow-green-500/20" 
    : "";

  // Animation variants
  const getAnimationVariants = () => {
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

  // Hover animation
  const hoverAnimation = isInteractive ? {
    scale: 1.1,
    rotate: animation === "spin" ? 360 : 0,
    transition: { duration: 0.3 }
  } : {};

  return (
    <AnimatePresence>
      <motion.div
        key={animationKey}
        className={cn("relative", className)}
        {...getAnimationVariants()}
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
          sizeClasses[size], 
          borderClasses, 
          shadowClasses,
          "overflow-hidden",
          isInteractive && "cursor-pointer"
        )}>
          <AvatarImage src={imagePath} alt="User photo" />
          <AvatarFallback>
            <User className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        
        {/* Decorative elements for enhanced visual effect */}
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
}