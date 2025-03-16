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

// Cache configuration constants
const CACHE_TTL = {
  GOALS: 5 * 60 * 1000,         // 5 minutes for goals data
  METRICS: 10 * 60 * 1000,      // 10 minutes for metrics (changes less frequently)
  TASKS: 2 * 60 * 1000,         // 2 minutes for tasks (changes more frequently)
  USERS: 15 * 60 * 1000,        // 15 minutes for users data
  GOAL_STATUSES: 5 * 60 * 1000, // 5 minutes for goal statuses
  DEFAULT: 60 * 1000            // 1 minute default
};

class ServerCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = CACHE_TTL.DEFAULT;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private cacheSize: number = 0;
  private maxCacheSize: number = 100; // Maximum number of entries to store
  
  constructor() {
    // Periodically clean up expired entries
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Clean every 5 minutes
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // If cache is full, remove the oldest entry
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.getOldestCacheKey();
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl
    });
    
    this.cacheSize = this.cache.size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.cacheMisses++;
      return null;
    }
    
    // Check if cache entry has expired
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      this.cacheMisses++;
      this.cacheSize = this.cache.size;
      return null;
    }
    
    this.cacheHits++;
    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.cacheSize = this.cache.size;
  }

  invalidateByPrefix(prefix: string): void {
    // Convert keys iterator to array before iterating to fix LSP error
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
    this.cacheSize = this.cache.size;
  }
  
  private getOldestCacheKey(): string | null {
    if (this.cache.size === 0) return null;
    
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    
    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });
    
    return oldestKey;
  }
  
  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    this.cache.forEach((entry, key) => {
      if (now > entry.timestamp) {
        this.cache.delete(key);
        expiredCount++;
      }
    });
    
    this.cacheSize = this.cache.size;
    console.log(`Cache cleanup: removed ${expiredCount} expired entries. Current cache size: ${this.cacheSize}`);
  }
  
  // Get cache statistics
  getStats() {
    const hitRate = this.cacheHits + this.cacheMisses > 0 
      ? (this.cacheHits / (this.cacheHits + this.cacheMisses) * 100).toFixed(2) 
      : '0';
      
    return {
      size: this.cacheSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: `${hitRate}%`
    };
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
        }
      }
      
      res.status(200).json({ message: "Metrics updated successfully" });
    } catch (error) {
      console.error("Error updating metrics:", error);
      res.status(500).json({ message: "Error updating metrics", error: String(error) });
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
      serverCache.set(cacheKey, goals, CACHE_TTL.GOALS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching goals" });
    }
  });
  
  // Get a specific goal
  app.get("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoal(id);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Error fetching goal" });
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
      // Try to get metrics from cache first
      const cacheKey = "metrics:all";
      const cachedMetrics = serverCache.get(cacheKey);
      
      if (cachedMetrics) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedMetrics);
      }
      
      // Cache miss, fetch from database
      const metrics = await storage.getAllMetrics();
      
      // Cache for configured TTL
      serverCache.set(cacheKey, metrics, CACHE_TTL.METRICS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching metrics" });
    }
  });
  
  // Get metrics by category
  app.get("/api/metrics/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      
      // Try to get metrics from cache first
      const cacheKey = `metrics:category:${category}`;
      const cachedMetrics = serverCache.get(cacheKey);
      
      if (cachedMetrics) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedMetrics);
      }
      
      // Cache miss, fetch from database
      const metrics = await storage.getMetricsByCategory(category);
      
      // Cache for configured TTL
      serverCache.set(cacheKey, metrics, CACHE_TTL.METRICS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
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
      
      // Invalidate caches
      serverCache.invalidate("metrics:all");
      serverCache.invalidateByPrefix("metrics:category:");
      
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
      // Try to get goal statuses from cache first
      const cacheKey = "goal-statuses:all";
      const cachedStatuses = serverCache.get(cacheKey);
      
      if (cachedStatuses) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedStatuses);
      }
      
      // Cache miss, fetch from database
      const statuses = await storage.getAllGoalStatuses();
      
      // Cache for configured TTL
      serverCache.set(cacheKey, statuses, CACHE_TTL.GOAL_STATUSES);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching goal statuses" });
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
      
      // Cache for 30 minutes - weeks don't change frequently
      serverCache.set(cacheKey, weeks, 30 * 60 * 1000);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(weeks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weeks" });
    }
  });
  
  // Get tasks by week with specific weekId
  app.get("/api/tasks/week/:weekId", async (req, res) => {
    try {
      const weekId = parseInt(req.params.weekId);
      
      // Try to get tasks from cache first
      const cacheKey = `tasks:week:${weekId}`;
      const cachedTasks = serverCache.get(cacheKey);
      
      if (cachedTasks) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedTasks);
      }
      
      // Cache miss, fetch from database
      const tasks = await storage.getTasksByWeek(weekId);
      
      // Cache for configured TTL
      serverCache.set(cacheKey, tasks, CACHE_TTL.TASKS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
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
      
      // Try to get tasks from cache first
      const cacheKey = `tasks:week:${firstWeek.id}`;
      const cachedTasks = serverCache.get(cacheKey);
      
      if (cachedTasks) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedTasks);
      }
      
      // Cache miss, fetch from database
      const tasks = await storage.getTasksByWeek(firstWeek.id);
      
      // Cache for configured TTL
      serverCache.set(cacheKey, tasks, CACHE_TTL.TASKS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });
  
  // Create the server
  const server = createServer(app);
  return server;
}
