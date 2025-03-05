import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AddGoal from "@/pages/add-goal";
import AddProgress from "@/pages/add-progress";
import AddTask from "@/pages/add-task";
import TaskDetails from "@/pages/task-details";
import GoalTasks from "@/pages/goal-tasks";
import TaskBoard from "@/pages/task-board";
import HabitTracker from "@/pages/habit-tracker";
import { GoalCelebrationProvider } from "./context/goal-celebration-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/add-goal" component={AddGoal} />
      <Route path="/add-progress" component={AddProgress} />
      <Route path="/add-task" component={AddTask} />
      <Route path="/tasks/:id" component={TaskDetails} />
      <Route path="/goal-tasks/:id" component={GoalTasks} />
      <Route path="/task-board" component={TaskBoard} />
      <Route path="/habit-tracker" component={HabitTracker} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoalCelebrationProvider>
        <Router />
        <Toaster />
      </GoalCelebrationProvider>
    </QueryClientProvider>
  );
}

export default App;
