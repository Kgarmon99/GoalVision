import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Settings,
  Radio,
  ChevronUp,
  ChevronDown,
  Target,
  Zap,
  Users
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moneybotLogo from "../assets/moneybot-logo.png";

const SimpleDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const [metrics, setMetrics] = useState({
    revenue: 2100,
    revenueTarget: 10000,
    revenuePrevious: 0,
    growth: 27.5,
    growthTarget: 30,
    growthPrevious: 22,
    students: 0,
    studentsTarget: 100,
    studentsPrevious: 0,
  });

  const [editMetrics, setEditMetrics] = useState(metrics);

  useEffect(() => {
    setEditMetrics(metrics);
  }, [metrics]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('moneybot-core-metrics');
    if (saved) {
      try {
        setMetrics(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load metrics', e);
      }
    }
  }, []);

  const saveMetrics = () => {
    setMetrics(editMetrics);
    localStorage.setItem('moneybot-core-metrics', JSON.stringify(editMetrics));
    setSettingsOpen(false);
  };

  const revenueProgress = Math.min(100, (metrics.revenue / metrics.revenueTarget) * 100);
  const revenueChange = metrics.revenuePrevious > 0 
    ? ((metrics.revenue - metrics.revenuePrevious) / metrics.revenuePrevious) * 100 
    : 0;
  const revenueUp = revenueChange >= 0;

  const growthProgress = Math.min(100, (metrics.growth / metrics.growthTarget) * 100);
  const growthChange = metrics.growth - metrics.growthPrevious;
  const growthUp = growthChange >= 0;

  const studentsProgress = metrics.studentsTarget > 0 ? Math.min(100, (metrics.students / metrics.studentsTarget) * 100) : 0;
  const studentsChange = metrics.studentsPrevious > 0 
    ? ((metrics.students - metrics.studentsPrevious) / metrics.studentsPrevious) * 100 
    : (metrics.students > 0 ? 100 : 0);
  const studentsUp = studentsChange >= 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-black tactical-grid scanlines flex flex-col">
      {/* Minimal Header */}
      <div className="border-b border-primary/30 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 border border-primary/50 bg-black flex items-center justify-center">
                <img 
                  src={moneybotLogo} 
                  alt="Moneybot" 
                  className="h-6 w-6 md:h-8 md:w-8" 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' }}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                MONEYBOT
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Radio className="w-2 h-2 md:w-2.5 md:h-2.5 text-primary animate-pulse" />
                <span className="text-[8px] md:text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                  {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
            </div>
          </div>
          
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button 
                className="btn-tactical p-2 md:p-2.5"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-black border-primary/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-primary font-mono tracking-wider">UPDATE METRICS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <h3 className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] text-gray-500">Current</Label>
                      <Input
                        type="number"
                        value={editMetrics.revenue}
                        onChange={(e) => setEditMetrics({...editMetrics, revenue: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Target</Label>
                      <Input
                        type="number"
                        value={editMetrics.revenueTarget}
                        onChange={(e) => setEditMetrics({...editMetrics, revenueTarget: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Previous</Label>
                      <Input
                        type="number"
                        value={editMetrics.revenuePrevious}
                        onChange={(e) => setEditMetrics({...editMetrics, revenuePrevious: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Growth %
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] text-gray-500">Current</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editMetrics.growth}
                        onChange={(e) => setEditMetrics({...editMetrics, growth: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Target</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editMetrics.growthTarget}
                        onChange={(e) => setEditMetrics({...editMetrics, growthTarget: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Previous</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editMetrics.growthPrevious}
                        onChange={(e) => setEditMetrics({...editMetrics, growthPrevious: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3 h-3" /> Students
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-[10px] text-gray-500">Current</Label>
                      <Input
                        type="number"
                        value={editMetrics.students}
                        onChange={(e) => setEditMetrics({...editMetrics, students: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Target</Label>
                      <Input
                        type="number"
                        value={editMetrics.studentsTarget}
                        onChange={(e) => setEditMetrics({...editMetrics, studentsTarget: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Previous</Label>
                      <Input
                        type="number"
                        value={editMetrics.studentsPrevious}
                        onChange={(e) => setEditMetrics({...editMetrics, studentsPrevious: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={saveMetrics} className="w-full bg-primary hover:bg-primary/80 text-black font-mono">
                  SAVE
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content - Three Hero Metrics */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            
            {/* REVENUE Card */}
            <div className="tactical-card corner-brackets p-6 md:p-8 relative" data-testid="card-revenue">
              <div className="mil-tag">REV-01</div>
              
              <div className="pt-4 md:pt-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <div className="data-label text-xs md:text-sm mb-2">REVENUE</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-revenue-value"
                    >
                      {formatCurrency(metrics.revenue)}
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 md:h-12 md:w-12 text-primary/30" />
                </div>

                {/* Change Indicator */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className={`flex items-center gap-1 px-2 py-1 border ${revenueUp ? 'border-primary/50 text-primary' : 'border-red-500/50 text-red-500'}`}>
                    {revenueUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-mono text-sm font-bold">{revenueUp ? '+' : ''}{revenueChange.toFixed(1)}%</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 font-mono">vs last period</span>
                </div>

                {/* Progress to Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: {formatCurrency(metrics.revenueTarget)}</span>
                    </div>
                    <span className="font-mono text-sm text-primary font-bold">{revenueProgress.toFixed(0)}%</span>
                  </div>
                  <div className="progress-tactical h-3 md:h-4">
                    <div 
                      className="progress-tactical-fill" 
                      style={{ width: `${revenueProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GROWTH Card */}
            <div className="tactical-card corner-brackets p-6 md:p-8 relative" data-testid="card-growth">
              <div className="mil-tag">GRW-01</div>
              
              <div className="pt-4 md:pt-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <div className="data-label text-xs md:text-sm mb-2">GROWTH</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-growth-value"
                    >
                      {metrics.growth.toFixed(1)}%
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-primary/30" />
                </div>

                {/* Change Indicator */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className={`flex items-center gap-1 px-2 py-1 border ${growthUp ? 'border-primary/50 text-primary' : 'border-red-500/50 text-red-500'}`}>
                    {growthUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-mono text-sm font-bold">{growthUp ? '+' : ''}{growthChange.toFixed(1)}pp</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 font-mono">vs last period</span>
                </div>

                {/* Progress to Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: {metrics.growthTarget}%</span>
                    </div>
                    <span className="font-mono text-sm text-primary font-bold">{growthProgress.toFixed(0)}%</span>
                  </div>
                  <div className="progress-tactical h-3 md:h-4">
                    <div 
                      className="progress-tactical-fill" 
                      style={{ width: `${growthProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STUDENTS Card */}
            <div className="tactical-card corner-brackets p-6 md:p-8 relative" data-testid="card-students">
              <div className="mil-tag">STU-01</div>
              
              <div className="pt-4 md:pt-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <div className="data-label text-xs md:text-sm mb-2">STUDENTS</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-students-value"
                    >
                      {metrics.students.toLocaleString()}
                    </div>
                  </div>
                  <Users className="h-8 w-8 md:h-12 md:w-12 text-primary/30" />
                </div>

                {/* Change Indicator */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className={`flex items-center gap-1 px-2 py-1 border ${studentsUp ? 'border-primary/50 text-primary' : 'border-red-500/50 text-red-500'}`}>
                    {studentsUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-mono text-sm font-bold">{studentsUp ? '+' : ''}{studentsChange.toFixed(0)}%</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 font-mono">vs last period</span>
                </div>

                {/* Progress to Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: {metrics.studentsTarget}</span>
                    </div>
                    <span className="font-mono text-sm text-primary font-bold">{studentsProgress.toFixed(0)}%</span>
                  </div>
                  <div className="progress-tactical h-3 md:h-4">
                    <div 
                      className="progress-tactical-fill" 
                      style={{ width: `${studentsProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Mission Status */}
          <div className="mt-6 md:mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-primary/20 bg-black/50">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
              <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-wider">
                {revenueProgress >= 100 && growthProgress >= 100 && studentsProgress >= 100
                  ? "ALL TARGETS ACHIEVED" 
                  : revenueProgress >= 100 || growthProgress >= 100 || studentsProgress >= 100
                    ? "PARTIAL MISSION COMPLETE"
                    : "MISSION IN PROGRESS"
                }
              </span>
              <div className={`w-2 h-2 rounded-full ${
                revenueProgress >= 100 && growthProgress >= 100 && studentsProgress >= 100
                  ? 'bg-primary' 
                  : 'bg-yellow-500'
              } animate-pulse`} />
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="border-t border-primary/20 px-4 py-2 md:py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[8px] md:text-[10px] text-gray-600 font-mono">SYSTEM NOMINAL</span>
          </div>
          <span className="classified-badge text-[7px] md:text-[9px]">EYES ONLY</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
