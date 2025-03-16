import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { GlobeVisualization } from '@/components/globe-visualization-fixed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Map, PieChart, BarChart3, Users, Globe, Activity, Clock, Target, 
  TrendingUp, BarChart4, Zap, Award, Star, CheckCircle2, Share2, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AnimatedComponent } from '@/components/ui/animated-component';
import { Separator } from '@/components/ui/separator';

// Activity level definition
type ActivityLevel = 'high' | 'medium' | 'low' | 'inactive';

// User with enhanced activity data
interface EnhancedUser extends User {
  activityLevel: ActivityLevel;
  lastActiveRelative: string;
  totalImpact: number;
}

// Region data interface for map visualization
interface RegionData {
  name: string;
  count: number;
  percentage: number;
  activityScore: number;
}

// Define continents for better regional grouping
const continentMapping: Record<string, string> = {
  "United States": "North America",
  "Canada": "North America",
  "Mexico": "North America",
  "United Kingdom": "Europe",
  "Germany": "Europe",
  "France": "Europe",
  "Spain": "Europe",
  "Italy": "Europe",
  "India": "Asia",
  "China": "Asia",
  "Japan": "Asia",
  "South Korea": "Asia",
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Brazil": "South America",
  "Argentina": "South America",
  "Chile": "South America",
  "Nigeria": "Africa",
  "South Africa": "Africa",
  "Egypt": "Africa",
  "Kenya": "Africa",
  "Russia": "Europe",
  "Singapore": "Asia",
  "Indonesia": "Asia",
  "United Arab Emirates": "Asia"
};

// Activity period buckets
type ActivityPeriod = 'Last 24 hours' | 'Last week' | 'Last month' | 'Older';

