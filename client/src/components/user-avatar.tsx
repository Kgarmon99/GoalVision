import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  fallback?: string;
  showStatus?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({ 
  className,
  fallback = "KG",
  showStatus = false,
  size = "md",
}: UserAvatarProps) {
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  };

  // Set avatar size class
  const avatarClass = cn(
    sizeClasses[size],
    className
  );
  
  return (
    <div className="relative">
      <Avatar className={avatarClass}>
        <AvatarImage src="/images/profile/user-profile.jpeg" alt="Kahlil Garmon" />
        <AvatarFallback className="bg-gray-800 text-green-400 font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <span className="absolute bottom-0 right-0 block rounded-full bg-green-500 ring-2 ring-white"
          style={{
            width: size === "sm" ? "8px" : size === "md" ? "10px" : size === "lg" ? "12px" : "14px",
            height: size === "sm" ? "8px" : size === "md" ? "10px" : size === "lg" ? "12px" : "14px",
          }}>
        </span>
      )}
    </div>
  );
}