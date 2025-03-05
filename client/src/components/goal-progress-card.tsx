import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Goal } from "@shared/schema";
import { Link } from "wouter";
import { PlusCircle, TrendingUp, ArrowUpRight, Target, Award, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGoalCelebrationContext } from "../context/goal-celebration-context";

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [prevPercent, setPrevPercent] = useState<number | null>(null);
  const { triggerCelebration } = useGoalCelebrationContext();
  
  // Calculate percentage complete
  const percentComplete = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  
  // Check for significant milestone achievements to trigger celebration
  useEffect(() => {
    // Only trigger for significant increases (25%, 50%, 75%, 100%)
    const milestones = [25, 50, 75, 100];
    
    if (prevPercent !== null) {
      // Find the highest milestone crossed in this update
      const prevMilestone = milestones.filter(m => prevPercent < m).sort((a, b) => a - b)[0];
      const currentMilestone = milestones.filter(m => percentComplete >= m).sort((a, b) => b - a)[0];
      
      if (currentMilestone && (!prevMilestone || currentMilestone > prevMilestone)) {
        // Trigger celebration for the milestone achievement
        triggerCelebration({
          goalName: goal.name,
          progressPercentage: percentComplete,
          username: "Team" // Could be replaced with actual user data
        });
      }
    }
    
    setPrevPercent(percentComplete);
  }, [percentComplete, prevPercent, goal.name, triggerCelebration]);
  
  // Format values with units
  const formatValue = (value: number, unit: string | null) => {
    if (unit === "M") {
      return `$${value}M`;
    } else if (unit === "K") {
      return `$${value}K`;
    } else {
      return value.toLocaleString();
    }
  };

  // Determine the progress color class based on percentage
  const getProgressColorClass = (percent: number) => {
    if (percent >= 75) return "bg-green-500";
    if (percent >= 50) return "bg-yellow-500";
    if (percent >= 25) return "bg-orange-500";
    return "bg-red-600";
  };
  
  // Calculate remaining amount
  const remaining = goal.target - goal.current;
  
  // Get achievement status text
  const getAchievementStatusText = () => {
    if (percentComplete >= 100) return "Achieved! 🏆";
    if (percentComplete >= 75) return "Almost there!";
    if (percentComplete >= 50) return "Halfway through";
    if (percentComplete >= 25) return "Getting started";
    return "Far from target!";
  };
  
  // Get achievement status color
  const getAchievementStatusColor = () => {
    if (percentComplete >= 100) return "text-green-500";
    if (percentComplete >= 75) return "text-green-400";
    if (percentComplete >= 50) return "text-yellow-500";
    if (percentComplete >= 25) return "text-orange-500";
    return "text-red-500";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`glow-card bg-gray-900 border hover:shadow-xl transition-all duration-300 ${
        percentComplete >= 75 ? "border-green-600" :
        percentComplete >= 50 ? "border-yellow-600" :
        percentComplete >= 25 ? "border-orange-600" :
        "border-red-600"
      }`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
            <div>
              <div className="flex items-center">
                <p className="text-sm font-medium text-green-400 text-glow">{goal.name}</p>
                {percentComplete >= 100 && <Award className="h-3 w-3 ml-1 text-yellow-400" />}
                {percentComplete < 100 && <Target className="h-3 w-3 ml-1 text-green-400" />}
              </div>
              <div className="flex items-baseline gap-2">
                <motion.p 
                  className="mt-1 text-xl sm:text-2xl font-bold text-white"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatValue(goal.current, goal.unit)}
                </motion.p>
                <p className="text-xs sm:text-sm text-green-400">
                  of {formatValue(goal.target, goal.unit)}
                </p>
              </div>
            </div>
            <motion.span 
              className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium ${
                percentComplete >= 75 ? "bg-green-900/75 text-green-400 border border-green-500" :
                percentComplete >= 50 ? "bg-yellow-900/75 text-yellow-400 border border-yellow-500" :
                percentComplete >= 25 ? "bg-orange-900/75 text-orange-400 border border-orange-500" :
                "bg-red-900/75 text-red-400 border border-red-500"
              } ${percentComplete < 25 ? "animate-pulse" : "pulse-glow"}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {percentComplete}% complete
            </motion.span>
          </div>
          
          <div className="mt-3 sm:mt-4">
            <div className="relative">
              <Progress 
                value={percentComplete} 
                className="h-2.5 bg-gray-800 glow-element" 
                indicatorClassName={getProgressColorClass(percentComplete)}
              />
              {percentComplete >= 100 && (
                <motion.div 
                  className="absolute top-0 right-0 h-full w-2.5 bg-yellow-400 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-green-400">0%</span>
              <span className="text-green-400">100%</span>
            </div>
          </div>
          
          <div className="mt-2">
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center w-full justify-center"
            >
              {expanded ? "Hide details" : "Show details"}
              <ChevronUp className={`h-3 w-3 ml-1 transition-transform duration-300 ${expanded ? "" : "transform rotate-180"}`} />
            </button>
          </div>
          
          {expanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 text-xs text-gray-400 border-t border-green-900 pt-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-green-400">Status:</p>
                  <p className={getAchievementStatusColor()}>{getAchievementStatusText()}</p>
                </div>
                <div>
                  <p className="text-green-400">Remaining:</p>
                  <p className={percentComplete < 25 ? "text-red-500 font-semibold" : ""}>{formatValue(remaining, goal.unit)}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="mt-3 flex justify-end">
            <Link href={`/add-progress?goalId=${goal.id}`}>
              <Button variant="outline" size="sm" className="text-xs border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 group">
                <PlusCircle className="h-3 w-3 mr-1 group-hover:text-white transition-colors" />
                <span className="hidden xs:inline">Update</span> Progress
                <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
