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
  insertUserSchema,
  goals,
  metrics,
  goalStatus,
  executionTasks,
  subtasks,
  weeks,
  users
} from "@shared/schema";
import { db } from "./db";

// Simple server-side cache implementation to reduce database load
// Cache entries expire after specified time to ensure data freshness
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class ServerCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 60 * 1000; // Default 60 seconds TTL

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if cache entry has expired
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    // Convert keys iterator to array before iterating to fix LSP error
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

const serverCache = new ServerCache();

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // All routes are prefixed with /api
  
  // Update metrics based on goal data
  app.post("/api/metrics/refresh", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      const existingGrowthMetrics = await storage.getMetricsByCategory("growth");
      const existingRevenueMetrics = await storage.getMetricsByCategory("revenue");
      
      // Calculate growth metrics
      if (goals.length > 0) {
        // Find User Growth goal if it exists
        const userGrowthGoal = goals.find(g => g.name.toLowerCase().includes("user") || g.name.toLowerCase().includes("growth"));
        if (userGrowthGoal) {
          // Update Monthly Active Users metric
          const mauMetric = existingGrowthMetrics.find(m => m.name === "Monthly Active Users");
          if (mauMetric) {
            const current = `${userGrowthGoal.current.toFixed(1)}M`;
            const previous = mauMetric.value;
            const previousValue = parseFloat(previous.replace(/[^\d.-]/g, ''));
            const trend = ((userGrowthGoal.current - previousValue) / previousValue) * 100;
            
            await storage.updateMetric(mauMetric.id, {
              value: current,
              previousValue: previous,
              trend: Math.abs(trend),
              trendDirection: trend >= 0 ? "up" : "down"
            });
          }
          
          // Update User Growth Rate
          const growthRateMetric = existingGrowthMetrics.find(m => m.name === "User Retention Rate");
          if (growthRateMetric) {
            const completionPercentage = (userGrowthGoal.current / userGrowthGoal.target) * 100;
            const current = `${completionPercentage.toFixed(1)}%`;
            const previous = growthRateMetric.value;
            const previousValue = parseFloat(previous.replace(/[^\d.-]/g, ''));
            const trend = ((completionPercentage - previousValue) / previousValue) * 100;
            
            await storage.updateMetric(growthRateMetric.id, {
              value: current,
              previousValue: previous,
              trend: Math.abs(trend),
              trendDirection: trend >= 0 ? "up" : "down"
            });
          }
        }
        
        // Find school related goal if it exists
        const schoolGoal = goals.find(g => g.name.toLowerCase().includes("school"));
        if (schoolGoal) {
          // Update School Onboarding Rate
          const schoolMetric = existingGrowthMetrics.find(m => m.name === "School Onboarding Rate");
          if (schoolMetric) {
            const current = `${schoolGoal.current}/month`;
            const previous = schoolMetric.value;
            const previousValue = parseFloat(previous.replace(/[^\d.-]/g, ''));
            const trend = ((schoolGoal.current - previousValue) / previousValue) * 100;
            
            await storage.updateMetric(schoolMetric.id, {
              value: current,
              previousValue: previous,
              trend: Math.abs(trend),
              trendDirection: trend >= 0 ? "up" : "down"
            });
          }
        }
        
        // Find Revenue goal if it exists
        const revenueGoal = goals.find(g => g.name.toLowerCase().includes("revenue"));
        if (revenueGoal) {
          // Update Monthly Recurring Revenue
          const mrrMetric = existingRevenueMetrics.find(m => m.name === "Monthly Recurring Revenue");
          if (mrrMetric) {
            const current = `$${(revenueGoal.current / 12).toFixed(2)}M`;
            const previous = mrrMetric.value;
            const previousValue = parseFloat(previous.replace(/[^\d.-]/g, ''));
            const monthlyValue = revenueGoal.current / 12;
            const trend = ((monthlyValue - previousValue) / previousValue) * 100;
            
            await storage.updateMetric(mrrMetric.id, {
              value: current,
              previousValue: previous,
              trend: Math.abs(trend),
              trendDirection: trend >= 0 ? "up" : "down"
            });
          }
          
          // Update Annual Recurring Revenue
          const arrMetric = existingRevenueMetrics.find(m => m.name === "Annual Recurring Revenue");
          if (arrMetric) {
            const current = `$${revenueGoal.current.toFixed(1)}M`;
            const previous = arrMetric.value;
            const previousValue = parseFloat(previous.replace(/[^\d.-]/g, ''));
            const trend = ((revenueGoal.current - previousValue) / previousValue) * 100;
            
            await storage.updateMetric(arrMetric.id, {
              value: current,
              previousValue: previous,
              trend: Math.abs(trend),
              trendDirection: trend >= 0 ? "up" : "down"
            });
          }
        }
      }
      
      res.status(200).json({ message: "Metrics updated successfully" });
    } catch (error) {
      console.error("Error updating metrics:", error);
      res.status(500).json({ message: "Error updating metrics", error: String(error) });
    }
  });
  
  // Clear all sample data
  app.post("/api/reset-data", async (req, res) => {
    try {
      // Clear all tables
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
      // Try to get goals from cache first
      const cacheKey = "goals:all";
      const cachedGoals = serverCache.get(cacheKey);
      
      if (cachedGoals) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedGoals);
      }
      
      // Cache miss, fetch from database
      const goals = await storage.getAllGoals();
      
      // Cache for 30 seconds - goals don't change that frequently but we need fresh data
      serverCache.set(cacheKey, goals, 30 * 1000);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
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
      
      // Automatically update metrics based on the updated goal
      try {
        // Make a simple request to our metrics refresh endpoint
        await fetch(`http://localhost:${process.env.PORT || 5000}/api/metrics/refresh`, {
          method: 'POST',
        });
        
        // Invalidate relevant caches to ensure data consistency
        serverCache.invalidate("goals:all");
        serverCache.invalidateByPrefix("metrics:");
      } catch (metricError) {
        console.error("Error refreshing metrics after goal update:", metricError);
        // We don't fail the whole request if metrics update fails
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
  
  // Delete a goal
  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoal(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting goal" });
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
      // Try to get tasks from cache first
      const cacheKey = "tasks:all";
      const cachedTasks = serverCache.get(cacheKey);
      
      if (cachedTasks) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedTasks);
      }
      
      // Cache miss, fetch from database
      const tasks = await storage.getAllTasks();
      
      // Cache for 30 seconds - tasks are frequently accessed
      serverCache.set(cacheKey, tasks, 30 * 1000);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
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
      
      // Invalidate task cache to ensure data consistency
      serverCache.invalidate("tasks:all");
      serverCache.invalidateByPrefix(`tasks:week:${updatedTask.weekId}`);
      
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
  
  // Get all weeks
  app.get("/api/weeks", async (req, res) => {
    try {
      // Try to get weeks from cache first
      const cacheKey = "weeks:all";
      const cachedWeeks = serverCache.get(cacheKey);
      
      if (cachedWeeks) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedWeeks);
      }
      
      // Cache miss, fetch from database
      const weeks = await storage.getAllWeeks();
      
      // Cache for 60 seconds - weeks rarely change
      serverCache.set(cacheKey, weeks, 60 * 1000);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
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

// Get all goal templates
app.get("/api/goal-templates", async (req, res) => {
  try {
    const templates = await storage.getAllGoalTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goal templates" });
  }
});

// Get templates by category
app.get("/api/goal-templates/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const templates = await storage.getGoalTemplatesByCategory(category);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates by category" });
  }
});

