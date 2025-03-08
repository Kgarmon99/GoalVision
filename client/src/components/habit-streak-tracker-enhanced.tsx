import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, Medal, Check, X, Award, Gift, Flame, Zap, Target, TrendingUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format, isSameDay, getDay, isSameWeek, isAfter, isBefore, addDays, subDays, parseISO, differenceInDays } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Habit, Goal, HabitStreak } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useGoalCelebration } from "@/hooks/use-goal-celebration";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { ParticleEffect } from "@/components/ui/particle-effect";
import { motion, AnimatePresence } from "framer-motion";

const habitFormSchema = z.object({
  name: z.string().min(3, { message: "Habit name must be at least 3 characters" }),
  description: z.string().optional(),
  goalId: z.string(),
  reminderTime: z.string().optional(),
  targetDaysPerWeek: z.coerce.number().min(1).max(7),
  priority: z.enum(["low", "medium", "high"]),
  category: z.string()
});

interface HabitStreakTrackerProps {
  goalId?: number;
}

export function HabitStreakTracker({ goalId }: HabitStreakTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [currentStreakCount, setCurrentStreakCount] = useState<number>(0);
  const [longestStreakCount, setLongestStreakCount] = useState<number>(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'grid'>('grid');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();
  const { triggerCelebration } = useGoalCelebration();
  
  const today = new Date();
  
  // Create calendar dates (current week)
  useEffect(() => {
    const dates: Date[] = [];
    // Get Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());
    
    // Create array of dates for this week
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      dates.push(day);
    }
    
    setCalendarDates(dates);
  }, [today]);
  
  useEffect(() => {
    async function fetchHabits() {
      try {
        setLoadingHabits(true);
        const response = await apiRequest("GET", goalId ? `/api/habits/goal/${goalId}` : '/api/habits');
        const data = await response.json();
        setHabits(data);
        
        // Select the first habit by default if none is selected
        if (data.length > 0 && !selectedHabit) {
          setSelectedHabit(data[0]);
          fetchStreaksForHabit(data[0].id);
        }
        
        setLoadingHabits(false);
      } catch (error) {
        console.error('Error fetching habits:', error);
        toast({
          title: "Failed to load habits",
          description: "Please try again later",
          variant: "destructive"
        });
        setLoadingHabits(false);
      }
    }
    
    async function fetchGoals() {
      try {
        const response = await apiRequest("GET", '/api/goals');
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    }
    
    fetchHabits();
    fetchGoals();
  }, [goalId]);
  
  async function fetchStreaksForHabit(habitId: number) {
    try {
      setLoadingStreaks(true);
      
      // Get current date info for date range
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Format dates for API query
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      // Fetch streaks for the date range
      const response = await apiRequest("GET", `/api/habits/${habitId}/streaks/range?startDate=${startDate}&endDate=${endDate}`);
      const streakData = await response.json();
      setStreaks(streakData);
      
      // Get current streak count
      const currentStreakResponse = await apiRequest("GET", `/api/habits/${habitId}/current-streak`);
      const currentStreakData = await currentStreakResponse.json();
      setCurrentStreakCount(currentStreakData.currentStreak || 0);
      
      // Calculate longest streak
      let longest = 0;
      let current = 0;
      
      // Sort the streaks by date
      const sortedStreaks = [...streakData].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      for (const streak of sortedStreaks) {
        if (streak.completed) {
          current++;
          longest = Math.max(current, longest);
        } else {
          current = 0;
        }
      }
      
      setLongestStreakCount(longest);
      setLoadingStreaks(false);
    } catch (error) {
      console.error('Error fetching streaks:', error);
      toast({
        title: "Failed to load habit streaks",
        description: "Please try again later",
        variant: "destructive"
      });
      setLoadingStreaks(false);
    }
  }
  
  const handleHabitSelect = (habit: Habit) => {
    setSelectedHabit(habit);
    fetchStreaksForHabit(habit.id);
  };
  
  const calculateCompletionRate = useCallback((habit: Habit) => {
    if (!habit || !streaks.length) return 0;
    
    const relevantStreaks = streaks.filter(streak => streak.habitId === habit.id);
    const completedCount = relevantStreaks.filter(streak => streak.completed).length;
    
    return relevantStreaks.length > 0 
      ? Math.round((completedCount / relevantStreaks.length) * 100) 
      : 0;
  }, [streaks]);
  
  const markHabitForDate = async (habit: Habit, date: Date, completed: boolean) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if there's already a streak for this date
      const existingStreak = streaks.find(s => 
        s.habitId === habit.id && 
        format(new Date(s.date), 'yyyy-MM-dd') === dateStr
      );
      
      if (existingStreak) {
        // Update existing streak
        const response = await apiRequest("PATCH", `/api/habits/${habit.id}/streaks/${existingStreak.id}`, {
          completed
        });
        
        if (response.ok) {
          // Update local state
          setStreaks(prevStreaks => 
            prevStreaks.map(s => 
              s.id === existingStreak.id ? { ...s, completed } : s
            )
          );
          
          toast({
            title: completed ? "Habit completed" : "Habit marked as missed",
            description: `${habit.name} for ${format(date, 'MMM dd')}`,
            variant: completed ? "default" : "destructive"
          });
          
          if (completed && isSameDay(date, new Date())) {
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 2000);
          }
          
          // Recalculate current streak
          fetchStreaksForHabit(habit.id);
        }
      } else {
        // Create new streak
        const response = await apiRequest("POST", `/api/habits/${habit.id}/streaks`, {
          date: dateStr,
          completed,
        });
        
        if (response.ok) {
          const newStreak = await response.json();
          
          // Update local state
          setStreaks(prevStreaks => [...prevStreaks, newStreak]);
          
          toast({
            title: completed ? "Habit completed" : "Habit marked as missed",
            description: `${habit.name} for ${format(date, 'MMM dd')}`,
            variant: completed ? "default" : "destructive"
          });
          
          if (completed && isSameDay(date, new Date())) {
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 2000);
            
            // Check if we hit a streak milestone (divisible by 5)
            if ((currentStreakCount + 1) % 5 === 0) {
              setShowCelebration(true);
              triggerCelebration({
                goalName: habit.name,
                progressPercentage: currentStreakCount + 1,
                username: "You"
              });
            }
          }
          
          // Recalculate current streak
          fetchStreaksForHabit(habit.id);
        }
      }
    } catch (error) {
      console.error('Error marking habit:', error);
      toast({
        title: "Failed to update habit",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const getStreak = (habitId: number, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return streaks.find(s => 
      s.habitId === habitId && 
      format(new Date(s.date), 'yyyy-MM-dd') === dateStr
    );
  };
  
  const getStreakCountText = (count: number) => {
    if (count === 0) return "No current streak";
    if (count === 1) return "1 day streak";
    return `${count} day streak`;
  };
  
  const getStreakEmoji = (count: number) => {
    if (count >= 20) return "🔥🔥🔥";
    if (count >= 10) return "🔥🔥";
    if (count >= 5) return "🔥";
    if (count >= 1) return "✅";
    return "🔄";
  };
  
  const isWeekend = (date: Date) => {
    const day = getDay(date);
    return day === 0 || day === 6;
  };
  
  const getDayBackgroundClass = (date: Date) => {
    if (isSameDay(date, new Date())) return "bg-green-600/10 border-green-500/50";
    if (isWeekend(date)) return "bg-gray-800/50";
    return "bg-gray-900/30";
  };
  
  const getTrendDirection = (habit: Habit) => {
    if (!streaks.length) return "neutral";
    
    // Get streaks for this habit
    const habitStreaks = streaks.filter(s => s.habitId === habit.id);
    if (habitStreaks.length < 7) return "neutral";
    
    // Split into recent and earlier periods
    const sortedDates = habitStreaks.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const recentStreaks = sortedDates.slice(0, Math.floor(sortedDates.length / 2));
    const earlierStreaks = sortedDates.slice(Math.floor(sortedDates.length / 2));
    
    // Calculate completion rates
    const recentCompletionRate = recentStreaks.filter(s => s.completed).length / recentStreaks.length;
    const earlierCompletionRate = earlierStreaks.filter(s => s.completed).length / earlierStreaks.length;
    
    // Determine trend
    const difference = recentCompletionRate - earlierCompletionRate;
    if (difference > 0.1) return "improving";
    if (difference < -0.1) return "declining";
    return "neutral";
  };
  
  // Get color class based on trend
  const getTrendColorClass = (trend: string) => {
    if (trend === "improving") return "text-green-400";
    if (trend === "declining") return "text-red-400";
    return "text-gray-400";
  };
  
  // Get icon based on trend
  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend === "declining") return <TrendingUp className="h-4 w-4 text-red-400 transform rotate-180" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };
  
  if (loadingHabits && habits.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading habits...</p>
        </div>
      </div>
    );
  }
  
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-2">
            <Flame className="h-8 w-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">No habits found</h3>
          <p className="text-gray-400 max-w-md">
            Start by creating your first habit to track. Consistent habits are the key to achieving your goals.
          </p>
        </div>
        
        <Button 
          onClick={() => setFormVisible(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Habit
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Habits list and selection */}
        <Card className="md:col-span-1 bg-gray-900/50 border-gray-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Flame className="h-5 w-5 mr-2 text-orange-400" />
              Your Habits
            </CardTitle>
            <CardDescription>Select a habit to track your streak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  onClick={() => handleHabitSelect(habit)}
                  className={`p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all flex items-center justify-between ${
                    selectedHabit?.id === habit.id ? 'bg-gray-800 border border-green-500/30' : 'bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-10 rounded-full ${habit.priority === 'high' ? 'bg-red-500' : habit.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="font-medium text-white">{habit.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{habit.targetDaysPerWeek} days/week</span>
                        <span>•</span>
                        <span className="capitalize">{habit.category || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedHabit?.id === habit.id && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      Selected
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => setFormVisible(true)}
              variant="outline" 
              className="w-full border-dashed border-gray-700 hover:border-green-500/50 hover:bg-green-500/5"
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Habit
            </Button>
          </CardFooter>
        </Card>
        
        {/* Main streak tracking section */}
        <Card className="md:col-span-2 bg-gray-900/50 border-gray-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl"></div>
          
          {selectedHabit && (
            <>
              <CardHeader className="pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center">
                      {selectedHabit.name}
                      <Badge 
                        className={`ml-2 ${selectedHabit.priority === 'high' ? 'bg-red-500/20 text-red-300' : 
                          selectedHabit.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                          'bg-blue-500/20 text-blue-300'}`}
                      >
                        {selectedHabit.priority.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedHabit.description || `Track your progress for ${selectedHabit.name}`}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <button 
                        onClick={() => setViewMode('grid')} 
                        className={`px-3 py-1.5 rounded-l-md text-sm ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        Grid
                      </button>
                      <button 
                        onClick={() => setViewMode('calendar')} 
                        className={`px-3 py-1.5 rounded-r-md text-sm ${viewMode === 'calendar' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                      >
                        Calendar
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-5">
                {/* Stats section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-400">Current Streak</h4>
                      <div className="flex items-center">
                        <span className="text-orange-400 text-sm">{getStreakEmoji(currentStreakCount)}</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold mt-1 text-white">{getStreakCountText(currentStreakCount)}</p>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-400">Longest Streak</h4>
                      <Medal className="h-4 w-4 text-yellow-400" />
                    </div>
                    <p className="text-xl font-bold mt-1 text-white">{getStreakCountText(longestStreakCount)}</p>
                  </div>
                  
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-400">Completion Rate</h4>
                      {getTrendIcon(getTrendDirection(selectedHabit))}
                    </div>
                    <p className="text-xl font-bold mt-1 text-white">{calculateCompletionRate(selectedHabit)}%</p>
                    <div className="absolute -right-1 -bottom-1 opacity-10">
                      <Zap className="h-14 w-14 text-yellow-400" />
                    </div>
                  </div>
                </div>
                
                {viewMode === 'grid' ? (
                  // Grid view
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Recent Days</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 14 }).map((_, idx) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 13 + idx);
                        
                        const streak = getStreak(selectedHabit.id, date);
                        const isCompleted = streak?.completed;
                        const isToday = isSameDay(date, new Date());
                        
                        return (
                          <div key={idx} className="flex flex-col items-center">
                            <div className="text-xs text-gray-500 mb-1">{format(date, 'E')}</div>
                            <div 
                              className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                                isToday ? 'border-green-500' : 'border-gray-700'
                              } ${
                                isCompleted ? 'bg-green-600/20' : 
                                  streak ? 'bg-red-500/20' : 'bg-gray-800/60'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="h-5 w-5 text-green-400" />
                              ) : streak ? (
                                <X className="h-5 w-5 text-red-400" />
                              ) : (
                                <span className="text-xs text-gray-400">{format(date, 'd')}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{format(date, 'MMM')}</div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Mark today's habit section */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-white mb-4">Today's Progress</h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-white font-medium">
                              {format(new Date(), 'EEEE, MMMM d')}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Track your progress for today
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="destructive"
                              onClick={() => markHabitForDate(selectedHabit, new Date(), false)}
                              className="shadow-lg hover:shadow-red-500/20"
                              disabled={loadingStreaks}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Missed
                            </Button>
                            
                            <AnimatedButton
                              variant="default"
                              className="bg-gradient-to-r from-green-600 to-emerald-500 border-0 shadow-lg hover:shadow-green-500/30"
                              onClick={() => markHabitForDate(selectedHabit, new Date(), true)}
                              disabled={loadingStreaks}
                              animation="pulse"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Completed
                            </AnimatedButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Calendar view
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">This Week</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDates.map((date, idx) => {
                        const streak = getStreak(selectedHabit.id, date);
                        const isCompleted = streak?.completed;
                        const isToday = isSameDay(date, new Date());
                        const isPast = isBefore(date, new Date()) && !isToday;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col items-center ${isToday ? 'relative' : ''}`}
                          >
                            {isToday && (
                              <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse z-10" />
                            )}
                            <div className="text-sm font-medium text-gray-300 mb-1">{format(date, 'E')}</div>
                            <button
                              disabled={!isPast && !isToday}
                              onClick={() => setSelectedDate(date)}
                              className={`w-full aspect-square flex flex-col items-center justify-center rounded-lg border ${
                                isToday ? 'border-green-500' : 'border-gray-700'
                              } ${getDayBackgroundClass(date)} ${
                                isSameDay(date, selectedDate) ? 'ring-2 ring-blue-500' : ''
                              } ${
                                (isPast || isToday) ? 'cursor-pointer hover:bg-gray-700/50' : 'cursor-not-allowed opacity-60'
                              }`}
                            >
                              <span className={`text-lg ${isToday ? 'font-bold text-green-400' : 'text-gray-200'}`}>
                                {format(date, 'd')}
                              </span>
                              
                              {isCompleted ? (
                                <div className="mt-1 text-green-400">
                                  <Check className="h-5 w-5" />
                                </div>
                              ) : streak ? (
                                <div className="mt-1 text-red-400">
                                  <X className="h-5 w-5" />
                                </div>
                              ) : (
                                <div className="mt-1 h-5 w-5"></div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Selected date actions */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">
                          {format(selectedDate, 'EEEE, MMMM d')}
                        </h3>
                        {isSameDay(selectedDate, new Date()) && (
                          <Badge className="bg-green-500/20 text-green-300">Today</Badge>
                        )}
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="text-white font-medium">
                              {selectedHabit.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {selectedHabit.description || `Record your progress for ${format(selectedDate, 'MMM d')}`}
                            </p>
                          </div>
                          
                          {(isBefore(selectedDate, new Date()) || isSameDay(selectedDate, new Date())) && (
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="destructive"
                                onClick={() => markHabitForDate(selectedHabit, selectedDate, false)}
                                className="shadow-lg hover:shadow-red-500/20"
                                disabled={loadingStreaks}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Missed
                              </Button>
                              
                              <Button
                                variant="default"
                                className="bg-gradient-to-r from-green-600 to-emerald-500 border-0 shadow-lg hover:shadow-green-500/30"
                                onClick={() => markHabitForDate(selectedHabit, selectedDate, true)}
                                disabled={loadingStreaks}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Completed
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
      
      {/* Success animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="rounded-full bg-green-500/20 w-32 h-32 flex items-center justify-center">
              <Check className="h-16 w-16 text-green-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Particles on success */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <div className="fixed inset-0 pointer-events-none z-40">
            <ParticleEffect
              type="confetti"
              count={100}
              colors={["#10b981", "#34d399", "#6ee7b7", "#ecfdf5"]}
              duration={2000}
              particleSize={[5, 10]}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}