import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PlayerStats,
  EnhancedProgressCard,
  QuestItem,
  ItemCard,
  DailyChallenge,
  CharacterStats,
  Leaderboard,
  GameButton,
  Achievement,
  GameNotification,
  SkillTree,
  useGameSounds
} from '@/components/game-elements';
import {
  Target, Trophy, Flame, Zap, Crown, Gift, Star, 
  Sparkles, Shield, Swords, Award, Smartphone, Bot, 
  Lightbulb, Gem, HeartPulse, Puzzle, ArrowUpRight,
  Bolt, TrendingUp, Medal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, ExecutionTask } from '@shared/schema';

export default function GamifiedDashboard() {
  const [showAchievement, setShowAchievement] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const { playSound, muted, toggleMute } = useGameSounds();
  const [playerStats, setPlayerStats] = useState({
    name: 'Player',
    level: 5,
    xp: 350,
    nextLevelXp: 500,
    health: 80,
    maxHealth: 100,
    mana: 65,
    maxMana: 100,
    gold: 850,
    achievements: 7
  });

  // Fetch data with react-query
  const { data: goals = [] } = useQuery<Goal[]>({ 
    queryKey: ['/api/goals']
  });
  
  const { data: tasks = [] } = useQuery<ExecutionTask[]>({ 
    queryKey: ['/api/tasks']
  });

  const leaderboardEntries = [
    { id: '1', name: 'Epic Achiever', score: 9500, avatar: '', isCurrentUser: false },
    { id: '2', name: 'Goal Master', score: 8200, avatar: '', isCurrentUser: false },
    { id: '3', name: 'Task Warrior', score: 7400, avatar: '', isCurrentUser: false },
    { id: '4', name: 'Player', score: 6500, avatar: '', isCurrentUser: true },
    { id: '5', name: 'Progress Hunter', score: 5800, avatar: '', isCurrentUser: false },
  ];

  const dailyChallenges = [
    {
      title: 'Complete 3 High Priority Tasks',
      description: 'Finish 3 tasks marked as high priority to earn rewards',
      rewards: [
        { type: 'xp' as const, amount: 150 },
        { type: 'gold' as const, amount: 50 },
      ],
      completed: false
    },
    {
      title: 'Achieve 100% on Any Goal',
      description: 'Reach 100% completion on any of your goals',
      rewards: [
        { type: 'xp' as const, amount: 250 },
        { type: 'item' as const, amount: 1, name: 'Golden Badge' },
      ],
      completed: true
    }
  ];

  const characterStats = [
    { name: 'Focus', value: 85, max: 100, bonus: 5, icon: <Target className="h-3 w-3" /> },
    { name: 'Creativity', value: 70, max: 100, bonus: 0, icon: <Sparkles className="h-3 w-3" /> },
    { name: 'Consistency', value: 90, max: 100, bonus: 10, icon: <TrendingUp className="h-3 w-3" /> },
    { name: 'Energy', value: 65, max: 100, bonus: -5, icon: <Bolt className="h-3 w-3" /> }
  ];

  const playerItems = [
    {
      name: 'Productivity Boost',
      description: 'Increases focus by 15% for 24 hours',
      rarity: 'uncommon' as const,
      icon: <Lightbulb className="h-6 w-6 text-green-400" />,
      stats: [
        { label: 'Duration', value: '24 hours' },
        { label: 'Focus bonus', value: '+15%' }
      ]
    },
    {
      name: 'Golden Trophy',
      description: 'Award for completing all Q1 goals ahead of schedule',
      rarity: 'epic' as const,
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      stats: [
        { label: 'Prestige', value: '+50' },
        { label: 'Motivation', value: '+25%' }
      ]
    }
  ];

  const skills = [
    {
      id: 'time-management',
      name: 'Time Management',
      description: 'Master the art of time management to increase productivity',
      icon: <Clock className="h-6 w-6 text-blue-400" />,
      unlocked: true,
      position: 10
    },
    {
      id: 'deep-focus',
      name: 'Deep Focus',
      description: 'Achieve deep focus states for complex tasks',
      icon: <Target className="h-6 w-6 text-purple-400" />,
      unlocked: true,
      position: 25
    },
    {
      id: 'task-automation',
      name: 'Task Automation',
      description: 'Automate repetitive tasks to save time',
      icon: <Bot className="h-6 w-6 text-green-400" />,
      unlocked: false,
      position: 40
    },
    {
      id: 'goal-mastery',
      name: 'Goal Mastery',
      description: 'Become an expert at setting and achieving challenging goals',
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      unlocked: false, 
      position: 55
    },
    {
      id: 'strategic-planning',
      name: 'Strategic Planning',
      description: 'Develop strategic planning abilities for complex projects',
      icon: <Puzzle className="h-6 w-6 text-red-400" />,
      unlocked: false,
      position: 70
    }
  ];

  // Trigger achievement demo
  const triggerAchievement = () => {
    setShowAchievement(true);
    playSound('achievement');
  };

  // Trigger notification demo
  const triggerNotification = () => {
    setShowNotification(true);
    playSound('reward');
  };

  // Level up demo
  const levelUp = () => {
    playSound('levelUp');
    setPlayerStats(prev => ({
      ...prev,
      level: prev.level + 1,
      xp: 0,
      nextLevelXp: prev.nextLevelXp + 100,
      health: prev.maxHealth,
      mana: prev.maxMana
    }));
    triggerNotification();
  };

  // Complete task demo
  const completeTask = () => {
    playSound('taskComplete');
    setPlayerStats(prev => ({
      ...prev,
      xp: Math.min(prev.xp + 50, prev.nextLevelXp),
      gold: prev.gold + 25
    }));
  };

  useEffect(() => {
    // Auto-trigger a notification after 2 seconds for demo purposes
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen game-bg text-white overflow-y-auto pb-20">
      <Achievement 
        title="Goal Master" 
        description="You've achieved 3 goals ahead of schedule!" 
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        icon={<Trophy className="h-5 w-5 text-yellow-300" />}
      />
      
      <GameNotification
        title="Daily Challenge Completed!"
        message="You've earned 150 XP and 50 Gold"
        icon={<Award className="h-5 w-5 text-purple-400" />}
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-80 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center">
              <Crown className="mr-2 h-5 w-5 text-yellow-400" />
              Goal Quest 2025
            </h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleMute} 
                className="text-gray-400 hover:text-white"
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <div className="bg-gray-800 px-3 py-1 rounded-full flex items-center">
                <Gift className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-yellow-400 font-bold">{playerStats.gold}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Player and Stats */}
          <div className="md:col-span-1 space-y-6">
            <PlayerStats 
              name={playerStats.name}
              avatar={null}
              level={playerStats.level}
              xp={playerStats.xp}
              nextLevelXp={playerStats.nextLevelXp}
              health={playerStats.health}
              maxHealth={playerStats.maxHealth}
              mana={playerStats.mana}
              maxMana={playerStats.maxMana}
              gold={playerStats.gold}
              achievements={playerStats.achievements}
            />
            
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Zap className="h-4 w-4 text-yellow-400 mr-1" />
                Player Attributes
              </h3>
              <CharacterStats stats={characterStats} />
            </div>
            
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Gift className="h-4 w-4 text-yellow-400 mr-1" />
                Inventory
              </h3>
              <div className="space-y-3">
                {playerItems.map((item, index) => (
                  <ItemCard key={index} {...item} />
                ))}
              </div>
            </div>
            
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Trophy className="h-4 w-4 text-yellow-400 mr-1" />
                Leaderboard
              </h3>
              <Leaderboard entries={leaderboardEntries} />
            </div>
          </div>
          
          {/* Middle Column - Goals and Tasks */}
          <div className="md:col-span-1 space-y-6">
            <div className="game-card p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold flex items-center">
                  <Target className="h-4 w-4 text-green-400 mr-1" />
                  Active Goals
                </h3>
                <GameButton size="sm" variant="primary">Add Goal</GameButton>
              </div>
              
              <div className="space-y-4">
                {goals.slice(0, 3).map(goal => (
                  <EnhancedProgressCard
                    key={goal.id}
                    title={goal.name}
                    current={goal.current || 0}
                    target={goal.target || 100}
                    level={Math.floor(Math.random() * 5) + 1}
                    daysLeft={Math.floor(Math.random() * 30) + 1}
                    category={goal.category || "Business"}
                    icon={<Target className="h-5 w-5 text-green-400" />}
                  />
                ))}
                
                {goals.length === 0 && (
                  <div className="text-center p-6 text-gray-400">
                    <Trophy className="h-10 w-10 mx-auto mb-3 text-gray-500 opacity-50" />
                    <p>No goals yet. Start your journey by creating a new goal!</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="game-card p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold flex items-center">
                  <Bolt className="h-4 w-4 text-blue-400 mr-1" />
                  Current Quests
                </h3>
                <GameButton size="sm" variant="secondary">Add Task</GameButton>
              </div>
              
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <QuestItem
                    key={task.id}
                    title={task.task}
                    description={`Priority: ${task.priority}`}
                    completed={task.status === 'completed'}
                    priority={task.priority as 'low' | 'medium' | 'high'}
                    reward={{
                      xp: Math.floor(Math.random() * 50) + 10,
                      coins: Math.floor(Math.random() * 30) + 5
                    }}
                    onClick={completeTask}
                  />
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center p-6 text-gray-400">
                    <Swords className="h-10 w-10 mx-auto mb-3 text-gray-500 opacity-50" />
                    <p>No quests available. Create a task to begin your adventure!</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Sparkles className="h-4 w-4 text-purple-400 mr-1" />
                Daily Challenges
              </h3>
              
              <div className="space-y-3">
                {dailyChallenges.map((challenge, index) => (
                  <DailyChallenge 
                    key={index}
                    title={challenge.title}
                    description={challenge.description}
                    rewards={challenge.rewards}
                    completed={challenge.completed}
                    onClick={() => !challenge.completed && triggerAchievement()}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Achievements and Skill Tree */}
          <div className="md:col-span-1 space-y-6">
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Award className="h-4 w-4 text-yellow-400 mr-1" />
                Achievements
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-lg flex items-center justify-center border ${i < 4 ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'border-gray-700 bg-gray-800'}`}
                    onClick={i < 4 ? triggerAchievement : undefined}
                  >
                    {i === 0 && <Trophy className="h-6 w-6 text-yellow-400" />}
                    {i === 1 && <Medal className="h-6 w-6 text-yellow-400" />}
                    {i === 2 && <Target className="h-6 w-6 text-yellow-400" />}
                    {i === 3 && <Award className="h-6 w-6 text-yellow-400" />}
                    {i >= 4 && <Shield className="h-6 w-6 text-gray-600" />}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Flame className="h-4 w-4 text-red-400 mr-1" />
                Skill Tree
              </h3>
              
              <div className="h-96 relative">
                <SkillTree skills={skills} />
              </div>
            </div>
            
            <div className="game-card p-4">
              <h3 className="font-bold mb-3 flex items-center">
                <Gem className="h-4 w-4 text-indigo-400 mr-1" />
                Training Demos
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <GameButton 
                  onClick={levelUp}
                  className="w-full"
                >
                  Level Up!
                </GameButton>
                
                <GameButton 
                  onClick={triggerAchievement}
                  variant="secondary"
                  className="w-full"
                >
                  Achievement
                </GameButton>
                
                <GameButton 
                  onClick={completeTask}
                  variant="primary"
                  className="w-full"
                >
                  Complete Task
                </GameButton>
                
                <GameButton 
                  onClick={triggerNotification}
                  variant="secondary"
                  className="w-full"
                >
                  Notification
                </GameButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}