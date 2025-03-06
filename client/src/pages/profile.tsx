import React from "react";
import { 
  Trophy, 
  Target, 
  Calendar, 
  Clock, 
  BarChart4, 
  Flame,
  Award,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { UserAvatar } from "@/components/user-avatar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Goal, ExecutionTask } from "../../../shared/schema";

export default function Profile() {
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: tasks = [] } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks/all'],
  });

  // Calculate completion metrics
  const completedGoals = goals.filter((goal: Goal) => goal.current >= goal.target).length;
  const completedTasks = tasks.filter((task: ExecutionTask) => task.status === "completed").length;
  const totalGoals = goals.length;
  const totalTasks = tasks.length;
  
  // Arbitrary level calculation based on completed goals and tasks
  const level = Math.max(1, Math.floor((completedGoals * 3 + completedTasks) / 5));
  const xp = (completedGoals * 300 + completedTasks * 100) % 1000;
  const nextLevelXp = 1000;
  
  // Mock achievements
  const achievements = [
    { id: 1, name: "Goal Setter", description: "Set your first goal", earned: true, icon: <Target className="h-6 w-6 text-yellow-400" /> },
    { id: 2, name: "Task Master", description: "Complete 10 tasks", earned: completedTasks >= 10, icon: <Award className="h-6 w-6 text-yellow-400" /> },
    { id: 3, name: "On Fire", description: "Maintain a streak for 7 days", earned: false, icon: <Flame className="h-6 w-6 text-yellow-400" /> },
    { id: 4, name: "Dedicated", description: "Log in for 30 consecutive days", earned: false, icon: <Calendar className="h-6 w-6 text-yellow-400" /> },
    { id: 5, name: "Goal Achiever", description: "Complete 5 goals", earned: completedGoals >= 5, icon: <Trophy className="h-6 w-6 text-yellow-400" /> },
  ];

  // Stats
  const stats = [
    { name: "Goals Set", value: totalGoals, icon: <Target className="h-5 w-5 text-primary" /> },
    { name: "Goals Completed", value: completedGoals, icon: <Trophy className="h-5 w-5 text-primary" /> }, 
    { name: "Tasks Completed", value: completedTasks, icon: <Clock className="h-5 w-5 text-primary" /> },
    { name: "Current Streak", value: "3 days", icon: <Flame className="h-5 w-5 text-primary" /> }
  ];

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 bg-gray-950 border-green-800 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-900 to-green-900/20 pb-8 pt-6 relative">
            <div className="absolute inset-0 bg-[url('/images/profile/user-profile.jpeg')] opacity-10 bg-cover bg-center"></div>
            <div className="relative z-10 flex flex-col items-center">
              <AnimatedComponent animation="fadeIn" delay={0.1}>
                <UserAvatar size="xl" showStatus={true} className="border-4 border-green-500 h-24 w-24" />
              </AnimatedComponent>
              <AnimatedComponent animation="fadeIn" delay={0.2}>
                <h2 className="mt-4 text-2xl font-bold text-white">Kahlil Garmon</h2>
              </AnimatedComponent>
              <AnimatedComponent animation="fadeIn" delay={0.3}>
                <div className="mt-1 text-green-400 font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-green-400" />
                  Goal Master - Level {level}
                </div>
              </AnimatedComponent>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-green-400">
                <span>Level {level}</span>
                <span>{xp}/{nextLevelXp} XP</span>
              </div>
              <Progress value={(xp / nextLevelXp) * 100} className="h-2" />
            </div>
            
            <Separator className="bg-green-800/30" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-green-400" />
                Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <AnimatedComponent key={i} animation="fadeIn" delay={0.1 * (i + 1)}>
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="flex items-center text-green-400 mb-1">
                        {stat.icon}
                        <span className="text-xs font-medium ml-1">{stat.name}</span>
                      </div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                    </div>
                  </AnimatedComponent>
                ))}
              </div>
            </div>
            
            <Separator className="bg-green-800/30" />
            
            <Link href="/task-board">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View Your Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Achievements Section */}
        <Card className="md:col-span-2 bg-gray-950 border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, i) => (
                <AnimatedComponent key={i} animation="fadeIn" delay={0.15 * (i + 1)}>
                  <Card className={`border ${achievement.earned ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-gray-700 bg-gray-900/50'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full mr-3 ${achievement.earned ? 'bg-yellow-500/20' : 'bg-gray-800'}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold text-white">{achievement.name}</h3>
                            {achievement.earned && (
                              <Badge className="ml-2 bg-yellow-600 hover:bg-yellow-700">Unlocked</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedComponent>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Goals Progress Section */}
      <Card className="bg-gray-950 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Target className="h-5 w-5 mr-2 text-green-400" />
            Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal: Goal, i: number) => (
              <AnimatedComponent key={i} animation="fadeIn" delay={0.1 * (i + 1)}>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-white">{goal.name}</h3>
                    <Badge className={
                      goal.current >= goal.target 
                        ? "bg-green-600 hover:bg-green-700" 
                        : goal.current >= (goal.target * 0.7) 
                          ? "bg-yellow-600 hover:bg-yellow-700" 
                          : "bg-gray-600 hover:bg-gray-700"
                    }>
                      {goal.current >= goal.target 
                        ? "Completed" 
                        : goal.current >= (goal.target * 0.7) 
                          ? "Almost There" 
                          : "In Progress"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-green-400">{Math.min(100, Math.round((goal.current / goal.target) * 100))}%</span>
                    </div>
                    <Progress value={Math.min(100, (goal.current / goal.target) * 100)} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Current: {goal.current} {goal.unit}</span>
                      <span>Target: {goal.target} {goal.unit}</span>
                    </div>
                  </div>
                </div>
              </AnimatedComponent>
            ))}
            
            {goals.length > 0 ? (
              <Link href="/">
                <Button variant="outline" className="w-full border-green-500 text-green-400 hover:bg-gray-900">
                  View All Goals
                </Button>
              </Link>
            ) : (
              <div className="text-center p-6">
                <p className="text-gray-400 mb-4">You haven't set any goals yet.</p>
                <Link href="/add-goal">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create Your First Goal
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}