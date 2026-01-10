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
  Users,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import moneybotLogo from "../assets/moneybot-logo.png";

const SimpleDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hubspotSyncing, setHubspotSyncing] = useState(false);
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState({
    pilots: 5,
    pilotsTarget: 2500,
    pilotsPrevious: 4,
    pilotsDeadline: "2026-12-01",
    districts: 4,
    districtsTarget: 100,
    districtsPrevious: 3,
    districtsDeadline: "2026-12-01",
    students: 2000000,
    studentsTarget: 3000000,
    studentsPrevious: 300,
    studentsDeadline: "2026-12-01",
    revenue: 20000000,
    revenueTarget: 20000000,
    revenuePrevious: 0,
    revenueDeadline: "2026-12-01",
    activeUsage: 35,
    activeUsageTarget: 40,
    renewalRate: 92,
    renewalRateTarget: 90
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
    // Force clear old local storage data if it exists to ensure new 2026 targets apply
    const saved = localStorage.getItem('moneybot-core-metrics');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only override if the targets aren't the new 2026 ones
        if (parsed.studentsTarget !== 3000000 || parsed.revenueTarget !== 20000000) {
          localStorage.setItem('moneybot-core-metrics', JSON.stringify(metrics));
        } else {
          setMetrics(parsed);
        }
      } catch (e) {
        localStorage.setItem('moneybot-core-metrics', JSON.stringify(metrics));
      }
    } else {
      localStorage.setItem('moneybot-core-metrics', JSON.stringify(metrics));
    }
  }, []);

  const saveMetrics = () => {
    setMetrics(editMetrics);
    localStorage.setItem('moneybot-core-metrics', JSON.stringify(editMetrics));
    setSettingsOpen(false);
  };

  const syncWithHubSpot = async () => {
    setHubspotSyncing(true);
    try {
      const response = await fetch('/api/hubspot/deals/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch HubSpot data');
      }
      const data = await response.json();
      
      const previousRevenue = metrics.revenue;
      const newMetrics = {
        ...metrics,
        revenue: data.totalRevenue,
        revenuePrevious: previousRevenue,
      };
      
      setMetrics(newMetrics);
      localStorage.setItem('moneybot-core-metrics', JSON.stringify(newMetrics));
      
      toast({
        title: "HubSpot Synced",
        description: `Updated revenue from ${data.closedWonCount} won deals: $${data.totalRevenue.toLocaleString()}`,
      });
      
      // Refresh page after 1 second to ensure UI updates
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Could not connect to HubSpot",
        variant: "destructive",
      });
    } finally {
      setHubspotSyncing(false);
    }
  };

  const districtsProgress = metrics.districtsTarget > 0 ? Math.min(100, (metrics.districts / metrics.districtsTarget) * 100) : 0;
  const districtsChange = metrics.districts - metrics.districtsPrevious;
  const districtsUp = districtsChange >= 0;

  const pilotsProgress = Math.min(100, (metrics.pilots / metrics.pilotsTarget) * 100);
  const pilotsChange = metrics.pilots - metrics.pilotsPrevious;
  const pilotsUp = pilotsChange >= 0;

  const studentsProgress = metrics.studentsTarget > 0 ? Math.min(100, (metrics.students / metrics.studentsTarget) * 100) : 0;
  const studentsChange = metrics.studentsPrevious > 0 
    ? ((metrics.students - metrics.studentsPrevious) / metrics.studentsPrevious) * 100 
    : (metrics.students > 0 ? 100 : 0);
  const studentsUp = studentsChange >= 0;

  const revenueProgress = metrics.revenueTarget > 0 ? Math.min(100, (metrics.revenue / metrics.revenueTarget) * 100) : 0;
  const revenueChange = metrics.revenuePrevious > 0 
    ? ((metrics.revenue - metrics.revenuePrevious) / metrics.revenuePrevious) * 100 
    : 0;
  const revenueUp = revenueChange >= 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatDeadline = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          
          <div className="flex items-center gap-2">
            <button 
              onClick={syncWithHubSpot}
              disabled={hubspotSyncing}
              className="btn-tactical p-2 md:p-2.5 flex items-center gap-2"
              data-testid="button-hubspot-sync"
            >
              <RefreshCw className={`h-4 w-4 md:h-5 md:w-5 ${hubspotSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-xs font-mono">HUBSPOT</span>
            </button>
          
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
                    <TrendingUp className="w-3 h-3" /> Pilots
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-[10px] text-gray-500">Current</Label>
                      <Input
                        type="number"
                        value={editMetrics.pilots}
                        onChange={(e) => setEditMetrics({...editMetrics, pilots: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Target</Label>
                      <Input
                        type="number"
                        value={editMetrics.pilotsTarget}
                        onChange={(e) => setEditMetrics({...editMetrics, pilotsTarget: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Deadline</Label>
                      <Input
                        type="date"
                        value={editMetrics.pilotsDeadline}
                        onChange={(e) => setEditMetrics({...editMetrics, pilotsDeadline: e.target.value})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Previous</Label>
                      <Input
                        type="number"
                        value={editMetrics.pilotsPrevious}
                        onChange={(e) => setEditMetrics({...editMetrics, pilotsPrevious: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-3 h-3" /> Districts
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-[10px] text-gray-500">Current</Label>
                      <Input
                        type="number"
                        value={editMetrics.districts}
                        onChange={(e) => setEditMetrics({...editMetrics, districts: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Target</Label>
                      <Input
                        type="number"
                        value={editMetrics.districtsTarget}
                        onChange={(e) => setEditMetrics({...editMetrics, districtsTarget: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Deadline</Label>
                      <Input
                        type="date"
                        value={editMetrics.districtsDeadline}
                        onChange={(e) => setEditMetrics({...editMetrics, districtsDeadline: e.target.value})}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-500">Previous</Label>
                      <Input
                        type="number"
                        value={editMetrics.districtsPrevious}
                        onChange={(e) => setEditMetrics({...editMetrics, districtsPrevious: Number(e.target.value)})}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3 h-3" /> Students
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
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
                      <Label className="text-[10px] text-gray-500">Deadline</Label>
                      <Input
                        type="date"
                        value={editMetrics.studentsDeadline}
                        onChange={(e) => setEditMetrics({...editMetrics, studentsDeadline: e.target.value})}
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
                <div className="space-y-3">
                  <h3 className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Revenue
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
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
                      <Label className="text-[10px] text-gray-500">Deadline</Label>
                      <Input
                        type="date"
                        value={editMetrics.revenueDeadline}
                        onChange={(e) => setEditMetrics({...editMetrics, revenueDeadline: e.target.value})}
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
                <Button onClick={saveMetrics} className="w-full bg-primary hover:bg-primary/80 text-black font-mono">
                  SAVE
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content - Four Hero Metrics */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-8">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            
            {/* PILOTS Card */}
            <div className="tactical-card corner-brackets p-6 md:p-8 relative" data-testid="card-pilots">
              <div className="mil-tag">PLT-01</div>
              
              <div className="pt-4 md:pt-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <div className="data-label text-xs md:text-sm mb-2 uppercase tracking-widest text-primary/70">Schools Live</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-pilots-value"
                    >
                      {metrics.pilots} / {metrics.pilotsTarget}
                    </div>
                  </div>
                  <Radio className="h-8 w-8 md:h-12 md:w-12 text-primary/30" />
                </div>

                {/* Change Indicator */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className={`flex items-center gap-1 px-2 py-1 border ${pilotsUp ? 'border-primary/50 text-primary' : 'border-red-500/50 text-red-500'}`}>
                    {pilotsUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-mono text-sm font-bold">{pilotsUp ? '+' : ''}{pilotsChange}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 font-mono">vs last period</span>
                </div>

                {/* Progress to Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: {metrics.pilotsTarget} by {formatDeadline(metrics.pilotsDeadline)}</span>
                    </div>
                    <span className="font-mono text-sm text-primary font-bold">{pilotsProgress.toFixed(0)}%</span>
                  </div>
                  <div className="progress-tactical h-3 md:h-4">
                    <div 
                      className="progress-tactical-fill" 
                      style={{ width: `${pilotsProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DISTRICTS Card */}
            <div className="tactical-card corner-brackets p-6 md:p-8 relative" data-testid="card-districts">
              <div className="mil-tag">DST-01</div>
              
              <div className="pt-4 md:pt-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <div className="data-label text-xs md:text-sm mb-2 uppercase tracking-widest text-primary/70">Districts</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-districts-value"
                    >
                      {metrics.districts} / {metrics.districtsTarget}
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 md:h-12 md:w-12 text-primary/30" />
                </div>

                {/* Change Indicator */}
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className={`flex items-center gap-1 px-2 py-1 border ${districtsUp ? 'border-primary/50 text-primary' : 'border-red-500/50 text-red-500'}`}>
                    {districtsUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-mono text-sm font-bold">{districtsUp ? '+' : ''}{districtsChange}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-500 font-mono">vs last period</span>
                </div>

                {/* Progress to Target */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-primary/60" />
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: {metrics.districtsTarget} by {formatDeadline(metrics.districtsDeadline)}</span>
                    </div>
                    <span className="font-mono text-sm text-primary font-bold">{districtsProgress.toFixed(0)}%</span>
                  </div>
                  <div className="progress-tactical h-3 md:h-4">
                    <div 
                      className="progress-tactical-fill" 
                      style={{ width: `${districtsProgress}%` }}
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
                    <div className="data-label text-xs md:text-sm mb-2 uppercase tracking-widest text-primary/70">Active Students</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-students-value"
                    >
                      {metrics.students >= 1000000 ? (metrics.students/1000000).toFixed(1) + 'M' : metrics.students >= 1000 ? (metrics.students/1000).toFixed(1) + 'K' : metrics.students} / {(metrics.studentsTarget/1000000).toFixed(1)}M
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
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: {(metrics.studentsTarget/1000000).toFixed(1)}M by {formatDeadline(metrics.studentsDeadline)}</span>
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

            {/* REVENUE Card */}
            <div className="tactical-card corner-brackets p-6 md:p-8 relative" data-testid="card-revenue">
              <div className="mil-tag">REV-01</div>
              
              <div className="pt-4 md:pt-6">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div>
                    <div className="data-label text-xs md:text-sm mb-2 uppercase tracking-widest text-primary/70">ARR Revenue</div>
                    <div 
                      className="data-value text-4xl md:text-5xl font-black"
                      style={{ fontFamily: 'Orbitron, sans-serif' }}
                      data-testid="text-revenue-value"
                    >
                      {metrics.revenue >= 1000000 ? '$' + (metrics.revenue/1000000).toFixed(1) + 'M' : formatCurrency(metrics.revenue)} / ${(metrics.revenueTarget/1000000).toFixed(0)}M
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
                      <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase">Target: ${(metrics.revenueTarget/1000000).toFixed(0)}M by {formatDeadline(metrics.revenueDeadline)}</span>
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

          </div>

          {/* Goals Summary */}
          <div className="mt-8 md:mt-10 space-y-4 bg-primary/5 p-6 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
            <div className="flex justify-between items-end border-b border-primary/20 pb-3">
              <span className="font-mono text-sm text-gray-400 uppercase tracking-widest">Schools Live</span>
              <span className="font-mono text-4xl text-primary font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>{metrics.pilots} / {metrics.pilotsTarget}</span>
            </div>
            <div className="flex justify-between items-end border-b border-primary/20 pb-3">
              <span className="font-mono text-sm text-gray-400 uppercase tracking-widest">Active Students</span>
              <span className="font-mono text-4xl text-primary font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>{(metrics.students/1000000).toFixed(1)}M / {(metrics.studentsTarget/1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-end border-b border-primary/20 pb-3">
              <span className="font-mono text-sm text-gray-400 uppercase tracking-widest">ARR Revenue</span>
              <span className="font-mono text-4xl text-primary font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>${(metrics.revenue/1000000).toFixed(1)}M / ${(metrics.revenueTarget/1000000).toFixed(0)}M</span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-b border-primary/20 pb-3">
              <div className="flex justify-between items-end">
                <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Daily Active Usage</span>
                <span className="font-mono text-xl text-primary font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>{metrics.activeUsage}% / {metrics.activeUsageTarget}%</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Renewal Rate</span>
                <span className="font-mono text-xl text-primary font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>{metrics.renewalRate}% / {metrics.renewalRateTarget}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-gray-600 font-mono">MISSION DEADLINE: 12-01-2026</span>
              <span className="text-[10px] text-primary/40 font-mono animate-pulse">NORTH STAR: CATEGORY AUTHORITY</span>
            </div>
          </div>

          {/* Mission Status */}
          <div className="mt-6 md:mt-8 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-primary/20 bg-black/50">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
              <span className="text-[10px] md:text-xs text-gray-400 font-mono uppercase tracking-wider">
                {pilotsProgress >= 100 && districtsProgress >= 100 && studentsProgress >= 100 && revenueProgress >= 100
                  ? "ALL TARGETS ACHIEVED" 
                  : pilotsProgress >= 100 || districtsProgress >= 100 || studentsProgress >= 100 || revenueProgress >= 100
                    ? "PARTIAL MISSION COMPLETE"
                    : "MISSION IN PROGRESS"
                }
              </span>
              <div className={`w-2 h-2 rounded-full ${
                pilotsProgress >= 100 && districtsProgress >= 100 && studentsProgress >= 100 && revenueProgress >= 100
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
