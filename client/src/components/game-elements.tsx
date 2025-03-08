import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleEffect } from './ui/particle-effect';
import { Check, Trophy, Star, Coins, Heart, Droplet, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Avatar } from './ui/avatar';

// XP Progress Bar
interface XPBarProps {
  current: number;
  total: number;
  level?: number;
  showLevel?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ current, total, level = 1, showLevel = true }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const [showAnimation, setShowAnimation] = useState(false);
  const prevPercentageRef = useRef(0);
  
  useEffect(() => {
    if (percentage > prevPercentageRef.current) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
    prevPercentageRef.current = percentage;
  }, [percentage]);
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 items-center">
        <div className="flex gap-2 items-center">
          {showLevel && (
            <motion.div 
              className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {level}
            </motion.div>
          )}
          <div className="text-sm font-medium">XP Progress</div>
        </div>
        <div className="text-xs font-medium">{current}/{total} XP</div>
      </div>
      
      <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {showAnimation && (
          <div className="absolute inset-0">
            <ParticleEffect 
              type="sparkles"
              colors={['#10b981', '#34d399', '#6ee7b7']}
              count={20}
              particleSize={[2, 4]}
              duration={1500}
              areaWidth={Math.round(percentage * 0.01 * 100)}
              areaHeight={8}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Health/Mana Status Bar
interface StatusBarProps {
  current: number;
  total: number;
  type: 'health' | 'mana';
  showLabel?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ current, total, type, showLabel = true }) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const barColor = type === 'health' ? 'from-rose-500 to-red-600' : 'from-blue-500 to-indigo-600';
  const iconColor = type === 'health' ? 'text-rose-500' : 'text-blue-500';
  const icon = type === 'health' ? <Heart className={`w-4 h-4 ${iconColor}`} /> : <Droplet className={`w-4 h-4 ${iconColor}`} />;
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 items-center">
          <div className="flex gap-1 items-center">
            {icon}
            <div className="text-xs font-medium">{type === 'health' ? 'Health' : 'Energy'}</div>
          </div>
          <div className="text-xs font-medium">{current}/{total}</div>
        </div>
      )}
      
      <motion.div 
        className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>
    </div>
  );
};

// Reward Animation
interface RewardAnimationProps {
  amount: number;
  type: 'xp' | 'coins' | 'health' | 'mana';
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export const RewardAnimation: React.FC<RewardAnimationProps> = ({ 
  amount, 
  type, 
  position = { x: 0, y: 0 },
  onComplete 
}) => {
  const typeIcons = {
    xp: <Star className="w-4 h-4 text-yellow-400" />,
    coins: <Coins className="w-4 h-4 text-yellow-500" />,
    health: <Heart className="w-4 h-4 text-rose-500" />,
    mana: <Droplet className="w-4 h-4 text-blue-500" />
  };
  
  const typeColors = {
    xp: ['#eab308', '#fbbf24', '#fcd34d'],
    coins: ['#f59e0b', '#fbbf24', '#fcd34d'],
    health: ['#e11d48', '#f43f5e', '#fb7185'],
    mana: ['#3b82f6', '#60a5fa', '#93c5fd']
  };
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50 flex items-center gap-1 font-bold text-white px-2 py-1 rounded-md shadow-lg"
      style={{ 
        left: position.x, 
        top: position.y,
        backgroundColor: typeColors[type][0] 
      }}
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ opacity: 1, scale: 1.2, y: -20 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={() => onComplete?.()}
    >
      {typeIcons[type]}
      <span>+{amount}</span>
      
      <div className="absolute inset-0 overflow-hidden">
        <ParticleEffect 
          type="sparkles" 
          colors={typeColors[type]} 
          count={10} 
          particleSize={[2, 3]}
          duration={800}
        />
      </div>
    </motion.div>
  );
};

// Quest Item/Task
interface QuestItemProps {
  title: string;
  description?: string;
  completed?: boolean | null;
  priority?: 'low' | 'medium' | 'high';
  reward?: {
    xp?: number;
    coins?: number;
  };
  onClick?: () => void;
  className?: string;
}

