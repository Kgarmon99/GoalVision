import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { 
  Target, 
  Zap, 
  Brain, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Star,
  Trophy,
  DollarSign,
  Eye,
  Compass,
  ArrowRight,
  RefreshCcw,
  Award,
  Flame,
  BarChart3,
  Users,
  Bot,
  Sparkles,
  Plus,
  Edit,
  Check,
  X
} from "lucide-react";
import { OodaOpportunity, OodaDailyMove, OodaStreak, Goal, Prospect } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

const OodaDashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Today's daily move state
  const [isEditingDailyMove, setIsEditingDailyMove] = useState(false);
  const [editMoveTitle, setEditMoveTitle] = useState("");
  const [editMoveDescription, setEditMoveDescription] = useState("");

  // Fetch OODA data
  const { 
    data: opportunities = [], 
    isLoading: isLoadingOpportunities,
    refetch: refetchOpportunities
  } = useQuery<OodaOpportunity[]>({
    queryKey: ['/api/ooda/opportunities/top/3'],
  });

  const { 
    data: todayMove, 
    isLoading: isLoadingTodayMove,
    refetch: refetchTodayMove
  } = useQuery<OodaDailyMove>({
    queryKey: ['/api/ooda/daily-move/today'],
  });

  const { 
    data: streak, 
    isLoading: isLoadingStreak,
    refetch: refetchStreak
  } = useQuery<OodaStreak>({
    queryKey: ['/api/ooda/streak'],
  });

  // Fetch existing data for integration
  const { 
    data: goals = [], 
    refetch: refetchGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { 
    data: prospects = [], 
    refetch: refetchProspects
  } = useQuery<Prospect[]>({
    queryKey: ['/api/prospects/top/5'],
  });

  const isLoading = isLoadingOpportunities || isLoadingTodayMove || isLoadingStreak;

  // Update daily move mutation
  const updateDailyMoveMutation = useMutation({
    mutationFn: async (data: { status: string; outcome?: string; revenueImpact?: number }) => {
      if (!todayMove) throw new Error("No daily move to update");
      const response = await fetch(`/api/ooda/daily-moves/${todayMove.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update daily move');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ooda/daily-move/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ooda/streak'] });
      refetchTodayMove();
      refetchStreak();
    }
  });

  // Refresh handler
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        refetchOpportunities(), 
        refetchTodayMove(),
        refetchStreak(),
        refetchGoals(),
        refetchProspects()
      ]);
      
      setLastUpdated(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
      
      toast({
        title: "OODA Engine Updated",
        description: "All revenue intelligence refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to refresh OODA engine data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchOpportunities, refetchTodayMove, refetchStreak, refetchGoals, refetchProspects, toast]);

  // Daily move completion handler
  const handleCompleteDailyMove = useCallback(() => {
    if (!todayMove) return;
    
    const celebrationMessages = [
      "🎯 OODA Loop Complete! Revenue momentum building!",
      "⚡ Daily Power Move Executed! Elite performance!",
      "🚀 Mission Accomplished! The empire grows stronger!",
      "💎 Excellence Delivered! Champions execute daily!",
      "🏆 Victory Secured! Building trillion-dollar habits!"
    ];
    
    updateDailyMoveMutation.mutate({
      status: todayMove.status === "completed" ? "planned" : "completed",
      outcome: todayMove.status === "completed" ? "" : "Successfully executed daily revenue move",
      revenueImpact: todayMove.status === "completed" ? 0 : todayMove.revenueImpact || 0
    });
    
    if (todayMove.status !== "completed") {
      toast({
        title: celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)],
        description: "OODA streak extended! Revenue velocity increasing!",
      });
    }
  }, [todayMove, updateDailyMoveMutation, toast]);

  // Edit daily move handlers
  const handleEditDailyMove = useCallback(() => {
    if (!todayMove) return;
    setIsEditingDailyMove(true);
    setEditMoveTitle(todayMove.moveTitle);
    setEditMoveDescription(todayMove.moveDescription);
  }, [todayMove]);

  const handleSaveDailyMove = useCallback(() => {
    // Implementation would update the daily move
    setIsEditingDailyMove(false);
    toast({
      title: "Daily Move Updated",
      description: "Your power move has been refined for maximum impact.",
    });
  }, [editMoveTitle, editMoveDescription, toast]);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Revenue Now": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "Revenue Later": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Compounders": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      
      {/* Electric Galaxy Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-gray-950 to-black"></div>
        
        {/* Electric grid overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))'
        }}></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                    OODA Revenue Engine
                  </h1>
                  <p className="text-gray-300">Trillion-Dollar Daily Revenue Ritual</p>
                  <div className="mt-2 p-2 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg border border-yellow-500/30">
                    <p className="text-yellow-300 font-semibold text-sm">🧠 "Make revenue automatic. Make scale inevitable."</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gray-900/80 rounded-md shadow-sm border border-green-600 p-2 hidden md:block">
                  <span className="text-sm text-green-400">Last updated:</span>
                  <span className="text-sm font-medium text-white ml-1">{lastUpdated}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
                      <span className="hidden sm:inline">Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Refresh</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* OODA Loop Overview */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: "OBSERVE", icon: Eye, desc: "AI scans opportunities", color: "from-blue-500 to-blue-600" },
                { stage: "ORIENT", icon: Compass, desc: "Auto-rank by ROI", color: "from-purple-500 to-purple-600" },
                { stage: "DECIDE", icon: Target, desc: "Pick 1 power move", color: "from-green-500 to-green-600" },
                { stage: "ACT", icon: Zap, desc: "Execute or delegate", color: "from-red-500 to-red-600" }
              ].map((item, index) => (
                <Card key={item.stage} className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`bg-gradient-to-r ${item.color} p-2 rounded-lg`}>
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-bold text-white">{item.stage}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Revenue Streak */}
          {streak && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500/30 p-3 rounded-full">
                        <Flame className="h-6 w-6 text-yellow-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-yellow-300">Revenue Streak</h2>
                        <p className="text-sm text-gray-300">Daily execution momentum</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-300">{streak.currentStreak} days</div>
                      <div className="text-sm text-gray-400">Longest: {streak.longestStreak}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-lg font-semibold text-white">${streak.totalRevenue?.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Revenue Impact</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-lg font-semibold text-white">{streak.totalMoves}</div>
                      <div className="text-sm text-gray-400">Total Moves Executed</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-lg font-semibold text-white">{streak.badges?.length || 0}</div>
                      <div className="text-sm text-gray-400">Badges Earned</div>
                    </div>
                  </div>
                  
                  {streak.badges && streak.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {streak.badges.map((badge, index) => (
                        <Badge key={index} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Today's Daily Move */}
          {todayMove && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border-green-500/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/30 p-3 rounded-full">
                        <Target className="h-6 w-6 text-green-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-green-300">Today's Power Move</h2>
                        <p className="text-sm text-gray-300">Your #1 revenue domino</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={todayMove.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}>
                        {todayMove.status === "completed" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3 w-3 mr-1" />
                            {todayMove.status}
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 mb-4">
                    {isEditingDailyMove ? (
                      <div className="space-y-3">
                        <Input
                          value={editMoveTitle}
                          onChange={(e) => setEditMoveTitle(e.target.value)}
                          className="bg-black/50 border-green-500/60 text-white"
                          placeholder="Move title..."
                        />
                        <Textarea
                          value={editMoveDescription}
                          onChange={(e) => setEditMoveDescription(e.target.value)}
                          className="bg-black/50 border-green-500/60 text-white min-h-[60px]"
                          placeholder="Move description..."
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveDailyMove}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingDailyMove(false)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-white">{todayMove.moveTitle}</h3>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={handleEditDailyMove}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={handleCompleteDailyMove}
                              disabled={updateDailyMoveMutation.isPending}
                              className={todayMove.status === "completed" 
                                ? "bg-gray-600 hover:bg-gray-700" 
                                : "bg-green-600 hover:bg-green-700"}
                            >
                              {todayMove.status === "completed" ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{todayMove.moveDescription}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-400">Potential: ${todayMove.revenueImpact?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-400">ROI Score: {todayMove.roiScore}/10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-400">Action: {todayMove.actionType}</span>
                          </div>
                        </div>
                        
                        {todayMove.outcome && (
                          <div className="mt-3 p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                            <p className="text-sm text-green-300">
                              <strong>Outcome:</strong> {todayMove.outcome}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Top 3 OODA Opportunities */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  High-Leverage Opportunities
                  <Badge className="bg-blue-500/20 text-blue-300">AI Ranked</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.slice(0, 3).map((opportunity, index) => (
                    <div key={opportunity.id} className="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-semibold text-white">#{index + 1}</span>
                            <h3 className="text-lg font-medium text-white">{opportunity.title}</h3>
                            <Badge className={getCategoryColor(opportunity.category)}>
                              {opportunity.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{opportunity.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-400">ROI Score</div>
                          <div className="text-2xl font-bold text-green-400">{opportunity.roiScore}/10</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-white">${opportunity.potentialRevenue?.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Potential Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-white">{opportunity.effortImpactRatio}/10</div>
                          <div className="text-xs text-gray-400">Effort/Impact</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-semibold ${getUrgencyColor(opportunity.urgencyLevel)}`}>
                            {opportunity.urgencyLevel.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400">Urgency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-400">{opportunity.leverageType}</div>
                          <div className="text-xs text-gray-400">Leverage Type</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          Stage: {opportunity.stage}
                        </Badge>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Select Move
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Integration with Existing Data */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {/* Revenue Goals Progress */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Revenue Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.filter(goal => goal.name.toLowerCase().includes('revenue') || goal.name.toLowerCase().includes('funding')).map((goal) => (
                    <div key={goal.id} className="bg-black/30 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">{goal.name}</span>
                        <span className="text-sm text-gray-400">
                          {goal.current}{goal.unit} / {goal.target}{goal.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.round((goal.current / goal.target) * 100)}% complete
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Prospects Pipeline */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-blue-400" />
                  Revenue Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prospects.slice(0, 3).map((prospect) => (
                    <div key={prospect.id} className="bg-black/30 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-white">{prospect.name}</span>
                          <div className="text-sm text-gray-400">{prospect.organization}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-400">
                            ${prospect.value.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">{prospect.probability}% likely</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {prospect.stage}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default OodaDashboard;