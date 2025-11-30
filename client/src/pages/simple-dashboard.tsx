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
  Radar,
  Menu
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-black tactical-grid flex items-center justify-center p-4">
        <div className="text-center">
          <Radar className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-4 animate-spin" />
          <div className="data-value text-lg md:text-xl">INITIALIZING...</div>
          <div className="data-label mt-2">SECURE CONNECTION</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black tactical-grid scanlines">
      {/* Classification Banner */}
      <div className="bg-red-900/30 border-b border-red-500/50 py-1 px-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="classified-badge">CLASSIFIED</span>
            <span className="text-red-400 text-[8px] md:text-[10px] font-mono tracking-widest hidden sm:inline">
              // AUTHORIZED ONLY
            </span>
          </div>
          <div className="text-red-400 text-[8px] md:text-[10px] font-mono tracking-wider">
            {Math.random().toString(36).substring(2, 8).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="header-bar border-b-2 border-primary/50">
        <div className="px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 md:gap-5">
              <div className="relative">
                <div className="w-10 h-10 md:w-16 md:h-16 border-2 border-primary bg-black flex items-center justify-center">
                  <img 
                    src={moneybotLogo} 
                    alt="Moneybot" 
                    className="h-7 w-7 md:h-12 md:w-12" 
                    style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))' }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-2 h-2 md:w-4 md:h-4 bg-primary rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 md:gap-3">
                  <h1 className="text-lg md:text-2xl font-black text-white tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    MONEYBOT
                  </h1>
                  <span className="text-primary text-[8px] md:text-xs font-mono border border-primary/50 px-1.5 md:px-2 py-0.5 hidden sm:inline">
                    MK-II
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-4 mt-1">
                  <span className="data-label flex items-center gap-1 text-[8px] md:text-[10px]">
                    <Radio className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary animate-pulse" />
                    <span className="hidden xs:inline">COMMAND</span> ACTIVE
                  </span>
                  <span className="text-primary text-[10px] md:text-xs font-mono hidden sm:inline">
                    {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Desktop Status & Settings */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-6 border border-primary/20 bg-black/50 px-4 py-2">
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

            {/* Mobile Settings */}
            <div className="lg:hidden">
              <SettingsDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-6 py-4 md:py-6 entrance-animation relative z-10 max-w-7xl mx-auto">
        
        {/* Gamification HUD */}
        <div className="mb-4 md:mb-6">
          <GamificationHUD />
        </div>

        {/* Startup Metrics Section */}
        <div className="mb-4 md:mb-6">
          <StartupMetricsDisplay />
        </div>
        
        {/* Primary Metrics Grid */}
        <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Crosshair className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            <span className="section-title text-[9px] md:text-xs">PRIMARY INTEL</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <span className="text-[8px] md:text-[10px] text-gray-600 font-mono hidden sm:inline">SECTOR-ALPHA</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8 stagger-children">
          <div className="tactical-card corner-brackets p-3 md:p-5 hover-lift hex-overlay" data-testid="card-pipeline-value">
            <div className="mil-tag">REV-01</div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-3 md:mt-4">
                <p className="data-label text-[8px] md:text-[10px]">PIPELINE</p>
                <p className="data-value text-lg md:text-2xl mt-1 md:mt-2">
                  ${Math.round(totalPipeline / 1000)}K
                </p>
                <div className="alert-level mt-1.5 md:mt-2">
                  <div className="alert-bar active" />
                  <div className="alert-bar active" />
                  <div className="alert-bar active" />
                  <div className="alert-bar active" />
                  <div className="alert-bar" />
                </div>
              </div>
              <DollarSign className="h-6 w-6 md:h-10 md:w-10 text-primary opacity-40" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-3 md:p-5 hover-lift warning-stripes" data-testid="card-monthly-burn">
            <div className="mil-tag" style={{ background: '#f59e0b' }}>BRN-01</div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-3 md:mt-4">
                <p className="data-label text-[8px] md:text-[10px]">BURN RATE</p>
                <p className="data-value text-lg md:text-2xl mt-1 md:mt-2 text-yellow-500">
                  ${(financials.monthlyBurnRate / 1000).toFixed(0)}K
                </p>
                <div className="alert-level mt-1.5 md:mt-2">
                  <div className="alert-bar warning" />
                  <div className="alert-bar warning" />
                  <div className="alert-bar warning" />
                  <div className="alert-bar" />
                  <div className="alert-bar" />
                </div>
              </div>
              <AlertTriangle className="h-6 w-6 md:h-10 md:w-10 text-yellow-500 opacity-40" />
            </div>
          </div>

          <div className={`tactical-card corner-brackets p-3 md:p-5 hover-lift ${runwayStatus === 'critical' ? 'danger-stripes' : ''}`} data-testid="card-runway">
            <div className="mil-tag" style={{ background: runwayStatus === 'critical' ? '#ef4444' : runwayStatus === 'caution' ? '#f59e0b' : undefined }}>
              RWY-01
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-3 md:mt-4">
                <p className="data-label text-[8px] md:text-[10px]">RUNWAY</p>
                <p className={`data-value text-lg md:text-2xl mt-1 md:mt-2 ${runwayStatus === 'critical' ? 'text-red-500' : runwayStatus === 'caution' ? 'text-yellow-500' : ''}`}>
                  {runway.toFixed(1)}mo
                </p>
                <div className="alert-level mt-1.5 md:mt-2">
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
              <Zap className="h-6 w-6 md:h-10 md:w-10 text-primary opacity-40" />
            </div>
          </div>

          <div className="tactical-card corner-brackets p-3 md:p-5 hover-lift" data-testid="card-goals-progress">
            <div className="mil-tag">OBJ-01</div>
            <div className="flex items-center justify-between relative z-10">
              <div className="mt-3 md:mt-4">
                <p className="data-label text-[8px] md:text-[10px]">OBJECTIVES</p>
                <p className="data-value text-lg md:text-2xl mt-1 md:mt-2">
                  {completedGoals}/{totalGoals}
                </p>
                <div className="text-[8px] md:text-[10px] text-gray-500 font-mono mt-0.5 md:mt-1">
                  {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
                </div>
              </div>
              <Target className="h-6 w-6 md:h-10 md:w-10 text-primary opacity-40" />
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Target className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="section-title text-[9px] md:text-xs">OBJECTIVES</span>
              <span className="text-[8px] md:text-[10px] text-gray-600 font-mono border border-gray-800 px-1.5 md:px-2 py-0.5">
                {filteredGoals.length} TGT
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:max-w-md">
              <div className="flex-1 sm:flex-initial sm:w-48 md:w-64">
                <SearchBar 
                  placeholder="SEARCH..." 
                  onSearch={setGoalSearch}
                />
              </div>
              <GoalDialog />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3 stagger-children">
            {filteredGoals.map((goal, index) => {
              const progress = Math.min(100, (goal.current / goal.target) * 100);
              const isComplete = progress >= 100;
              const isOnTrack = progress >= 75;
              const status = isComplete ? 'COMPLETE' : isOnTrack ? 'ON TRACK' : 'ATTENTION';
              
              return (
                <div 
                  key={goal.id} 
                  className={`tactical-card p-3 md:p-5 hover-lift ${isComplete ? 'pulse-glow' : !isOnTrack ? 'warning-stripes' : ''}`}
                  data-testid={`card-goal-${goal.id}`}
                >
                  <div className="mil-tag">TGT-{String(index + 1).padStart(2, '0')}</div>
                  <div className="flex items-start justify-between mb-3 md:mb-4 mt-3 md:mt-4 relative z-10">
                    <div className="flex-1 pr-2">
                      <h3 className="text-white font-bold tracking-wide uppercase text-xs md:text-sm leading-tight" data-testid={`text-goal-name-${goal.id}`}>
                        {goal.name}
                      </h3>
                      {goal.deadline && (
                        <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                          <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-600" />
                          <span className="text-[8px] md:text-[10px] text-gray-500 font-mono" data-testid={`text-goal-deadline-${goal.id}`}>
                            {goal.deadline}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="text-right">
                        <div className="data-value text-base md:text-xl" data-testid={`text-goal-progress-${goal.id}`}>
                          {Math.round(progress)}%
                        </div>
                        <span className={`text-[8px] md:text-[10px] uppercase tracking-wider font-bold ${
                          isComplete ? 'status-online' : isOnTrack ? 'text-primary/70' : 'status-warning'
                        }`} data-testid={`status-goal-${goal.id}`}>
                          {status}
                        </span>
                      </div>
                      <GoalDialog 
                        goal={goal} 
                        trigger={
                          <button 
                            className="btn-tactical p-1.5 md:p-2"
                            data-testid={`button-edit-goal-${goal.id}`}
                          >
                            <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 md:space-y-2 relative z-10">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="data-label text-[8px] md:text-[10px]">CURRENT</span>
                      <span className="text-white font-mono text-xs md:text-sm" data-testid={`text-goal-current-${goal.id}`}>
                        {goal.current.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="data-label text-[8px] md:text-[10px]">TARGET</span>
                      <span className="text-white font-mono text-xs md:text-sm" data-testid={`text-goal-target-${goal.id}`}>
                        {goal.target.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div className="progress-tactical mt-2 md:mt-3">
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
              <div className="col-span-full text-center py-8 md:py-12 tactical-card" data-testid="empty-goals">
                <Target className="h-8 w-8 md:h-12 md:w-12 text-primary/20 mx-auto mb-2 md:mb-3" />
                <p className="text-gray-600 font-mono uppercase tracking-wider text-xs md:text-sm">
                  {goalSearch ? "NO MATCHES" : "NO TARGETS"}
                </p>
                {!goalSearch && <div className="mt-3 md:mt-4"><GoalDialog /></div>}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="section-title text-[9px] md:text-xs">PIPELINE</span>
              <span className="text-[8px] md:text-[10px] text-gray-600 font-mono border border-gray-800 px-1.5 md:px-2 py-0.5">
                {filteredProspects.length} CONTACTS
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto sm:max-w-md">
              <div className="flex-1 sm:flex-initial sm:w-48 md:w-64">
                <SearchBar 
                  placeholder="SEARCH..." 
                  onSearch={setProspectSearch}
                />
              </div>
              <ProspectDialog />
            </div>
          </div>
          
          <div className="tactical-card" data-testid="card-pipeline">
            <div className="mil-tag">SEC-ALPHA</div>
            <div className="p-2 md:p-4 pt-6 md:pt-8">
              <div className="space-y-1.5 md:space-y-2 stagger-children">
                {filteredProspects.slice(0, 8).map((prospect, index) => (
                  <div 
                    key={prospect.id} 
                    className="flex items-center justify-between p-2.5 md:p-4 bg-black/80 border border-primary/10 hover:border-primary/40 transition-all group relative"
                    data-testid={`row-prospect-${prospect.id}`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 md:w-1 bg-primary/50" />
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                      <span className="text-[8px] md:text-[10px] text-gray-600 font-mono w-5 md:w-8 flex-shrink-0">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
                          <span className="text-white font-bold uppercase tracking-wide text-xs md:text-sm truncate" data-testid={`text-prospect-name-${prospect.id}`}>
                            {prospect.name}
                          </span>
                          <span className="text-[10px] md:text-sm text-gray-400 font-mono truncate hidden sm:inline" data-testid={`text-prospect-org-${prospect.id}`}>
                            {prospect.organization}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
                          <span className="text-[8px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 border border-primary/40 text-primary font-mono uppercase tracking-wider" data-testid={`text-prospect-stage-${prospect.id}`}>
                            {prospect.stage}
                          </span>
                          <span className="text-[8px] md:text-[10px] text-gray-500 font-mono hidden sm:inline" data-testid={`text-prospect-probability-${prospect.id}`}>
                            {prospect.probability}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="data-value text-sm md:text-lg" data-testid={`text-prospect-value-${prospect.id}`}>
                          ${(prospect.value / 1000).toFixed(0)}K
                        </div>
                        <div className="text-[8px] md:text-[10px] text-gray-500 font-mono hidden sm:inline" data-testid={`text-prospect-expected-${prospect.id}`}>
                          EXP: ${Math.round(prospect.value * (prospect.probability / 100) / 1000)}K
                        </div>
                      </div>
                      <ProspectDialog 
                        prospect={prospect}
                        trigger={
                          <button 
                            className="btn-tactical p-1.5 md:p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-edit-prospect-${prospect.id}`}
                          >
                            <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        }
                      />
                    </div>
                  </div>
                ))}
                
                {filteredProspects.length === 0 && (
                  <div className="text-center py-8 md:py-12" data-testid="empty-prospects">
                    <Users className="h-8 w-8 md:h-12 md:w-12 text-primary/20 mx-auto mb-2 md:mb-3" />
                    <p className="text-gray-600 font-mono uppercase tracking-wider text-xs md:text-sm">
                      {prospectSearch ? "NO MATCHES" : "NO CONTACTS"}
                    </p>
                    {!prospectSearch && <div className="mt-3 md:mt-4"><ProspectDialog /></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="mt-6 md:mt-8 pt-3 md:pt-4 border-t border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[10px] text-gray-500 font-mono">NOMINAL</span>
              </div>
              <span className="text-[8px] md:text-[10px] text-gray-600 font-mono hidden sm:inline">
                MONEYBOT v2.0.1
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-[8px] md:text-[10px] text-gray-600 font-mono">
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
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
