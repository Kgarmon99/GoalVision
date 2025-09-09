import { useToast } from "@/hooks/use-toast";

interface GoalCelebrationProps {
  goalName: string;
  progress: number;
}

export function GoalCelebration({ goalName, progress }: GoalCelebrationProps) {
  const { toast } = useToast();

  if (progress >= 100) {
    toast({
      title: "Goal Completed! 🎉",
      description: `Congratulations on completing ${goalName}!`,
    });
  }

  return null;
}