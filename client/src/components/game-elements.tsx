import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Award, Star, Gift, Zap } from 'lucide-react';
import '../styles/gamification.css';
import { useWindowSize } from 'react-use';
// @ts-ignore
import Confetti from 'react-confetti';

interface XPBarProps {
  current: number;
  total: number;
  level?: number;
  showLevel?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ current, total, level = 1, showLevel = true }) => {
  const percentage = Math.min(100, (current / total) * 100);
  
  return (
    <div className="flex items-center w-full">
      {showLevel && (
        <div className="level-badge mr-2">
          {level}
        </div>
      )}
      <div className="flex-1">
        <div className="xp-bar">
          <motion.div 
            className="xp-bar-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="text-xs text-yellow-300 flex justify-between">
          <span>XP: {current}/{total}</span>
          <span>Level {level}</span>
        </div>
      </div>
    </div>
  );
};

interface StatusBarProps {
  current: number;
  total: number;
  type: 'health' | 'mana';
  showLabel?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ current, total, type, showLabel = true }) => {
  const percentage = Math.min(100, (current / total) * 100);
  const barClass = type === 'health' ? 'health-bar' : 'mana-bar';
  const fillClass = type === 'health' ? 'health-bar-fill' : 'mana-bar-fill';
  const color = type === 'health' ? 'text-red-400' : 'text-blue-400';
  const label = type === 'health' ? 'HP' : 'MP';
  
  return (
    <div className="w-full">
      <div className={barClass}>
        <motion.div 
          className={fillClass}
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {showLabel && (
        <div className={`text-xs ${color} flex justify-between`}>
          <span>{label}: {current}/{total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};

interface RewardAnimationProps {
  amount: number;
  type: 'xp' | 'coins' | 'health' | 'mana';
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export const RewardAnimation: React.FC<RewardAnimationProps> = ({ 
  amount, 
  type, 
  position,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);
  let color = '';
  let prefix = '';
  
  switch(type) {
    case 'xp':
      color = 'text-yellow-300';
      prefix = '+';
      break;
    case 'coins':
      color = 'text-yellow-400';
      prefix = '+';
      break;
    case 'health':
      color = 'text-red-400';
      prefix = '+';
      break;
    case 'mana':
      color = 'text-blue-400';
      prefix = '+';
      break;
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!isVisible) return null;
  
  const style = position ? { 
    left: `${position.x}px`, 
    top: `${position.y}px` 
  } : {};
  
  return (
    <motion.div 
      className={`floating-indicator ${type} ${color}`}
      style={style}
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: -30 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
    >
      {prefix}{amount} {type === 'xp' ? 'XP' : type === 'coins' ? 'Gold' : ''}
    </motion.div>
  );
};

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
  className = ''
}) => {
  const priorityClass = 
    priority === 'high' ? 'high-priority' :
    priority === 'medium' ? 'medium-priority' : '';
  
  return (
    <motion.div 
      className={`quest-item ${completed ? 'completed' : ''} ${priorityClass} ${className}`}
      onClick={onClick}
      whileHover={{ x: 5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mr-3">
        <input 
          type="checkbox" 
          checked={completed} 
          onChange={() => onClick && onClick()} 
          className="game-checkbox"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold">{title}</h4>
        {description && <p className="text-xs text-gray-300">{description}</p>}
      </div>
      {reward && (
        <div className="flex items-center text-xs">
          {reward.xp && (
            <div className="flex items-center text-yellow-300 mr-2">
              <Star className="h-3 w-3 mr-1" />
              {reward.xp} XP
            </div>
          )}
          {reward.coins && (
            <div className="flex items-center text-yellow-400">
              <Gift className="h-3 w-3 mr-1" />
              {reward.coins} Gold
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

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
  icon = <Award className="h-5 w-5 text-yellow-300" />,
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
          className="achievement-popup"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        >
          <div className="achievement-icon">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-yellow-300">Achievement Unlocked!</h4>
            <p className="text-xs">{title}</p>
            {description && <p className="text-xs text-gray-300">{description}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
  const { width, height } = useWindowSize();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
      <Confetti
        width={width}
        height={height}
        numberOfPieces={500}
        recycle={false}
        colors={['#00ff00', '#ffcc00', '#ff33cc', '#3399ff', '#ff3333']}
      />
    </div>
  );
};

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
  avatar,
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
    <div className="game-card p-4">
      <div className="flex items-center mb-4">
        <div className="player-avatar w-12 h-12 mr-3">
          {avatar ? (
            <img src={avatar} alt="Player avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-green-500 font-bold">{name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold">{name}</h3>
          <div className="flex items-center text-xs">
            <div className="mr-2 flex items-center text-yellow-300">
              <Award className="h-3 w-3 mr-1" />
              {achievements}
            </div>
            <div className="flex items-center text-yellow-400">
              <Gift className="h-3 w-3 mr-1" />
              {gold}
            </div>
          </div>
        </div>
        <div className="level-badge">{level}</div>
      </div>
      
      <div className="space-y-2">
        <XPBar current={xp} total={nextLevelXp} level={level} showLevel={false} />
        <StatusBar current={health} total={maxHealth} type="health" />
        <StatusBar current={mana} total={maxMana} type="mana" />
      </div>
    </div>
  );
};

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
  className = '',
  ...props
}) => {
  let variantClass = '';
  switch(variant) {
    case 'primary':
      variantClass = 'game-button';
      break;
    case 'secondary':
      variantClass = 'game-button bg-indigo-900 border-indigo-500 text-indigo-300';
      break;
    case 'danger':
      variantClass = 'game-button bg-red-900 border-red-500 text-red-300';
      break;
  }
  
  let sizeClass = '';
  switch(size) {
    case 'sm':
      sizeClass = 'text-xs py-1 px-3';
      break;
    case 'md':
      sizeClass = 'text-sm py-2 px-4';
      break;
    case 'lg':
      sizeClass = 'text-base py-3 px-6';
      break;
  }
  
  const activeClass = isActive ? 'ring-2 ring-yellow-400 ring-opacity-50' : '';
  
  return (
    <button
      className={`${variantClass} ${sizeClass} ${activeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};