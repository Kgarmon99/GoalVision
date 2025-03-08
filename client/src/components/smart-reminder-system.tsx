import { useState, useEffect } from "react";
import { Habit, HabitStreak } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  BellRing, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  BellOff,
  Smartphone,
  Zap,
  PieChart,
  Flame
} from "lucide-react";
import { format, addDays, isToday, parseISO, isBefore, isAfter, differenceInDays, startOfDay, isWithinInterval } from "date-fns";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ParticleEffect } from "@/components/ui/particle-effect";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SmartReminderSystemProps {
  habitId?: number;
  habits?: Habit[];
  onHabitSelect?: (habitId: number) => void;
}

export function SmartReminderSystem({ habitId, habits, onHabitSelect }: SmartReminderSystemProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<number | undefined>(habitId);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [allHabits, setAllHabits] = useState<Habit[]>(habits || []);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reminderSettings, setReminderSettings] = useState<{
    enabled: boolean;
    time: string;
    advancedReminders: boolean;
    smartSuggestions: boolean;
    browserNotifications: boolean;
  }>({
    enabled: true,
    time: "08:00",
    advancedReminders: false,
    smartSuggestions: true,
    browserNotifications: true
  });
  const [upcomingReminders, setUpcomingReminders] = useState<Array<{
    habit: Habit;
    time: string;
    day: string;
    message: string;
    type: 'standard' | 'smart' | 'warning' | 'milestone';
  }>>([]);
  const { toast } = useToast();
  
  // Fetch habits if not provided
  useEffect(() => {
    if (!habits) {
      async function fetchHabits() {
        try {
          setLoading(true);
          const response = await apiRequest("GET", '/api/habits');
          const data = await response.json();
          setAllHabits(data);
          
          if (data.length > 0) {
            const initialHabitId = habitId || data[0].id;
            setSelectedHabitId(initialHabitId);
            setSelectedHabit(data.find(h => h.id === initialHabitId) || null);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching habits:', error);
          setLoading(false);
        }
      }
      fetchHabits();
    } else if (habitId && habits.length > 0) {
      setSelectedHabitId(habitId);
      setSelectedHabit(habits.find(h => h.id === habitId) || null);
    } else if (habits.length > 0) {
      setSelectedHabitId(habits[0].id);
      setSelectedHabit(habits[0]);
    }
  }, [habitId, habits]);
  
  // Fetch streaks for the selected habit
  useEffect(() => {
    if (!selectedHabitId) return;
    
    async function fetchStreaks() {
      try {
        setLoading(true);
        
        // Get streaks for the past 30 days
        const today = new Date();
        const startDate = addDays(today, -30);
        
        const response = await apiRequest("GET", `/api/habits/${selectedHabitId}/streaks/range?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}`);
        const data = await response.json();
        setStreaks(data);
        
        // Set reminder time from habit
        const habit = allHabits.find(h => h.id === selectedHabitId);
        if (habit) {
          setReminderSettings(prev => ({
            ...prev,
            time: habit.reminderTime || "08:00"
          }));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching habit streaks:', error);
        setLoading(false);
      }
    }
    
    fetchStreaks();
  }, [selectedHabitId, allHabits]);
  
  // Generate upcoming reminders based on habits
  useEffect(() => {
    if (!allHabits.length) return;
    
    const reminders = [];
    const today = new Date();
    
    for (const habit of allHabits) {
      const isSelectedHabit = habit.id === selectedHabitId;
      
      // Standard reminder for today
      if (isSelectedHabit || reminders.length < 5) {
        reminders.push({
          habit,
          time: habit.reminderTime || "08:00",
          day: "Today",
          message: `Time to complete your "${habit.name}" habit`,
          type: 'standard' as const
        });
      }
      
      // Smart reminders based on analytics
      if (reminderSettings.smartSuggestions) {
        // Find streaks for this habit
        const habitStreaks = streaks.filter(s => s.habitId === habit.id);
        const habitCompletedToday = habitStreaks.some(s => 
          isToday(new Date(s.date)) && s.completed
        );
        
        // If this habit has a current streak of 5+ days
        const streak = calculateCurrentStreak(habit.id);
        if (streak >= 4 && !habitCompletedToday && isSelectedHabit) {
          reminders.push({
            habit,
            time: addTime(habit.reminderTime || "08:00", 3), // Remind a bit later
            day: "Today",
            message: `Don't break your ${streak}-day streak for "${habit.name}"!`,
            type: 'warning' as const
          });
        }
        
        // If approaching a milestone (streak is one less than a multiple of 5)
        if (streak % 5 === 4 && !habitCompletedToday && isSelectedHabit) {
          reminders.push({
            habit,
            time: addTime(habit.reminderTime || "08:00", 2), 
            day: "Today",
            message: `Complete "${habit.name}" today to reach a ${streak + 1}-day milestone!`,
            type: 'milestone' as const
          });
        }
        
        // If the habit completion rate is lower on certain days, add a smart reminder
        if (isSelectedHabit && reminderSettings.advancedReminders) {
          // Get the day of week that has the lowest completion rate
          const dayCompletion = analyzeDayCompletion(habit.id);
          const lowestDay = dayCompletion.reduce((prev, curr) => 
            prev.completionRate < curr.completionRate ? prev : curr
          );
          
          const tomorrow = addDays(today, 1);
          const tomorrowDayName = format(tomorrow, 'EEEE');
          
          if (lowestDay.day === tomorrowDayName && lowestDay.completionRate < 50) {
            reminders.push({
              habit,
              time: habit.reminderTime || "08:00",
              day: "Tomorrow",
              message: `Extra reminder for "${habit.name}" - this is typically harder for you on ${tomorrowDayName}s`,
              type: 'smart' as const
            });
          }
        }
      }
    }
    
    // Sort reminders by day and time
    reminders.sort((a, b) => {
      if (a.day === b.day) {
        return a.time.localeCompare(b.time);
      }
      return a.day === "Today" ? -1 : 1;
    });
    
    setUpcomingReminders(reminders);
  }, [allHabits, selectedHabitId, streaks, reminderSettings]);
  
  // Calculate current streak for a habit
  const calculateCurrentStreak = (habitId: number): number => {
    if (!streaks.length) return 0;
    
    // Filter streaks for this habit
    const habitStreaks = streaks.filter(s => s.habitId === habitId);
    if (!habitStreaks.length) return 0;
    
    // Sort by date descending
    const sortedStreaks = [...habitStreaks].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = startOfDay(new Date());
    let lastDate = today;
    
    // If today's streak exists and is complete, count it
    const todayStreak = sortedStreaks.find(s => isToday(new Date(s.date)));
    if (todayStreak && todayStreak.completed) {
      streak = 1;
    } else if (!todayStreak) {
      // If no streak for today, start checking from yesterday
      lastDate = startOfDay(addDays(today, -1));
    } else {
      // Today's streak exists but not completed, streak is 0
      return 0;
    }
    
    // Count consecutive completed streaks
    for (const s of sortedStreaks) {
      const streakDate = startOfDay(new Date(s.date));
      
      // Skip today's entry as we've already checked it
      if (isToday(streakDate)) continue;
      
      // Check if this streak is for the expected day and is completed
      if (isSameDay(streakDate, lastDate) && s.completed) {
        streak++;
        lastDate = addDays(lastDate, -1); // Move to the previous day
      } else if (isSameDay(streakDate, lastDate) && !s.completed) {
        // Found an incomplete streak, stop counting
        break;
      } else if (differenceInDays(lastDate, streakDate) > 1) {
        // Found a gap in days, stop counting
        break;
      } else if (streakDate < lastDate) {
        // This streak is for a day we've already passed
        continue;
      }
    }
    
    return streak;
  };
  
  // Analyze which days of the week have the lowest completion rates
  const analyzeDayCompletion = (habitId: number) => {
    const habitStreaks = streaks.filter(s => s.habitId === habitId);
    
    // Initialize day completion stats
    const dayStats: Record<string, { completed: number; total: number }> = {
      'Sunday': { completed: 0, total: 0 },
      'Monday': { completed: 0, total: 0 },
      'Tuesday': { completed: 0, total: 0 },
      'Wednesday': { completed: 0, total: 0 },
      'Thursday': { completed: 0, total: 0 },
      'Friday': { completed: 0, total: 0 },
      'Saturday': { completed: 0, total: 0 }
    };
    
    // Count completions by day
    habitStreaks.forEach(streak => {
      const date = new Date(streak.date);
      const dayName = format(date, 'EEEE');
      
      dayStats[dayName].total++;
      if (streak.completed) {
        dayStats[dayName].completed++;
      }
    });
    
    // Calculate completion rates
    return Object.entries(dayStats).map(([day, data]) => ({
      day,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 100,
      count: data.total
    }));
  };
  
  // Add minutes to a time string (HH:MM)
  const addTime = (timeString: string, minutesToAdd: number): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + minutesToAdd);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Handler for habit selection
  const handleHabitSelect = (id: number) => {
    setSelectedHabitId(id);
    const habit = allHabits.find(h => h.id === id);
    setSelectedHabit(habit || null);
    
    if (onHabitSelect) {
      onHabitSelect(id);
    }
  };
  
  // Handler for updating reminder settings
  const handleReminderSettingChange = (key: keyof typeof reminderSettings, value: any) => {
    setReminderSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handler for updating reminder time
  const handleReminderTimeChange = async () => {
    if (!selectedHabit || !selectedHabitId) return;
    
    try {
      // Update the habit with the new reminder time
      await apiRequest("PATCH", `/api/habits/${selectedHabitId}`, {
        reminderTime: reminderSettings.time
      });
      
      // Update the local habit data
      setAllHabits(prev => prev.map(h => 
        h.id === selectedHabitId 
          ? { ...h, reminderTime: reminderSettings.time } 
          : h
      ));
      
      setSelectedHabit({ ...selectedHabit, reminderTime: reminderSettings.time });
      
      toast({
        title: "Reminder Updated",
        description: `Reminder time for "${selectedHabit.name}" set to ${format(
          parseISO(`2000-01-01T${reminderSettings.time}`), 
          'h:mm a'
        )}`,
      });
    } catch (error) {
      console.error('Error updating habit reminder time:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not update reminder time. Please try again.",
      });
    }
  };
  
  // Handler for sending a test notification
  const handleTestNotification = () => {
    if (!selectedHabit) return;
    
    // Request notification permission if not already granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    
    // Show a sample notification
    if (Notification.permission === "granted") {
      const notification = new Notification(`Reminder: ${selectedHabit.name}`, {
        body: `This is a test notification for your habit reminder.`,
        icon: '/favicon.ico'
      });
      
      toast({
        title: "Test Notification",
        description: "A test notification has been sent.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Notification Permission Denied",
        description: "Please enable notifications in your browser settings.",
      });
    }
  };
  
  // Simulate a habit reminder now
  const remindNow = async () => {
    if (!selectedHabit || !selectedHabitId) return;
    
    // Check if habit is already completed today
    const today = new Date();
    const todayStreak = streaks.find(streak => {
      const streakDate = new Date(streak.date);
      return isToday(streakDate);
    });
    
    if (todayStreak && todayStreak.completed) {
      toast({
        title: "Already Completed",
        description: `You've already completed "${selectedHabit.name}" today!`,
        variant: "default",
      });
      return;
    }
    
    // Mark habit as complete
    try {
      if (todayStreak) {
        // Update existing streak
        await apiRequest("PATCH", `/api/habit-streaks/${todayStreak.id}`, {
          completed: true,
          notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
        });
      } else {
        // Create new streak
        await apiRequest("POST", '/api/habit-streaks', {
          habitId: selectedHabitId,
          date: today.toISOString(),
          completed: true,
          notes: `Completed on ${format(today, 'MMM dd, yyyy')}`
        });
      }
      
      // Update the streaks data
      const response = await apiRequest("GET", `/api/habits/${selectedHabitId}/streaks/range?startDate=${addDays(today, -30).toISOString()}&endDate=${today.toISOString()}`);
      const updatedStreaks = await response.json();
      setStreaks(updatedStreaks);
      
      toast({
        title: "Habit Completed",
        description: `"${selectedHabit.name}" marked as completed for today!`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error marking habit as complete:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not mark habit as complete. Please try again.",
      });
    }
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
  
  if (allHabits.length === 0) {
    return (
      <Card className="shadow-lg bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Smart Reminder System</CardTitle>
          <CardDescription className="text-gray-400">Intelligent reminders for your habits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <BellRing className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white">No habits found</h3>
            <p className="text-sm text-gray-400 mt-2">
              Create habits to set up smart reminders
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <AnimatedComponent animation="fadeIn" delay={0.1}>
      <Card className="shadow-xl bg-gray-900/80 border-gray-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-50 blur-xl pointer-events-none"></div>
        
        <CardHeader className="relative z-10 border-b border-gray-800">
          <CardTitle className="flex items-center text-white">
            <BellRing className="mr-2 h-6 w-6 text-purple-500 animate-pulse" />
            <span className="text-glow">Smart Reminder System</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Never miss a habit with intelligent reminders</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10 pt-6">
          {/* Habit Selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {allHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Badge 
                  variant={selectedHabitId === habit.id ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedHabitId === habit.id ? 'scale-110 shadow-glow' : 'hover:scale-105'
                  } ${habit.color === 'primary' ? 'bg-primary' : 
                    habit.color === 'blue' ? 'bg-blue-500' : 
                    habit.color === 'green' ? 'bg-green-500' : 
                    habit.color === 'purple' ? 'bg-purple-500' : 
                    habit.color === 'indigo' ? 'bg-indigo-500' : 'bg-primary'}`}
                  onClick={() => handleHabitSelect(habit.id)}
                >
                  {habit.name}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          {selectedHabit && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reminder Settings */}
                <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-400" />
                    Reminder Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enabled" className="flex items-center space-x-2 text-gray-300">
                        <Bell className="h-4 w-4 text-gray-400" />
                        <span>Enable Reminders</span>
                      </Label>
                      <Switch
                        id="enabled"
                        checked={reminderSettings.enabled}
                        onCheckedChange={(checked) => handleReminderSettingChange("enabled", checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reminderTime" className="text-gray-300">Reminder Time</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="reminderTime"
                          type="time"
                          value={reminderSettings.time}
                          onChange={(e) => handleReminderSettingChange("time", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white flex-grow"
                          disabled={!reminderSettings.enabled}
                        />
                        <Button 
                          size="sm" 
                          onClick={handleReminderTimeChange}
                          disabled={!reminderSettings.enabled}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Save
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Current setting: {format(
                          parseISO(`2000-01-01T${selectedHabit.reminderTime || "08:00"}`), 
                          'h:mm a'
                        )}
                      </p>
                    </div>
                    
                    <div className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smartSuggestions" className="flex items-center space-x-2 text-gray-300">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span>Smart Suggestions</span>
                        </Label>
                        <Switch
                          id="smartSuggestions"
                          checked={reminderSettings.smartSuggestions}
                          onCheckedChange={(checked) => handleReminderSettingChange("smartSuggestions", checked)}
                          disabled={!reminderSettings.enabled}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="advancedReminders" className="flex items-center space-x-2 text-gray-300">
                          <PieChart className="h-4 w-4 text-blue-400" />
                          <span>Performance-Based Reminders</span>
                        </Label>
                        <Switch
                          id="advancedReminders"
                          checked={reminderSettings.advancedReminders}
                          onCheckedChange={(checked) => handleReminderSettingChange("advancedReminders", checked)}
                          disabled={!reminderSettings.enabled || !reminderSettings.smartSuggestions}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="browserNotifications" className="flex items-center space-x-2 text-gray-300">
                          <Smartphone className="h-4 w-4 text-indigo-400" />
                          <span>Browser Notifications</span>
                        </Label>
                        <Switch
                          id="browserNotifications"
                          checked={reminderSettings.browserNotifications}
                          onCheckedChange={(checked) => handleReminderSettingChange("browserNotifications", checked)}
                          disabled={!reminderSettings.enabled}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        onClick={handleTestNotification}
                        variant="outline"
                        size="sm"
                        className="text-purple-400 border-purple-800 hover:bg-purple-950 hover:text-purple-300"
                        disabled={!reminderSettings.enabled || !reminderSettings.browserNotifications}
                      >
                        Test Notification
                      </Button>
                      
                      <Button 
                        onClick={remindNow}
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600"
                      >
                        Complete Now
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Reminders */}
                <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                    Upcoming Reminders
                  </h3>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {upcomingReminders.length > 0 ? (
                      upcomingReminders.map((reminder, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div 
                            className={`
                              p-3 rounded-lg flex items-start space-x-3 
                              ${reminder.type === 'standard' ? 'bg-gray-800/80 border border-gray-700' : 
                                reminder.type === 'smart' ? 'bg-blue-900/30 border border-blue-800/50' : 
                                reminder.type === 'warning' ? 'bg-orange-900/30 border border-orange-800/50' : 
                                'bg-purple-900/30 border border-purple-800/50'}
                            `}
                          >
                            <div className={`
                              rounded-full p-2 flex-shrink-0
                              ${reminder.type === 'standard' ? 'bg-gray-700' : 
                                reminder.type === 'smart' ? 'bg-blue-800/70' : 
                                reminder.type === 'warning' ? 'bg-orange-800/70' : 
                                'bg-purple-800/70'}
                            `}>
                              {reminder.type === 'standard' ? (
                                <BellRing className="h-4 w-4 text-gray-300" />
                              ) : reminder.type === 'smart' ? (
                                <Zap className="h-4 w-4 text-blue-300" />
                              ) : reminder.type === 'warning' ? (
                                <Flame className="h-4 w-4 text-orange-300" />
                              ) : (
                                <Award className="h-4 w-4 text-purple-300" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="font-medium text-gray-200">
                                  {reminder.habit.name}
                                </div>
                                <div className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">
                                  {reminder.day} · {format(
                                    parseISO(`2000-01-01T${reminder.time}`), 
                                    'h:mm a'
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">{reminder.message}</p>
                              
                              {/* Only show relevant action buttons */}
                              {reminder.habit.id === selectedHabitId && reminder.day === "Today" && (
                                <div className="mt-2 flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                                    onClick={remindNow}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Complete
                                  </Button>
                                  
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 px-2 text-xs text-gray-400 hover:text-white"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Skip
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-400">
                        No upcoming reminders
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Smart Tips */}
              <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 mt-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                  Smart Tips
                </h3>
                
                <div className="space-y-3">
                  {selectedHabit && (
                    <>
                      <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300">
                          {(() => {
                            // Calculate personalized tips based on habit data
                            const streak = calculateCurrentStreak(selectedHabit.id);
                            const dayCompletion = analyzeDayCompletion(selectedHabit.id);
                            
                            if (dayCompletion.length > 0 && dayCompletion.some(d => d.count > 0)) {
                              // Find best and worst days
                              const bestDay = [...dayCompletion]
                                .filter(d => d.count > 0)
                                .sort((a, b) => b.completionRate - a.completionRate)[0];
                                
                              const worstDay = [...dayCompletion]
                                .filter(d => d.count > 0)
                                .sort((a, b) => a.completionRate - b.completionRate)[0];
                              
                              if (bestDay && worstDay && bestDay.completionRate - worstDay.completionRate > 30) {
                                return `You're most consistent with ${selectedHabit.name} on ${bestDay.day}s (${bestDay.completionRate}%) and struggle most on ${worstDay.day}s (${worstDay.completionRate}%). Consider setting additional reminders for ${worstDay.day}s.`;
                              } else if (streak >= 3) {
                                return `You're on a ${streak}-day streak for ${selectedHabit.name}! Set a visual reminder in a place you'll see regularly to maintain momentum.`;
                              } else if (streak === 0) {
                                const today = new Date();
                                const bestDayName = bestDay ? bestDay.day : format(today, 'EEEE');
                                return `Try linking ${selectedHabit.name} to an existing habit you already do consistently. ${bestDayName}s seem to work best for you.`;
                              }
                            }
                            
                            // Default tips if not enough data
                            return [
                              `Schedule your ${selectedHabit.name} habit at the same time each day to build a stronger routine.`,
                              `Try the 2-minute rule: commit to just 2 minutes of your habit, and you'll often continue once started.`,
                              `Place visual reminders for ${selectedHabit.name} where you'll see them during your daily routine.`,
                              `Track your habit first thing in the morning or last thing at night to ensure you don't forget.`,
                              `Create a habit stack by doing ${selectedHabit.name} immediately before or after an existing habit.`
                            ][Math.floor(Math.random() * 5)];
                          })()}
                        </p>
                      </div>
                      
                      <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-800/50">
                        <h4 className="text-md font-medium text-white mb-2">Optimal Time Setting</h4>
                        <p className="text-gray-300">
                          {(() => {
                            // Generate optimal time advice
                            const currentTime = selectedHabit.reminderTime || "08:00";
                            const [hours] = currentTime.split(':').map(Number);
                            
                            if (hours >= 5 && hours < 9) {
                              return "Your current morning reminder is good! Research shows morning routines have 25% higher completion rates.";
                            } else if (hours >= 21 || hours < 5) {
                              return "Consider moving your reminder earlier. Evening/night reminders have lower completion rates than morning or afternoon ones.";
                            } else {
                              return "Your current reminder time aligns well with productivity patterns. Consider adding a secondary reminder 30 minutes after your primary time.";
                            }
                          })()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AnimatedComponent>
  );
}