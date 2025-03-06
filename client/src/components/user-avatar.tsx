
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={`player-avatar ${className || ""}`}>
      <AvatarImage src="/images/user-profile.jpeg" alt="Kahlil Garmon" />
      <AvatarFallback>KG</AvatarFallback>
    </Avatar>
  );
}
import React from 'react';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 'md', 
  showBorder = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${className} relative inline-block`}>
      <img 
        src="/images/kahlil-profile.jpeg" 
        alt="Kahlil Garmon" 
        className={`${sizeClasses[size]} rounded-full ${showBorder ? 'border border-green-400' : ''}`}
      />
    </div>
  );
};

export default UserAvatar;
