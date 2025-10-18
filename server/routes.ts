import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertGoalSchema, 
  insertMetricSchema, 
  insertGoalStatusSchema, 
  insertUserSchema,
  insertProspectSchema,
  insertRegionSchema,
  insertSchoolSchema,
  goals,
  metrics,
  goalStatus,
  users,
  prospects,
  regions,
  schools,
  oodaOpportunities,
  dailyMoves
} from "@shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
import path from "path";

// Simple server-side cache implementation to reduce database load
// Cache entries expire after specified time to ensure data freshness
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// Cache configuration constants - Simplified for MoneyBot dashboard
const CACHE_TTL = {
  GOALS: 5 * 60 * 1000,         // 5 minutes for goals data
  METRICS: 10 * 60 * 1000,      // 10 minutes for metrics (changes less frequently)
  USERS: 15 * 60 * 1000,        // 15 minutes for users data
  GOAL_STATUSES: 5 * 60 * 1000, // 5 minutes for goal statuses
  PROSPECTS: 5 * 60 * 1000,     // 5 minutes for prospect data
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
  
  // Simplified MoneyBot Dashboard - Weekly tasks removed per user request
  
  // Prospect Routes
  
  // Get all prospects
  app.get("/api/prospects", async (req, res) => {
    try {
      // Try to get prospects from cache first
      const cacheKey = "prospects:all";
      const cachedProspects = serverCache.get(cacheKey);
      
      if (cachedProspects) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedProspects);
      }
      
      // Cache miss, fetch from database
      const prospects = await storage.getAllProspects();
      
      // Cache for 5 minutes
      serverCache.set(cacheKey, prospects, CACHE_TTL.GOALS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(prospects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prospects" });
    }
  });
  
  // Get top prospects
  app.get("/api/prospects/top/:limit?", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit || "3");
      
      // Try to get top prospects from cache first
      const cacheKey = `prospects:top:${limit}`;
      const cachedProspects = serverCache.get(cacheKey);
      
      if (cachedProspects) {
        // Set cache header to inform client
        res.set('X-Cache', 'HIT');
        return res.json(cachedProspects);
      }
      
      // Cache miss, fetch from database
      const prospects = await storage.getTopProspects(limit);
      
      // Cache for 5 minutes
      serverCache.set(cacheKey, prospects, CACHE_TTL.GOALS);
      
      // Set cache header
      res.set('X-Cache', 'MISS');
      res.json(prospects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching top prospects" });
    }
  });
  
  // Get a specific prospect
  app.get("/api/prospects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prospect = await storage.getProspect(id);
      
      if (!prospect) {
        return res.status(404).json({ message: "Prospect not found" });
      }
      
      res.json(prospect);
    } catch (error) {
      res.status(500).json({ message: "Error fetching prospect" });
    }
  });
  
  // Create a prospect
  app.post("/api/prospects", async (req, res) => {
    try {
      const prospectData = insertProspectSchema.parse(req.body);
      const prospect = await storage.createProspect(prospectData);
      
      // Invalidate caches
      serverCache.invalidate("prospects:all");
      serverCache.invalidateByPrefix("prospects:top:");
      
      res.status(201).json(prospect);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid prospect data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating prospect" });
    }
  });
  
  // Update a prospect
  app.patch("/api/prospects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prospectData = insertProspectSchema.partial().parse(req.body);
      const updatedProspect = await storage.updateProspect(id, prospectData);
      
      if (!updatedProspect) {
        return res.status(404).json({ message: "Prospect not found" });
      }
      
      // Invalidate caches
      serverCache.invalidate("prospects:all");
      serverCache.invalidateByPrefix("prospects:top:");
      
      res.json(updatedProspect);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid prospect data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating prospect" });
    }
  });
  
  // Delete a prospect
  app.delete("/api/prospects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProspect(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Prospect not found" });
      }
      
      // Invalidate caches
      serverCache.invalidate("prospects:all");
      serverCache.invalidateByPrefix("prospects:top:");
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting prospect" });
    }
  });

  // Region Routes
  
  // Get all regions
  app.get("/api/regions", async (req, res) => {
    try {
      const cacheKey = "regions:all";
      const cachedRegions = serverCache.get(cacheKey);
      
      if (cachedRegions) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedRegions);
      }
      
      const regions = await storage.getAllRegions();
      serverCache.set(cacheKey, regions, CACHE_TTL.DEFAULT);
      
      res.set('X-Cache', 'MISS');
      res.json(regions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching regions" });
    }
  });
  
  // Get a specific region
  app.get("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const region = await storage.getRegion(id);
      
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }
      
      res.json(region);
    } catch (error) {
      res.status(500).json({ message: "Error fetching region" });
    }
  });
  
  // Update a region (toggle conquest, update notes, etc.)
  app.patch("/api/regions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const regionData = insertRegionSchema.partial().parse(req.body);
      const updatedRegion = await storage.updateRegion(id, regionData);
      
      if (!updatedRegion) {
        return res.status(404).json({ message: "Region not found" });
      }
      
      // Invalidate cache
      serverCache.invalidate("regions:all");
      
      res.json(updatedRegion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid region data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating region" });
    }
  });

  // School Routes
  
  // Get all schools
  app.get("/api/schools", async (req, res) => {
    try {
      const cacheKey = "schools:all";
      const cachedSchools = serverCache.get(cacheKey);
      
      if (cachedSchools) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedSchools);
      }
      
      const schools = await storage.getAllSchools();
      serverCache.set(cacheKey, schools, CACHE_TTL.DEFAULT);
      
      res.set('X-Cache', 'MISS');
      res.json(schools);
    } catch (error) {
      res.status(500).json({ message: "Error fetching schools" });
    }
  });
  
  // Get schools by region
  app.get("/api/regions/:regionId/schools", async (req, res) => {
    try {
      const regionId = parseInt(req.params.regionId);
      const cacheKey = `schools:region:${regionId}`;
      
      const cachedSchools = serverCache.get(cacheKey);
      if (cachedSchools) {
        res.set('X-Cache', 'HIT');
        return res.json(cachedSchools);
      }
      
      const schools = await storage.getSchoolsByRegion(regionId);
      serverCache.set(cacheKey, schools, CACHE_TTL.DEFAULT);
      
      res.set('X-Cache', 'MISS');
      res.json(schools);
    } catch (error) {
      res.status(500).json({ message: "Error fetching schools for region" });
    }
  });
  
  // Get a specific school
  app.get("/api/schools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const school = await storage.getSchool(id);
      
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      
      res.json(school);
    } catch (error) {
      res.status(500).json({ message: "Error fetching school" });
    }
  });
  
  // Create a new school
  app.post("/api/schools", async (req, res) => {
    try {
      const schoolData = insertSchoolSchema.parse(req.body);
      const newSchool = await storage.createSchool(schoolData);
      
      // Invalidate caches
      serverCache.invalidate("schools:all");
      serverCache.invalidate(`schools:region:${newSchool.regionId}`);
      
      res.status(201).json(newSchool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid school data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating school" });
    }
  });
  
  // Update a school (mark as contacted, update status, etc.)
  app.patch("/api/schools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schoolData = insertSchoolSchema.partial().parse(req.body);
      const updatedSchool = await storage.updateSchool(id, schoolData);
      
      if (!updatedSchool) {
        return res.status(404).json({ message: "School not found" });
      }
      
      // Invalidate caches
      serverCache.invalidate("schools:all");
      serverCache.invalidate(`schools:region:${updatedSchool.regionId}`);
      
      res.json(updatedSchool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid school data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating school" });
    }
  });
  
  // Delete a school
  app.delete("/api/schools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the school first to know which region cache to invalidate
      const school = await storage.getSchool(id);
      if (!school) {
        return res.status(404).json({ message: "School not found" });
      }
      
      const deleted = await storage.deleteSchool(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "School not found" });
      }
      
      // Invalidate caches
      serverCache.invalidate("schools:all");
      serverCache.invalidate(`schools:region:${school.regionId}`);
      
      res.json({ message: "School deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting school" });
    }
  });

  // OODA Loop routes
  app.get("/api/ooda/opportunities/top/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 3;
      const cacheKey = `ooda:opportunities:top:${limit}`;
      
      let opportunities = serverCache.get<any[]>(cacheKey);
      if (!opportunities) {
        opportunities = await db.select().from(oodaOpportunities)
          .orderBy(desc(oodaOpportunities.priority))
          .limit(limit);
        serverCache.set(cacheKey, opportunities, CACHE_TTL.DEFAULT);
      }
      
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching top OODA opportunities" });
    }
  });
  
  app.get("/api/ooda/daily-move/today", async (req, res) => {
    try {
      const cacheKey = "ooda:daily-move:today";
      
      let todayMove = serverCache.get<any>(cacheKey);
      if (!todayMove) {
        const result = await db.select().from(dailyMoves)
          .where(eq(dailyMoves.date, new Date().toISOString().split('T')[0]))
          .limit(1);
        todayMove = result[0] || null;
        serverCache.set(cacheKey, todayMove, CACHE_TTL.DEFAULT);
      }
      
      res.json(todayMove);
    } catch (error) {
      res.status(500).json({ message: "Error fetching today's daily move" });
    }
  });
  
  app.get("/api/ooda/streak", async (req, res) => {
    try {
      const cacheKey = "ooda:streak";
      
      let streak = serverCache.get<number>(cacheKey);
      if (streak === null) {
        // Calculate streak by counting consecutive days with daily moves
        const recentMoves = await db.select().from(dailyMoves)
          .orderBy(desc(dailyMoves.date))
          .limit(30);
        
        streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          const hasMove = recentMoves.some(move => move.date === dateStr);
          if (hasMove) {
            streak++;
          } else {
            break;
          }
        }
        
        serverCache.set(cacheKey, streak, CACHE_TTL.DEFAULT);
      }
      
      res.json({ streak });
    } catch (error) {
      res.status(500).json({ message: "Error fetching OODA streak" });
    }
  });
  

  // Serve MoneyBot logo
  app.get("/moneybot-logo.png", (req, res) => {
    res.sendFile(path.resolve("public/moneybot-logo.png"));
  });

  // Create the server
  const server = createServer(app);
  return server;
}
