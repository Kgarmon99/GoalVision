import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Eye, 
  Compass, 
  CheckCircle, 
  Play, 
  TrendingUp, 
  Flame, 
  DollarSign, 
  Clock, 
  Zap,
  Users,
  MessageSquare,
  Megaphone,
  ShoppingCart,
  Heart,
  Package,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { PomodoroTimer } from "@/components/pomodoro-timer";

interface OodaOpportunity {
  id: number;
  title: string;
  description: string;
  category: string;
  estimatedRevenue: number;
  effortLevel: number;
  timeRequired: number;
  priority: number;
  isCompleted: boolean;
}

interface DailyMove {
  id: number;
  date: string;
  move: string;
  category: string;
  outcome: string;
  revenueGenerated: number;
  signalStrength: number;
  lessons: string;
  nextAction: string;
}

const categoryIcons: Record<string, any> = {
  "cold-outreach": Users,
  "partnerships": MessageSquare,
  "content": Megaphone,
  "conversion": ShoppingCart,
  "retention": Heart,
  "product": Package
};

const categoryColors: Record<string, string> = {
  "cold-outreach": "bg-blue-500",
  "partnerships": "bg-purple-500",
  "content": "bg-green-500",
  "conversion": "bg-orange-500",
  "retention": "bg-pink-500",
  "product": "bg-indigo-500"
};

