import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { GlobeVisualization } from '@/components/globe-visualization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Map, PieChart, BarChart, Users, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GlobalImpact() {
  const [activeView, setActiveView] = useState<string>('globe');
  const { toast } = useToast();
  
  // Fetch users data
  const { 
    data: users = [], 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 60000, // 60 seconds
    retry: 2
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
  
  // Organize user data by regions
  const regionData = users.reduce((acc: Record<string, number>, user) => {
    if (!user.country) return acc;
    
    // Simplified region mapping - would likely use a proper region mapping in real app
    let region = user.country;
    
    if (!acc[region]) {
      acc[region] = 0;
    }
    acc[region]++;
    return acc;
  }, {});
  
  // Organize user data by activity
  const getUserActivityStats = () => {
    if (users.length === 0) return [];
    
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;
    
    const activityBuckets = {
      "Last 24 hours": 0,
      "Last week": 0,
      "Last month": 0,
      "Older": 0
    };
    
    users.forEach(user => {
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
      period,
      count,
      percentage: Math.round((count / users.length) * 100)
    }));
  };
  
  const activityStats = getUserActivityStats();
  
  // Get user impact stats (goals and tasks)
  const getUserImpactStats = () => {
    if (users.length === 0) return [];
    
    // Sort users by goals created/tasks completed
    return users
      .filter(user => user.goalsCreated || user.tasksCompleted)
      .sort((a, b) => {
        const aImpact = (a.goalsCreated || 0) + (a.tasksCompleted || 0);
        const bImpact = (b.goalsCreated || 0) + (b.tasksCompleted || 0);
        return bImpact - aImpact;
      })
      .slice(0, 5) // Top 5 users
      .map(user => ({
        username: user.username,
        goalsCreated: user.goalsCreated || 0,
        tasksCompleted: user.tasksCompleted || 0,
        totalImpact: (user.goalsCreated || 0) + (user.tasksCompleted || 0)
      }));
  };
  
  const impactStats = getUserImpactStats();
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Global Impact Dashboard</h1>
        <p className="text-muted-foreground">
          Track worldwide user engagement and impact across the globe
        </p>
      </div>
      
      <Tabs defaultValue={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList>
          <TabsTrigger value="globe" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>3D Globe</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Regional Stats</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>User Activity</span>
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>User Impact</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="globe" className="mt-6">
          <div className="h-[600px]">
            <GlobeVisualization className="h-full" />
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="mr-2 h-5 w-5" />
                  Regional Distribution
                </CardTitle>
                <CardDescription>
                  User distribution by geographical region
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="h-60 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : Object.keys(regionData).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(regionData)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([region, count]) => (
                        <div key={region} className="flex items-center">
                          <div className="w-36 font-medium truncate">{region}</div>
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${Math.min((count as number / users.length) * 100, 100)}%` }} 
                              />
                            </div>
                          </div>
                          <div className="w-12 text-right text-sm">{count}</div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-muted-foreground">
                    No regional data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Global Reach
                </CardTitle>
                <CardDescription>
                  Overview of global user presence
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="h-60 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {users.length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Total Users
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {Object.keys(regionData).length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Countries
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {users.filter(u => u.lastActive && new Date(u.lastActive).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)).length}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Active (7d)
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {users.reduce((sum, user) => sum + (user.goalsCreated || 0), 0)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Goals Created
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                User Activity Trends
              </CardTitle>
              <CardDescription>
                Recent user engagement patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : activityStats.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {activityStats.map(stat => (
                      <div key={stat.period} className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg">
                        <div className="text-3xl font-bold text-primary">
                          {stat.count}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {stat.period}
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          {stat.percentage}% of users
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Activity Distribution</h3>
                    {activityStats.map(stat => (
                      <div key={stat.period} className="flex items-center">
                        <div className="w-36 font-medium truncate">{stat.period}</div>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${stat.percentage}%` }} 
                            />
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm">{stat.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground">
                  No activity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="impact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Impact Leaders
              </CardTitle>
              <CardDescription>
                Top users by goals created and tasks completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : impactStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-center py-3 px-4 font-medium">Goals Created</th>
                        <th className="text-center py-3 px-4 font-medium">Tasks Completed</th>
                        <th className="text-center py-3 px-4 font-medium">Total Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impactStats.map((user, index) => (
                        <tr key={user.username} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                          <td className="py-3 px-4 font-medium">{user.username}</td>
                          <td className="py-3 px-4 text-center">{user.goalsCreated}</td>
                          <td className="py-3 px-4 text-center">{user.tasksCompleted}</td>
                          <td className="py-3 px-4 text-center font-medium">{user.totalImpact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-muted-foreground">
                  No impact data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}