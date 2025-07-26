import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Eye, 
  Compass, 
  CheckCircle, 
  Play, 
  TrendingUp, 
  Flame, 
  DollarSign, 
  Clock, 
  Zap,
  Users,
  MessageSquare,
  Megaphone,
  ShoppingCart,
  Heart,
  Package,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

interface OodaOpportunity {
  id: number;
  title: string;
  description: string;
  category: string;
  estimatedRevenue: number;
  effortLevel: number;
  timeRequired: number;
  priority: number;
  isCompleted: boolean;
}

interface DailyMove {
  id: number;
  date: string;
  move: string;
  category: string;
  outcome: string;
  revenueGenerated: number;
  signalStrength: number;
  lessons: string;
  nextAction: string;
}

const categoryIcons: Record<string, any> = {
  "cold-outreach": Users,
  "partnerships": MessageSquare,
  "content": Megaphone,
  "conversion": ShoppingCart,
  "retention": Heart,
  "product": Package
};

const categoryColors: Record<string, string> = {
  "cold-outreach": "bg-blue-500",
  "partnerships": "bg-purple-500",
  "content": "bg-green-500",
  "conversion": "bg-orange-500",
  "retention": "bg-pink-500",
  "product": "bg-indigo-500"
};

export default function OodaDashboard() {
  const [currentPhase, setCurrentPhase] = useState<'observe' | 'orient' | 'decide' | 'act'>('observe');
  const [todaysNotes, setTodaysNotes] = useState({
    observe: "",
    orient: "",
    decide: "",
    act: ""
  });

  const { data: topOpportunities = [], isLoading: opportunitiesLoading } = useQuery<OodaOpportunity[]>({
    queryKey: ['/api/ooda/opportunities/top/3']
  });

  const { data: todayMove, isLoading: moveLoading } = useQuery<DailyMove | null>({
    queryKey: ['/api/ooda/daily-move/today']
  });

  const { data: streakData, isLoading: streakLoading } = useQuery<{ streak: number }>({
    queryKey: ['/api/ooda/streak']
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getEffortDisplay = (level: number) => {
    const displays = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    return displays[level - 1] || 'Unknown';
  };

  const getSignalDisplay = (strength: number) => {
    const signals = ['🔴 Cold', '🟡 Warm', '🟠 Hot', '🟢 Very Hot', '🔥 Red Hot'];
    return signals[strength - 1] || '🔴 Cold';
  };

  const phaseContent = {
    observe: {
      title: "Observe: Scan for Leverage",
      description: "Review your pipeline, CRM, DMs, and revenue dashboard. Look for signals where $1 today turns into $100 tomorrow.",
      icon: Eye,
      color: "bg-blue-500"
    },
    orient: {
      title: "Orient: Prioritize the 10x",
      description: "Choose your growth vector: Topline Growth, Distribution, or Offer Design. What would make revenue inevitable today?",
      icon: Compass,
      color: "bg-purple-500"
    },
    decide: {
      title: "Decide: Pick 1 Trillion-Dollar Move",
      description: "Choose the highest-leverage action. What's the smallest, highest-impact move you can ship today?",
      icon: Target,
      color: "bg-orange-500"
    },
    act: {
      title: "Act: Execute + Log",
      description: "Block 1 focused hour. Track your move in the Daily Revenue Leaderboard. Post for feedback or streak accountability.",
      icon: Play,
      color: "bg-green-500"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              ← MoneyBot Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-orange-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Trillion-Dollar Daily Revenue Ritual
              </h1>
            </div>
            <div></div> {/* Spacer for centering */}
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center">
            Transform your daily routine into a revenue-generating machine with the OODA Loop system. 
            Make money a daily reflex, not an event.
          </p>
        </motion.div>

        {/* Streak and Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Current Streak</p>
                  <p className="text-3xl font-bold">
                    {streakLoading ? "..." : `${streakData?.streak || 0} days`}
                  </p>
                </div>
                <Flame className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Today's Revenue Impact</p>
                  <p className="text-3xl font-bold">
                    {moveLoading ? "..." : formatCurrency(todayMove?.revenueGenerated || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pipeline Strength</p>
                  <p className="text-3xl font-bold">
                    {moveLoading ? "..." : getSignalDisplay(todayMove?.signalStrength || 1)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* OODA Loop Process */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Daily OODA Loop
                </CardTitle>
                <CardDescription>
                  Your high-performance daily operating system for compounding revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentPhase} onValueChange={(value) => setCurrentPhase(value as any)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="observe" className="text-xs">Observe</TabsTrigger>
                    <TabsTrigger value="orient" className="text-xs">Orient</TabsTrigger>
                    <TabsTrigger value="decide" className="text-xs">Decide</TabsTrigger>
                    <TabsTrigger value="act" className="text-xs">Act</TabsTrigger>
                  </TabsList>

                  {Object.entries(phaseContent).map(([phase, content]) => (
                    <TabsContent key={phase} value={phase} className="mt-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${content.color} text-white`}>
                            <content.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{content.title}</h3>
                            <p className="text-sm text-muted-foreground">{content.description}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`${phase}-notes`}>Today's Notes</Label>
                          <Textarea
                            id={`${phase}-notes`}
                            placeholder={`What did you ${phase} today?`}
                            value={todaysNotes[phase as keyof typeof todaysNotes]}
                            onChange={(e) => setTodaysNotes(prev => ({
                              ...prev,
                              [phase]: e.target.value
                            }))}
                            className="min-h-[100px]"
                          />
                        </div>

                        {phase === 'act' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="revenue-impact">Revenue Impact ($)</Label>
                              <Input
                                id="revenue-impact"
                                type="number"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="signal-strength">Signal Strength (1-5)</Label>
                              <Input
                                id="signal-strength"
                                type="number"
                                min="1"
                                max="5"
                                placeholder="3"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const phases = ['observe', 'orient', 'decide', 'act'];
                      const currentIndex = phases.indexOf(currentPhase);
                      if (currentIndex > 0) {
                        setCurrentPhase(phases[currentIndex - 1] as any);
                      }
                    }}
                    disabled={currentPhase === 'observe'}
                  >
                    Previous Phase
                  </Button>
                  <Button
                    onClick={() => {
                      const phases = ['observe', 'orient', 'decide', 'act'];
                      const currentIndex = phases.indexOf(currentPhase);
                      if (currentIndex < phases.length - 1) {
                        setCurrentPhase(phases[currentIndex + 1] as any);
                      }
                    }}
                    disabled={currentPhase === 'act'}
                  >
                    Next Phase
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Move */}
            {todayMove && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Today's Trillion-Dollar Move
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{todayMove.category}</Badge>
                        <span className="text-sm text-muted-foreground">{getSignalDisplay(todayMove.signalStrength)}</span>
                      </div>
                      <p className="font-medium">{todayMove.move}</p>
                    </div>
                    
                    {todayMove.outcome && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-700">Outcome:</p>
                        <p className="text-sm">{todayMove.outcome}</p>
                      </div>
                    )}

                    {todayMove.lessons && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-700">Lessons Learned:</p>
                        <p className="text-sm">{todayMove.lessons}</p>
                      </div>
                    )}

                    {todayMove.nextAction && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-orange-700">Next Action:</p>
                        <p className="text-sm">{todayMove.nextAction}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar: Opportunities */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Top Revenue Opportunities
                </CardTitle>
                <CardDescription>
                  Highest-leverage moves available today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topOpportunities.map((opportunity) => {
                      const IconComponent = categoryIcons[opportunity.category] || Package;
                      const colorClass = categoryColors[opportunity.category] || "bg-gray-500";
                      
                      return (
                        <motion.div
                          key={opportunity.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${colorClass} text-white flex-shrink-0`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm leading-tight">{opportunity.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{opportunity.description}</p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {formatCurrency(opportunity.estimatedRevenue)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {opportunity.timeRequired}m
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-muted-foreground">Priority</div>
                                  <div className="font-bold text-sm">{opportunity.priority}</div>
                                </div>
                              </div>
                              
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Effort: {getEffortDisplay(opportunity.effortLevel)}</span>
                                  <span>{opportunity.priority}%</span>
                                </div>
                                <Progress value={opportunity.priority} className="h-1" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Move Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Move Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryIcons).map(([category, IconComponent]) => {
                    const colorClass = categoryColors[category];
                    const displayName = category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Ready to Make Your Move?</h2>
              <p className="text-slate-300 mb-6">
                "You don't rise to the level of your goals, you fall to the level of your systems." — James Clear
              </p>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                Complete Today's OODA Loop
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}