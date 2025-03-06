import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertGoalSchema, 
  insertMetricSchema, 
  insertGoalStatusSchema, 
  insertExecutionTaskSchema, 
  insertWeekSchema,
  insertSubtaskSchema,
  insertHabitSchema,
  insertHabitStreakSchema,
  goals,
  metrics,
  goalStatus,
  executionTasks,
  subtasks,
  weeks,
  habits,
  habitStreaks
} from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // All routes are prefixed with /api
  
  // Clear all sample data
  app.post("/api/reset-data", async (req, res) => {
    try {
      // Clear all tables
      await db.delete(habitStreaks);
      await db.delete(habits);
      await db.delete(subtasks);
      await db.delete(executionTasks);
      await db.delete(goalStatus);
      await db.delete(metrics);
      await db.delete(goals);
      await db.delete(weeks);
      
      res.status(200).json({ message: "All sample data cleared successfully" });
    } catch (error) {
      console.error("Error clearing sample data:", error);
      res.status(500).json({ message: "Error clearing data", error: String(error) });
    }
  });
  
  // Get all goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching goals" });
    }
  });
  
  // Update a goal
  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goalData = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(id, goalData);
      
      if (!updatedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating goal" });
    }
  });
  
  // Create a goal
  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating goal" });
    }
  });
  
  // Get all metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getAllMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching metrics" });
    }
  });
  
  // Get metrics by category
  app.get("/api/metrics/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const metrics = await storage.getMetricsByCategory(category);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching metrics by category" });
    }
  });
  
  // Update a metric
  app.patch("/api/metrics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const metricData = insertMetricSchema.partial().parse(req.body);
      const updatedMetric = await storage.updateMetric(id, metricData);
      
      if (!updatedMetric) {
        return res.status(404).json({ message: "Metric not found" });
      }
      
      res.json(updatedMetric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating metric" });
    }
  });
  
  // Create a metric
  app.post("/api/metrics", async (req, res) => {
    try {
      const metricData = insertMetricSchema.parse(req.body);
      const metric = await storage.createMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating metric" });
    }
  });
  
  // Get all goal statuses
  app.get("/api/goal-statuses", async (req, res) => {
    try {
      const statuses = await storage.getAllGoalStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching goal statuses" });
    }
  });
  
  // Update a goal status
  app.patch("/api/goal-statuses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const statusData = insertGoalStatusSchema.partial().parse(req.body);
      const updatedStatus = await storage.updateGoalStatus(id, statusData);
      
      if (!updatedStatus) {
        return res.status(404).json({ message: "Goal status not found" });
      }
      
      res.json(updatedStatus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal status data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating goal status" });
    }
  });
  
  // Create a goal status
  app.post("/api/goal-statuses", async (req, res) => {
    try {
      const statusData = insertGoalStatusSchema.parse(req.body);
      const status = await storage.createGoalStatus(statusData);
      res.status(201).json(status);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal status data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating goal status" });
    }
  });
  
  // Get tasks by week with specific weekId
  app.get("/api/tasks/week/:weekId", async (req, res) => {
    try {
      const weekId = parseInt(req.params.weekId);
      const tasks = await storage.getTasksByWeek(weekId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by week" });
    }
  });
  
  // Get tasks by week (default to the first week if no id specified)
  app.get("/api/tasks/week", async (req, res) => {
    try {
      // Get the first week from the database, or default to week with ID 1
      const weeks = await storage.getAllWeeks();
      
      if (weeks.length === 0) {
        return res.status(404).json({ message: "No weeks found" });
      }
      
      const firstWeek = weeks[0];
      const tasks = await storage.getTasksByWeek(firstWeek.id);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task" });
    }
  });
  
  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Get a specific task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task" });
    }
  });
  
  // Create a task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertExecutionTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });
  
  // Update a task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertExecutionTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, taskData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating task" });
    }
  });
  
  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });
  
  // Toggle task priority status
  app.post("/api/tasks/:id/toggle-priority", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the task first
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // If we're setting this task as a priority, first reset all other tasks
      if (!task.isPriority) {
        // Get all tasks
        const allTasks = await storage.getAllTasks();
        
        // Reset priority on all tasks that currently have it set
        for (const t of allTasks) {
          if (t.isPriority) {
            await storage.updateTask(t.id, { isPriority: false });
          }
        }
      }
      
      // Toggle this task's priority status
      const updatedTask = await storage.updateTask(id, { 
        isPriority: !task.isPriority 
      });
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task priority" });
    }
  });
  
  // Get all weeks
  app.get("/api/weeks", async (req, res) => {
    try {
      const weeks = await storage.getAllWeeks();
      res.json(weeks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weeks" });
    }
  });
  
  // Get a specific week
  app.get("/api/weeks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const week = await storage.getWeek(id);
      
      if (!week) {
        return res.status(404).json({ message: "Week not found" });
      }
      
      res.json(week);
    } catch (error) {
      res.status(500).json({ message: "Error fetching week" });
    }
  });
  
  // Create a week
  app.post("/api/weeks", async (req, res) => {
    try {
      const weekData = insertWeekSchema.parse(req.body);
      const week = await storage.createWeek(weekData);
      res.status(201).json(week);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid week data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating week" });
    }
  });
  
  // Update a week
  app.patch("/api/weeks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const weekData = insertWeekSchema.partial().parse(req.body);
      const updatedWeek = await storage.updateWeek(id, weekData);
      
      if (!updatedWeek) {
        return res.status(404).json({ message: "Week not found" });
      }
      
      res.json(updatedWeek);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid week data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating week" });
    }
  });

  // Subtask routes
  // Get all subtasks
  app.get("/api/subtasks", async (req, res) => {
    try {
      const subtasks = await storage.getAllSubtasks();
      res.json(subtasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subtasks" });
    }
  });

  // Get subtasks for a specific parent task
  app.get("/api/tasks/:taskId/subtasks", async (req, res) => {
    try {
      const parentTaskId = parseInt(req.params.taskId);
      const subtasks = await storage.getSubtasksByParentId(parentTaskId);
      res.json(subtasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subtasks for task" });
    }
  });

  // Get a specific subtask
  app.get("/api/subtasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subtask = await storage.getSubtask(id);
      
      if (!subtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      
      res.json(subtask);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subtask" });
    }
  });

  // Create a subtask
  app.post("/api/subtasks", async (req, res) => {
    try {
      const subtaskData = insertSubtaskSchema.parse(req.body);
      const subtask = await storage.createSubtask(subtaskData);
      res.status(201).json(subtask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subtask data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating subtask" });
    }
  });

  // Update a subtask
  app.patch("/api/subtasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subtaskData = insertSubtaskSchema.partial().parse(req.body);
      const updatedSubtask = await storage.updateSubtask(id, subtaskData);
      
      if (!updatedSubtask) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      
      res.json(updatedSubtask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subtask data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating subtask" });
    }
  });

  // Delete a subtask
  app.delete("/api/subtasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSubtask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Subtask not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting subtask" });
    }
  });

  // Habit routes
  // Get all habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Error fetching habits" });
    }
  });

  // Get habits by goal ID
  app.get("/api/goals/:goalId/habits", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const habits = await storage.getHabitsByGoalId(goalId);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Error fetching habits for goal" });
    }
  });

  // Get a specific habit
  app.get("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.getHabit(id);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      res.status(500).json({ message: "Error fetching habit" });
    }
  });

  // Create a habit
  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating habit" });
    }
  });

  // Update a habit
  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habitData = insertHabitSchema.partial().parse(req.body);
      const updatedHabit = await storage.updateHabit(id, habitData);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating habit" });
    }
  });

  // Delete a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHabit(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting habit" });
    }
  });

  // Habit Streak routes
  // Get all streaks for a habit
  app.get("/api/habits/:habitId/streaks", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const streaks = await storage.getHabitStreaksByHabitId(habitId);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching streaks for habit" });
    }
  });

  // Get streaks for a habit in a date range
  app.get("/api/habits/:habitId/streaks/range", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date(); // Default to today
      
      const streaks = await storage.getHabitStreaksInDateRange(habitId, startDate, endDate);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching streaks for date range" });
    }
  });

  // Get current streak count for a habit
  app.get("/api/habits/:habitId/current-streak", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const streakCount = await storage.getCurrentStreak(habitId);
      res.json({ habitId, currentStreak: streakCount });
    } catch (error) {
      res.status(500).json({ message: "Error calculating current streak" });
    }
  });

  // Get a specific streak
  app.get("/api/habit-streaks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const streak = await storage.getHabitStreak(id);
      
      if (!streak) {
        return res.status(404).json({ message: "Habit streak not found" });
      }
      
      res.json(streak);
    } catch (error) {
      res.status(500).json({ message: "Error fetching habit streak" });
    }
  });

  // Create a habit streak
  app.post("/api/habit-streaks", async (req, res) => {
    try {
      const streakData = insertHabitStreakSchema.parse(req.body);
      const streak = await storage.createHabitStreak(streakData);
      res.status(201).json(streak);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit streak data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating habit streak" });
    }
  });

  // Update a habit streak
  app.patch("/api/habit-streaks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const streakData = insertHabitStreakSchema.partial().parse(req.body);
      const updatedStreak = await storage.updateHabitStreak(id, streakData);
      
      if (!updatedStreak) {
        return res.status(404).json({ message: "Habit streak not found" });
      }
      
      res.json(updatedStreak);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit streak data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating habit streak" });
    }
  });

  // Delete a habit streak
  app.delete("/api/habit-streaks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHabitStreak(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Habit streak not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting habit streak" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
