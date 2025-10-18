import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal, Prospect } from "@shared/schema";
import { 
  DollarSign, 
  Target, 
  Users,
  AlertCircle,
  Zap,
  Calendar,
  Pencil
} from "lucide-react";
import { GoalDialog } from "@/components/goal-dialog";
import { ProspectDialog } from "@/components/prospect-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { SearchBar } from "@/components/search-bar";
import { RegionMap } from "@/components/region-map";
import { useState, useEffect, useMemo } from "react";

const SimpleDashboard = () => {
  const [financials, setFinancials] = useState({
    monthlyBurnRate: 250000,
    currentCash: 1000000,
  });
  const [goalSearch, setGoalSearch] = useState("");
  const [prospectSearch, setProspectSearch] = useState("");

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem('dashboard-settings');
      if (saved) {
        try {
          setFinancials(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
    };

    loadSettings();
    window.addEventListener('settings-updated', loadSettings);
    return () => window.removeEventListener('settings-updated', loadSettings);
  }, []);

  const { data: goals = [], isLoading: isLoadingGoals } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  const { data: prospects = [], isLoading: isLoadingProspects } = useQuery<Prospect[]>({
    queryKey: ['/api/prospects/top/10'],
  });

  const isLoading = isLoadingGoals || isLoadingProspects;

  const filteredGoals = useMemo(() => {
    if (!goalSearch) return goals;
    const query = goalSearch.toLowerCase();
    return goals.filter(g => 
      g.name.toLowerCase().includes(query) || 
      g.unit?.toLowerCase().includes(query)
    );
  }, [goals, goalSearch]);

  const filteredProspects = useMemo(() => {
    if (!prospectSearch) return prospects;
    const query = prospectSearch.toLowerCase();
    return prospects.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.organization.toLowerCase().includes(query) ||
      p.stage.toLowerCase().includes(query)
    );
  }, [prospects, prospectSearch]);

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => (g.current / g.target) * 100 >= 100).length;
  const totalPipeline = prospects.reduce((sum, p) => sum + (p.value * (p.probability / 100)), 0);
  
  const runway = financials.currentCash / financials.monthlyBurnRate;

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-white text-glow">Loading numbers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white text-glow">Numbers Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">Your business at a glance</p>
            </div>
            <SettingsDialog />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 entrance-animation">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glow-card bg-black/80 border-primary/40 hover-lift" data-testid="card-pipeline-value">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Pipeline Value</p>
                  <p className="text-2xl font-bold text-white text-glow-sm mt-1">
                    ${Math.round(totalPipeline).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card bg-black/80 border-primary/40 hover-lift" data-testid="card-monthly-burn">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly Burn</p>
                  <p className="text-2xl font-bold text-white text-glow-sm mt-1">
                    ${financials.monthlyBurnRate.toLocaleString()}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-white drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card bg-black/80 border-primary/40 hover-lift" data-testid="card-runway">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Runway</p>
                  <p className="text-2xl font-bold text-white text-glow-sm mt-1">
                    {runway.toFixed(1)} months
                  </p>
                </div>
                <Zap className="h-8 w-8 text-primary drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card bg-black/80 border-primary/40 hover-lift" data-testid="card-goals-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Goals Progress</p>
                  <p className="text-2xl font-bold text-white text-glow-sm mt-1">
                    {completedGoals}/{totalGoals}
                  </p>
                </div>
                <Target className="h-8 w-8 text-primary drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Conquest Map Section */}
        <div className="mb-8">
          <Card className="glow-card bg-black/80 border-primary/40" data-testid="card-region-map">
            <CardContent className="p-6">
              <RegionMap />
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-white text-glow">Goals & Targets</h2>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <SearchBar 
                placeholder="Search goals..." 
                onSearch={setGoalSearch}
              />
              <GoalDialog />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              const isComplete = progress >= 100;
              const isOnTrack = progress >= 75;
              
              return (
                <Card 
                  key={goal.id} 
                  className={`gradient-border glow-card bg-black/80 border-primary/40 ${isComplete ? 'celebration-card' : ''}`}
                  data-testid={`card-goal-${goal.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white text-glow-sm" data-testid={`text-goal-name-${goal.id}`}>{goal.name}</h3>
                        {goal.deadline && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span data-testid={`text-goal-deadline-${goal.id}`}>{goal.deadline}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary text-glow" data-testid={`text-goal-progress-${goal.id}`}>
                            {Math.round(progress)}%
                          </div>
                          {isComplete ? (
                            <span className="text-xs text-primary" data-testid={`status-goal-${goal.id}`}>Complete</span>
                          ) : isOnTrack ? (
                            <span className="text-xs text-primary/70" data-testid={`status-goal-${goal.id}`}>On Track</span>
                          ) : (
                            <span className="text-xs text-white/70" data-testid={`status-goal-${goal.id}`}>Needs Focus</span>
                          )}
                        </div>
                        <GoalDialog 
                          goal={goal} 
                          trigger={
                            <button 
                              className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                              data-testid={`button-edit-goal-${goal.id}`}
                            >
                              <Pencil className="h-4 w-4 text-primary" />
                            </button>
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current</span>
                        <span className="text-white font-medium" data-testid={`text-goal-current-${goal.id}`}>
                          {goal.current.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Target</span>
                        <span className="text-white font-medium" data-testid={`text-goal-target-${goal.id}`}>
                          {goal.target.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mt-3 glow-neon" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredGoals.length === 0 && (
              <div className="col-span-full text-center py-12" data-testid="empty-goals">
                <p className="text-gray-400 mb-4">
                  {goalSearch ? "No goals match your search" : "No goals set yet"}
                </p>
                {!goalSearch && <GoalDialog />}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-white text-glow">Sales Pipeline</h2>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <SearchBar 
                placeholder="Search prospects..." 
                onSearch={setProspectSearch}
              />
              <ProspectDialog />
            </div>
          </div>
          <Card className="glow-card bg-black/80 border-primary/40" data-testid="card-pipeline">
            <CardContent className="p-6">
              <div className="space-y-3">
                {filteredProspects.slice(0, 8).map((prospect) => (
                  <div 
                    key={prospect.id} 
                    className="flex items-center justify-between p-3 bg-black/60 rounded-lg border border-primary/20 hover:border-primary/40 transition-all hover-lift iridescent-hover group"
                    data-testid={`row-prospect-${prospect.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium" data-testid={`text-prospect-name-${prospect.id}`}>{prospect.name}</p>
                        <span className="text-xs text-gray-500">•</span>
                        <p className="text-sm text-gray-400" data-testid={`text-prospect-org-${prospect.id}`}>{prospect.organization}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded border border-primary/30" data-testid={`text-prospect-stage-${prospect.id}`}>
                          {prospect.stage}
                        </span>
                        <span className="text-xs text-gray-500" data-testid={`text-prospect-probability-${prospect.id}`}>
                          {prospect.probability}% probability
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary text-glow" data-testid={`text-prospect-value-${prospect.id}`}>
                          ${prospect.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500" data-testid={`text-prospect-expected-${prospect.id}`}>
                          ${Math.round(prospect.value * (prospect.probability / 100)).toLocaleString()} expected
                        </div>
                      </div>
                      <ProspectDialog 
                        prospect={prospect}
                        trigger={
                          <button 
                            className="p-2 hover:bg-primary/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            data-testid={`button-edit-prospect-${prospect.id}`}
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                ))}
                
                {filteredProspects.length === 0 && (
                  <div className="text-center py-8" data-testid="empty-prospects">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 mb-4">
                      {prospectSearch ? "No prospects match your search" : "No prospects in pipeline"}
                    </p>
                    {!prospectSearch && <ProspectDialog />}
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