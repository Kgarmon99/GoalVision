import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Goal, Prospect } from "@shared/schema";
import { 
  DollarSign, 
  Target, 
  Users,
  AlertCircle,
  Zap,
  Calendar,
  Pencil,
  Activity,
  Crosshair
} from "lucide-react";
import { GoalDialog } from "@/components/goal-dialog";
import { ProspectDialog } from "@/components/prospect-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import { SearchBar } from "@/components/search-bar";
import { GamificationHUD } from "@/components/gamification-hud";
import { StartupMetricsDisplay } from "@/components/startup-metrics-display";
import { useState, useEffect, useMemo } from "react";
import moneybotLogo from "../assets/moneybot-logo.png";

const SimpleDashboard = () => {
  const [financials, setFinancials] = useState({
    monthlyBurnRate: 250000,
    currentCash: 1000000,
  });
  const [goalSearch, setGoalSearch] = useState("");
  const [prospectSearch, setProspectSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      <div className="min-h-screen bg-black tactical-grid flex items-center justify-center">
        <div className="text-center">
          <div className="data-value text-2xl">LOADING SYSTEMS...</div>
          <div className="data-label mt-2">INITIALIZING COMMAND CENTER</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black tactical-grid scanlines">
      {/* Header Bar */}
      <div className="header-bar">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={moneybotLogo} 
                  alt="Moneybot" 
                  className="h-14 w-14 border border-primary/50" 
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))'
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full pulse-glow" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  MONEYBOT COMMAND
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="data-label">MISSION CONTROL ACTIVE</span>
                  <span className="text-primary text-xs font-mono">
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="status-bar hidden md:flex">
                <div className="status-indicator">
                  <div className="status-dot online" />
                  <span className="text-gray-400">SYSTEMS NOMINAL</span>
                </div>
                <div className="status-indicator">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="text-gray-400">LIVE DATA</span>
                </div>
              </div>
              <SettingsDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 entrance-animation relative z-10">
        
        {/* Gamification HUD */}
        <div className="mb-6">
          <GamificationHUD />
        </div>

        {/* Startup Metrics Section */}
        <div className="mb-6">
          <StartupMetricsDisplay />
        </div>
        
        {/* Primary Metrics Grid */}
        <div className="section-divider mb-6">
          <span className="section-title">Primary Metrics</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger-children">
          <div className="tactical-card corner-brackets p-5 hover-lift" data-testid="card-pipeline-value">
            <div className="flex items-center justify-between">
              <div>
                <p className="data-label">Pipeline Value</p>
                <p className="data-value text-2xl mt-2">
                  ${Math.round(totalPipeline).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-60" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-5 hover-lift" data-testid="card-monthly-burn">
            <div className="flex items-center justify-between">
              <div>
                <p className="data-label">Monthly Burn</p>
                <p className="data-value text-2xl mt-2">
                  ${financials.monthlyBurnRate.toLocaleString()}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500 opacity-60" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-5 hover-lift" data-testid="card-runway">
            <div className="flex items-center justify-between">
              <div>
                <p className="data-label">Runway</p>
                <p className={`data-value text-2xl mt-2 ${runway < 6 ? 'text-red-500' : runway < 12 ? 'text-yellow-500' : ''}`}>
                  {runway.toFixed(1)} MO
                </p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-60" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-5 hover-lift" data-testid="card-goals-progress">
            <div className="flex items-center justify-between">
              <div>
                <p className="data-label">Objectives Complete</p>
                <p className="data-value text-2xl mt-2">
                  {completedGoals}/{totalGoals}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-60" />
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Crosshair className="w-5 h-5 text-primary" />
              <h2 className="section-title">Active Objectives</h2>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <SearchBar 
                placeholder="Search objectives..." 
                onSearch={setGoalSearch}
              />
              <GoalDialog />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
            {filteredGoals.map((goal) => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              const isComplete = progress >= 100;
              const isOnTrack = progress >= 75;
              
              return (
                <div 
                  key={goal.id} 
                  className={`tactical-card p-5 hover-lift ${isComplete ? 'pulse-glow' : ''}`}
                  data-testid={`card-goal-${goal.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold tracking-wide" data-testid={`text-goal-name-${goal.id}`}>
                        {goal.name}
                      </h3>
                      {goal.deadline && (
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500 font-mono" data-testid={`text-goal-deadline-${goal.id}`}>
                            {goal.deadline}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <div className="data-value text-xl" data-testid={`text-goal-progress-${goal.id}`}>
                          {Math.round(progress)}%
                        </div>
                        <span className={`text-xs uppercase tracking-wider ${
                          isComplete ? 'status-online' : isOnTrack ? 'text-primary/70' : 'status-warning'
                        }`} data-testid={`status-goal-${goal.id}`}>
                          {isComplete ? 'COMPLETE' : isOnTrack ? 'ON TRACK' : 'ATTENTION'}
                        </span>
                      </div>
                      <GoalDialog 
                        goal={goal} 
                        trigger={
                          <button 
                            className="btn-tactical p-2"
                            data-testid={`button-edit-goal-${goal.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="data-label">Current</span>
                      <span className="text-white font-mono" data-testid={`text-goal-current-${goal.id}`}>
                        {goal.current.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="data-label">Target</span>
                      <span className="text-white font-mono" data-testid={`text-goal-target-${goal.id}`}>
                        {goal.target.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div className="progress-tactical mt-3">
                      <div 
                        className="progress-tactical-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredGoals.length === 0 && (
              <div className="col-span-full text-center py-12 tactical-card" data-testid="empty-goals">
                <Target className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                <p className="text-gray-500 mb-4 font-mono">
                  {goalSearch ? "NO OBJECTIVES MATCH QUERY" : "NO ACTIVE OBJECTIVES"}
                </p>
                {!goalSearch && <GoalDialog />}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Section */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="section-title">Revenue Pipeline</h2>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <SearchBar 
                placeholder="Search pipeline..." 
                onSearch={setProspectSearch}
              />
              <ProspectDialog />
            </div>
          </div>
          
          <div className="tactical-card" data-testid="card-pipeline">
            <div className="p-4">
              <div className="space-y-2 stagger-children">
                {filteredProspects.slice(0, 8).map((prospect) => (
                  <div 
                    key={prospect.id} 
                    className="flex items-center justify-between p-4 bg-black/60 border border-primary/10 hover:border-primary/30 transition-all group"
                    data-testid={`row-prospect-${prospect.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium" data-testid={`text-prospect-name-${prospect.id}`}>
                          {prospect.name}
                        </span>
                        <span className="text-gray-600">|</span>
                        <span className="text-sm text-gray-400 font-mono" data-testid={`text-prospect-org-${prospect.id}`}>
                          {prospect.organization}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 border border-primary/30 text-primary font-mono uppercase" data-testid={`text-prospect-stage-${prospect.id}`}>
                          {prospect.stage}
                        </span>
                        <span className="text-xs text-gray-500 font-mono" data-testid={`text-prospect-probability-${prospect.id}`}>
                          {prospect.probability}% PROB
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="data-value text-lg" data-testid={`text-prospect-value-${prospect.id}`}>
                          ${prospect.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 font-mono" data-testid={`text-prospect-expected-${prospect.id}`}>
                          ${Math.round(prospect.value * (prospect.probability / 100)).toLocaleString()} EXP
                        </div>
                      </div>
                      <ProspectDialog 
                        prospect={prospect}
                        trigger={
                          <button 
                            className="btn-tactical p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-edit-prospect-${prospect.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                ))}
                
                {filteredProspects.length === 0 && (
                  <div className="text-center py-12" data-testid="empty-prospects">
                    <Users className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                    <p className="text-gray-500 font-mono">
                      {prospectSearch ? "NO PROSPECTS MATCH QUERY" : "NO ACTIVE PROSPECTS"}
                    </p>
                    {!prospectSearch && <div className="mt-4"><ProspectDialog /></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 pt-4 border-t border-primary/10">
          <div className="flex items-center justify-between text-xs text-gray-600 font-mono">
            <span>MONEYBOT v2.0 | COMMAND CENTER</span>
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimpleDashboard;
