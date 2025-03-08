import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, parseISO, isSameDay, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday, addDays, subDays, differenceInDays, differenceInWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Habit, HabitStreak } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, BarChart as BarChartIcon, Calendar, Clock, Award, Target, MoveUp, CheckCircle2, XCircle, Zap, Users } from "lucide-react";
import { AnimatedComponent } from "@/components/ui/animated-component";

interface HabitAnalyticsDashboardProps {
  habitId?: number;
  allHabits?: Habit[];
  onHabitSelect?: (habitId: number) => void;
}

interface StreakData {
  date: Date;
  completed: boolean;
}

interface DayAnalysis {
  day: string;
  completionRate: number;
  count: number;
}

interface TimeAnalysis {
  period: string;
  completionRate: number;
}

export function HabitAnalyticsDashboard({ habitId, allHabits, onHabitSelect }: HabitAnalyticsDashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [streakData, setStreakData] = useState<StreakData[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'30days' | '3months' | 'year'>('30days');
  const [consistencyScore, setConsistencyScore] = useState<number>(0);
  const [weekdayAnalysis, setWeekdayAnalysis] = useState<DayAnalysis[]>([]);
  const [timeOfDayAnalysis, setTimeOfDayAnalysis] = useState<TimeAnalysis[]>([]);
  const [strongestStreak, setStrongestStreak] = useState<number>(0);
  const [weeklyCompletion, setWeeklyCompletion] = useState<{date: string, completed: number, missed: number}[]>([]);
  const { toast } = useToast();
  
  // Fetch habits data if not provided
  useEffect(() => {
    if (allHabits && allHabits.length > 0) {
      setHabits(allHabits);
      setLoadingHabits(false);
      
      // Set selected habit from the provided habitId or first habit
      const habit = habitId 
        ? allHabits.find(h => h.id === habitId) 
        : allHabits[0];
        
      if (habit) {
        setSelectedHabit(habit);
        fetchStreaksForHabit(habit.id);
      }
    } else {
      async function fetchHabits() {
        try {
          setLoadingHabits(true);
          const response = await apiRequest("GET", '/api/habits');
          const data = await response.json();
          setHabits(data);
          
          if (data.length > 0) {
            const habit = habitId 
              ? data.find((h: any) => h.id === habitId) 
              : data[0];
              
            if (habit) {
              setSelectedHabit(habit);
              fetchStreaksForHabit(habit.id);
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
  }, [habitId, allHabits]);
  
  // Handle manual habit selection
  const handleHabitChange = (habitId: string) => {
    const habit = habits.find(h => h.id === parseInt(habitId));
    if (habit) {
      setSelectedHabit(habit);
      fetchStreaksForHabit(habit.id);
      
      // Call parent's onHabitSelect if provided
      if (onHabitSelect) {
        onHabitSelect(habit.id);
      }
    }
  };
  
  // Fetch streak data for selected habit
  async function fetchStreaksForHabit(habitId: number) {
    try {
      setLoadingStreaks(true);
      
      // Get date range based on selected period
      const today = new Date();
      let startDate = new Date();
      
      if (selectedPeriod === '30days') {
        startDate.setDate(today.getDate() - 30);
      } else if (selectedPeriod === '3months') {
        startDate.setMonth(today.getMonth() - 3);
      } else {
        startDate.setFullYear(today.getFullYear() - 1);
      }
      
      // Format dates for API query
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = today.toISOString().split('T')[0];
      
      // Fetch streaks for the date range
      const response = await apiRequest("GET", `/api/habits/${habitId}/streaks/range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      const streakData = await response.json();
      setStreaks(streakData);
      
      // Process streak data for charts
      processStreakData(streakData, startDate, today);
      
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
  
  // Process and format streak data for visualization
  const processStreakData = (streaks: HabitStreak[], startDate: Date, endDate: Date) => {
    // Create a data point for each day in the range
    const data: StreakData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const streak = streaks.find(s => 
        format(new Date(s.date), 'yyyy-MM-dd') === dateStr
      );
      
      data.push({
        date: new Date(currentDate),
        completed: streak ? streak.completed : false
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setStreakData(data);
    
    // Calculate consistency score - percentage of completed days
    const totalDays = data.length;
    const completedDays = data.filter(d => d.completed).length;
    const score = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    setConsistencyScore(score);
    
    // Perform day of week analysis
    const dayAnalysis: { [key: string]: { total: number, completed: number } } = {
      'Monday': { total: 0, completed: 0 },
      'Tuesday': { total: 0, completed: 0 },
      'Wednesday': { total: 0, completed: 0 },
      'Thursday': { total: 0, completed: 0 },
      'Friday': { total: 0, completed: 0 },
      'Saturday': { total: 0, completed: 0 },
      'Sunday': { total: 0, completed: 0 }
    };
    
    // Count occurrences and completions by day of week
    data.forEach(d => {
      const dayName = format(d.date, 'EEEE');
      dayAnalysis[dayName].total++;
      if (d.completed) {
        dayAnalysis[dayName].completed++;
      }
    });
    
    // Convert to array format for chart
    const weekdayAnalysisData: DayAnalysis[] = Object.entries(dayAnalysis).map(([day, stats]) => ({
      day: day.substring(0, 3), // abbreviate to Mon, Tue, etc.
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      count: stats.total
    }));
    
    setWeekdayAnalysis(weekdayAnalysisData);
    
    // Calculate time of day analysis
    // Since we don't have actual time data, we'll use dummy data here
    // In a real app, you would use the actual completion times
    setTimeOfDayAnalysis([
      { period: 'Morning', completionRate: 75 },
      { period: 'Afternoon', completionRate: 60 },
      { period: 'Evening', completionRate: 40 },
      { period: 'Night', completionRate: 25 }
    ]);
    
    // Calculate strongest streak
    let currentStreak = 0;
    let maxStreak = 0;
    
    data.forEach(d => {
      if (d.completed) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    setStrongestStreak(maxStreak);
    
    // Generate weekly completion data
    const weeklyData: { [key: string]: { completed: number, missed: number } } = {};
    let currentWeekStart = startOfWeek(startDate);
    const lastWeekEnd = endOfWeek(endDate);
    
    while (currentWeekStart <= lastWeekEnd) {
      const weekKey = format(currentWeekStart, 'MMM d');
      weeklyData[weekKey] = { completed: 0, missed: 0 };
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    // Populate weekly data
    data.forEach(d => {
      const weekStart = startOfWeek(d.date);
      const weekKey = format(weekStart, 'MMM d');
      
      if (weeklyData[weekKey]) {
        if (d.completed) {
          weeklyData[weekKey].completed++;
        } else {
          weeklyData[weekKey].missed++;
        }
      }
    });
    
    // Convert to array for chart
    const weeklyCompletionData = Object.entries(weeklyData).map(([date, stats]) => ({
      date,
      completed: stats.completed,
      missed: stats.missed
    }));
    
    setWeeklyCompletion(weeklyCompletionData);
  };
  
  // Handle period selection change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value as '30days' | '3months' | 'year');
    
    if (selectedHabit) {
      fetchStreaksForHabit(selectedHabit.id);
    }
  };
  
  // Generate recommendations based on habit data
  const getRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    if (weekdayAnalysis.length > 0) {
      // Find best day
      const bestDay = [...weekdayAnalysis].sort((a, b) => b.completionRate - a.completionRate)[0];
      if (bestDay.completionRate > 70) {
        recommendations.push(`You're most consistent on ${bestDay.day}days (${bestDay.completionRate}% completion). Keep up the good work!`);
      }
      
      // Find worst day
      const worstDay = [...weekdayAnalysis].sort((a, b) => a.completionRate - b.completionRate)[0];
      if (worstDay.completionRate < 50 && worstDay.count > 3) {
        recommendations.push(`You struggle most on ${worstDay.day}days (only ${worstDay.completionRate}% completion). Try setting a special reminder for this day.`);
      }
    }
    
    // Consistency score recommendations
    if (consistencyScore < 30) {
      recommendations.push("Your consistency is low. Start with smaller daily goals to build momentum.");
    } else if (consistencyScore > 80) {
      recommendations.push("Excellent consistency! Consider increasing the challenge of your habit.");
    }
    
    // Streak recommendations
    if (strongestStreak < 3) {
      recommendations.push("Focus on building longer streaks. Even 3 days in a row can help form a habit.");
    } else if (strongestStreak >= 21) {
      recommendations.push("You've achieved a 21+ day streak! This habit is becoming part of your routine.");
    }
    
    // Add general recommendations if we have few specific ones
    if (recommendations.length < 2) {
      recommendations.push("Track your habit at the same time each day to build consistency.");
      recommendations.push("Link this habit to an existing daily routine to make it easier to remember.");
    }
    
    return recommendations;
  };
  
  // Generate summary text
  const getSummaryText = (): string => {
    if (consistencyScore >= 80) {
      return "Excellent habit consistency! You're well on your way to making this a permanent part of your routine.";
    } else if (consistencyScore >= 60) {
      return "Good consistency. You're making steady progress with this habit.";
    } else if (consistencyScore >= 40) {
      return "Moderate consistency. Try to identify what's making this habit challenging.";
    } else {
      return "This habit needs attention. Consider simplifying it or setting more specific triggers.";
    }
  };
  
  // Get color based on consistency score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-emerald-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };
  
  // Loading state
  if (loadingHabits && habits.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }
  
  // No habits state
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-2">
            <BarChartIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">No habits to analyze</h3>
          <p className="text-gray-400 max-w-md">
            Create and track habits to see detailed analytics and insights on your progress.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header with habit selector and period selector */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-1">Select Habit</label>
          <Select
            value={selectedHabit ? selectedHabit.id.toString() : ""}
            onValueChange={handleHabitChange}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select a habit to analyze" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {habits.map((habit) => (
                <SelectItem key={habit.id} value={habit.id.toString()}>
                  {habit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Time Period</label>
          <div className="flex rounded-md overflow-hidden border border-gray-700">
            <Button
              variant="ghost"
              className={`px-3 py-1 rounded-none ${selectedPeriod === '30days' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => handlePeriodChange('30days')}
            >
              30 Days
            </Button>
            <Button
              variant="ghost"
              className={`px-3 py-1 rounded-none ${selectedPeriod === '3months' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => handlePeriodChange('3months')}
            >
              3 Months
            </Button>
            <Button
              variant="ghost"
              className={`px-3 py-1 rounded-none ${selectedPeriod === 'year' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              onClick={() => handlePeriodChange('year')}
            >
              Year
            </Button>
          </div>
        </div>
      </div>
      
      {selectedHabit && (
        <AnimatedComponent animation="fadeIn" delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Habit Overview Card */}
            <Card className="bg-gray-900/50 border-gray-800 shadow-md overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      <span>Habit Overview</span>
                    </CardTitle>
                    <CardDescription>{selectedHabit.name}</CardDescription>
                  </div>
                  <Badge 
                    className={`${selectedHabit.priority === 'high' ? 'bg-red-500/20 text-red-300' : 
                      selectedHabit.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-blue-500/20 text-blue-300'}`}
                  >
                    {selectedHabit.priority.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">Consistency</p>
                      <p className={`text-xl font-bold ${getScoreColor(consistencyScore)}`}>{consistencyScore}%</p>
                    </div>
                    <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">Best Streak</p>
                      <p className="text-xl font-bold text-orange-400">{strongestStreak} days</p>
                    </div>
                    <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">Goal</p>
                      <p className="text-xl font-bold text-cyan-400">{selectedHabit.targetDaysPerWeek}/week</p>
                    </div>
                    <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="text-xl font-bold text-purple-400 capitalize">{selectedHabit.category || "General"}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-md font-medium text-white mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-400" />
                      Summary
                    </h3>
                    <p className="text-gray-300">{getSummaryText()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recommendations Card */}
            <Card className="bg-gray-900/50 border-gray-800 shadow-md overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <span>Recommendations</span>
                </CardTitle>
                <CardDescription>Personalized insights for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRecommendations().map((recommendation, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="mt-0.5 bg-gray-700 rounded-full p-1.5 text-yellow-400">
                        <Award className="h-3 w-3" />
                      </div>
                      <p className="text-sm text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedComponent>
      )}
      
      {selectedHabit && (
        <AnimatedComponent animation="fadeIn" delay={0.4}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Completion Chart */}
            <Card className="bg-gray-900/50 border-gray-800 shadow-md overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-400" />
                  <span>Weekly Completion</span>
                </CardTitle>
                <CardDescription>Tracking weekly consistency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loadingStreaks ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    </div>
                  ) : weeklyCompletion.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyCompletion} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                          labelStyle={{ color: '#F9FAFB' }}
                        />
                        <Legend />
                        <Bar dataKey="completed" name="Completed" fill="#10B981" />
                        <Bar dataKey="missed" name="Missed" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400">No completion data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Day of Week Analysis Chart */}
            <Card className="bg-gray-900/50 border-gray-800 shadow-md overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <BarChartIcon className="h-5 w-5 text-blue-400" />
                  <span>Day of Week Analysis</span>
                </CardTitle>
                <CardDescription>Identify your strongest and weakest days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loadingStreaks ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    </div>
                  ) : weekdayAnalysis.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekdayAnalysis} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                          labelStyle={{ color: '#F9FAFB' }}
                          formatter={(value) => [`${value}%`, 'Completion Rate']}
                        />
                        <Bar dataKey="completionRate" name="Completion Rate" fill="#60A5FA">
                          {weekdayAnalysis.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.completionRate > 70 ? '#10B981' : 
                                    entry.completionRate > 40 ? '#60A5FA' : 
                                    '#EF4444'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400">No day analysis data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedComponent>
      )}
      
      {selectedHabit && (
        <AnimatedComponent animation="fadeIn" delay={0.6}>
          <div className="grid grid-cols-1 gap-6">
            {/* Habit Completion Timeline */}
            <Card className="bg-gray-900/50 border-gray-800 shadow-md overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <MoveUp className="h-5 w-5 text-purple-400" />
                  <span>Habit Completion Timeline</span>
                </CardTitle>
                <CardDescription>View your progress over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {loadingStreaks ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                    </div>
                  ) : streakData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={streakData.map((d, idx) => ({
                          date: format(d.date, 'MMM d'),
                          completed: d.completed ? 1 : 0,
                          index: idx
                        }))}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          interval={Math.floor(streakData.length / 10)} // Show fewer x-axis labels
                        />
                        <YAxis 
                          stroke="#9CA3AF"
                          domain={[0, 1]}
                          ticks={[0, 1]}
                          tickFormatter={(value) => value === 1 ? 'Yes' : 'No'}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                          labelStyle={{ color: '#F9FAFB' }}
                          formatter={(value) => [value === 1 ? 'Completed' : 'Missed', 'Status']}
                        />
                        <Legend />
                        <Line 
                          type="step" 
                          dataKey="completed" 
                          name="Completion" 
                          stroke="#10B981" 
                          dot={{ stroke: '#10B981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400">No timeline data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedComponent>
      )}
    </div>
  );
}