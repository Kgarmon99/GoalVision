import { useQuery } from "@tanstack/react-query";
import { Goal, Prospect } from "@shared/schema";
import { 
  DollarSign, 
  Target, 
  Users,
  AlertTriangle,
  Zap,
  Calendar,
  Pencil,
  Activity,
  Crosshair,
  Shield,
  Radio,
  Radar
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
  const runwayStatus = runway >= 12 ? 'nominal' : runway >= 6 ? 'caution' : 'critical';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black tactical-grid flex items-center justify-center">
        <div className="text-center">
          <Radar className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <div className="data-value text-xl">INITIALIZING SYSTEMS...</div>
          <div className="data-label mt-2">ESTABLISHING SECURE CONNECTION</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black tactical-grid scanlines">
      {/* Classification Banner */}
      <div className="bg-red-900/30 border-b border-red-500/50 py-1">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="classified-badge">CLASSIFIED</span>
            <span className="text-red-400 text-[10px] font-mono tracking-widest">// AUTHORIZED PERSONNEL ONLY</span>
          </div>
          <div className="text-red-400 text-[10px] font-mono tracking-wider">
            SESSION: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="header-bar border-b-2 border-primary/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-primary bg-black flex items-center justify-center">
                  <img 
                    src={moneybotLogo} 
                    alt="Moneybot" 
                    className="h-12 w-12" 
                    style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))' }}
                  />
                </div>
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-white tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    MONEYBOT
                  </h1>
                  <span className="text-primary text-xs font-mono border border-primary/50 px-2 py-0.5">MK-II</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="data-label flex items-center gap-1">
                    <Radio className="w-3 h-3 text-primary animate-pulse" />
                    COMMAND ACTIVE
                  </span>
                  <span className="text-primary text-xs font-mono">
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}.{String(currentTime.getMilliseconds()).padStart(3, '0')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* System Status */}
              <div className="hidden lg:flex items-center gap-6 border border-primary/20 bg-black/50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-mono uppercase">SYS ONLINE</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-gray-400 font-mono uppercase">DATA STREAM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-gray-400 font-mono uppercase">ENCRYPTED</span>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <span className="section-title">PRIMARY INTEL</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <span className="text-[10px] text-gray-600 font-mono">SECTOR-ALPHA</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8 stagger-children">
          <div className="tactical-card corner-brackets p-5 hover-lift hex-overlay" data-testid="card-pipeline-value">
            <div className="mil-tag">REV-01</div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-4">
                <p className="data-label">PIPELINE VALUE</p>
                <p className="data-value text-2xl mt-2">
                  ${Math.round(totalPipeline).toLocaleString()}
                </p>
                <div className="alert-level mt-2">
                  <div className="alert-bar active" />
                  <div className="alert-bar active" />
                  <div className="alert-bar active" />
                  <div className="alert-bar active" />
                  <div className="alert-bar" />
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-primary opacity-40" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-5 hover-lift warning-stripes" data-testid="card-monthly-burn">
            <div className="mil-tag" style={{ background: '#f59e0b' }}>BRN-01</div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-4">
                <p className="data-label">MONTHLY BURN</p>
                <p className="data-value text-2xl mt-2 text-yellow-500">
                  ${financials.monthlyBurnRate.toLocaleString()}
                </p>
                <div className="alert-level mt-2">
                  <div className="alert-bar warning" />
                  <div className="alert-bar warning" />
                  <div className="alert-bar warning" />
                  <div className="alert-bar" />
                  <div className="alert-bar" />
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-40" />
            </div>
          </div>

          <div className={`tactical-card corner-brackets p-5 hover-lift ${runwayStatus === 'critical' ? 'danger-stripes' : ''}`} data-testid="card-runway">
            <div className="mil-tag" style={{ background: runwayStatus === 'critical' ? '#ef4444' : runwayStatus === 'caution' ? '#f59e0b' : undefined }}>
              RWY-01
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-4">
                <p className="data-label">RUNWAY STATUS</p>
                <p className={`data-value text-2xl mt-2 ${runwayStatus === 'critical' ? 'text-red-500' : runwayStatus === 'caution' ? 'text-yellow-500' : ''}`}>
                  {runway.toFixed(1)} MO
                </p>
                <div className="alert-level mt-2">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`alert-bar ${
                        i < Math.ceil(runway / 3) 
                          ? runwayStatus === 'critical' ? 'critical' : runwayStatus === 'caution' ? 'warning' : 'active'
                          : ''
                      }`} 
                    />
                  ))}
                </div>
              </div>
              <Zap className="h-10 w-10 text-primary opacity-40" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-5 hover-lift" data-testid="card-goals-progress">
            <div className="mil-tag">OBJ-01</div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-4">
                <p className="data-label">OBJECTIVES</p>
                <p className="data-value text-2xl mt-2">
                  {completedGoals}/{totalGoals}
                </p>
                <div className="text-[10px] text-gray-500 font-mono mt-1">
                  {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% COMPLETE
                </div>
              </div>
              <Target className="h-10 w-10 text-primary opacity-40" />
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-primary" />
              <span className="section-title">ACTIVE OBJECTIVES</span>
              <span className="text-[10px] text-gray-600 font-mono border border-gray-800 px-2 py-0.5">
                {filteredGoals.length} TARGETS
              </span>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <SearchBar 
                placeholder="SEARCH OBJECTIVES..." 
                onSearch={setGoalSearch}
              />
              <GoalDialog />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger-children">
            {filteredGoals.map((goal, index) => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              const isComplete = progress >= 100;
              const isOnTrack = progress >= 75;
              const status = isComplete ? 'COMPLETE' : isOnTrack ? 'ON TRACK' : 'ATTENTION';
              
              return (
                <div 
                  key={goal.id} 
                  className={`tactical-card p-5 hover-lift ${isComplete ? 'pulse-glow' : !isOnTrack ? 'warning-stripes' : ''}`}
                  data-testid={`card-goal-${goal.id}`}
                >
                  <div className="mil-tag">TGT-{String(index + 1).padStart(2, '0')}</div>
                  <div className="flex items-start justify-between mb-4 mt-4 relative z-10">
                    <div className="flex-1">
                      <h3 className="text-white font-bold tracking-wide uppercase text-sm" data-testid={`text-goal-name-${goal.id}`}>
                        {goal.name}
                      </h3>
                      {goal.deadline && (
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-gray-600" />
                          <span className="text-[10px] text-gray-500 font-mono" data-testid={`text-goal-deadline-${goal.id}`}>
                            DEADLINE: {goal.deadline}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <div className="data-value text-xl" data-testid={`text-goal-progress-${goal.id}`}>
                          {Math.round(progress)}%
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${
                          isComplete ? 'status-online' : isOnTrack ? 'text-primary/70' : 'status-warning'
                        }`} data-testid={`status-goal-${goal.id}`}>
                          {status}
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
                  
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-sm">
                      <span className="data-label">CURRENT</span>
                      <span className="text-white font-mono text-sm" data-testid={`text-goal-current-${goal.id}`}>
                        {goal.current.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="data-label">TARGET</span>
                      <span className="text-white font-mono text-sm" data-testid={`text-goal-target-${goal.id}`}>
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
                <Target className="h-12 w-12 text-primary/20 mx-auto mb-3" />
                <p className="text-gray-600 font-mono uppercase tracking-wider">
                  {goalSearch ? "NO TARGETS MATCH QUERY" : "NO ACTIVE TARGETS"}
                </p>
                {!goalSearch && <div className="mt-4"><GoalDialog /></div>}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Section */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="section-title">REVENUE PIPELINE</span>
              <span className="text-[10px] text-gray-600 font-mono border border-gray-800 px-2 py-0.5">
                {filteredProspects.length} CONTACTS
              </span>
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <SearchBar 
                placeholder="SEARCH PIPELINE..." 
                onSearch={setProspectSearch}
              />
              <ProspectDialog />
            </div>
          </div>
          
          <div className="tactical-card" data-testid="card-pipeline">
            <div className="mil-tag">SEC-ALPHA</div>
            <div className="p-4 pt-8">
              <div className="space-y-2 stagger-children">
                {filteredProspects.slice(0, 8).map((prospect, index) => (
                  <div 
                    key={prospect.id} 
                    className="flex items-center justify-between p-4 bg-black/80 border border-primary/10 hover:border-primary/40 transition-all group relative"
                    data-testid={`row-prospect-${prospect.id}`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" />
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-gray-600 font-mono w-8">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold uppercase tracking-wide text-sm" data-testid={`text-prospect-name-${prospect.id}`}>
                            {prospect.name}
                          </span>
                          <span className="text-gray-600">|</span>
                          <span className="text-sm text-gray-400 font-mono" data-testid={`text-prospect-org-${prospect.id}`}>
                            {prospect.organization}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] px-2 py-1 border border-primary/40 text-primary font-mono uppercase tracking-wider" data-testid={`text-prospect-stage-${prospect.id}`}>
                            {prospect.stage}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono" data-testid={`text-prospect-probability-${prospect.id}`}>
                            PROB: {prospect.probability}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="data-value text-lg" data-testid={`text-prospect-value-${prospect.id}`}>
                          ${prospect.value.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono" data-testid={`text-prospect-expected-${prospect.id}`}>
                          EXP: ${Math.round(prospect.value * (prospect.probability / 100)).toLocaleString()}
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
                    <Users className="h-12 w-12 text-primary/20 mx-auto mb-3" />
                    <p className="text-gray-600 font-mono uppercase tracking-wider">
                      {prospectSearch ? "NO CONTACTS MATCH QUERY" : "NO ACTIVE CONTACTS"}
                    </p>
                    {!prospectSearch && <div className="mt-4"><ProspectDialog /></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="mt-8 pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-500 font-mono">SYSTEM NOMINAL</span>
              </div>
              <span className="text-[10px] text-gray-600 font-mono">
                MONEYBOT COMMAND v2.0.1 | BUILD 2025.11.30
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-600 font-mono">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
              </span>
              <span className="classified-badge">EYES ONLY</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimpleDashboard;
