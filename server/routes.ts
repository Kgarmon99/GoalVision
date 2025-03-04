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
  goals,
  metrics,
  goalStatus,
  executionTasks,
  weeks
} from "@shared/schema";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // All routes are prefixed with /api
  
  // Clear all sample data
  app.post("/api/reset-data", async (req, res) => {
    try {
      // Clear all tables
      await db.delete(executionTasks);
      await db.delete(goalStatus);
      await db.delete(metrics);
      await db.delete(goals);
      await db.delete(weeks);
      
      try {
        // Create Kahlil's 2025 goals from attached document
        const personalGoals: InsertGoal[] = [
          { name: "Revenue", current: 0, target: 100, unit: "M", color: "blue" },
          { name: "Funding", current: 0, target: 10, unit: "M", color: "green" },
          { name: "User Growth", current: 0, target: 100, unit: "M", color: "purple" },
          { name: "School Expansion", current: 0, target: 10000, unit: "", color: "amber" },
          { name: "Personal - SF Move", current: 0, target: 100, unit: "%", color: "red" }
        ];
        
        // Add the goals
        const createdGoals = await Promise.all(personalGoals.map(goal => storage.createGoal(goal)));
        
        // Add growth metrics based on goals document
        const growthMetrics: InsertMetric[] = [
          { 
            name: "Monthly Active Users", 
            value: "0", 
            previousValue: "0", 
            trend: 0, 
            trendDirection: "stable", 
            category: "growth" 
          },
          { 
            name: "User Retention Rate", 
            value: "0%", 
            previousValue: "0%", 
            trend: 0, 
            trendDirection: "stable", 
            category: "growth" 
          },
          { 
            name: "Net Promoter Score", 
            value: "0", 
            previousValue: "0", 
            trend: 0, 
            trendDirection: "stable", 
            category: "growth" 
          },
          { 
            name: "School Onboarding Rate", 
            value: "0/month", 
            previousValue: "0/month", 
            trend: 0, 
            trendDirection: "stable", 
            category: "growth" 
          }
        ];
        
        // Add revenue metrics based on goals document
        const revenueMetrics: InsertMetric[] = [
          { 
            name: "Monthly Recurring Revenue", 
            value: "$0", 
            previousValue: "$0", 
            trend: 0, 
            trendDirection: "stable", 
            category: "revenue" 
          },
          { 
            name: "Annual Recurring Revenue", 
            value: "$0", 
            previousValue: "$0", 
            trend: 0, 
            trendDirection: "stable", 
            category: "revenue" 
          },
          { 
            name: "Customer Acquisition Cost", 
            value: "$0", 
            previousValue: "$0", 
            trend: 0, 
            trendDirection: "stable", 
            category: "revenue" 
          },
          { 
            name: "Lifetime Value", 
            value: "$0", 
            previousValue: "$0", 
            trend: 0, 
            trendDirection: "stable", 
            category: "revenue" 
          }
        ];
        
        // Add the metrics
        await Promise.all([...growthMetrics, ...revenueMetrics].map(metric => storage.createMetric(metric)));
        
        // Add a week for task tracking
        const week: InsertWeek = {
          number: 1,
          dateRange: "January 1 - 7, 2025",
          completionRate: 0,
        };
        
        const createdWeek = await storage.createWeek(week);
        
        // Add goal statuses
        const goalMap = new Map(createdGoals.map(goal => [goal.name, goal.id]));
        
        const goalStatuses: InsertGoalStatus[] = personalGoals.map(goal => ({
          goalId: goalMap.get(goal.name) || 0,
          goalName: goal.name,
          status: "on-track"
        }));
        
        await Promise.all(goalStatuses.map(status => storage.createGoalStatus(status)));
        
        // Add initial tasks from the goals document
        const initialTasks: InsertExecutionTask[] = [
          { 
            task: "Finalize pitch deck, financial projections, & business plan", 
            owner: "Kahlil", 
            ownerAvatar: "", 
            goalCategory: "Funding", 
            categoryColor: "green", 
            dueDate: "Feb 1, 2025", 
            status: "in-progress",
            weekId: createdWeek.id
          },
          { 
            task: "Apply for YC funding ($500K)", 
            owner: "Kahlil", 
            ownerAvatar: "", 
            goalCategory: "Funding", 
            categoryColor: "green", 
            dueDate: "Feb 12, 2025", 
            status: "not-started",
            weekId: createdWeek.id
          },
          { 
            task: "Build investor pipeline for A16Z ($2M target)", 
            owner: "Kahlil", 
            ownerAvatar: "", 
            goalCategory: "Funding", 
            categoryColor: "green", 
            dueDate: "Mar 1, 2025", 
            status: "not-started",
            weekId: createdWeek.id
          },
          { 
            task: "Launch revenue optimization A/B tests", 
            owner: "Team", 
            ownerAvatar: "", 
            goalCategory: "Revenue", 
            categoryColor: "blue", 
            dueDate: "Feb 15, 2025", 
            status: "not-started",
            weekId: createdWeek.id
          },
          { 
            task: "Select a place in SF", 
            owner: "Kahlil", 
            ownerAvatar: "", 
            goalCategory: "Personal - SF Move", 
            categoryColor: "red", 
            dueDate: "Apr 1, 2025", 
            status: "not-started",
            weekId: createdWeek.id
          }
        ];
        
        await Promise.all(initialTasks.map(task => storage.createExecutionTask(task)));
        
        res.status(200).json({ message: "2025 goals added successfully" });
      } catch (innerError) {
        console.error("Error creating 2025 goals:", innerError);
        res.status(200).json({ message: "All sample data cleared successfully" });
      }
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
  
  // Disable goal deletion (prevent data loss)
  app.delete("/api/goals/:id", async (req, res) => {
    res.status(403).json({ 
      message: "Deletion is not allowed. Please use edit functionality instead.",
      hint: "This application is designed to preserve historical data. Use PATCH /api/goals/:id to update records."
    });
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
  
  // Disable metric deletion (prevent data loss)
  app.delete("/api/metrics/:id", async (req, res) => {
    res.status(403).json({ 
      message: "Deletion is not allowed. Please use edit functionality instead.",
      hint: "This application is designed to preserve historical data. Use PATCH /api/metrics/:id to update records."
    });
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
  
  // Disable goal status deletion (prevent data loss)
  app.delete("/api/goal-statuses/:id", async (req, res) => {
    res.status(403).json({ 
      message: "Deletion is not allowed. Please use edit functionality instead.",
      hint: "This application is designed to preserve historical data. Use PATCH /api/goal-statuses/:id to update records."
    });
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
  
  // Disable task deletion (prevent data loss)
  app.delete("/api/tasks/:id", async (req, res) => {
    res.status(403).json({ 
      message: "Deletion is not allowed. Please use edit functionality instead.",
      hint: "This application is designed to preserve historical data. Use PATCH /api/tasks/:id to update records."
    });
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
  
  // Disable week deletion (prevent data loss)
  app.delete("/api/weeks/:id", async (req, res) => {
    res.status(403).json({ 
      message: "Deletion is not allowed. Please use edit functionality instead.",
      hint: "This application is designed to preserve historical data. Use PATCH /api/weeks/:id to update records."
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
