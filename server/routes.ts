import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertGoalSchema, 
  insertMetricSchema, 
  insertGoalStatusSchema, 
  insertExecutionTaskSchema, 
  insertWeekSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // All routes are prefixed with /api
  
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
  
  // Get tasks by week
  app.get("/api/tasks/week/:weekId", async (req, res) => {
    try {
      const weekId = parseInt(req.params.weekId);
      const tasks = await storage.getTasksByWeek(weekId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by week" });
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

  const httpServer = createServer(app);
  return httpServer;
}
