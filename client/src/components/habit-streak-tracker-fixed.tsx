import { useState, useEffect } from "react";
import { Habit, HabitStreak } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Calendar as CalendarIcon, X, Award, Zap, Flame } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import Confetti from "react-confetti";
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
        
        const streaksResponse = await apiRequest(
          "GET", 
          `/api/habits/${selectedHabit.id}/streaks/range?startDate=${thirtyDaysAgo.toISOString()}&endDate=${today.toISOString()}`
        );
        const streaksData = await streaksResponse.json();
        setStreaks(streaksData);
        
        const currentStreakResponse = await apiRequest(
          "GET", 
          `/api/habits/${selectedHabit.id}/current-streak`
        );
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
        const updatedStreak = await apiRequest(
          "PATCH",
          `/api/habit-streaks/${todayStreak.id}`,
          {
            completed: true,
            notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
          }
        );
        const updatedStreakData = await updatedStreak.json();
        
        setStreaks(streaks.map(s => s.id === updatedStreakData.id ? updatedStreakData : s));
      } else {
        // Create new streak
        const newStreak = await apiRequest(
          "POST",
          '/api/habit-streaks',
          {
            habitId: selectedHabit.id,
            date: today,
            completed: true,
            notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
          }
        );
        const newStreakData = await newStreak.json();
        
        setStreaks([...streaks, newStreakData]);
      }
      
      // Fetch updated current streak
      const currentStreakResponse = await apiRequest(
        "GET", 
        `/api/habits/${selectedHabit.id}/current-streak`
      );
      const currentStreakData = await currentStreakResponse.json();
      const newCurrentStreak = currentStreakData.currentStreak;
      setCurrentStreak(newCurrentStreak);
      
      // Show confetti if streak hits a milestone
      if (newCurrentStreak % 5 === 0 && newCurrentStreak > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/habits/${selectedHabit.id}/current-streak`] });
      queryClient.invalidateQueries({ queryKey: [`/api/habits/${selectedHabit.id}/streaks`] });
      
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
        const updatedStreak = await apiRequest(
          "PATCH",
          `/api/habit-streaks/${todayStreak.id}`,
          {
            completed: false,
            notes: `Missed on ${format(today, 'MMM dd, yyyy')}`
          }
        );
        const updatedStreakData = await updatedStreak.json();
        
        setStreaks(streaks.map(s => s.id === updatedStreakData.id ? updatedStreakData : s));
      } else {
        // Create new streak
        const newStreak = await apiRequest(
          "POST",
          '/api/habit-streaks',
          {
            habitId: selectedHabit.id,
            date: today,
            completed: false,
            notes: `Missed on ${format(today, 'MMM dd, yyyy')}`
          }
        );
        const newStreakData = await newStreak.json();
        
        setStreaks([...streaks, newStreakData]);
      }
      
      // Fetch updated current streak
      const currentStreakResponse = await apiRequest(
        "GET", 
        `/api/habits/${selectedHabit.id}/current-streak`
      );
      const currentStreakData = await currentStreakResponse.json();
      setCurrentStreak(currentStreakData.currentStreak);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/habits/${selectedHabit.id}/current-streak`] });
      queryClient.invalidateQueries({ queryKey: [`/api/habits/${selectedHabit.id}/streaks`] });
      
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
      {habits.map(habit => (
        <Badge 
          key={habit.id}
          variant={selectedHabit?.id === habit.id ? 'default' : 'outline'}
          className={`cursor-pointer ${
            selectedHabit?.id === habit.id 
              ? (habit.color === 'primary' ? 'bg-green-600 hover:bg-green-700' : 
                 habit.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 
                 habit.color === 'green' ? 'bg-green-600 hover:bg-green-700' : 
                 habit.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 
                 'bg-indigo-600 hover:bg-indigo-700')
              : 'hover:bg-gray-800 text-white border-gray-700'
          }`}
          onClick={() => setSelectedHabit(habit)}
        >
          {habit.name}
        </Badge>
      ))}
    </div>
  );
  
  const StreakCalendar = () => {
    const datesWithStatus = getDatesWithCompletionStatus();
    
    return (
      <Calendar
        mode="default"
        className="border border-gray-800 rounded-md bg-gray-900"
        modifiers={{
          completed: datesWithStatus.filter(d => d.completed).map(d => d.date),
          missed: datesWithStatus.filter(d => !d.completed).map(d => d.date),
        }}
        modifiersClassNames={{
          completed: 'bg-green-900 text-green-300 font-bold rounded-full',
          missed: 'bg-red-900 text-red-300 font-bold rounded-full',
        }}
      />
    );
  };
  
  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
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
      <Card className="bg-gray-900 border-gray-800 gradient-border">
        <CardHeader>
          <CardTitle className="text-white">Habit Streak Tracker</CardTitle>
          <CardDescription className="text-gray-400">Track your daily habits to build consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-600 mb-4" />
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
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Card className="shadow-lg bg-gray-900 border-gray-800 hover:border-green-800 transition-all duration-300 gradient-border">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="flex items-center text-white">
            <Flame className="mr-2 h-6 w-6 text-orange-500" />
            Habit Streak Tracker
          </CardTitle>
          <CardDescription className="text-gray-400">Build consistency with daily habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {renderHabitSelection()}
          
          {selectedHabit && (
            <>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">{selectedHabit.name}</h3>
                  <Badge variant="outline" className="font-mono text-gray-300 border-gray-600">
                    {selectedHabit.frequency}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">{selectedHabit.description}</p>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-gray-900 p-4 rounded-md border border-gray-800 shadow-md neon-glow">
                    <div className="text-sm text-gray-400 mb-1">Current Streak</div>
                    <div className="text-2xl font-bold flex items-center text-white">
                      {currentStreak} 
                      <span className="text-sm ml-1 font-normal text-gray-400">days</span>
                      {currentStreak > 0 && (
                        <Flame className="ml-2 h-5 w-5 text-orange-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded-md border border-gray-800 shadow-md neon-glow">
                    <div className="text-sm text-gray-400 mb-1">Target Streak</div>
                    <div className="text-2xl font-bold flex items-center text-white">
                      {selectedHabit.targetStreakDays || 7}
                      <span className="text-sm ml-1 font-normal text-gray-400">days</span>
                      <Award className="ml-2 h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded-md border border-gray-800 shadow-md neon-glow">
                    <div className="text-sm text-gray-400 mb-1">Reminder Time</div>
                    <div className="text-2xl font-bold text-white">
                      {selectedHabit.reminderTime || "08:00 AM"}
                    </div>
                  </div>
                </motion.div>
                
                <Separator className="my-4 bg-gray-700" />
                
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-green-400">Progress toward target</span>
                    <span className="text-sm font-medium text-green-400">{Math.round(getStreakProgress())}%</span>
                  </div>
                  <Progress 
                    value={getStreakProgress()} 
                    className="h-2 bg-gray-800"
                    indicatorClassName={
                      getStreakProgress() >= 75 ? "bg-green-500" :
                      getStreakProgress() >= 50 ? "bg-yellow-500" :
                      getStreakProgress() >= 25 ? "bg-orange-500" :
                      "bg-red-500"
                    }
                  />
                </div>
                
                {!isTodayRegistered() ? (
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={markHabitComplete}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-5 w-5" />
                      Completed Today
                    </Button>
                    <Button 
                      onClick={markHabitMissed}
                      variant="outline" 
                      className="flex items-center gap-2 text-red-400 border-red-800 hover:border-red-700 hover:bg-red-900/30"
                    >
                      <X className="h-5 w-5" />
                      Missed Today
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-3 rounded-md border border-gray-700 bg-gray-800/50">
                    <div className="mb-2 font-medium text-white">Today's status</div>
                    {isTodayCompleted() ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
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
                        variant="link" 
                        className="text-xs text-blue-400 hover:text-blue-300"
                        onClick={isTodayCompleted() ? markHabitMissed : markHabitComplete}
                      >
                        Change status
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2 text-gray-300">Recent History</h3>
                <StreakCalendar />
              </div>
              
              {currentStreak >= (selectedHabit.targetStreakDays || 7) && (
                <motion.div 
                  className="bg-green-900/30 border border-green-800 rounded-lg p-4 mt-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex justify-center mb-2">
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-300">Target Reached!</h3>
                  <p className="text-sm text-green-400">
                    Congratulations! You've reached your target streak of {selectedHabit.targetStreakDays || 7} days.
                    Keep going to build this habit permanently!
                  </p>
                </motion.div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500 justify-center border-t border-gray-800 pt-4">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-600" />
            Building habits takes 66 days on average for new behaviors to become automatic
          </div>
        </CardFooter>
      </Card>
    </>
  );
}