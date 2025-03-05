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
          response = await apiRequest(`/api/goals/${goalId}/habits`);
        } else {
          response = await apiRequest('/api/habits');
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
        
        const streaksResponse = await apiRequest(`/api/habits/${selectedHabit.id}/streaks/range?startDate=${thirtyDaysAgo.toISOString()}&endDate=${today.toISOString()}`);
        const streaksData = await streaksResponse.json();
        setStreaks(streaksData);
        
        const currentStreakResponse = await apiRequest(`/api/habits/${selectedHabit.id}/current-streak`);
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
        const updatedStreak = await apiRequest(`/api/habit-streaks/${todayStreak.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            completed: true,
            notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
          }),
        });
        const updatedStreakData = await updatedStreak.json();
        
        setStreaks(streaks.map(s => s.id === updatedStreakData.id ? updatedStreakData : s));
      } else {
        // Create new streak
        const newStreak = await apiRequest('/api/habit-streaks', {
          method: 'POST',
          body: JSON.stringify({
            habitId: selectedHabit.id,
            date: today,
            completed: true,
            notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
          }),
        });
        const newStreakData = await newStreak.json();
        
        setStreaks([...streaks, newStreakData]);
      }
      
      // Fetch updated current streak
      const currentStreakResponse = await apiRequest(`/api/habits/${selectedHabit.id}/current-streak`);
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
        const updatedStreak = await apiRequest(`/api/habit-streaks/${todayStreak.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            completed: false,
            notes: `Missed on ${format(today, 'MMM dd, yyyy')}`
          }),
        });
        const updatedStreakData = await updatedStreak.json();
        
        setStreaks(streaks.map(s => s.id === updatedStreakData.id ? updatedStreakData : s));
      } else {
        // Create new streak
        const newStreak = await apiRequest('/api/habit-streaks', {
          method: 'POST',
          body: JSON.stringify({
            habitId: selectedHabit.id,
            date: today,
            completed: false,
            notes: `Missed on ${format(today, 'MMM dd, yyyy')}`
          }),
        });
        const newStreakData = await newStreak.json();
        
        setStreaks([...streaks, newStreakData]);
      }
      
      // Fetch updated current streak
      const currentStreakResponse = await apiRequest(`/api/habits/${selectedHabit.id}/current-streak`);
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
      {habits.map(habit => (
        <Badge 
          key={habit.id}
          variant={selectedHabit?.id === habit.id ? 'default' : 'outline'}
          className={`cursor-pointer ${habit.color === 'primary' ? 'bg-primary' : habit.color === 'blue' ? 'bg-blue-500' : 
            habit.color === 'green' ? 'bg-green-500' : 
            habit.color === 'purple' ? 'bg-purple-500' : 
            habit.color === 'indigo' ? 'bg-indigo-500' : 'bg-primary'}`}
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
        className="border rounded-md"
        modifiers={{
          completed: datesWithStatus.filter(d => d.completed).map(d => d.date),
          missed: datesWithStatus.filter(d => !d.completed).map(d => d.date),
        }}
        modifiersClassNames={{
          completed: 'bg-green-100 text-green-800 font-bold rounded-full',
          missed: 'bg-red-100 text-red-800 font-bold rounded-full',
        }}
        styles={{
          day: { 
            complete: { 
              color: 'white',
              backgroundColor: 'rgba(74, 222, 128, 0.5)',
              fontWeight: 'bold'
            }
          }
        }}
      />
    );
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Habit Streak Tracker</CardTitle>
          <CardDescription>Track your daily habits to build consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No habits found</h3>
            <p className="text-sm text-muted-foreground mt-2">
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
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="mr-2 h-6 w-6 text-orange-500" />
            Habit Streak Tracker
          </CardTitle>
          <CardDescription>Build consistency with daily habits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderHabitSelection()}
          
          {selectedHabit && (
            <>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{selectedHabit.name}</h3>
                  <Badge variant="outline" className="font-mono">
                    {selectedHabit.frequency}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{selectedHabit.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-md border shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
                    <div className="text-2xl font-bold flex items-center">
                      {currentStreak} 
                      <span className="text-sm ml-1 font-normal">days</span>
                      {currentStreak > 0 && (
                        <Flame className="ml-2 h-5 w-5 text-orange-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md border shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Target Streak</div>
                    <div className="text-2xl font-bold flex items-center">
                      {selectedHabit.targetStreakDays || 7}
                      <span className="text-sm ml-1 font-normal">days</span>
                      <Award className="ml-2 h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md border shadow-sm">
                    <div className="text-sm text-muted-foreground mb-1">Reminder Time</div>
                    <div className="text-2xl font-bold">
                      {selectedHabit.reminderTime || "08:00 AM"}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress toward target</span>
                    <span className="text-sm font-medium">{Math.round(getStreakProgress())}%</span>
                  </div>
                  <Progress value={getStreakProgress()} className="h-2" />
                </div>
                
                {!isTodayRegistered() ? (
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={markHabitComplete}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-5 w-5" />
                      Completed Today
                    </Button>
                    <Button 
                      onClick={markHabitMissed}
                      variant="outline" 
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                      Missed Today
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-3 rounded-md border bg-gray-50">
                    <div className="mb-2 font-medium">Today's status</div>
                    {isTodayCompleted() ? (
                      <Badge className="bg-green-600 hover:bg-green-700">
                        <Check className="mr-1 h-4 w-4" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        <X className="mr-1 h-4 w-4" />
                        Missed
                      </Badge>
                    )}
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        variant="link" 
                        className="text-xs"
                        onClick={isTodayCompleted() ? markHabitMissed : markHabitComplete}
                      >
                        Change status
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-md font-medium mb-2">Recent History</h3>
                <StreakCalendar />
              </div>
              
              {currentStreak >= (selectedHabit.targetStreakDays || 7) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Target Reached!</h3>
                  <p className="text-sm text-green-700">
                    Congratulations! You've reached your target streak of {selectedHabit.targetStreakDays || 7} days.
                    Keep going to build this habit permanently!
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Building habits takes 66 days on average for new behaviors to become automatic
          </div>
        </CardFooter>
      </Card>
    </>
  );
}