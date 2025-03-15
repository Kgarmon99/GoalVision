import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface SimpleAvatarProps {
  imagePath?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withBorder?: boolean;
  borderColor?: string;
  withShadow?: boolean;
  onClick?: () => void;
}

export function SimpleAvatar({
  imagePath = "/images/user.jpg",
  size = "md",
  className,
  withBorder = true,
  borderColor = "border-green-400",
  withShadow = true,
  onClick,
}: SimpleAvatarProps) {
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

  return (
    <div className={cn("relative", className)}>
      <Avatar 
        onClick={onClick}
        className={cn(
          sizeClasses[size], 
          borderClasses, 
          shadowClasses,
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
}