// Create a goal template
app.post("/api/goal-templates", async (req, res) => {
  try {
    const templateData = insertGoalTemplateSchema.parse(req.body);
    const template = await storage.createGoalTemplate(templateData);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid template data", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating template" });
  }
});

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

  // User routes
  // Get all users (with caching for better performance)
  app.get("/api/users", async (req, res) => {
    try {
      // Try to get users from cache first for faster load times
      const cacheKey = "users:all";
      const cachedUsers = serverCache.get(cacheKey);
      
      if (cachedUsers) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedUsers);
      }
      
      // Cache miss, fetch from database
      const users = await storage.getAllUsers();
      
      // Cache for 5 minutes - user data doesn't change that frequently
      serverCache.set(cacheKey, users, 5 * 60 * 1000);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Get a specific user
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Create a user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Update a user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Update user location
  app.patch("/api/users/:id/location", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { latitude, longitude, country, city } = req.body;
      
      if (typeof latitude !== 'number' || typeof longitude !== 'number' || 
          typeof country !== 'string' || typeof city !== 'string') {
        return res.status(400).json({ 
          message: "Invalid location data",
          errors: "All location fields (latitude, longitude, country, city) are required"
        });
      }
      
      const updatedUser = await storage.updateUserLocation(id, latitude, longitude, country, city);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user location" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
