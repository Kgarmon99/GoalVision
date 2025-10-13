import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal, Prospect } from "@shared/schema";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Users,
  AlertCircle,
  Zap,
  Calendar
} from "lucide-react";

const SimpleDashboard = () => {
  // Fetch goals
  const { data: goals = [], isLoading: isLoadingGoals } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch prospects
  const { data: prospects = [], isLoading: isLoadingProspects } = useQuery<Prospect[]>({
    queryKey: ['/api/prospects/top/10'],
  });

  const isLoading = isLoadingGoals || isLoadingProspects;

  // Calculate key metrics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => (g.current / g.target) * 100 >= 100).length;
  const totalPipeline = prospects.reduce((sum, p) => sum + (p.value * (p.probability / 100)), 0);
  
  // Burn rate - hardcoded for now, can be made dynamic
  const monthlyBurnRate = 250000;
  const currentCash = 1000000; // Example
  const runway = currentCash / monthlyBurnRate;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading numbers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Numbers Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Your business at a glance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Key Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Pipeline Value</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${Math.round(totalPipeline).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Burn</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${monthlyBurnRate.toLocaleString()}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Runway</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {runway.toFixed(1)} months
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Goals Progress</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {completedGoals}/{totalGoals}
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Goals & Targets</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              const isComplete = progress >= 100;
              const isOnTrack = progress >= 75;
              
              return (
                <Card key={goal.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                        {goal.deadline && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {goal.deadline}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {Math.round(progress)}%
                        </div>
                        {isComplete ? (
                          <span className="text-xs text-green-400">Complete</span>
                        ) : isOnTrack ? (
                          <span className="text-xs text-blue-400">On Track</span>
                        ) : (
                          <span className="text-xs text-yellow-400">Needs Focus</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current</span>
                        <span className="text-white font-medium">
                          {goal.current.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Target</span>
                        <span className="text-white font-medium">
                          {goal.target.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mt-3" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {goals.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">No goals set yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Prospects Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Sales Pipeline</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="space-y-3">
                {prospects.slice(0, 8).map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{prospect.name}</p>
                        <span className="text-xs text-gray-500">•</span>
                        <p className="text-sm text-gray-400">{prospect.organization}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                          {prospect.stage}
                        </span>
                        <span className="text-xs text-gray-500">
                          {prospect.probability}% probability
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-400">
                        ${prospect.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${Math.round(prospect.value * (prospect.probability / 100)).toLocaleString()} expected
                      </div>
                    </div>
                  </div>
                ))}
                
                {prospects.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No prospects in pipeline</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SimpleDashboard;