import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertGoalSchema, type Goal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { awardXp, calculateGoalXp } from "@/lib/gamification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertGoalSchema.extend({
  current: z.coerce.number().min(0),
  target: z.coerce.number().min(1, "Target must be greater than 0"),
});

type GoalDialogProps = {
  goal?: Goal;
  trigger?: React.ReactNode;
};

export function GoalDialog({ goal, trigger }: GoalDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      current: 0,
      target: 0,
      unit: "",
      color: "primary",
      deadline: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (goal) {
        form.reset({
          name: goal.name,
          current: goal.current,
          target: goal.target,
          unit: goal.unit || "",
          color: goal.color || "primary",
          deadline: goal.deadline || "",
        });
      } else {
        form.reset({
          name: "",
          current: 0,
          target: 0,
          unit: "",
          color: "primary",
          deadline: "",
        });
      }
    }
  }, [open, goal, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      
      // Award XP for creating a new goal
      await awardXp({
        eventType: "goal_created",
        xpAmount: 50, // Base XP for creating a goal
        goalId: data.id,
        description: `Created new goal: ${variables.name}`
      });
      
      toast({
        title: "Goal created",
        description: "Your goal has been created successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest("PATCH", `/api/goals/${goal?.id}`, data);
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      
      // Award XP for goal progress
      if (goal) {
        const xpAmount = calculateGoalXp(variables.current, variables.target);
        const progress = (variables.current / variables.target) * 100;
        
        let description = `Updated goal: ${variables.name}`;
        if (progress >= 100) {
          description = `🎉 Completed goal: ${variables.name}!`;
        } else if (progress >= 75) {
          description = `⭐ 75% milestone: ${variables.name}`;
        } else if (progress >= 50) {
          description = `📈 50% milestone: ${variables.name}`;
        }
        
        await awardXp({
          eventType: progress >= 100 ? "goal_completed" : "goal_progress",
          xpAmount,
          goalId: goal.id,
          description
        });
      }
      
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/goals/${goal?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (goal) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className="glow-button bg-primary/20 border-primary/40 hover:bg-primary/30" 
            data-testid={goal ? "button-edit-goal" : "button-add-goal"}
          >
            {goal ? (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black border-primary/40 text-white">
        <DialogHeader>
          <DialogTitle className="text-glow">
            {goal ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="E.g., Revenue target" 
                      className="bg-black/60 border-primary/30"
                      data-testid="input-goal-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01"
                        className="bg-black/60 border-primary/30"
                        data-testid="input-goal-current"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01"
                        className="bg-black/60 border-primary/30"
                        data-testid="input-goal-target"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ''}
                        placeholder="E.g., $, users, %" 
                        className="bg-black/60 border-primary/30"
                        data-testid="input-goal-unit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ''}
                        type="date"
                        className="bg-black/60 border-primary/30"
                        data-testid="input-goal-deadline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between pt-4">
              {goal && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-goal"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-primary/30"
                  data-testid="button-cancel-goal"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary text-black hover:bg-primary/90"
                  data-testid="button-submit-goal"
                >
                  {isPending ? "Saving..." : goal ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}