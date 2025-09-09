import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Goal, Prospect } from "@shared/schema";
import { Target, TrendingUp, Users, DollarSign, RefreshCcw } from "lucide-react";

const SimpleDashboard = () => {
  // Fetch goals
  const { 
    data: goals = [], 
    isLoading: isLoadingGoals,
    refetch: refetchGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch prospects
  const { 
    data: prospects = [], 
    isLoading: isLoadingProspects,
    refetch: refetchProspects
  } = useQuery<Prospect[]>({
    queryKey: ['/api/prospects/top/10'],
  });

  const isLoading = isLoadingGoals || isLoadingProspects;

  const handleRefresh = async () => {
    await Promise.all([refetchGoals(), refetchProspects()]);
  };

  // Calculate key metrics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => (g.current / g.target) * 100 >= 100).length;
  const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const activeProspects = prospects.length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Goals Dashboard</h1>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Total Goals</p>
                  <p className="text-2xl font-bold text-white">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Active Prospects</p>
                  <p className="text-2xl font-bold text-white">{activeProspects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.slice(0, 5).map((goal) => {
                  const progress = Math.min(100, (goal.current / goal.target) * 100);
                  return (
                    <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <div className="flex-1">
                        <p className="text-white font-medium">{goal.name}</p>
                        <div className="mt-2">
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm text-gray-400">{Math.round(progress)}%</p>
                      </div>
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <p className="text-gray-400">No active goals</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prospects List */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Top Prospects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prospects.slice(0, 5).map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div className="flex-1">
                      <p className="text-white font-medium">{prospect.name}</p>
                      <p className="text-sm text-gray-400">{prospect.organization}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-green-400">${prospect.value?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                ))}
                {prospects.length === 0 && (
                  <p className="text-gray-400">No active prospects</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Goal Completion</span>
                  <span className="text-white">{completedGoals} of {totalGoals} completed</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SimpleDashboard;