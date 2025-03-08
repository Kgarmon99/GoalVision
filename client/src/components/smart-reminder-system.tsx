import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format, parseISO, isSameDay, addDays, subDays, isBefore, isPast, isFuture, differenceInDays } from "date-fns";
import { Habit, HabitStreak } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BellRing, Bell, Zap, CalendarClock, BellOff, Flame, AlertTriangle, Check, X, Award, Calendar, SkipForward, UserRound, ArrowRight, CheckCircle2, AlarmClock } from "lucide-react";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ParticleEffect } from "@/components/ui/particle-effect";
import { AnimatedProgress } from "@/components/ui/animated-progress";

interface SmartReminderSystemProps {
  habitId?: number;
  habits?: Habit[];
  onHabitSelect?: (habitId: number) => void;
}

export function SmartReminderSystem({ habitId, habits, onHabitSelect }: SmartReminderSystemProps) {
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferredReminderTime, setPreferredReminderTime] = useState<string>('08:00');
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(false);
  const [weeklyPattern, setWeeklyPattern] = useState<{[key: string]: number}>({});
  const [timeBasedReminders, setTimeBasedReminders] = useState(true);
  const [adaptiveReminders, setAdaptiveReminders] = useState(true);
  const [pendingReminder, setPendingReminder] = useState<{habitId: number, type: string, time: string} | null>(null);
  const [currentStreakCount, setCurrentStreakCount] = useState<number>(0);
  const [dangerDays, setDangerDays] = useState<string[]>([]);
  const [nextMilestone, setNextMilestone] = useState<number>(0);
  const { toast } = useToast();
  
  // Fetch habits data if not provided
  useEffect(() => {
    if (habits && habits.length > 0) {
      setLocalHabits(habits);
      setLoadingHabits(false);
      
      // Set selected habit from the provided habitId or first habit
      const habit = habitId 
        ? habits.find(h => h.id === habitId) 
        : habits[0];
        
      if (habit) {
        setSelectedHabit(habit);
        fetchHabitData(habit.id);
      }
    } else {
      async function fetchHabits() {
        try {
          setLoadingHabits(true);
          const response = await apiRequest("GET", '/api/habits');
          const data = await response.json();
          setLocalHabits(data);
          
          if (data.length > 0) {
            const habit = habitId 
              ? data.find((h: any) => h.id === habitId) 
              : data[0];
              
            if (habit) {
              setSelectedHabit(habit);
              fetchHabitData(habit.id);
            }
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
      
      fetchHabits();
    }
  }, [habitId, habits]);
  
  // Handle manual habit selection
  const handleHabitChange = (habitId: string) => {
    const habit = localHabits.find(h => h.id === parseInt(habitId));
    if (habit) {
      setSelectedHabit(habit);
      fetchHabitData(habit.id);
      
      // Call parent's onHabitSelect if provided
      if (onHabitSelect) {
        onHabitSelect(habit.id);
      }
    }
  };
  
  // Fetch habit streak data and analyze patterns
  async function fetchHabitData(habitId: number) {
    try {
      setLoadingStreaks(true);
      
      // Get current date info for date range
      const today = new Date();
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(today.getDate() - 60);
      
      // Format dates for API query
      const startDate = sixtyDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      // Fetch streaks for the date range
      const response = await apiRequest("GET", `/api/habits/${habitId}/streaks/range?startDate=${startDate}&endDate=${endDate}`);
      const streakData = await response.json();
      setStreaks(streakData);
      
      // Get current streak count
      const currentStreakResponse = await apiRequest("GET", `/api/habits/${habitId}/current-streak`);
      const currentStreakData = await currentStreakResponse.json();
      setCurrentStreakCount(currentStreakData.currentStreak || 0);
      
      // Calculate next milestone (next 5-day increment)
      const currentStreak = currentStreakData.currentStreak || 0;
      const nextMilestoneValue = Math.ceil((currentStreak + 1) / 5) * 5;
      setNextMilestone(nextMilestoneValue);
      
      // Analyze weekly patterns
      analyzeWeeklyPatterns(streakData);
      
      // Set reminder time from the habit data if available
      const selectedHabit = localHabits.find(h => h.id === habitId);
      if (selectedHabit && selectedHabit.reminderTime) {
        setPreferredReminderTime(selectedHabit.reminderTime);
      }
      
      setLoadingStreaks(false);
    } catch (error) {
      console.error('Error fetching habit data:', error);
      toast({
        title: "Failed to load habit data",
        description: "Please try again later",
        variant: "destructive"
      });
      setLoadingStreaks(false);
    }
  }
  
  // Analyze weekly patterns to determine when habit is most often missed
  const analyzeWeeklyPatterns = (streaks: HabitStreak[]) => {
    const weekdayMissed: {[key: string]: number} = {
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0,
      'Sunday': 0
    };
    
    const weekdayTotal: {[key: string]: number} = {
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0,
      'Sunday': 0
    };
    
    streaks.forEach(streak => {
      const date = new Date(streak.date);
      const day = format(date, 'EEEE');
      
      weekdayTotal[day]++;
      if (!streak.completed) {
        weekdayMissed[day]++;
      }
    });
    
    // Calculate miss percentage for each day
    const missPercentage: {[key: string]: number} = {};
    Object.keys(weekdayTotal).forEach(day => {
      if (weekdayTotal[day] > 0) {
        missPercentage[day] = Math.round((weekdayMissed[day] / weekdayTotal[day]) * 100);
      } else {
        missPercentage[day] = 0;
      }
    });
    
    setWeeklyPattern(missPercentage);
    
    // Determine danger days (days with miss rate > 40%)
    const dangerDaysList: string[] = [];
    Object.entries(missPercentage).forEach(([day, percentage]) => {
      if (percentage > 40 && weekdayTotal[day] >= 3) {
        dangerDaysList.push(day);
      }
    });
    
    setDangerDays(dangerDaysList);
  };
  
  // Determine if today is a "danger day" based on past patterns
  const isTodayDangerDay = useMemo(() => {
    const today = format(new Date(), 'EEEE');
    return dangerDays.includes(today);
  }, [dangerDays]);
  
  // Calculate the next scheduled reminder
  const nextReminderTime = useMemo(() => {
    if (!selectedHabit || !reminderEnabled) return null;
    
    // Use habit's reminder time if available, otherwise use preferred time
    const reminderTime = selectedHabit.reminderTime || preferredReminderTime;
    
    // Extract hours and minutes from the reminder time
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    // Create reminder date
    const now = new Date();
    let reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If today's reminder time has passed, set for tomorrow
    if (reminderDate < now) {
      reminderDate = addDays(reminderDate, 1);
    }
    
    return reminderDate;
  }, [selectedHabit, reminderEnabled, preferredReminderTime]);
  
  // Save reminder time to habit
  const saveReminderTime = async () => {
    if (!selectedHabit) return;
    
    try {
      // Update habit with new reminder time
      const response = await apiRequest("PATCH", `/api/habits/${selectedHabit.id}`, {
        reminderTime: preferredReminderTime
      });
      
      if (response.ok) {
        toast({
          title: "Reminder time updated",
          description: `Reminder set for ${preferredReminderTime}`,
        });
        
        // Update local habit data
        setLocalHabits(prevHabits => 
          prevHabits.map(h => 
            h.id === selectedHabit.id 
              ? { ...h, reminderTime: preferredReminderTime } 
              : h
          )
        );
      }
    } catch (error) {
      console.error('Error saving reminder time:', error);
      toast({
        title: "Failed to update reminder time",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  // Toggle browser notifications (permission request)
  const toggleNotifications = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(!notificationsEnabled);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          toast({
            title: "Notifications enabled",
            description: "You'll receive browser notifications for your habits",
          });
        } else {
          toast({
            title: "Notification permission denied",
            description: "You'll need to enable permissions in your browser settings",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Notifications blocked",
          description: "You'll need to enable permissions in your browser settings",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
    }
  };
  
  // Get today's status for selected habit
  const getTodayStatus = useMemo(() => {
    if (!selectedHabit || !streaks.length) return 'pending';
    
    const today = new Date();
    const todayStreak = streaks.find(s => 
      isSameDay(new Date(s.date), today)
    );
    
    if (!todayStreak) return 'pending';
    return todayStreak.completed ? 'completed' : 'missed';
  }, [selectedHabit, streaks]);
  
  // Mark habit as completed for today
  const markHabitCompleted = async () => {
    if (!selectedHabit) return;
    
    try {
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');
      
      // Check if there's already a streak for today
      const existingStreak = streaks.find(s => 
        isSameDay(new Date(s.date), today)
      );
      
      if (existingStreak) {
        // Update existing streak
        const response = await apiRequest("PATCH", `/api/habits/${selectedHabit.id}/streaks/${existingStreak.id}`, {
          completed: true
        });
        
        if (response.ok) {
          // Update local state
          setStreaks(prevStreaks => 
            prevStreaks.map(s => 
              s.id === existingStreak.id ? { ...s, completed: true } : s
            )
          );
          
          toast({
            title: "Habit completed",
            description: `${selectedHabit.name} marked as completed for today`,
          });
          
          // Update streak count
          setCurrentStreakCount(prev => prev + 1);
        }
      } else {
        // Create new streak
        const response = await apiRequest("POST", `/api/habits/${selectedHabit.id}/streaks`, {
          date: dateStr,
          completed: true,
        });
        
        if (response.ok) {
          const newStreak = await response.json();
          
          // Update local state
          setStreaks(prevStreaks => [...prevStreaks, newStreak]);
          
          toast({
            title: "Habit completed",
            description: `${selectedHabit.name} marked as completed for today`,
          });
          
          // Update streak count
          setCurrentStreakCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error marking habit completed:', error);
      toast({
        title: "Failed to update habit",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  // Skip habit for today
  const skipHabitToday = async () => {
    if (!selectedHabit) return;
    
    try {
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');
      
      // Check if there's already a streak for today
      const existingStreak = streaks.find(s => 
        isSameDay(new Date(s.date), today)
      );
      
      if (existingStreak) {
        // Update existing streak
        const response = await apiRequest("PATCH", `/api/habits/${selectedHabit.id}/streaks/${existingStreak.id}`, {
          completed: false
        });
        
        if (response.ok) {
          // Update local state
          setStreaks(prevStreaks => 
            prevStreaks.map(s => 
              s.id === existingStreak.id ? { ...s, completed: false } : s
            )
          );
          
          toast({
            title: "Habit skipped",
            description: `${selectedHabit.name} marked as skipped for today`,
            variant: "destructive"
          });
          
          // Reset streak count
          setCurrentStreakCount(0);
        }
      } else {
        // Create new streak marked as not completed
        const response = await apiRequest("POST", `/api/habits/${selectedHabit.id}/streaks`, {
          date: dateStr,
          completed: false,
        });
        
        if (response.ok) {
          const newStreak = await response.json();
          
          // Update local state
          setStreaks(prevStreaks => [...prevStreaks, newStreak]);
          
          toast({
            title: "Habit skipped",
            description: `${selectedHabit.name} marked as skipped for today`,
            variant: "destructive"
          });
          
          // Reset streak count
          setCurrentStreakCount(0);
        }
      }
    } catch (error) {
      console.error('Error skipping habit:', error);
      toast({
        title: "Failed to update habit",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  // Get danger level for today based on pattern analysis
  const getDangerLevel = (): 'low' | 'medium' | 'high' => {
    if (isTodayDangerDay) return 'high';
    
    const today = format(new Date(), 'EEEE');
    const missRate = weeklyPattern[today] || 0;
    
    if (missRate > 30) return 'medium';
    return 'low';
  };
  
  // Get text for danger level
  const getDangerLevelText = (): string => {
    const level = getDangerLevel();
    
    if (level === 'high') return "High risk day! You often miss this habit today.";
    if (level === 'medium') return "Medium risk - stay focused on this habit today.";
    return "Low risk - you usually complete this habit today.";
  };
  
  // Loading state
  if (loadingHabits && localHabits.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading reminder system...</p>
        </div>
      </div>
    );
  }
  
  // No habits state
  if (localHabits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-2">
            <BellRing className="h-8 w-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">No habits for reminders</h3>
          <p className="text-gray-400 max-w-md">
            Create habits first to set up smart reminders and get notified at the optimal times.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header with habit selector */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Habit</label>
          <Select
            value={selectedHabit ? selectedHabit.id.toString() : ""}
            onValueChange={handleHabitChange}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select a habit to manage reminders" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {localHabits.map((habit) => (
                <SelectItem key={habit.id} value={habit.id.toString()}>
                  {habit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="notification-mode" 
              checked={notificationsEnabled} 
              onCheckedChange={toggleNotifications} 
            />
            <Label htmlFor="notification-mode" className="text-sm text-gray-400">
              Browser Notifications
            </Label>
          </div>
        </div>
      </div>
      
      {selectedHabit && (
        <AnimatedComponent animation="fadeIn" delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Status Card */}
            <Card className="md:col-span-1 bg-gray-900/50 border-gray-800 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  Today's Status
                </CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Habit name and today's status */}
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-md font-medium text-white mb-1">{selectedHabit.name}</h3>
                    <p className="text-sm text-gray-400">{selectedHabit.description || "No description"}</p>
                    
                    <div className="mt-3 flex items-center space-x-2">
                      <Badge className={getTodayStatus === 'completed' 
                          ? 'bg-green-500/20 text-green-300' 
                          : getTodayStatus === 'missed' 
                            ? 'bg-red-500/20 text-red-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }
                      >
                        {getTodayStatus === 'completed' 
                          ? 'COMPLETED' 
                          : getTodayStatus === 'missed' 
                            ? 'MISSED' 
                            : 'PENDING'
                        }
                      </Badge>
                      
                      <span className="text-sm text-gray-400">
                        Current streak: <span className="text-orange-400 font-medium">{currentStreakCount} days</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Risk assessment */}
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-medium text-white">Risk Assessment</h3>
                      <Badge className={
                        getDangerLevel() === 'high' 
                          ? 'bg-red-500/20 text-red-300' 
                          : getDangerLevel() === 'medium' 
                            ? 'bg-yellow-500/20 text-yellow-300' 
                            : 'bg-green-500/20 text-green-300'
                      }>
                        {getDangerLevel().toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{getDangerLevelText()}</p>
                    
                    {dangerDays.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-red-400">Danger days: {dangerDays.join(', ')}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick actions */}
                  {getTodayStatus === 'pending' && (
                    <div className="mt-2 flex space-x-2">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={skipHabitToday}
                      >
                        <SkipForward className="h-4 w-4 mr-1" />
                        Skip Today
                      </Button>
                      <AnimatedButton 
                        variant="default" 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 border-0"
                        animation="pulse"
                        onClick={markHabitCompleted}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Complete
                      </AnimatedButton>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Reminders Configuration Card */}
            <Card className="md:col-span-1 bg-gray-900/50 border-gray-800 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-400" />
                  Reminder Settings
                </CardTitle>
                <CardDescription>Customize when you're reminded</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Master reminder toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-medium text-white">Enable Reminders</h3>
                      <p className="text-xs text-gray-400">All notifications for this habit</p>
                    </div>
                    <Switch 
                      checked={reminderEnabled} 
                      onCheckedChange={setReminderEnabled}
                    />
                  </div>
                  
                  {reminderEnabled && (
                    <>
                      <Separator className="bg-gray-700" />
                      
                      {/* Reminder Time */}
                      <div className="space-y-2">
                        <Label className="text-sm text-white">Preferred Reminder Time</Label>
                        <div className="flex space-x-2">
                          <Input 
                            type="time" 
                            value={preferredReminderTime} 
                            onChange={(e) => setPreferredReminderTime(e.target.value)}
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={saveReminderTime}
                          >
                            Save
                          </Button>
                        </div>
                        {nextReminderTime && (
                          <p className="text-xs text-gray-400">
                            Next reminder: {format(nextReminderTime, 'EEEE, MMM d')} at {format(nextReminderTime, 'h:mm a')}
                          </p>
                        )}
                      </div>
                      
                      {/* Adaptive Reminders */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium text-white">Adaptive Reminders</h3>
                          <p className="text-xs text-gray-400">Additional reminders on high-risk days</p>
                        </div>
                        <Switch 
                          checked={adaptiveReminders} 
                          onCheckedChange={setAdaptiveReminders}
                        />
                      </div>
                      
                      {/* Time-Based Reminders */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-medium text-white">Time-Based Reminders</h3>
                          <p className="text-xs text-gray-400">Get reminders at specific times</p>
                        </div>
                        <Switch 
                          checked={timeBasedReminders} 
                          onCheckedChange={setTimeBasedReminders}
                        />
                      </div>
                      
                      {/* Reminder Preview */}
                      <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-700 flex items-center space-x-3">
                        <div className="p-1.5 bg-purple-500/20 rounded-full">
                          <BellRing className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-sm">
                          <p className="text-white">Reminder: {selectedHabit.name}</p>
                          <p className="text-xs text-gray-400">Don't forget to complete this habit today!</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Milestone Progress Card */}
            <Card className="md:col-span-1 bg-gray-900/50 border-gray-800 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-400" />
                  Milestone Progress
                </CardTitle>
                <CardDescription>Track your next achievement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Next milestone progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-white">Next Milestone: {nextMilestone} Days</h3>
                      <Badge className="bg-yellow-500/20 text-yellow-300">
                        {currentStreakCount}/{nextMilestone}
                      </Badge>
                    </div>
                    
                    <AnimatedProgress
                      value={currentStreakCount}
                      maxValue={nextMilestone}
                      showPercentage={false}
                      showValue={true}
                      height="h-3"
                      indicatorClassName="bg-gradient-to-r from-yellow-500 to-amber-500"
                      className="bg-gray-800"
                    />
                    
                    <p className="text-sm text-gray-400">
                      {nextMilestone - currentStreakCount} more days to reach your next milestone!
                    </p>
                  </div>
                  
                  {/* Upcoming celebrations */}
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-md font-medium text-white mb-2">Upcoming Celebrations</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <div className="p-1 bg-yellow-500/20 rounded-full mr-2">
                          <Flame className="h-4 w-4 text-yellow-400" />
                        </div>
                        <span className="text-gray-300">{nextMilestone} Day Streak</span>
                      </li>
                      
                      <li className="flex items-center text-sm">
                        <div className="p-1 bg-purple-500/20 rounded-full mr-2">
                          <Zap className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-gray-300">30 Day Challenge</span>
                      </li>
                      
                      <li className="flex items-center text-sm">
                        <div className="p-1 bg-blue-500/20 rounded-full mr-2">
                          <UserRound className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-gray-300">Habit Master (100 Days)</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Motivation prompt */}
                  {currentStreakCount > 0 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-green-400 font-medium">
                        You're on a roll! Keep the streak going!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedComponent>
      )}
      
      {selectedHabit && (
        <AnimatedComponent animation="fadeIn" delay={0.4}>
          <Card className="bg-gray-900/50 border-gray-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/5 rounded-full blur-3xl"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlarmClock className="h-5 w-5 mr-2 text-cyan-400" />
                Scheduled Reminders
              </CardTitle>
              <CardDescription>All upcoming alerts for this habit</CardDescription>
            </CardHeader>
            <CardContent>
              {reminderEnabled ? (
                <div className="space-y-3">
                  {/* Standard daily reminder */}
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-700 rounded-full mr-3">
                        <Bell className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-white">Daily Reminder</h3>
                        <p className="text-sm text-gray-400">Every day at {format(new Date(`2025-01-01T${preferredReminderTime}`), 'h:mm a')}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300">Active</Badge>
                  </div>
                  
                  {/* Adaptive reminder for danger days */}
                  {adaptiveReminders && dangerDays.length > 0 && (
                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-700 rounded-full mr-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-md font-medium text-white">Danger Day Reminder</h3>
                          <p className="text-sm text-gray-400">Extra reminder on: {dangerDays.join(', ')}</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-300">Adaptive</Badge>
                    </div>
                  )}
                  
                  {/* Milestone reminder */}
                  <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-700 rounded-full mr-3">
                        <Award className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-md font-medium text-white">Milestone Alert</h3>
                        <p className="text-sm text-gray-400">When you're close to reaching {nextMilestone} days</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300">Motivational</Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 bg-gray-800 rounded-full mb-3">
                    <BellOff className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Reminders are disabled</h3>
                  <p className="text-gray-400 max-w-md mb-4">
                    You won't receive notifications for this habit. Enable reminders to stay on track.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setReminderEnabled(true)}
                    className="border-dashed"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Enable Reminders
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedComponent>
      )}
    </div>
  );
}