export default function OodaDashboard() {
  // Atomic Habits: Make it Obvious - Start with current time and visual cues
  const [currentTime] = useState(new Date());
  const isLoopCompleted = Boolean(localStorage.getItem(`ooda-${currentTime.toDateString()}`));
  const [currentPhase, setCurrentPhase] = useState<'observe' | 'orient' | 'decide' | 'act'>('observe');
  const [completedPhases, setCompletedPhases] = useState<string[]>(() => {
    const saved = localStorage.getItem(`ooda-phases-${currentTime.toDateString()}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  // Make it Easy - Simple form with minimal friction
  const [todaysNotes, setTodaysNotes] = useState(() => {
    const saved = localStorage.getItem(`ooda-notes-${currentTime.toDateString()}`);
    return saved ? JSON.parse(saved) : {
      observe: "",
      orient: "",
      decide: "",
      act: ""
    };
  });

  // Make it Satisfying - Progress tracking
  const [totalRevenue, setTotalRevenue] = useState(0);
  const progressPercentage = (completedPhases.length / 4) * 100;

  const { data: topOpportunities = [], isLoading: opportunitiesLoading } = useQuery<OodaOpportunity[]>({
    queryKey: ['/api/ooda/opportunities/top/3']
  });

  const { data: todayMove, isLoading: moveLoading } = useQuery<DailyMove | null>({
    queryKey: ['/api/ooda/daily-move/today']
  });

  const { data: streakData, isLoading: streakLoading } = useQuery<{ streak: number }>({
    queryKey: ['/api/ooda/streak']
  });

  // Atomic Habits Functions
  const saveProgress = () => {
    localStorage.setItem(`ooda-notes-${currentTime.toDateString()}`, JSON.stringify(todaysNotes));
    localStorage.setItem(`ooda-phases-${currentTime.toDateString()}`, JSON.stringify(completedPhases));
  };

  const completePhase = (phase: string) => {
    if (!completedPhases.includes(phase)) {
      const newCompleted = [...completedPhases, phase];
      setCompletedPhases(newCompleted);
      localStorage.setItem(`ooda-phases-${currentTime.toDateString()}`, JSON.stringify(newCompleted));
      
      // Satisfying feedback
      if (newCompleted.length === 4) {
        localStorage.setItem(`ooda-${currentTime.toDateString()}`, 'completed');
        // Celebration effect could go here
      }
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 10) return "🌅 Morning OODA Loop";
    if (hour < 14) return "☀️ Midday Revenue Check";
    if (hour < 18) return "🌆 Afternoon Power Hour";
    return "🌙 Evening Reflection";
  };

  const getMinimumViableAction = (phase: string) => {
    const actions = {
      observe: "Spend 2 minutes scanning your CRM for one warm lead",
      orient: "Choose ONE growth lever: Sales, Partnerships, or Content", 
      decide: "Pick your single highest-impact 30-minute task",
      act: "Execute for 25 minutes, then log the result"
    };
    return actions[phase as keyof typeof actions] || "Take action";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEffortDisplay = (level: number) => {
    const displays = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    return displays[level - 1] || 'Unknown';
  };

  const getSignalDisplay = (strength: number) => {
    const signals = ['🔴 Cold', '🟡 Warm', '🟠 Hot', '🟢 Very Hot', '🔥 Red Hot'];
    return signals[strength - 1] || '🔴 Cold';
  };

  const phaseContent = {
    observe: {
      title: "Observe: Scan for Leverage",
      description: "Review your pipeline, CRM, DMs, and revenue dashboard. Look for signals where $1 today turns into $100 tomorrow.",
      icon: Eye,
      color: "bg-blue-500"
    },
    orient: {
      title: "Orient: Prioritize the 10x",
      description: "Choose your growth vector: Topline Growth, Distribution, or Offer Design. What would make revenue inevitable today?",
      icon: Compass,
      color: "bg-purple-500"
    },
    decide: {
      title: "Decide: Pick 1 Trillion-Dollar Move",
      description: "Choose the highest-leverage action. What's the smallest, highest-impact move you can ship today?",
      icon: Target,
      color: "bg-orange-500"
    },
    act: {
      title: "Act: Execute + Log",
      description: "Block 1 focused hour. Track your move in the Daily Revenue Leaderboard. Post for feedback or streak accountability.",
      icon: Play,
      color: "bg-green-500"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Atomic Habits principles */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              ← MoneyBot Dashboard
            </Button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-6 w-6 text-orange-500" />
                <h1 className="text-2xl font-bold text-gray-800">
                  {getTimeBasedGreeting()}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full px-4 py-2 shadow-sm border">
                  <span className="text-sm text-gray-600">Progress: </span>
                  <span className="font-bold text-orange-600">{Math.round(progressPercentage)}%</span>
                </div>
                {isLoopCompleted && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Today's Loop Complete
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xs text-gray-400">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
          
          {/* Progress Bar - Make it Obvious */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full"
                style={{ width: `${progressPercentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {completedPhases.length}/4 phases complete
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Streak and Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Current Streak</p>
                  <p className="text-3xl font-bold">
                    {streakLoading ? "..." : `${streakData?.streak || 0} days`}
                  </p>
                </div>
                <Flame className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Today's Revenue Impact</p>
                  <p className="text-3xl font-bold">
                    {moveLoading ? "..." : formatCurrency(todayMove?.revenueGenerated || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pipeline Strength</p>
                  <p className="text-3xl font-bold">
                    {moveLoading ? "..." : getSignalDisplay(todayMove?.signalStrength || 1)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Simplified OODA Workflow - Atomic Habits Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* OODA Workflow - One Phase at a Time */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Today's Quick Action - Make it Easy */}
            {!isLoopCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-orange-800">
                      🎯 Your 2-Minute Revenue Action
                    </CardTitle>
                    <CardDescription className="text-orange-700">
                      {getMinimumViableAction(currentPhase)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${phaseContent[currentPhase].color} text-white`}>
                        {React.createElement(phaseContent[currentPhase].icon, { className: "h-4 w-4" })}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{phaseContent[currentPhase].title}</h3>
                        <p className="text-sm text-gray-600">{phaseContent[currentPhase].description}</p>
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="Quick note: What did you discover or do?"
                      value={todaysNotes[currentPhase as keyof typeof todaysNotes]}
                      onChange={(e) => {
                        const newNotes = { ...todaysNotes, [currentPhase]: e.target.value };
                        setTodaysNotes(newNotes);
                        saveProgress();
                      }}
                      className="min-h-[80px] mb-4"
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          completePhase(currentPhase);
                          const phases = ['observe', 'orient', 'decide', 'act'];
                          const currentIndex = phases.indexOf(currentPhase);
                          if (currentIndex < phases.length - 1) {
                            setCurrentPhase(phases[currentIndex + 1] as any);
                          }
                        }}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={completedPhases.includes(currentPhase)}
                      >
                        {completedPhases.includes(currentPhase) ? '✓ Done' : 'Complete & Next'}
                      </Button>
                      
                      {currentPhase !== 'observe' && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const phases = ['observe', 'orient', 'decide', 'act'];
                            const currentIndex = phases.indexOf(currentPhase);
                            if (currentIndex > 0) {
                              setCurrentPhase(phases[currentIndex - 1] as any);
                            }
                          }}
                        >
                          ← Back
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Phase Progress Visual */}
            <div className="grid grid-cols-4 gap-2">
              {['observe', 'orient', 'decide', 'act'].map((phase, index) => {
                const isCompleted = completedPhases.includes(phase);
                const isCurrent = currentPhase === phase;
                const PhaseIcon = phaseContent[phase as keyof typeof phaseContent].icon;
                
                return (
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`text-center cursor-pointer transition-all ${
                        isCompleted ? 'bg-green-100 border-green-300' :
                        isCurrent ? 'bg-orange-100 border-orange-300' :
                        'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setCurrentPhase(phase as any)}
                    >
                      <CardContent className="p-3">
                        <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-orange-500 text-white' :
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : <PhaseIcon className="h-4 w-4" />}
                        </div>
                        <p className="text-xs font-medium capitalize">{phase}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Today's Move */}
            {todayMove && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Today's Trillion-Dollar Move
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{todayMove.category}</Badge>
                        <span className="text-sm text-muted-foreground">{getSignalDisplay(todayMove.signalStrength)}</span>
                      </div>
                      <p className="font-medium">{todayMove.move}</p>
                    </div>
                    
                    {todayMove.outcome && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-700">Outcome:</p>
                        <p className="text-sm">{todayMove.outcome}</p>
                      </div>
                    )}

                    {todayMove.lessons && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-700">Lessons Learned:</p>
                        <p className="text-sm">{todayMove.lessons}</p>
                      </div>
                    )}

                    {todayMove.nextAction && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-orange-700">Next Action:</p>
                        <p className="text-sm">{todayMove.nextAction}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar: Opportunities */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Top Revenue Opportunities
                </CardTitle>
                <CardDescription>
                  Highest-leverage moves available today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topOpportunities.map((opportunity) => {
                      const IconComponent = categoryIcons[opportunity.category] || Package;
                      const colorClass = categoryColors[opportunity.category] || "bg-gray-500";
                      
                      return (
                        <motion.div
                          key={opportunity.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${colorClass} text-white flex-shrink-0`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-tight">{opportunity.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{opportunity.description}</p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {formatCurrency(opportunity.estimatedRevenue)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {opportunity.timeRequired}m
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">Priority</div>
                                  <div className="font-bold text-sm">{opportunity.priority}</div>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Effort: {getEffortDisplay(opportunity.effortLevel)}</span>
                                  <span>{opportunity.priority}%</span>
                                </div>
                                <Progress value={opportunity.priority} className="h-1" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Move Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Move Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryIcons).map(([category, IconComponent]) => {
                    const colorClass = categoryColors[category];
                    const displayName = category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Completion Celebration */}
        {isLoopCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-2">OODA Loop Complete!</h2>
                <p className="text-green-100 mb-4 text-lg">
                  You've built today's revenue momentum. Every loop compounds into exponential growth.
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <div className="font-bold">Streak: {streakData?.streak || 0} days</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <div className="font-bold">Revenue: {formatCurrency(todayMove?.revenueGenerated || 0)}</div>
                  </div>
                </div>
                <p className="text-green-200 text-sm mt-4 italic">
                  "You don't rise to the level of your goals, you fall to the level of your systems." — James Clear
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Daily Habit Reminder */}
        {!isLoopCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Build Your Revenue Habit</h3>
                <p className="text-slate-300 mb-4 text-sm">
                  Every completed OODA loop builds compound momentum. Small daily actions create exponential results.
                </p>
                <div className="text-xs text-slate-400">
                  Complete all 4 phases to earn today's streak point
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}