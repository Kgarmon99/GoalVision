
import React from 'react';
import { motion } from 'framer-motion';

interface ProfileImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20', 
    xl: 'w-32 h-32'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden rounded-full border-2 border-primary ${sizeClasses[size]} ${className}`}
    >
      <img 
        src="/images/profile.jpeg" 
        alt="Profile" 
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
};