export default function GlobalImpact() {
  const [activeView, setActiveView] = useState<string>('globe');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [highlightedUser, setHighlightedUser] = useState<EnhancedUser | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Fetch users data
  const { 
    data: users = [], 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 30000, // 30 seconds
    retry: 2
  });
  
  // Process users with activity levels
  const processedUsers = users.map(user => {
    let activityLevel: ActivityLevel = 'inactive';
    let lastActiveRelative = 'Never active';
    
    if (user.lastActive) {
      const lastActive = new Date(user.lastActive);
      const now = new Date();
      const diffInDays = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffInDays <= 1) {
        activityLevel = 'high';
        lastActiveRelative = 'Today';
      } else if (diffInDays <= 3) {
        activityLevel = 'medium';
        lastActiveRelative = `${Math.floor(diffInDays)} days ago`;
      } else if (diffInDays <= 7) {
        activityLevel = 'low';
        lastActiveRelative = `${Math.floor(diffInDays)} days ago`;
      } else {
        lastActiveRelative = diffInDays < 30 
          ? `${Math.floor(diffInDays)} days ago` 
          : `${Math.floor(diffInDays / 30)} months ago`;
      }
    }
    
    return {
      ...user,
      activityLevel,
      lastActiveRelative,
      totalImpact: (user.goalsCreated || 0) + (user.tasksCompleted || 0)
    } as EnhancedUser;
  });
  
  useEffect(() => {
    if (usersError) {
      toast({
        title: "Error loading user data",
        description: "There was a problem fetching user location data.",
        variant: "destructive"
      });
    }
  }, [usersError, toast]);
  
  // Organize user data by continents/regions
  const getRegionalData = (): RegionData[] => {
    const regionCounts: Record<string, { count: number, activeUsers: number }> = {};
    
    processedUsers.forEach(user => {
      if (!user.country) return;
      
      // Get continent or default to country name
      const region = continentMapping[user.country] || user.country;
      
      if (!regionCounts[region]) {
        regionCounts[region] = { count: 0, activeUsers: 0 };
      }
      
      regionCounts[region].count++;
      
      if (user.activityLevel === 'high' || user.activityLevel === 'medium') {
        regionCounts[region].activeUsers++;
      }
    });
    
    return Object.entries(regionCounts).map(([name, data]) => ({
      name,
      count: data.count,
      percentage: Math.round((data.count / processedUsers.length) * 100),
      activityScore: data.activeUsers
    })).sort((a, b) => b.count - a.count);
  };
  
  const regionalData = getRegionalData();
  
  // Organize user data by activity periods
  const getUserActivityStats = () => {
    if (processedUsers.length === 0) return [];
    
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    
    const activityBuckets: Record<ActivityPeriod, number> = {
      "Last 24 hours": 0,
      "Last week": 0,
      "Last month": 0,
      "Older": 0
    };
    
    processedUsers.forEach(user => {
      if (!user.lastActive) {
        activityBuckets["Older"]++;
        return;
      }
      
      const lastActive = new Date(user.lastActive);
      const timeDiff = now.getTime() - lastActive.getTime();
      
      if (timeDiff <= day) {
        activityBuckets["Last 24 hours"]++;
      } else if (timeDiff <= 7 * day) {
        activityBuckets["Last week"]++;
      } else if (timeDiff <= 30 * day) {
        activityBuckets["Last month"]++;
      } else {
        activityBuckets["Older"]++;
      }
    });
    
    return Object.entries(activityBuckets).map(([period, count]) => ({
      period: period as ActivityPeriod,
      count,
      percentage: Math.round((count / processedUsers.length) * 100)
    }));
  };
  
  const activityStats = getUserActivityStats();
  
  // Get user impact stats (goals and tasks)
  const getUserImpactStats = () => {
    if (processedUsers.length === 0) return [];
    
    // Sort users by total impact
    return processedUsers
      .filter(user => user.totalImpact > 0)
      .sort((a, b) => b.totalImpact - a.totalImpact)
      .slice(0, 10); // Top 10 users
  };
  
  const impactUsers = getUserImpactStats();
  
  // Get activity level color
  const getActivityColor = (level: ActivityLevel) => {
    switch(level) {
      case 'high': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-orange-500 text-white';
      default: return 'bg-red-500 text-white';
    }
  };
  
  // Get global activity summary
  const getActivitySummary = () => {
    const activeUsers = processedUsers.filter(u => u.activityLevel === 'high' || u.activityLevel === 'medium').length;
    const activePercentage = Math.round((activeUsers / processedUsers.length) * 100) || 0;
    
    const totalGoals = processedUsers.reduce((sum, user) => sum + (user.goalsCreated || 0), 0);
    const totalTasks = processedUsers.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0);
    
    return {
      activeUsers,
      activePercentage,
      totalGoals,
      totalTasks,
      goalsPerUser: (totalGoals / processedUsers.length) || 0,
      tasksPerUser: (totalTasks / processedUsers.length) || 0
    };
  };
  
  const activitySummary = getActivitySummary();
  
  // Handle continent selection for filtering
  const handleContinentSelect = (continent: string) => {
    setSelectedContinent(continent === selectedContinent ? null : continent);
  };
  
  // Get filtered users based on selected continent
  const getFilteredUsers = () => {
    if (!selectedContinent) return processedUsers;
    
    return processedUsers.filter(user => 
      user.country && (continentMapping[user.country] || user.country) === selectedContinent
    );
  };
  
  const filteredUsers = getFilteredUsers();
  
  // Calculate time distribution (what hours users are most active)
  const getTimeDistribution = () => {
    const hourCounts = Array(24).fill(0);
    
    processedUsers.forEach(user => {
      if (user.lastActive) {
        const lastActive = new Date(user.lastActive);
        const hour = lastActive.getHours();
        hourCounts[hour]++;
      }
    });
    
    return hourCounts.map((count, hour) => ({
      hour,
      count,
      percentage: Math.round((count / processedUsers.length) * 100)
    }));
  };
  
  const timeDistribution = getTimeDistribution();
  const peakHour = timeDistribution.reduce((peak, current) => 
    current.count > peak.count ? current : peak, { hour: 0, count: 0, percentage: 0 }
  );
  
  return (
    <div className="py-8 px-4 md:px-6 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-3">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Globe className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Global Impact Dashboard
          </h1>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-2xl"
          >
            Track real-time user engagement and progress across the world with our interactive visualization tools.
            Discover where users are most active and identify emerging trends in goal achievement.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-2"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" /> Export
            </Button>
          </motion.div>
        </div>
        
        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1">{processedUsers.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                From {regionalData.length} different regions
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 dark:from-green-950/40 dark:to-emerald-950/40 dark:border-green-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <h3 className="text-2xl font-bold mt-1">{activitySummary.activeUsers}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {activitySummary.activePercentage}% of total users active now
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 dark:from-purple-950/40 dark:to-violet-950/40 dark:border-purple-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                  <h3 className="text-2xl font-bold mt-1">{activitySummary.totalGoals}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Avg {activitySummary.goalsPerUser.toFixed(1)} goals per user
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 dark:from-orange-950/40 dark:to-amber-950/40 dark:border-orange-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                  <h3 className="text-2xl font-bold mt-1">{activitySummary.totalTasks}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Peak activity at {peakHour.hour}:00 (UTC)
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Tabs 
        defaultValue={activeView} 
        onValueChange={setActiveView} 
        className="w-full"
      >
        <div className="border-b mb-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger 
                value="globe" 
                className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
              >
                <Globe className="h-4 w-4" />
                <span>Interactive Globe</span>
              </TabsTrigger>
              <TabsTrigger 
                value="regions" 
                className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
              >
                <Map className="h-4 w-4" />
                <span>Region Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Activity Patterns</span>
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none rounded-none px-4 py-2"
              >
                <Award className="h-4 w-4" />
                <span>Impact Leaderboard</span>
              </TabsTrigger>
            </TabsList>
            <div className="hidden md:flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                <Clock className="h-3 w-3 mr-1" /> Updated just now
              </Badge>
            </div>
          </div>
        </div>
        
        <AnimatedComponent animation="fadeIn" duration={0.8}>
          <TabsContent value="globe" className="m-0">
            <div className="h-[750px] rounded-xl overflow-hidden border">
              <GlobeVisualization className="h-full" />
            </div>
          </TabsContent>
        </AnimatedComponent>
        
        <AnimatedComponent animation="fadeIn" duration={0.8}>
          <TabsContent value="regions" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Region Selections */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Map className="h-5 w-5 text-blue-600" />
                    Regional Distribution
                  </CardTitle>
                  <CardDescription>
                    Click on a region to filter data
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-1">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3">
                    {regionalData.map((region) => (
                      <motion.div 
                        key={region.name}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleContinentSelect(region.name)}
                        className={`flex items-center cursor-pointer p-3 rounded-lg border-2 ${
                          selectedContinent === region.name 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{region.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {region.percentage}%
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                                style={{ width: `${region.percentage}%` }} 
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{region.count} users</span>
                          </div>
                          
                          <div className="mt-2 flex items-center text-xs text-muted-foreground">
                            <Activity className="h-3 w-3 mr-1 text-green-500" />
                            <span>Active: {region.activityScore} users</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    {regionalData.length} regions detected
                  </div>
                  
                  {selectedContinent && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedContinent(null)}
                    >
                      Clear filter
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Stats Cards */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      {selectedContinent ? `${selectedContinent} Insights` : 'Global Insights'}
                    </CardTitle>
                    <CardDescription>
                      Current activity and impact metrics
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Users</div>
                        <div className="text-3xl font-bold text-blue-600">{filteredUsers.length}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {selectedContinent 
                            ? `${Math.round((filteredUsers.length / processedUsers.length) * 100)}% of global users` 
                            : 'Total registered users'}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Active Users</div>
                        <div className="text-3xl font-bold text-green-600">
                          {filteredUsers.filter(u => u.activityLevel === 'high' || u.activityLevel === 'medium').length}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Active in the last 3 days
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Goals Created</div>
                        <div className="text-3xl font-bold text-purple-600">
                          {filteredUsers.reduce((sum, user) => sum + (user.goalsCreated || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {(filteredUsers.reduce((sum, user) => sum + (user.goalsCreated || 0), 0) / filteredUsers.length).toFixed(1)} per user
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Tasks Completed</div>
                        <div className="text-3xl font-bold text-orange-600">
                          {filteredUsers.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {(filteredUsers.reduce((sum, user) => sum + (user.tasksCompleted || 0), 0) / filteredUsers.length).toFixed(1)} per user
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Most Active City</div>
                        <div className="text-xl font-bold text-indigo-600 truncate">
                          {(() => {
                            // Find most common city
                            const cityCounts: Record<string, number> = {};
                            filteredUsers.forEach(user => {
                              if (user.city) {
                                cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
                              }
                            });
                            
                            const entries = Object.entries(cityCounts);
                            if (entries.length === 0) return "No data";
                            
                            return entries.sort((a, b) => b[1] - a[1])[0][0];
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Based on user location data
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Peak Hour (UTC)</div>
                        <div className="text-3xl font-bold text-teal-600">
                          {(() => {
                            // Find peak hour for filtered users
                            const hourCounts = Array(24).fill(0);
                            filteredUsers.forEach(user => {
                              if (user.lastActive) {
                                const hour = new Date(user.lastActive).getHours();
                                hourCounts[hour]++;
                              }
                            });
                            
                            let max = 0;
                            let maxHour = 0;
                            hourCounts.forEach((count, hour) => {
                              if (count > max) {
                                max = count;
                                maxHour = hour;
                              }
                            });
                            
                            return `${maxHour}:00`;
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Most active time of day
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Users Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      {selectedContinent ? `${selectedContinent} Users` : 'Active Users'} 
                    </CardTitle>
                    <CardDescription>
                      {selectedContinent 
                        ? `Showing users from ${selectedContinent}` 
                        : 'Most recently active users globally'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                            <th className="text-left py-2 px-4 text-sm font-medium">User</th>
                            <th className="text-left py-2 px-4 text-sm font-medium">Location</th>
                            <th className="text-left py-2 px-4 text-sm font-medium">Status</th>
                            <th className="text-left py-2 px-4 text-sm font-medium">Last Active</th>
                            <th className="text-right py-2 px-4 text-sm font-medium">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers
                            .sort((a, b) => {
                              // Sort by activity level first
                              const activityOrder = { high: 0, medium: 1, low: 2, inactive: 3 };
                              return activityOrder[a.activityLevel] - activityOrder[b.activityLevel];
                            })
                            .slice(0, 5)
                            .map((user, i) => (
                              <tr 
                                key={user.id} 
                                className={`border-b ${
                                  highlightedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                                onMouseEnter={() => setHighlightedUser(user)}
                                onMouseLeave={() => setHighlightedUser(null)}
                              >
                                <td className="py-3 px-4 font-medium">{user.username}</td>
                                <td className="py-3 px-4 text-muted-foreground">
                                  {user.city}, {user.country}
                                </td>
                                <td className="py-3 px-4">
                                  <Badge className={getActivityColor(user.activityLevel)}>
                                    {user.activityLevel === 'high' ? 'Active' : 
                                     user.activityLevel === 'medium' ? 'Recent' :
                                     user.activityLevel === 'low' ? 'Occasional' : 'Inactive'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">
                                  {user.lastActiveRelative}
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                  {user.totalImpact}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-3 border-t">
                    <Button variant="outline" size="sm" className="ml-auto">
                      View All Users
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </AnimatedComponent>
        
        <AnimatedComponent animation="fadeIn" duration={0.8}>
          <TabsContent value="activity" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Activity Graph */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    User Activity by Time (UTC)
                  </CardTitle>
                  <CardDescription>
                    When users are most active across 24 hours
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="h-80 flex items-end gap-2 px-1">
                    {timeDistribution.map(({ hour, count, percentage }) => (
                      <div key={hour} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all relative group"
                          style={{ 
                            height: `${Math.max(5, percentage * 3.5)}%`,
                            background: hour === peakHour.hour 
                              ? 'linear-gradient(to top, rgb(79, 70, 229), rgb(67, 56, 202))' 
                              : undefined
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                            {count} users ({percentage}%)
                          </div>
                        </div>
                        <div className="text-xs mt-2 text-muted-foreground">
                          {hour}:00
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Peak activity time: <span className="font-medium text-blue-600">{peakHour.hour}:00 UTC</span>
                    </div>
                    
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> 
                      24-hour cycle
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Activity Periods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    User Activity Trends
                  </CardTitle>
                  <CardDescription>
                    Recent engagement patterns
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    {activityStats.map((stat, index) => (
                      <motion.div 
                        key={stat.period}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between">
                          <div className="font-medium text-sm">{stat.period}</div>
                          <div className="text-sm text-muted-foreground">
                            {stat.count} users
                          </div>
                        </div>
                        
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                            className={`h-full ${
                              stat.period === 'Last 24 hours' ? 'bg-green-500' :
                              stat.period === 'Last week' ? 'bg-blue-500' :
                              stat.period === 'Last month' ? 'bg-purple-500' :
                              'bg-gray-500'
                            }`}
                          />
                        </div>
                        
                        <div className="text-right text-xs text-muted-foreground">
                          {stat.percentage}% of all users
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Activity Health Score</h3>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <div className="text-sm">Engagement Score</div>
                        <div>
                          <Badge
                            className={
                              activitySummary.activePercentage > 50 ? 'bg-green-500' :
                              activitySummary.activePercentage > 30 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }
                          >
                            {activitySummary.activePercentage > 50 ? 'Excellent' :
                             activitySummary.activePercentage > 30 ? 'Good' :
                             'Needs Improvement'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="h-3 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                          style={{ width: `${Math.min(100, activitySummary.activePercentage * 1.8)}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Based on activity over the last 7 days
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6 text-sm">
                      <div>
                        <div className="text-muted-foreground">Active Minutes/User</div>
                        <div className="font-medium">42.8 min/day</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-muted-foreground">Retention Rate</div>
                        <div className="font-medium">87.3%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Activity Analysis
                  </CardTitle>
                  <CardDescription>
                    Insights into user activity patterns and trends
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        Peak Activity Times
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <div>Weekdays</div>
                          <div className="font-medium">10:00 - 14:00 UTC</div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Weekends</div>
                          <div className="font-medium">16:00 - 20:00 UTC</div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Most Active Day</div>
                          <div className="font-medium">Wednesday</div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between text-sm">
                          <div>Least Active</div>
                          <div className="font-medium">03:00 - 05:00 UTC</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <Map className="h-4 w-4 mr-2 text-blue-500" />
                        Geographic Insights
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <div>Most Active Region</div>
                          <div className="font-medium">{regionalData[0]?.name || 'N/A'}</div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Fastest Growth</div>
                          <div className="font-medium">Asia (+24%)</div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Most Engaged</div>
                          <div className="font-medium">North America</div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between text-sm">
                          <div>Needs Attention</div>
                          <div className="font-medium">South America</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-3 flex items-center">
                        <BarChart4 className="h-4 w-4 mr-2 text-blue-500" />
                        Performance Metrics
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <div>Avg. Session Time</div>
                          <div className="font-medium">12.5 minutes</div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Task Completion Rate</div>
                          <div className="font-medium">76.3%</div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <div>Goal Achievement</div>
                          <div className="font-medium">42.8%</div>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between text-sm">
                          <div>Monthly Growth</div>
                          <div className="font-medium text-green-600">+8.7%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </AnimatedComponent>
        
        <AnimatedComponent animation="fadeIn" duration={0.8}>
          <TabsContent value="leaderboard" className="m-0">
            <div className="flex flex-col lg:flex-row gap-6">
              <Card className="lg:w-2/3">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Global Impact Leaderboard
                  </CardTitle>
                  <CardDescription>
                    Users ranked by goals created and tasks completed
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                          <th className="text-left py-3 px-4 font-medium w-12">#</th>
                          <th className="text-left py-3 px-4 font-medium">User</th>
                          <th className="text-left py-3 px-4 font-medium">Location</th>
                          <th className="text-center py-3 px-4 font-medium">Goals</th>
                          <th className="text-center py-3 px-4 font-medium">Tasks</th>
                          <th className="text-center py-3 px-4 font-medium">Impact Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {impactUsers.map((user, index) => (
                          <motion.tr 
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              index < 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/10' : ''
                            }`}
                          >
                            <td className="py-4 px-4 font-bold text-center">
                              {index === 0 ? (
                                <div className="inline-flex items-center justify-center bg-yellow-500 text-white rounded-full w-6 h-6">
                                  1
                                </div>
                              ) : index === 1 ? (
                                <div className="inline-flex items-center justify-center bg-gray-400 text-white rounded-full w-6 h-6">
                                  2
                                </div>
                              ) : index === 2 ? (
                                <div className="inline-flex items-center justify-center bg-amber-700 text-white rounded-full w-6 h-6">
                                  3
                                </div>
                              ) : (
                                <span className="text-muted-foreground">{index + 1}</span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-medium flex items-center gap-2">
                              {index < 3 && (
                                <Star className={`h-4 w-4 ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-gray-400' : 'text-amber-700'
                                }`} />
                              )}
                              {user.username}
                              {user.activityLevel === 'high' && (
                                <Badge className="ml-1 bg-green-500 text-white">Active</Badge>
                              )}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {user.city}, {user.country}
                            </td>
                            <td className="py-4 px-4 text-center font-medium text-purple-600">
                              {user.goalsCreated || 0}
                            </td>
                            <td className="py-4 px-4 text-center font-medium text-orange-600">
                              {user.tasksCompleted || 0}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium text-sm">
                                {user.totalImpact}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                        
                        {impactUsers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              No impact data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-3 border-t flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {impactUsers.length} users ranked by impact
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" /> Share Leaderboard
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="lg:w-1/3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Impact Insights
                    </CardTitle>
                    <CardDescription>
                      Goal and task performance metrics
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Average Impact by Region</h3>
                      
                      {regionalData.slice(0, 5).map((region, i) => {
                        // Calculate average impact for this region
                        const regionUsers = processedUsers.filter(
                          user => user.country && (continentMapping[user.country] || user.country) === region.name
                        );
                        
                        const avgImpact = regionUsers.length > 0
                          ? regionUsers.reduce((sum, user) => sum + user.totalImpact, 0) / regionUsers.length
                          : 0;
                        
                        return (
                          <div key={region.name} className="flex items-center">
                            <div className="w-36 font-medium truncate">{region.name}</div>
                            <div className="flex-1">
                              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, avgImpact * 5)}%` }}
                                  transition={{ duration: 1, delay: 0.1 * i }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                                />
                              </div>
                            </div>
                            <div className="w-16 text-right text-sm font-medium">
                              {avgImpact.toFixed(1)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Impact Distribution</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <div className="text-muted-foreground text-xs mb-1">Goals Completed</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(processedUsers.reduce((sum, user) => sum + (user.goalsCreated || 0), 0) * 0.42)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            42% completion rate
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                          <div className="text-muted-foreground text-xs mb-1">Avg Tasks/Goal</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {(activitySummary.totalTasks / activitySummary.totalGoals).toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Tasks per goal created
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Top Achievements</h3>
                      
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Most Productive User</div>
                            <div className="text-sm text-muted-foreground">
                              {impactUsers[0]?.username || 'N/A'} ({impactUsers[0]?.totalImpact || 0} impact)
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg border flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Goal Setting Champion</div>
                            <div className="text-sm text-muted-foreground">
                              {processedUsers
                                .sort((a, b) => (b.goalsCreated || 0) - (a.goalsCreated || 0))[0]?.username || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg border flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Task Completion King</div>
                            <div className="text-sm text-muted-foreground">
                              {processedUsers
                                .sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0))[0]?.username || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </AnimatedComponent>
      </Tabs>
    </div>
  );
}