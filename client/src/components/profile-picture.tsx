import React from "react";
import { cn } from "@/lib/utils";

interface ProfilePictureProps {
  className?: string;
  onClick?: () => void;
}

export function ProfilePicture({ className, onClick }: ProfilePictureProps) {
  return (
    <div 
      className={cn(
        "w-16 h-16 rounded-full border-2 border-green-400 shadow-lg shadow-green-500/20 overflow-hidden cursor-pointer hover:scale-105 transition-transform",
        className
      )}
      onClick={onClick}
    >
      <img 
        src="/images/user.jpeg" 
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}