import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  fallback?: string;
  showStatus?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

export function UserAvatar({ 
  className,
  fallback = "KG",
  showStatus = false,
  size = "md"
}: UserAvatarProps) {
  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], "border-2 border-primary", className)}>
        <AvatarImage src="/images/profile/user-profile.jpeg" alt="User profile" />
        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
      )}
    </div>
  );
}