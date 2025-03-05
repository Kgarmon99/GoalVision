import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Award, Star, Gift, Zap, Sparkles, Trophy, 
  Flame, Shield, Swords, Skull, Crown, ChevronUp, 
  Palette, Smartphone, Bot, Lightbulb, Gem, Target,
  HeartPulse, Puzzle, ArrowUpRight, Bolt, TrendingUp, 
  Medal, Bell, LucideIcon
} from 'lucide-react';
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
          checked={completed || false} 
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

// New Gamification Components below

interface ItemCardProps {
  name: string;
  description?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
  }[];
  onClick?: () => void;
  className?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  name,
  description,
  rarity,
  icon = <Gem className="h-6 w-6" />,
  stats,
  onClick,
  className = ''
}) => {
  const rarityIcons = {
    common: <></>,
    uncommon: <Sparkles className="h-3 w-3 text-green-400" />,
    rare: <Zap className="h-3 w-3 text-purple-400" />,
    epic: <Flame className="h-3 w-3 text-pink-400" />,
    legendary: <Crown className="h-3 w-3 text-yellow-400" />
  };

  return (
    <motion.div 
      className={`item-card ${rarity} ${className}`}
      onClick={onClick}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-start mb-2">
        <div className="flex-shrink-0 mr-3">
          <div className={`p-2 rounded-lg bg-opacity-20 bg-black`}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h4 className="text-sm font-bold mr-2">{name}</h4>
            <div className={`rarity-badge ${rarity}`}>
              {rarityIcons[rarity]} {rarity}
            </div>
          </div>
          {description && <p className="text-xs text-gray-300">{description}</p>}
        </div>
      </div>
      
      {stats && stats.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{stat.label}:</span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

interface SkillTreeProps {
  skills: {
    id: string;
    name: string;
    description?: string;
    icon: React.ReactNode;
    unlocked: boolean;
    position: number; // 0 to 100 - percent position from top to bottom
    onUnlock?: () => void;
  }[];
}

export const SkillTree: React.FC<SkillTreeProps> = ({ skills }) => {
  return (
    <div className="skill-tree">
      {skills.map((skill) => (
        <div 
          key={skill.id} 
          className="skill-node"
          style={{ marginTop: `${skill.position}%` }}
        >
          <motion.div 
            className={`skill-icon ${skill.unlocked ? 'unlocked' : 'locked'}`}
            onClick={() => skill.unlocked && skill.onUnlock && skill.onUnlock()}
            whileHover={skill.unlocked ? { scale: 1.1 } : undefined}
            title={skill.description || skill.name}
          >
            {skill.icon}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

interface AvatarCustomizerProps {
  avatars: {
    id: string;
    name: string;
    image: string;
    unlocked: boolean;
  }[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  avatars,
  selectedId,
  onSelect
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {avatars.map((avatar) => (
        <div key={avatar.id} className="flex flex-col items-center">
          <div 
            className={`avatar-slot ${selectedId === avatar.id ? 'ring-2 ring-yellow-400' : ''} ${!avatar.unlocked ? 'opacity-40' : ''}`}
            onClick={() => avatar.unlocked && onSelect(avatar.id)}
          >
            {avatar.image ? (
              <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-content">
                <span>{avatar.name.charAt(0)}</span>
              </div>
            )}
            
            <div className="avatar-overlay">
              {!avatar.unlocked ? (
                <Shield className="h-6 w-6 text-gray-400" />
              ) : (
                <Check className="h-6 w-6 text-green-400" />
              )}
            </div>
          </div>
          <span className="text-xs mt-2">{avatar.name}</span>
        </div>
      ))}
    </div>
  );
};

interface CharacterStatsProps {
  stats: {
    name: string;
    value: number;
    max: number;
    bonus?: number;
    icon?: React.ReactNode;
  }[];
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({ stats }) => {
  return (
    <div className="stat-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-name">
            {stat.icon && <span className="mr-1">{stat.icon}</span>} 
            {stat.name}
          </div>
          <div className="stat-value">
            {stat.value}
            {stat.bonus && stat.bonus !== 0 && (
              <span className="stat-bonus">
                {stat.bonus > 0 ? `+${stat.bonus}` : stat.bonus}
              </span>
            )}
          </div>
          <div className="stat-bar">
            <div 
              className="stat-bar-fill" 
              style={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

interface DailyChallengeProps {
  title: string;
  description: string;
  rewards: {
    type: 'xp' | 'gold' | 'item';
    amount: number;
    name?: string;
  }[];
  completed?: boolean;
  onClick?: () => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  title,
  description,
  rewards,
  completed = false,
  onClick
}) => {
  const iconMap = {
    xp: <Star className="h-3 w-3 text-yellow-300" />,
    gold: <Gift className="h-3 w-3 text-yellow-400" />,
    item: <Gem className="h-3 w-3 text-purple-400" />
  };

  return (
    <motion.div 
      className={`daily-challenge ${completed ? 'opacity-70' : ''}`}
      onClick={onClick}
      whileHover={{ y: -3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="daily-challenge-title">{title}</h4>
          <p className="daily-challenge-description">{description}</p>
        </div>
        {completed && (
          <div className="bg-purple-900 bg-opacity-30 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500">
            Completed
          </div>
        )}
      </div>
      
      <div className="daily-challenge-reward">
        {rewards.map((reward, index) => (
          <div key={index} className="reward-item">
            <div className="reward-icon">
              {iconMap[reward.type]}
            </div>
            <span>
              {reward.amount} {reward.type === 'xp' ? 'XP' : reward.type === 'gold' ? 'Gold' : reward.name}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

interface ComboCounterProps {
  count: number;
  isActive: boolean;
  onComplete?: () => void;
}

export const ComboCounter: React.FC<ComboCounterProps> = ({
  count,
  isActive,
  onComplete
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isActive && count > 1) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [count, isActive, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div className="combo-counter">
      {count}x COMBO!
    </div>
  );
};

interface CriticalSuccessProps {
  position: { x: number; y: number };
  isActive: boolean;
  onComplete?: () => void;
}

export const CriticalSuccess: React.FC<CriticalSuccessProps> = ({
  position,
  isActive,
  onComplete
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div 
      className="critical-success"
      style={{ 
        left: position.x - 50, 
        top: position.y - 50 
      }}
    />
  );
};

interface GameNotificationProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const GameNotification: React.FC<GameNotificationProps> = ({
  title,
  message,
  icon = <Bell className="h-5 w-5 text-yellow-300" />,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5500); // 5s for display + 0.5s for animation
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="game-notification"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="notification-content">
            <div className="notification-icon">
              {icon}
            </div>
            <div className="notification-text">
              <div className="notification-title">{title}</div>
              <div className="notification-message">{message}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LeaderboardProps {
  entries: {
    id: string;
    name: string;
    avatar?: string;
    score: number;
    isCurrentUser?: boolean;
  }[];
  title?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  title = "Top Achievers"
}) => {
  // Sort entries by score in descending order
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);
  
  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        {title}
      </div>
      {sortedEntries.map((entry, index) => (
        <div key={entry.id} className={`leaderboard-item ${entry.isCurrentUser ? 'current-user' : ''}`}>
          <div className={`leaderboard-rank ${index < 3 ? `top-${index + 1}` : ''}`}>
            {index + 1}
          </div>
          <div className="leaderboard-player">
            <div className="leaderboard-player-avatar">
              {entry.avatar ? (
                <img src={entry.avatar} alt={entry.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-green-500 text-xs font-bold">{entry.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <span className="leaderboard-player-name">{entry.name}</span>
          </div>
          <div className="leaderboard-score">{entry.score.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

interface EnhancedProgressCardProps {
  title: string;
  description?: string;
  current: number;
  target: number;
  level?: number;
  daysLeft?: number;
  completed?: boolean;
  category?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const EnhancedProgressCard: React.FC<EnhancedProgressCardProps> = ({
  title,
  description,
  current,
  target,
  level = 1,
  daysLeft,
  completed = false,
  category,
  icon = <Target className="h-5 w-5" />,
  className = '',
  onClick
}) => {
  const percentage = Math.min(100, Math.floor((current / target) * 100));
  
  // Determine status color based on percentage
  let statusColor = 'text-blue-400';
  if (percentage >= 100) {
    statusColor = 'text-green-500';
  } else if (percentage >= 75) {
    statusColor = 'text-green-400';
  } else if (percentage >= 50) {
    statusColor = 'text-yellow-400';
  } else if (percentage >= 25) {
    statusColor = 'text-orange-400';
  } else {
    statusColor = 'text-red-400';
  }
  
  return (
    <motion.div 
      className={`progress-card p-4 ${completed ? 'completed' : ''} ${className}`}
      onClick={onClick}
      whileHover={{ y: -5 }}
    >
      <div className="progress-glow"></div>
      
      <div className="flex items-start mb-3">
        <div className="mr-3 p-2 rounded-lg bg-black bg-opacity-30">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">{title}</h3>
            {level && <div className="level-badge">{level}</div>}
          </div>
          
          {description && (
            <p className="text-xs text-gray-300 mt-1">{description}</p>
          )}
          
          {category && (
            <div className="text-xs text-purple-400 mt-1">
              {category}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="w-full rounded-full h-2 bg-gray-800">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <div className={statusColor}>
            {current} / {target} ({percentage}%)
          </div>
          
          {daysLeft !== undefined && (
            <div className={daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-gray-400'}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
            </div>
          )}
        </div>
      </div>
      
      {completed && (
        <div className="mt-3 pt-2 border-t border-gray-700 text-center">
          <div className="flex items-center justify-center text-green-500 text-xs font-medium">
            <Check className="h-3 w-3 mr-1" />
            COMPLETED
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Sound effects helper for gamification
interface GameSoundHook {
  playSound: (sound: string) => void;
  muted: boolean;
  toggleMute: () => void;
}

export const useGameSounds = (): GameSoundHook => {
  const soundRefs = {
    achievement: useRef<HTMLAudioElement | null>(null),
    levelUp: useRef<HTMLAudioElement | null>(null),
    taskComplete: useRef<HTMLAudioElement | null>(null),
    reward: useRef<HTMLAudioElement | null>(null),
    error: useRef<HTMLAudioElement | null>(null),
    buttonClick: useRef<HTMLAudioElement | null>(null)
  };

  const [muted, setMuted] = useState(true);

  useEffect(() => {
    // Only create audio elements on client-side
    if (typeof window !== 'undefined') {
      // Using base64 encoded small sound effects to avoid external file dependencies
      // You can replace these with actual file paths if you prefer
      const achievementSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGhgC1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAXYAAAAAAAABobZbRDuAAAAAAD/+9RkAA/yYDjGIyTZAAANIAAAAQAAAnf6AMZjAAANAMAAAAQm+8ePHjx48ePHiwIAAAAAEsHj/gQD+Dl/8ED//gwD/L/8H//ygD/AODn/5f/gQDg5/wf//4ODn/5/+XyQc/58HB//4OA4Py/wf//5fL5fL4P//+X///AAAAAKqqqqaapbIq95llmmSJLAEDoE5MCgDCIA1CY4HQGAMCAwATWsDgDBAPAM7cOAIC6A1gxmwDAKAcAwTgXADAMAMG0G4DRhAZAaA+AxMwiAUBUEYVgZOYHABgKA6EYNgMA6AUCoLQGjyB4C4VQXANKcIQIgaCkBQvAODkIgFimCYOQGBCBIBrJhMCsO4OgPANXkKA5AwAUAwBw3BUD4GAwDQPg3BMCgAgvByB4BgShhAwAwUA+CoPAJAeAIAwxAKGYMhkHwXV1V//rqpgAgAAAzU3VKqvXb/3d3L93yADDJDLAuMESQxxdDUIeMB+gNDATsGM0awwFTESUTg0cBAQsNInIMHSQEAyAAwVAEQMMFlJVpuX7v333fVUAAAKfnW6rTmS6lRvMsURFgwcRDmwICJZMCF4wKCjLCxMkmYxcfjBgBMfCEw2dTDwCCgAMTiAwMNDARlU3PiQCCpgEDGEAWFAEM2IYwoHDFwBMOAMMAQwcCTGBrAhCY1EpjcnnlVq9d3d//uvgGAKRk3W7rS6bTmS7VZWyyIwF8RQIGAp+YPFhhgWGZmeZMMxi8VGSDoZgNpl4PhALGExEYyDBiYKzP//+7+79UZXAAAAQWpjcpOLNSXJJ/xnFpCQ4ODRAAcEjCYpMaEswwVTEw5MLgkEgMYGEAGDRgESGBwoY2BgEBhhQCmHASYMH5h0GgtMmBjrS0vv693r//dVUAAALTuoW53UVFoJBKxRUiiyiIjAAuMCCEzKITHIVMTiAw2JDN6DMWjAxCPzMRcNHhAwgGzCwVMLBMDAQYHBRgwFMRUQoAswy4w8HQeLEAAD4AANaW7rXeqr//6qqAAAgKlOSlrdaXZOTZJZb5lkuIjKIUQgMKAQwCLjIwlMPgQwWHzJQ5MOiowqLDJgUMmjowyEwIAGBQGYSCwGDphsElTVKv//u97+6gAABBqndQl13Ut5LSpZS3mssoiMxFYjMAFDDRZMXCQw+JjDYtMRkIySMjPJPNHiYOCRgMGmARcYLFJiUYlTP/+/f9/dQAAAKqO7lKrVUpJKXOLRVa0kjRWokPdAdNAEgIBAQAwqAigEAAiAQKBQ+EgKLgoHAAFBQJGA4QAAENAQfB4MBBuTqAAACAABQGEgOAgcGAQLgYSAhIBhICgkMCQMCgQFAgeBwoJCQUBAUCBIcAgQJAYQAgIAAYQAoeGB4ZAgEAgEBwQHgoPBgcCwoCAQHCQYIGjv//////////////////////////////////////////////////////////////////////////////////4P/////////////////////////////////////////////////////////////////+lQxZEQAAAMGdMxmk0QhRPdS7CwAKfR0IXixKDRX/+9BkAvnwAABoAAAAAA0AAAAAAAAHEQAAAgAAA0gAAABECBQQEAANvZgIZACgMUFDYFEAJpGlxoTgYQAIgANAcMCCwVCIUAQFBoIDQPEAUCdWQ4DAADBIKMClxQEDEQMHAgxEEhoBsAJIjKURHhAUaO+qqjLiJuP/yczLiJiP//3S4iYXFzIzMy4ucXMXBEajMAAAgAAAAAAIAM';
      const levelUpSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGhgC1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAXMAAAAAAAABoa7KI2uAAAAAAD/+7RkAA/wAABoAAAAAAAADSAAAAAAwOcoeQABNIAAAMIAAAAEm+8ePHjx48ePHiwIAAAAAEsHj/gQD+Dl/8ED//gwD/L/8H//ygD/AODn/5f/gQDg5/wf//4ODn/5/+XyQc/58HB//4OA4Py/wf//5fL5fL4P//+X///AAAAAAA4jv+w4cP//gOI//h//B3///g7//wAAAAAAuA4Dh///wcB/+D//Af///wH//AAAAH3/+v/v+//f9//39//e//n3///+/////9QAAAABZZrAAAEjZAIAAAD/rIyjMpSZccSJDjipMkRMa6XFxZJEyIl1JkSRIiZcUiRcSJElx///iROYuJmXNxNzIm5mZnxmY8cRMiLuLi4kRFxdxFzIv//8R4u5mXIjLi4u5mXIi7jx///4mcXGZmZl3EuLmLi7i5kTcXFx//+ZlyLi7nhOyO6/////////////9JE3ERFxI///////////////////////////////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADOSy4pNkRkRETIvHETMSLi5mRcXcyMy4uYuJESJuLi4mTxci///+JfHi///7j//////////////+lQxZEQAAAMGdMprlJKAlKsWBfOgWFcoBBQIqBCQQCCFQwDwEEBkKBdAgQAOCAUcKAIfBIkAAAwDBYxQcMeIzNwYxgLMPADHAow8PMRAT/+9BkAvnwAABoAAAAAA0AAAAAAAAHEQAAAIAAANSAAAABKW8wgGLKBRqQMLID0RBLgwYMCCxYIBiQ0WgCAYoYGChBghwaQMmShRiJUFGxgQWKARdAgEMVCTHig2MuDyQEb8GgYGAQ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';
      const taskCompleteSound = 'data:audio/mp3;base64,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AgMAQGAYDgIBAAFvd3d3d3d3d3UAAAClSdN01lUrm6lLnTLVNbtNllNMYAYYAggAIMAgICQICQEAgGAsCA4BgKAYCgOvqqqqqqq////rAAAdJtOm07VKlnVRZd1lds2Xddl0yAAACAoHAYCgIAgJAYBgOB1X/3d3d3f////9QAADKm6TpNNJ006TaNpU1JJJJMpUBVQIDg0Dg4FgMB4MBwFA6qqqr+/////////////qAABJkkybTpNJkk0aRKkaVNK1KtmmAMUAQGA0EgYEQeBYTBYJAqqru7u7u7//////////QAACqm0TTTNNkk7QpOmk6lRJNEiKyAANEgaFAkJhcPBUJB4Pqqqvu7u7v/////////1gAATTtJpkmmi9O1KbppmpV3KqpulQAAKgcHBcOBUNBEHhMIBX9XV3d3d3d//////////9AAAG1apNNpkpXOpNNNtq00SVJkmgAAwqIgUIBIOgcGBEZ///////////////////////UAAD7v/////p///+ru///6///6rq///rAAAqZqqmpp1Iirp65SSaZJJJpAAAIAQGAwGBYFB//4LguAYCAOAgDgEAgCQJgUAgCAIAQBADBH93d////x//////z//////x//////cPAAA9VZppp0iEqquZaZNJlkmaAAAEAUDgeBYNBINBADBUKBQIAgBgMBQH/x//f//+OO///+OO///+OO///////P/v//x/a2mppeZeUmSIiRJEgAABAYEgkGAkFAkFAcEQkGAoDgaDwUB13d3f3d3cPHjxD/+/v7//jjjxx//Hjjv/++OOHHceOO/4//v/74v/////////5okMiIAAAGDOGNjmUDJQFqCWACAYoABgcAGAgAYDARgIBGA0IYFgJqpgIhGA0GYEAVgKCGAwIYr///////////////////////////////5IZEQAAAMGcMZpqgImHNBQFC4AiUYGAJgKAmAgGYCARgLBGAwGYEghgPB//vQZAYB9AAAaAAAAAA0gAAABAAAZRAAAAAAADSAAAAEGAgEYDAJgGAmAgGYCAJgGAmKq////////////////////////////////////////////////////////////oAAAAAAAAAAAAABZbbxLVAAAAQAgEYEAxgLBGA0GYD/9/f/////////////////////////////////////////////////9IZEQAAAMGYMZpsoGMA9wQJAYEQBgKBGBAKYFghgVCGBMEYFQhgWBGA0GYFQhgWDGBYMYFQhgVB////////////////////////34498d/AAAA';
      const rewardSound = 'data:audio/mp3;base64,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AMAgDVVVVVVVXVdV3/WAAAtVTpt2m6bTdN22lKZK00qmSZoAMQBIeGgYEBQLBoKA4FAkDAcCgUBgMBQIAwFAgDAMCAIBAAAAAC+/3/f397/////1gAASqaqbVNvS7abTVaplUmaaVNMkwCIKBYRCYJAgFBYEgkDAeCgUCgOBQGAkEAQCAMBAGAYEAQK7qqqqqvq7vr////+sAAAqm1TaTp0202m7TTtSqm1TJJNGYAYsDg0Eh4KBQDA0Fg4JhYJBIJAwGAoEgUCAMAgCAQCQOE////////////////////////////////////////KcRMiMSOMRMiRJIqzTJMkkkMiBAACAQBAKCQOBQGAwF///////////////////////4BQGAoDAQCAOBAHAgDAQBAKBAJBYHAgEgkEAcDf////////////////////////x///////////OZHd///fHHlQxYkQAAAMGYMZptADJQEXVAoDkAMKAQwEBzARKMBEswGMTAR6MCkswGSjARKMCAkwGSDARKMBAkwEBzAQAMBAAwEADAQAMBAAwEL//vQRAKAgAAAaAAAAAA0gAAABAAAZQgAAAAAADSAAAAEzAQAMBAAwEADAQFAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABRRZZoZEQAAAMGYMZptICnk5wKYFABikAGAwAYDABgIAGAYAYBsxgIAGAYEYBgJgGBmAYCYBgBgGAGAYKYBgRAAAAAAAIAAAAAAAQAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFRRZYBRRRJJJJJJIRAAEAgDAUBgIBAFAQBAFAgD/+OOO4cceOOOOOOOO45x3//h//ceOOOO4cP/8PPwPP/+///////x//////////HHHccPjh//DDDx////w8ceP/Hj///w8eP///h44444cceOHHceO447jh44cOO4cPjjx444f/AAAABZbbxJVAAAAQAgEYDAZgIBGAgAYBgBgH/+///////////////////////////////////////////////////oAAAAAAAAAAAAABZbbxJVAAAAQAgEYEAxgLBmA0GYDf/v//////////////////////////////////////////////////9AZEQAAAMGYMZptIM/hksMHQUAYCQRgIBmAsGYDwZgNBGAwIYDQBgMCiAcGYbCqAAAAAAAAAAAAAAAIAABZLrjR3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d//3d3d3d3d3d3d3d3e7u93d+8ZEQAAAMGYMZptAGBwUoFF4AkUYDAJgIiGAgMYDARgMCGA0EYDAhgKBmAwIYCAJgGAGAkAYBgBgGAGAgAYBgBgKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      const errorSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGhgC1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAWUAAAAAAAABob+LGtTAAAAAAD/+9BkBO/wAABoAAAAAA0AAAAAAAAHEQAAAgAAA0gAAABDz7x48ePHjx48ePFgQAAAAAJYPH/AgH8HL/4IH/+DAP8v/wf//KAP8A4Of/l/+BAODn/B///g4Of/n/5fJBz/nwcH//g4Dg/L/B///l8vl8vg///5f//8AAAAAqqqqqmmmsSr3mWWaZIksAQOgTkwKAMIgDUJjgdAYAwIDBBNawOAMEA8Azng4AgLoDWDGDAMAoBwDBOBcAMAwAwbQbgNGEBkBoD4DEzCIBQFQRhWBk5gcAGAoDoRg2AwDoBQKgtAaPIHgLhVBcA0pwhAiBoKQFC8A4OQiAWKYJg5AYEIEgGsmEwKw7g6A8A1eQoDkDABQDAHDcFQPgYDANA+DcEwKACC8HIHgGBKGEDADBQD4Kg8AkB4AgDDEAoZgyGQfBdXVX/+uqmACAAABFVdVUuaqupV33d3WldVXYAAEwSBzARLMBEkwKBDAesMxksvSfzNjTMXrEuivTL4CMaC0wWJjRr/f3+7u9VAAQATKl1brpbdpdKlVbvvuzd1V10AAA3MFgYABjAoGZ3IRjZbGjGsYwXZlhLGUT2YgORkNAmIAMX93/73d3+sAEATqdS126e2l1UqtbbLu7t3a73dIADcIxMEBgwYOTD4cMapcxmcjCqRMElowSYzKjMMwHEwyUjBQkNXm4oRfu7/f/d/qABACqpbpPdTp2nbtVWqu7ss3dTq0lAA3IIDAYVMGCEwuQDHKtMVs8xuRDBJIMPmMwKaTCZuMMkUwqJj///////9//+7/UACACbp20mrdt26W2aaqqvd3rdNlbqTAA3MHzAgRMMl0wmFzD6vMIJMxifjK5XMtiIwIbDJATMFlIwwODGQ0MEBIx8fTkgfL//b7/d/v/UACACTdp2m6StO3ababbLVdttrdstNAABOAEcB5gCRgYTGCiSYNURlxoGGz0YrHhf8TGBgiYTGhgkaGFgMYIDZyZWn9Zfu7/f/vf9QAIAKqbbtKnTa6dS6TStVWrqbVWqqzAA3KPTB4ANJ5E0OSDBQDMHCgxyBDEphMTnIwyOzEgRMGi0wGXwGA2NkrdVV/v//9/9QAIAKVNptJ009LqdOptpVbabbSqkzSYAAYwDw8EBAFCAUCA8CBYMB4GAweA4KAQCAkDAYBgMAwDBwFBADQKBoCAACVXrd3d/d///1AAgApTadttpbdOldNtNttJ01WmmqrMAChcPDgYDA4KA0CA0DBQKBYIAwGA4FAgEAQCAQBgGAwDAYBAEAgDX/////3/////UACACtNpttlS3aVVpum22pS6lVWmq0wABAGBAEAgFAoPDwgEgwFAoCgQBgKAwEAUCAMBAGAgBgEAYCAIBAJV/d/93d3f///6gAQAqptpu0nTtNtN02202m0qppp00yUCgYCgQBgICwOAwIAgFgQCgQBQIAwEAYCAIAwDAQAwDAMAwEAQCAMAQBd3d3/3//+///+oAEAK002nSdpp02mnTTaTSpppKlMkkkgAAYaBoFAkJBQQBwIBQGAgEAgDAUBgGAgCAMAgDAMAwCAMAgEAYCAHVVVVVVX////////qABAC1NNNtMlVLTbTtKpNNM0kpkkkgABQICQKBIQBQGAYEAgEAgDAUBgGAYCAIAgDAIAwDAIAwCAMAwCAMAgHf//3/7/////+//6gAQAtNKm2mamSTaTSaaZaSpJJJJJEAAYIBQIBQKCQMBAIAwGAoCgUBgKAwEAQBAGAYBAGAQBgEAgDAQA/93d3d3d///////UACAFqU00m002k00000y0kyZJJMkgACBgIBAIBQKAwEAYCAMBQGAgDAQBAGAQBgEAYBAEAgDAQBYXd3d3d3d3d////+oAEALUqTTaSaaSTSaVKZJMkkkSQAAEBAKBQKBQKBAGAgDAQBgKAgDAQBAGAQBgEAgDAIBJ3d3d3d3d3d3d////UACAFqTSTSSSSSSSSZJJEkkkkiAAxAEAgGAYCgQBgIAwEAYCAMAwDAMAwDAIBJ3d3d3d3d3d3df///6gAQA///////////////////////////////////////////////+kMiIAAAGDOGN02UCoQFooKAUMBj0wEATAQBMBAIwEAzAQCMBAIwEAzAQEMBAMwEADAQAMBAAwEAh//vQZAQA8AAAaAAAAAA0gAAABAAAZQgAAAAAADSAAAAEAQAMBAAwEAjARsMBAMwEATAQCMBAAwEAg///////////////////////////////////////////////////////////////QBRRbbIZEQAAAMGYMZptICnk5wKYFABikAGAwAYDABgIAGAYAYBsxgIAGAYEYBgJgGBmAYCYBgBgGAGAYKYBgRAAAAAAAIAAAAAAAQAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFRRZYBRRRJJJJJJIRAAEAYCAQBgMBAGAgEAYDf/jjjh444444447jjjHHcP+O4cceOPHHHjhx3Dh/448ceOO4444447hxxx4cccOHHcOHHHjjxx3HcOPHDjh4444cOO43w4ceP/8ceHDxx47jx3Hjhx3Djxx444ceOOO4cccOHHHjjj+HHHHcdx4444cfAAAAFllurklUAAARAgEYDARgMCGAYEYB//3//////////////////////////////////////////////////9AAAAAAAAAAAAABZbbxJVAAAAQAgEYEAxgLBmA0GYDf/v//////////////////////////////////////////////////9AZEQAAAMGYMZptIM/hksMHQUAYCQRgIBmAsGYDwZgNBGAwIYDQBgMCiAcGYbCqAAAAAAAAAAAAAAAIAABZLrjR3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d//3d3d3d3d3d3d3d3e7u93d+8ZEQAAAMGYMZptAGBwUoFF4AkUYDAJgIiGAgMYDARgMCGA0EYDAhgKBmAwIYCAJgGAGAkAYBgBgGAGAgAYBgBgKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      const buttonClickSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAGhgC1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAUQAAAAAAAABoa7SgBJAAAAAAD/+9BkBA/wAABoAAAAAA0AAAAAAAAHEQAAAgAAA0gAAABHTrx48ePHjx48ePFgQAAAAAJYPH/AgH8HL/4IH/+DAP8v/wf//KAP8A4Of/l/+BAODn/B///g4Of/n/5fJBz/nwcH//g4Dg/L/B///l8vl8vg///5f//8AAAAAqqqqqmmmsSr3mWWaZIksAQOgTkwKAMIgDUJjgdAYAwIDBBNawOAMEA8Azng4AgLoDWDGDAMAoBwDBOBcAMAwAwbQbgNGEBkBoD4DEzCIBQFQRhWBk5gcAGAoDoRg2AwDoBQKgtAaPIHgLhVBcA0pwhAiBoKQFC8A4OQiAWKYJg5AYEIEgGsmEwKw7g6A8A1eQoDkDABQDAHDcFQPgYDANA+DcEwKACC8HIHgGBKGEDADBQD4Kg8AkB4AgDDEAoZgyGQfBdXVX/+uqmACAAABCvvrvbqlbuqrV7ur3e9TVVYAAKAGZz/ZhACmFTyYYHhngmmL2wYaYpjdEGG1EYXcRg8pA8NzEAbU3e7/7/f/1ABAA01S3S6W6bt0uq1dtttd1dW6VtIAHygMYIIgqAMoRhjx2mF2iYYZJgkmmFy0eDOJhhWGMi8YWIRhETmHj6cLCxUf7//X/+v+sAEAE6nUtWt0unSqtVNtst11Wl22yqIAg4YnD4ID5hECGER2YPNxhRpGBjiYfMpg4zGG0qY0CZhEmGHyAYzCJiIxGMk+UYjlvu/+//6/9QAIAJuq7dVLbdTTXS6rXXVVVtnVZZIAReEnlgKSyDsGRh+FGCAqYNHJhsdGISsYgSBiEWmHAUYfC5h0emEQmYbEphsVGV0KcaP5yEWFnv9/v/33/UACAE3UVKW3V226dOq1Wm23VVaqlTWkAAvMFBMAAUw6ETD4eMPpQx+tTHqjMJK8xyFDCwKMolEweNDAgnMMCUw0FzCwlNruszIpVf/v//v/qABACrtpJ0mmrtp0mq1223Vp1LdXVZQAFeHvY9mJDuXAYPEJgQImExIYJIxiYomMByYXFJg0YGDxMYQCBkBCmDgyYjMZl9emt3///v//+oAEAKuydNJqnWnTdNLabbbbbaq1VlkAA3qGDBQbMBBowUQDD4cMIqQw0bjDJhMDmgxCbzCoKMCk4wOFgMBDBIoMDBkwuZTBQDMSIU4+JjDYbMGnEuJV/+7////+oAEAJ0502mk26Tpp002222023Vaqm0iYAGDQ+YHCpgoGGCRUYRHRmYMGUVAYDGprwamTwQYyGxggiGEROYGCRhIQGHRaYPAhg0IEwLdXV//9//9QAIAVdtNbTTOm6bTaaabtttNKqmmmTIAAIBoOBgIBQIDgUDQIBAGAsEAgCgUBgGAgCAIAwDAIAwDAMAgDBqr///3/7/+//9QAIAVpppttskqTbTTTTaaaaVNNJNJEAAQCBoHAwGAoFAgEAYCAQBgKAwDAQBgGAgCAIAgDAIAwDAIAwCCXd/f//3/////9QAIAVpm2m20k2kyaaSaaZaZMkkkkkAAgGAwEAgDAQBgIAwEAYCAMAwEAQBgEAYBAGAQBgEAQBgFvd3d/93f/////+oAEALSaTabZJJpJpJJklJkmSSJJAAAQEAgEAYCAIAwEAYCAIAwEAQBgEAYBAEAYBAGAW93d3d3d3d3d////qABACpNJpJJJkkkkmSSSSSSRJJIADBAKBQKBAGAgDAQBgIAgDAIAwDAMAwDALu7u7u7u7u7u7/////6gAQA/////////////////////////////////////////////////////////////////////////////////9//////////////+kMiIAAAGDOGNj2kCCwExRKAoYgZgIBmAgAYCBZgIAGAgAYCABgIbGAgGYCABgIAmAgCYCABgIjGAgAYCABgIAGAgU//vQRAgB8AAAaAAAAAA0gAAABAAAZQgAAAAAADSAAAAEYCABgIDGAgAYCABgICmAgAYCHBgIAGAgAYCABgIFP///////////////////////////////////////////////////////////////9ARRRLZIZEQAAAMGYMZptICnk6AKYFABikAGAwAYDABgIAGAYAYBsxgIAGAYEYBgJgGBmAYCYBgBgGAGAYKYBgRAAAAAAAIAAAAAAAQAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFRRZYBRRRJJJJJJIRAAEAYCASBAGAwGAgDAaCX/444464447jh444444cceOHHcOHDh/w4cOHDjvHHcOO4cOHDjjuHHjhxxx44ccOHDjjxw44cOHHHHjh44444cceOHH//x////ww8PPHw4cf/w44444cfD/+P/Hjjjhjv/8P+AAAAFllurklUAAARAgEYDARgMCGAYEYB//3//////////////////////////////////////////////////9AAAAAAAAAAAAABZbbxJVAAAAQAgEYEAxgLBmA0GYDf/v//////////////////////////////////////////////////9AZEQAAAMGYMZptIM/hksMHQUAYCQRgIBmAsGYDwZgNBGAwIYDQBgMCiAcGYbCqAAAAAAAAAAAAAAAIAABZLrjR3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d//3d3d3d3d3d3d3d3e7u93d+8ZEQAAAMGYMZptAGBwUoFF4AkUYDAJgIiGAgMYDARgMCGA0EYDAhgKBmAwIYCAJgGAGAkAYBgBgGAGAgAYBgBgKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

      // Create audio elements only if not in muted state
      if (!muted) {
        soundRefs.achievement.current = new Audio(achievementSound);
        soundRefs.levelUp.current = new Audio(levelUpSound);
        soundRefs.taskComplete.current = new Audio(taskCompleteSound);
        soundRefs.reward.current = new Audio(rewardSound);
        soundRefs.error.current = new Audio(errorSound);
        soundRefs.buttonClick.current = new Audio(buttonClickSound);
      }
    }
  }, [muted]);

  const playSound = (type: keyof typeof soundRefs) => {
    if (!muted && soundRefs[type].current) {
      soundRefs[type].current?.play().catch(e => console.log('Audio play error:', e));
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  return { playSound, muted, toggleMute };
};