
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, ArrowRight, Check, X, Trash2, BarChart3 } from "lucide-react";
import { GoalDependencyGraph } from "@/components/goal-dependency-graph";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Goal, GoalDependency } from "@shared/schema";

type GoalWithDependencies = {
  goal: Goal;
  dependencies: (GoalDependency & { dependsOnGoal: Goal })[];
  dependents: (GoalDependency & { goal: Goal })[];
};

const addDependencySchema = z.object({
  dependsOnGoalId: z.string({
    required_error: "Please select a goal",
  }),
  impact: z.string().transform((val) => parseFloat(val)),
  description: z.string().optional(),
});

export default function GoalDependenciesPage() {
  const [, params] = useParams();
  const goalId = params?.id ? parseInt(params.id) : undefined;
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState<"dependencies" | "dependents">("dependencies");
  
  const { data: allGoals } = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiRequest<Goal[]>("/api/goals"),
  });
  
  const { data: goalWithDependencies, refetch } = useQuery({
    queryKey: ["goal-dependencies", goalId],
    queryFn: () => apiRequest<GoalWithDependencies>(`/api/goals/${goalId}/dependencies`),
    enabled: !!goalId,
  });
  
  const addDependencyMutation = useMutation({
    mutationFn: (data: { goalId: number; dependsOnGoalId: number; impact: number; description: string }) =>
      apiRequest("/api/goal-dependencies", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Dependency added",
        description: "Goal dependency has been added successfully.",
      });
      refetch();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add goal dependency.",
        variant: "destructive",
      });
    },
  });
  
  const deleteDependencyMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/goal-dependencies/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({
        title: "Dependency removed",
        description: "Goal dependency has been removed successfully.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove goal dependency.",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<z.infer<typeof addDependencySchema>>({
    resolver: zodResolver(addDependencySchema),
    defaultValues: {
      dependsOnGoalId: "",
      impact: "5",
      description: "",
    },
  });
  
  const onSubmit = (values: z.infer<typeof addDependencySchema>) => {
    if (!goalId) return;
    
    addDependencyMutation.mutate({
      goalId,
      dependsOnGoalId: parseInt(values.dependsOnGoalId),
      impact: values.impact,
      description: values.description || "",
    });
  };
  
  // Filter out current goal and any goals that are already dependencies
  const availableGoals = allGoals?.filter(
    (g) =>
      g.id !== goalId &&
      !goalWithDependencies?.dependencies.some((d) => d.dependsOnGoalId === g.id)
  );
  
  if (!goalId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Select a Goal</CardTitle>
              <CardDescription>
                Please select a goal from the dashboard to view and manage its dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {goalWithDependencies?.goal.name} - Goal Dependencies
              </CardTitle>
              <CardDescription>
                Manage dependencies between goals to track how they affect each other
              </CardDescription>
            </CardHeader>
            <CardContent>
              {goalWithDependencies && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" /> 
                    Goal Relationship Visualization
                  </h3>
                  <GoalDependencyGraph 
                    goal={goalWithDependencies.goal}
                    dependencies={goalWithDependencies.dependencies}
                    dependents={goalWithDependencies.dependents}
                  />
                </div>
              )}
              
              <div className="flex space-x-4 mb-6">
                <Button
                  variant={selectedTab === "dependencies" ? "default" : "outline"}
                  onClick={() => setSelectedTab("dependencies")}
                >
                  Dependencies (Goals this one depends on)
                </Button>
                <Button
                  variant={selectedTab === "dependents" ? "default" : "outline"}
                  onClick={() => setSelectedTab("dependents")}
                >
                  Dependents (Goals that depend on this one)
                </Button>
              </div>
              
              {selectedTab === "dependencies" && (
                <>
                  <div className="space-y-4 mb-8">
                    <h3 className="text-lg font-semibold">Current Dependencies</h3>
                    {goalWithDependencies?.dependencies.length === 0 ? (
                      <p className="text-muted-foreground">
                        This goal doesn't depend on any other goals yet.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {goalWithDependencies?.dependencies.map((dep) => (
                          <Card key={dep.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium">{dep.dependsOnGoal.name}</h4>
                                    <span className="text-sm text-muted-foreground">
                                      ({dep.dependsOnGoal.current}/{dep.dependsOnGoal.target} {dep.dependsOnGoal.unit})
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center mt-2">
                                    <span className="text-sm mr-2">Impact:</span>
                                    <div className="w-24 bg-muted rounded-full h-2">
                                      <div
                                        className="bg-primary rounded-full h-2"
                                        style={{ width: `${(dep.impact / 10) * 100}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm ml-2">{dep.impact}/10</span>
                                  </div>
                                  
                                  {dep.description && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {dep.description}
                                    </p>
                                  )}
                                </div>
                                
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => deleteDependencyMutation.mutate(dep.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Dependency</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="dependsOnGoalId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Depends on Goal</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a goal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableGoals?.map((goal) => (
                                    <SelectItem key={goal.id} value={goal.id.toString()}>
                                      {goal.name} ({goal.current}/{goal.target} {goal.unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="impact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Impact (0-10)</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-4">
                                  <Slider
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    value={[parseFloat(field.value)]}
                                    onValueChange={(values) => field.onChange(values[0].toString())}
                                    className="flex-1"
                                  />
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="How does this goal impact the main goal?"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={addDependencyMutation.isPending}>
                          {addDependencyMutation.isPending ? "Adding..." : "Add Dependency"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </>
              )}
              
              {selectedTab === "dependents" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Goals that depend on this one</h3>
                  {goalWithDependencies?.dependents.length === 0 ? (
                    <p className="text-muted-foreground">
                      No other goals depend on this goal yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {goalWithDependencies?.dependents.map((dep) => (
                        <Card key={dep.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{dep.goal.name}</h4>
                                  <span className="text-sm text-muted-foreground">
                                    ({dep.goal.current}/{dep.goal.target} {dep.goal.unit})
                                  </span>
                                </div>
                                
                                <div className="flex items-center mt-2">
                                  <span className="text-sm mr-2">Impact:</span>
                                  <div className="w-24 bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary rounded-full h-2"
                                      style={{ width: `${(dep.impact / 10) * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm ml-2">{dep.impact}/10</span>
                                </div>
                                
                                {dep.description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {dep.description}
                                  </p>
                                )}
                              </div>
                              
                              <Link href={`/goal-dependencies/${dep.goal.id}`}>
                                <Button variant="outline" size="sm">
                                  View <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
