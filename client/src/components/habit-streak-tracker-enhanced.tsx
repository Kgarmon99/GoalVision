import { useState, useEffect } from "react";
import { Habit, HabitStreak } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Calendar as CalendarIcon, X, Award, Zap, Flame } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import Confetti from "react-confetti";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { ParticleEffect } from "@/components/ui/particle-effect";
import { motion } from "framer-motion";

interface HabitStreakTrackerProps {
  goalId?: number;
}

export function HabitStreakTracker({ goalId }: HabitStreakTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch habits
  useEffect(() => {
    async function fetchHabits() {
      try {
        setLoading(true);
        let response;
        if (goalId) {
          response = await apiRequest("GET", `/api/goals/${goalId}/habits`);
        } else {
          response = await apiRequest("GET", '/api/habits');
        }
        const data = await response.json();
        setHabits(data);
        
        if (data.length > 0) {
          setSelectedHabit(data[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setLoading(false);
      }
    }
    fetchHabits();
  }, [goalId]);
  
  // Fetch streaks when selected habit changes
  useEffect(() => {
    if (!selectedHabit) return;
    
    async function fetchStreaks() {
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const streaksResponse = await apiRequest("GET", `/api/habits/${selectedHabit?.id}/streaks/range?startDate=${thirtyDaysAgo.toISOString()}&endDate=${today.toISOString()}`);
        const streaksData = await streaksResponse.json();
        setStreaks(streaksData);
        
        const currentStreakResponse = await apiRequest("GET", `/api/habits/${selectedHabit?.id}/current-streak`);
        const currentStreakData = await currentStreakResponse.json();
        setCurrentStreak(currentStreakData.currentStreak);
      } catch (error) {
        console.error('Error fetching streaks:', error);
      }
    }
    fetchStreaks();
  }, [selectedHabit]);
  
  // Function to mark today's habit as complete
  const markHabitComplete = async () => {
    if (!selectedHabit) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if there's already a streak for today
      const todayStreak = streaks.find(streak => {
        const streakDate = new Date(streak.date);
        streakDate.setHours(0, 0, 0, 0);
        return streakDate.getTime() === today.getTime();
      });
      
      if (todayStreak) {
        // Update existing streak
        const updatedStreak = await apiRequest("PATCH", `/api/habit-streaks/${todayStreak.id}`, {
          completed: true,
          notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
        });
        const updatedStreakData = await updatedStreak.json();
        
        setStreaks(streaks.map(s => s.id === updatedStreakData.id ? updatedStreakData : s));
      } else {
        // Create new streak - ensure date is in ISO string format
        const newStreak = await apiRequest("POST", '/api/habit-streaks', {
          habitId: selectedHabit.id,
          date: today.toISOString(), // Convert to ISO string format
          completed: true,
          notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
        });
        const newStreakData = await newStreak.json();
        
        setStreaks([...streaks, newStreakData]);
      }
      
      // Fetch updated current streak
      const currentStreakResponse = await apiRequest("GET", `/api/habits/${selectedHabit.id}/current-streak`);
      const currentStreakData = await currentStreakResponse.json();
      const newCurrentStreak = currentStreakData.currentStreak;
      setCurrentStreak(newCurrentStreak);
      
      // Show confetti if streak hits a milestone
      if (newCurrentStreak % 5 === 0 && newCurrentStreak > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
    } catch (error) {
      console.error('Error marking habit complete:', error);
    }
  };
  
  // Function to mark today's habit as missed
  const markHabitMissed = async () => {
    if (!selectedHabit) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if there's already a streak for today
      const todayStreak = streaks.find(streak => {
        const streakDate = new Date(streak.date);
        streakDate.setHours(0, 0, 0, 0);
        return streakDate.getTime() === today.getTime();
      });
      
      if (todayStreak) {
        // Update existing streak
        const updatedStreak = await apiRequest("PATCH", `/api/habit-streaks/${todayStreak.id}`, {
          completed: false,
          notes: `Missed on ${format(today, 'MMM dd, yyyy')}`
        });
        const updatedStreakData = await updatedStreak.json();
        
        setStreaks(streaks.map(s => s.id === updatedStreakData.id ? updatedStreakData : s));
      } else {
        // Create new streak - ensure date is in ISO string format
        const newStreak = await apiRequest("POST", '/api/habit-streaks', {
          habitId: selectedHabit.id,
          date: today.toISOString(), // Convert to ISO string format
          completed: false,
          notes: `Missed on ${format(today, 'MMM dd, yyyy')}`
        });
        const newStreakData = await newStreak.json();
        
        setStreaks([...streaks, newStreakData]);
      }
      
      // Fetch updated current streak
      const currentStreakResponse = await apiRequest("GET", `/api/habits/${selectedHabit.id}/current-streak`);
      const currentStreakData = await currentStreakResponse.json();
      setCurrentStreak(currentStreakData.currentStreak);
      
    } catch (error) {
      console.error('Error marking habit missed:', error);
    }
  };
  
  const getStreakProgress = () => {
    if (!selectedHabit) return 0;
    return Math.min(100, (currentStreak / (selectedHabit.targetStreakDays || 7)) * 100);
  };
  
  // Determine if today's streak is already registered
  const isTodayRegistered = () => {
    if (!streaks.length) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return streaks.some(streak => {
      const streakDate = new Date(streak.date);
      streakDate.setHours(0, 0, 0, 0);
      return streakDate.getTime() === today.getTime();
    });
  };
  
  // Determine if today's streak is completed
  const isTodayCompleted = () => {
    if (!streaks.length) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStreak = streaks.find(streak => {
      const streakDate = new Date(streak.date);
      streakDate.setHours(0, 0, 0, 0);
      return streakDate.getTime() === today.getTime();
    });
    
    return todayStreak?.completed || false;
  };
  
  // Map streaks to calendar
  const getDatesWithCompletionStatus = () => {
    return streaks.map(streak => {
      const date = new Date(streak.date);
      return {
        date,
        completed: streak.completed
      };
    });
  };
  
  const renderHabitSelection = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {habits.map((habit, index) => (
        <motion.div
          key={habit.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Badge 
            key={habit.id}
            variant={selectedHabit?.id === habit.id ? 'default' : 'outline'}
            className={`cursor-pointer transition-all ${
              selectedHabit?.id === habit.id ? 'scale-110 shadow-glow' : 'hover:scale-105'
            } ${habit.color === 'primary' ? 'bg-primary' : 
              habit.color === 'blue' ? 'bg-blue-500' : 
              habit.color === 'green' ? 'bg-green-500' : 
              habit.color === 'purple' ? 'bg-purple-500' : 
              habit.color === 'indigo' ? 'bg-indigo-500' : 'bg-primary'}`}
            onClick={() => setSelectedHabit(habit)}
          >
            {habit.name}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
  
  const StreakCalendar = () => {
    const datesWithStatus = getDatesWithCompletionStatus();
    
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
        <Calendar
          mode="default"
          className="border rounded-md bg-gray-900/70"
          modifiers={{
            completed: datesWithStatus.filter(d => d.completed).map(d => d.date),
            missed: datesWithStatus.filter(d => !d.completed).map(d => d.date),
          }}
          modifiersClassNames={{
            completed: 'bg-green-900 text-green-100 font-bold rounded-full hover:bg-green-800',
            missed: 'bg-red-900 text-red-100 font-bold rounded-full hover:bg-red-800',
          }}
          // Removed styles prop with invalid 'complete' attribute
          classNames={{
            day_today: "bg-gray-800 text-white rounded-full",
            day_outside: "text-gray-500",
            table: "text-gray-300",
            head_cell: "text-gray-400 font-normal",
            cell: "p-0",
            button: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          }}
        />
      </div>
    );
  };
  
  if (loading) {
    return (
      <Card className="shadow-lg bg-gray-900/70 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (habits.length === 0) {
    return (
      <Card className="shadow-lg bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Habit Streak Tracker</CardTitle>
          <CardDescription className="text-gray-400">Track your daily habits to build consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white">No habits found</h3>
            <p className="text-sm text-gray-400 mt-2">
              {goalId 
                ? "This goal doesn't have any habits associated with it yet." 
                : "You haven't created any habits yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti recycle={false} numberOfPieces={200} />
        </div>
      )}
      
      <AnimatedComponent animation="fadeIn" delay={0.1}>
        <Card className="shadow-xl bg-gray-900/80 border-gray-800 overflow-hidden relative">
          {/* Glow effect for card */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-purple-500/10 opacity-50 blur-xl pointer-events-none"></div>
          
          <CardHeader className="relative z-10 border-b border-gray-800">
            <CardTitle className="flex items-center text-white">
              <Flame className="mr-2 h-6 w-6 text-orange-500 animate-pulse" />
              <span className="text-glow">Habit Streak Tracker</span>
            </CardTitle>
            <CardDescription className="text-gray-400">Build consistency with daily habits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10 pt-6">
            {renderHabitSelection()}
            
            {selectedHabit && (
              <>
                <div className="bg-gray-900/80 p-5 rounded-lg border border-gray-800 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">{selectedHabit.name}</h3>
                    <Badge variant="outline" className="font-mono text-gray-300 border-gray-700">
                      {selectedHabit.frequency}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-6">{selectedHabit.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/80 p-4 rounded-md border border-gray-700 flex flex-col items-center shadow-inner">
                      <div className="text-sm text-gray-400 mb-2">Current Streak</div>
                      <div className="text-3xl font-bold flex items-center text-white">
                        {currentStreak} 
                        <span className="text-sm ml-1 font-normal text-gray-400">days</span>
                        {currentStreak > 0 && (
                          <Flame className="ml-2 h-5 w-5 text-orange-500 animate-pulse" />
                        )}
                      </div>
                      {currentStreak >= 3 && (
                        <div className="mt-2 text-xs text-gray-400">
                          <span className="text-green-400">+{Math.floor(currentStreak / 3)} bonus points</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-800/80 p-4 rounded-md border border-gray-700 flex flex-col items-center shadow-inner">
                      <div className="text-sm text-gray-400 mb-2">Target Streak</div>
                      <div className="text-3xl font-bold flex items-center text-white">
                        {selectedHabit.targetStreakDays || 7}
                        <span className="text-sm ml-1 font-normal text-gray-400">days</span>
                        <Award className="ml-2 h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/80 p-4 rounded-md border border-gray-700 flex flex-col items-center shadow-inner">
                      <div className="text-sm text-gray-400 mb-2">Daily Reminder</div>
                      <div className="text-2xl font-bold text-white">
                        {selectedHabit.reminderTime || "08:00 AM"}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6 bg-gray-800" />
                  
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Progress toward target</span>
                      <span className="text-sm font-medium text-gray-300">{Math.round(getStreakProgress())}%</span>
                    </div>
                    <AnimatedProgress 
                      value={getStreakProgress()} 
                      className="h-2 bg-gray-800" 
                      indicatorClassName="bg-gradient-to-r from-green-600 to-emerald-500"
                      threshold={{
                        high: 75,
                        medium: 50,
                        low: 25
                      }}
                      thresholdColors={{
                        high: "bg-gradient-to-r from-green-600 to-emerald-500",
                        medium: "bg-gradient-to-r from-amber-500 to-orange-500",
                        low: "bg-gradient-to-r from-orange-500 to-red-500",
                        veryLow: "bg-gradient-to-r from-red-600 to-red-500"
                      }}
                    />
                    
                    {getStreakProgress() === 100 && (
                      <div className="mt-2 text-center">
                        <ParticleEffect
                          type="sparkles"
                          count={10}
                          colors={["#10b981", "#3b82f6", "#8b5cf6"]}
                          className="absolute inset-0"
                          autoPlay={true}
                        />
                        <span className="text-green-400 text-sm font-semibold relative z-10">Target achieved! 🏆</span>
                      </div>
                    )}
                  </div>
                  
                  {!isTodayRegistered() ? (
                    <div className="flex justify-center gap-4">
                      <Button 
                        onClick={markHabitComplete}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 border-0"
                      >
                        <Check className="h-5 w-5" />
                        Completed Today
                      </Button>
                      <Button 
                        onClick={markHabitMissed}
                        variant="outline" 
                        className="flex items-center gap-2 text-red-400 border-red-800 hover:bg-red-950 hover:text-red-300"
                      >
                        <X className="h-5 w-5" />
                        Missed Today
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4 rounded-md border bg-gray-800/70 border-gray-700">
                      <div className="mb-2 font-medium text-gray-300">Today's status</div>
                      {isTodayCompleted() ? (
                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
                          <Check className="mr-1 h-4 w-4" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-400 border-red-800">
                          <X className="mr-1 h-4 w-4" />
                          Missed
                        </Badge>
                      )}
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs text-gray-400 hover:text-white"
                          onClick={isTodayCompleted() ? markHabitMissed : markHabitComplete}
                        >
                          Change status
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-4 text-white flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Recent History
                  </h3>
                  <StreakCalendar />
                </div>
                
                {currentStreak >= (selectedHabit.targetStreakDays || 7) && (
                  <div className="bg-green-900/40 border border-green-800/80 rounded-lg p-4 mt-4 text-center relative overflow-hidden">
                    <ParticleEffect
                      type="confetti"
                      count={15}
                      colors={["#10b981", "#3b82f6", "#8b5cf6"]}
                      className="absolute inset-0"
                      autoPlay={true}
                    />
                    <div className="relative z-10">
                      <Award className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-green-300 mb-1">Congratulations!</h3>
                      <p className="text-green-200">
                        You've reached your target streak of {selectedHabit.targetStreakDays} days. Keep going to build your habit even stronger!
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </AnimatedComponent>
    </>
  );
}