export const QuestItem: React.FC<QuestItemProps> = ({
  title,
  description,
  completed = false,
  priority = 'medium',
  reward,
  onClick,
  className
}) => {
  const priorityColors = {
    low: 'border-l-blue-400',
    medium: 'border-l-amber-400',
    high: 'border-l-rose-500'
  };
  
  const completedClass = completed ? 'bg-primary/10 opacity-80' : '';
  
  return (
    <motion.div 
      className={cn(
        'border rounded-md p-3 mb-2 cursor-pointer border-l-4 transition-all hover:shadow-md',
        priorityColors[priority],
        completedClass,
        className
      )}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex justify-between">
        <div className="flex gap-2 items-start">
          <div className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
            completed ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'
          )}>
            {completed && <Check className="w-3 h-3 text-white" />}
          </div>
          
          <div>
            <h4 className={cn(
              'font-medium',
              completed ? 'line-through text-muted-foreground' : ''
            )}>
              {title}
            </h4>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {reward && (
          <div className="flex flex-col gap-1">
            {reward.xp && (
              <div className="flex items-center gap-1 text-xs bg-yellow-500/10 px-2 py-0.5 rounded">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{reward.xp} XP</span>
              </div>
            )}
            {reward.coins && (
              <div className="flex items-center gap-1 text-xs bg-amber-500/10 px-2 py-0.5 rounded">
                <Coins className="w-3 h-3 text-amber-500" />
                <span>{reward.coins}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Achievement Popup
interface AchievementProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const Achievement: React.FC<AchievementProps> = ({
  title,
  description,
  icon = <Trophy className="w-8 h-8 text-yellow-500" />,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-yellow-600 to-amber-500 text-white p-4 rounded-lg shadow-lg max-w-sm"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="flex gap-3">
            <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
              {icon}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
              <h4 className="font-medium">{title}</h4>
              {description && (
                <p className="text-sm text-white/80 mt-1">{description}</p>
              )}
            </div>
            
            <button 
              className="text-white/60 hover:text-white self-start"
              onClick={onClose}
            >
              &times;
            </button>
          </div>
          
          <div className="absolute -inset-1 overflow-hidden rounded-lg pointer-events-none">
            <ParticleEffect 
              type="sparkles" 
              colors={['#fef08a', '#fcd34d', '#fbbf24']} 
              count={30} 
              particleSize={[2, 4]}
              duration={5000}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Celebration Animation for Milestone
interface CelebrationProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

export const Celebration: React.FC<CelebrationProps> = ({
  isActive, 
  duration = 5000,
  onComplete
}) => {
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);
  
  return (
    <AnimatePresence>
      {isActive && (
        <>
          <motion.div 
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ParticleEffect 
              type="confetti" 
              count={200} 
              speed={2}
              duration={duration}
            />
          </motion.div>
          
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.8, 1] }}
              >
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-4 rounded-full">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              
              <motion.div
                className="absolute -inset-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -bottom-2 -left-2 animate-pulse" style={{ animationDelay: "0.5s" }} />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Player Stats Panel
interface PlayerStatProps {
  name: string;
  avatar?: string | null;
  level: number;
  xp: number;
  nextLevelXp: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  achievements?: number;
}

export const PlayerStats: React.FC<PlayerStatProps> = ({
  name,
  avatar = null,
  level,
  xp,
  nextLevelXp,
  health,
  maxHealth,
  mana,
  maxMana,
  gold,
  achievements = 0
}) => {
  return (
    <motion.div 
      className="bg-background border rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-primary">
            <img src={avatar || '/images/profiles/default-avatar.svg'} alt={name} />
          </Avatar>
          
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5">
                Level {level}
              </div>
              {achievements > 0 && (
                <div className="bg-amber-500/20 text-amber-500 text-xs rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {achievements}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <XPBar current={xp} total={nextLevelXp} level={level} showLevel={false} />
          <StatusBar current={health} total={maxHealth} type="health" />
          <StatusBar current={mana} total={maxMana} type="mana" />
          
          <div className="flex items-center gap-1 mt-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{gold} Gold</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Game-styled Button
interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isActive = false,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary text-white',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-500 text-white'
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  };
  
  const activeClass = isActive ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-background' : '';
  
  return (
    <Button
      className={cn(
        'relative font-medium rounded-md border-b-4 border-black/20 shadow-lg transform active:translate-y-1 active:border-b-0 transition-all',
        variantClasses[variant],
        sizeClasses[size],
        activeClass,
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-md opacity-20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-white/20" />
      </div>
    </Button>
  );
};