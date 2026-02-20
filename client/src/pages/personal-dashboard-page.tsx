import { useState, useEffect } from "react";
import {
  Target, Settings, Radio, ChevronUp, ChevronDown, Check, Calendar,
  Activity, TrendingUp, Users, DollarSign, ListChecks,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { usePersonalDashboard } from "@/context/personal-dashboard-context";
import type { PersonalDashboard, DashboardMetric, RoadmapPhase } from "@/types/personal-dashboard";

function formatValue(value: number, unit?: string): string {
  if (unit === "$M" || unit === "M") {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  }
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  return String(value);
}

function formatDeadline(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Props = { defaultTab?: "overview" | "roadmap" };

export default function PersonalDashboardPage({ defaultTab = "overview" }: Props) {
  const { dashboard, updateDashboard } = usePersonalDashboard();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingRoadmapKey, setEditingRoadmapKey] = useState<string | null>(null);
  const [editingRoadmapText, setEditingRoadmapText] = useState("");
  const [newItemPerPhase, setNewItemPerPhase] = useState<Record<string, string>>({});
  const [newTodayText, setNewTodayText] = useState("");
  const [newTomorrowText, setNewTomorrowText] = useState("");
  const [showSetToday, setShowSetToday] = useState(false);
  const [showSetTomorrow, setShowSetTomorrow] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!dashboard) return null;

  const toggleRoadmapItem = (phaseId: string, itemIdx: number | string) => {
    const key = `${phaseId}-${itemIdx}`;
    updateDashboard(d => ({
      ...d,
      roadmapCompleted: { ...d.roadmapCompleted, [key]: !d.roadmapCompleted[key] },
    }));
  };

  const getRoadmapItemText = (phaseId: string, itemIdx: number | string, defaultText: string) =>
    dashboard.roadmapItemText[`${phaseId}-${itemIdx}`] ?? defaultText;

  const saveRoadmapItemEdit = () => {
    if (!editingRoadmapKey || !editingRoadmapText.trim()) {
      setEditingRoadmapKey(null);
      setEditingRoadmapText("");
      return;
    }
    updateDashboard(d => ({
      ...d,
      roadmapItemText: { ...d.roadmapItemText, [editingRoadmapKey]: editingRoadmapText.trim() },
    }));
    setEditingRoadmapKey(null);
    setEditingRoadmapText("");
  };

  const deleteRoadmapItem = (phaseId: string, idx: number) => {
    const key = `${phaseId}-${idx}`;
    updateDashboard(d => ({
      ...d,
      roadmapDeleted: { ...d.roadmapDeleted, [key]: true },
    }));
    toast({ title: "Removed", description: "Item removed from roadmap." });
  };

  const addRoadmapItem = (phaseId: string) => {
    const text = (newItemPerPhase[phaseId] || "").trim();
    if (!text) return;
    updateDashboard(d => ({
      ...d,
      roadmapAdded: {
        ...d.roadmapAdded,
        [phaseId]: [...(d.roadmapAdded[phaseId] || []), text],
      },
    }));
    setNewItemPerPhase({ ...newItemPerPhase, [phaseId]: "" });
    toast({ title: "Added", description: "New item added to roadmap." });
  };

  const getPhaseProgress = (phase: RoadmapPhase) => {
    const baseCount = phase.items.length;
    const added = dashboard.roadmapAdded[phase.id] || [];
    const total = baseCount + added.length;
    let completed = 0;
    for (let i = 0; i < baseCount; i++) {
      if (!dashboard.roadmapDeleted[`${phase.id}-${i}`] && dashboard.roadmapCompleted[`${phase.id}-${i}`]) completed++;
    }
    added.forEach((_, idx) => {
      if (dashboard.roadmapCompleted[`${phase.id}-add-${idx}`]) completed++;
    });
    const activeBase = phase.items.filter((_, i) => !dashboard.roadmapDeleted[`${phase.id}-${i}`]).length;
    const activeTotal = activeBase + added.length;
    return { completed, total: activeTotal, percent: activeTotal > 0 ? Math.round((completed / activeTotal) * 100) : 0 };
  };

  const setAttackToday = (text: string, completed: boolean) => {
    const date = new Date().toISOString().split("T")[0];
    updateDashboard(d => ({ ...d, attackToday: { text, completed, date } }));
  };
  const setAttackTomorrow = (text: string) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const date = d.toISOString().split("T")[0];
    updateDashboard(dash => ({ ...dash, attackTomorrow: { text, date } }));
  };

  const updateMetric = (id: string, patch: Partial<DashboardMetric>) => {
    updateDashboard(d => ({
      ...d,
      metrics: d.metrics.map(m => (m.id === id ? { ...m, ...patch } : m)),
    }));
  };

  return (
    <div className="min-h-screen bg-black tactical-grid flex flex-col safe-area-padding">
      {/* Header */}
      <div className="border-b border-primary/30 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-primary/50 bg-black flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {dashboard.name.toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Radio className="w-2 h-2 text-primary animate-pulse" />
                <span className="text-[10px] text-gray-500 font-mono">
                  {currentTime.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            </div>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <button className="btn-tactical p-2.5" aria-label="Settings">
                <Settings className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-black border-primary/30 max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-primary font-mono">Edit metrics</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {dashboard.metrics.map((m) => (
                  <div key={m.id} className="space-y-2 border-b border-primary/10 pb-3">
                    <Label className="text-xs text-gray-400 font-mono">{m.label}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-gray-500">Current</Label>
                        <Input
                          type="number"
                          value={m.current}
                          onChange={(e) => updateMetric(m.id, { current: Number(e.target.value) })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-500">Target</Label>
                        <Input
                          type="number"
                          value={m.target}
                          onChange={(e) => updateMetric(m.id, { target: Number(e.target.value) })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[10px] text-gray-500">Deadline</Label>
                        <Input
                          type="date"
                          value={m.deadline}
                          onChange={(e) => updateMetric(m.id, { deadline: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {dashboard.metrics.length === 0 && (
                  <p className="text-xs text-gray-500">No metrics yet. Add some from the template or create a new dashboard.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 bg-black/40 border border-primary/20 p-1">
            <TabsTrigger value="overview" className="font-mono text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Overview
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="font-mono text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Roadmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Today / Tomorrow focus */}
            <div className="tactical-card corner-brackets p-4 border-primary/20">
              <div className="mil-tag">FOCUS</div>
              <div className="pt-4 space-y-3">
                {dashboard.attackToday ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAttackToday(dashboard.attackToday.text, !dashboard.attackToday.completed)}
                      className={`w-5 h-5 border flex items-center justify-center shrink-0 ${dashboard.attackToday.completed ? "bg-primary border-primary text-black" : "border-primary/40"}`}
                    >
                      {dashboard.attackToday.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className={`flex-1 text-sm ${dashboard.attackToday.completed ? "text-primary/70 line-through" : ""}`}>
                      {dashboard.attackToday.text}
                    </span>
                    <button type="button" onClick={() => { setNewTodayText(dashboard.attackToday!.text); setShowSetToday(true); }} className="text-[10px] text-primary/70 font-mono uppercase">Edit</button>
                  </div>
                ) : showSetToday ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Today's focus..."
                      value={newTodayText}
                      onChange={(e) => setNewTodayText(e.target.value)}
                      className="flex-1 h-9 text-sm bg-black/40 border-primary/20"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => { if (newTodayText.trim()) { setAttackToday(newTodayText.trim(), dashboard.attackToday?.completed ?? false); setNewTodayText(""); setShowSetToday(false); } }} className="h-9 font-mono text-xs">Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowSetToday(false); setNewTodayText(""); }} className="h-9 text-xs">Cancel</Button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowSetToday(true)} className="text-xs text-primary/70 font-mono hover:text-primary">+ Set today&apos;s focus</button>
                )}
                {dashboard.attackTomorrow ? (
                  <div className="text-xs text-gray-500 font-mono">Tomorrow: {dashboard.attackTomorrow.text}</div>
                ) : showSetTomorrow ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tomorrow's focus..."
                      value={newTomorrowText}
                      onChange={(e) => setNewTomorrowText(e.target.value)}
                      className="flex-1 h-9 text-sm bg-black/40 border-primary/20"
                    />
                    <Button size="sm" onClick={() => { if (newTomorrowText.trim()) { setAttackTomorrow(newTomorrowText.trim()); setNewTomorrowText(""); setShowSetTomorrow(false); } }} className="h-9 font-mono text-xs">Set</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowSetTomorrow(false); setNewTomorrowText(""); }} className="h-9 text-xs">Cancel</Button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowSetTomorrow(true)} className="text-xs text-gray-500 font-mono hover:text-primary">+ Set tomorrow</button>
                )}
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboard.metrics.map((m, idx) => {
                const progress = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                const change = m.current - m.previous;
                const up = change >= 0;
                return (
                  <div key={m.id} className="tactical-card corner-brackets p-4 relative">
                    <div className="mil-tag">M-{idx + 1}</div>
                    <div className="pt-4">
                      <div className="data-label text-xs uppercase tracking-wider text-primary/70">{m.label}</div>
                      <div className="data-value text-2xl font-black font-mono mt-1">
                        {m.unit === "$M" && formatValue(m.current, "M") + " / " + formatValue(m.target, "M")}
                        {!m.unit && `${m.current} / ${m.target}`}
                        {m.unit === "M" && (m.target >= 1e6 ? `${(m.current / 1e6).toFixed(1)}M / ${(m.target / 1e6).toFixed(1)}M` : `${m.current} / ${m.target}`)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center gap-1 px-2 py-0.5 border text-xs ${up ? "border-primary/50 text-primary" : "border-red-500/50 text-red-500"}`}>
                          {up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {up ? "+" : ""}{change}
                        </div>
                        <span className="text-[10px] text-gray-500">vs previous</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-gray-400">Target: {formatDeadline(m.deadline)}</span>
                          <span className="text-primary font-bold">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="progress-tactical h-2 mt-1">
                          <div className="progress-tactical-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {dashboard.metrics.length === 0 && (
              <div className="tactical-card p-6 text-center text-gray-500 text-sm">
                No metrics yet. Open Settings to add metrics or create a new dashboard from template.
              </div>
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-4 mt-4">
            {dashboard.roadmapPhases.map((phase, qIdx) => {
              const progress = getPhaseProgress(phase);
              return (
                <div
                  key={phase.id}
                  className={`tactical-card corner-brackets p-4 ${qIdx === 0 ? "border-primary/40 bg-primary/5" : ""}`}
                >
                  <div className={`mil-tag ${qIdx === 0 ? "bg-primary text-black" : ""}`}>{phase.quarter}</div>
                  <div className="pt-4 space-y-2">
                    <h3 className="font-mono text-xs text-primary font-bold uppercase">{phase.theme}</h3>
                    <p className="text-[10px] text-gray-400 font-mono italic">&quot;{phase.goal}&quot;</p>
                    <div className="space-y-1.5">
                      {phase.items.map((item, idx) => {
                        if (dashboard.roadmapDeleted[`${phase.id}-${idx}`]) return null;
                        const key = `${phase.id}-${idx}`;
                        const isCompleted = dashboard.roadmapCompleted[key];
                        const displayText = getRoadmapItemText(phase.id, idx, item);
                        const isEditing = editingRoadmapKey === key;
                        if (isEditing) {
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-4 h-4 shrink-0 border border-primary/30" />
                              <input
                                type="text"
                                autoFocus
                                value={editingRoadmapText}
                                onChange={(e) => setEditingRoadmapText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") saveRoadmapItemEdit(); if (e.key === "Escape") { setEditingRoadmapKey(null); setEditingRoadmapText(""); } }}
                                onBlur={saveRoadmapItemEdit}
                                className="flex-1 bg-black/60 border border-primary/40 px-2 py-1 text-xs font-mono text-primary"
                              />
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="flex items-start gap-2 group">
                            <button
                              onClick={() => toggleRoadmapItem(phase.id, idx)}
                              className={`w-5 h-5 shrink-0 border flex items-center justify-center mt-0.5 ${isCompleted ? "bg-primary border-primary text-black" : "border-primary/30"}`}
                            >
                              {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span
                              onClick={() => { setEditingRoadmapKey(key); setEditingRoadmapText(displayText); }}
                              className={`flex-1 text-xs font-mono cursor-pointer ${isCompleted ? "text-primary/70 line-through" : "text-gray-400"}`}
                            >
                              {displayText}
                            </span>
                            <button
                              onClick={() => deleteRoadmapItem(phase.id, idx)}
                              className="text-[10px] text-red-500/70 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            >
                              del
                            </button>
                          </div>
                        );
                      })}
                      {(dashboard.roadmapAdded[phase.id] || []).map((itemText, idx) => {
                        const key = `${phase.id}-add-${idx}`;
                        const isCompleted = dashboard.roadmapCompleted[key];
                        return (
                          <div key={`add-${idx}`} className="flex items-start gap-2 group">
                            <button
                              onClick={() => toggleRoadmapItem(phase.id, `add-${idx}`)}
                              className={`w-5 h-5 shrink-0 border flex items-center justify-center mt-0.5 ${isCompleted ? "bg-primary border-primary text-black" : "border-primary/30"}`}
                            >
                              {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span className={`flex-1 text-xs font-mono ${isCompleted ? "text-primary/70 line-through" : "text-gray-400"}`}>
                              {itemText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-3 border-t border-primary/10 flex gap-2">
                      <Input
                        placeholder="Add objective..."
                        value={newItemPerPhase[phase.id] || ""}
                        onChange={(e) => setNewItemPerPhase({ ...newItemPerPhase, [phase.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addRoadmapItem(phase.id)}
                        className="flex-1 h-8 text-xs bg-black/40 border-primary/20"
                      />
                      <Button onClick={() => addRoadmapItem(phase.id)} size="sm" className="h-8 font-mono text-xs">
                        Add
                      </Button>
                    </div>
                    <div className="pt-2 border-t border-primary/20 flex justify-between text-[10px] font-mono">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-primary font-bold">{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="progress-tactical h-1.5 mt-1">
                      <div className="progress-tactical-fill" style={{ width: `${progress.percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
