import { 
  users, 
  type User, 
  type InsertUser,
  goals,
  type Goal,
  type InsertGoal,
  metrics,
  type Metric,
  type InsertMetric,
  goalStatus,
  type GoalStatus,
  type InsertGoalStatus,
  executionTasks,
  type ExecutionTask,
  type InsertExecutionTask,
  weeks,
  type Week,
  type InsertWeek,
  subtasks,
  prospects,
  type Prospect,
  type InsertProspect,
  type Subtask,
  type InsertSubtask,
  oodaLoops,
  type OodaLoop,
  type InsertOodaLoop,
  oodaOpportunities,
  type OodaOpportunity,
  type InsertOodaOpportunity,
  dailyMoves,
  type DailyMove,
  type InsertDailyMove,
  regions,
  type Region,
  type InsertRegion,
  schools,
  type School,
  type InsertSchool
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>; 
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLocation(id: number, latitude: number, longitude: number, country: string, city: string): Promise<User | undefined>;
  
  // Goal methods
  getAllGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Metric methods
  getAllMetrics(): Promise<Metric[]>;
  getMetricsByCategory(category: string): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined>;
  
  // Goal Status methods
  getAllGoalStatuses(): Promise<GoalStatus[]>;
  updateGoalStatus(id: number, status: Partial<InsertGoalStatus>): Promise<GoalStatus | undefined>;
  createGoalStatus(status: InsertGoalStatus): Promise<GoalStatus>;
  
  // Execution Task methods
  getTasksByWeek(weekId: number): Promise<ExecutionTask[]>;
  getAllTasks(): Promise<ExecutionTask[]>;
  getTask(id: number): Promise<ExecutionTask | undefined>;
  createTask(task: InsertExecutionTask): Promise<ExecutionTask>;
  updateTask(id: number, task: Partial<InsertExecutionTask>): Promise<ExecutionTask | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Subtask methods
  getSubtasksByParentId(parentTaskId: number): Promise<Subtask[]>;
  getAllSubtasks(): Promise<Subtask[]>;
  getSubtask(id: number): Promise<Subtask | undefined>;
  createSubtask(subtask: InsertSubtask): Promise<Subtask>;
  updateSubtask(id: number, subtask: Partial<InsertSubtask>): Promise<Subtask | undefined>;
  deleteSubtask(id: number): Promise<boolean>;
  
  // Week methods
  getAllWeeks(): Promise<Week[]>;
  getWeek(id: number): Promise<Week | undefined>;
  createWeek(week: InsertWeek): Promise<Week>;
  updateWeek(id: number, week: Partial<InsertWeek>): Promise<Week | undefined>;
  
  // Prospect methods
  getAllProspects(): Promise<Prospect[]>;
  getProspect(id: number): Promise<Prospect | undefined>;
  getTopProspects(limit: number): Promise<Prospect[]>;
  createProspect(prospect: InsertProspect): Promise<Prospect>;
  updateProspect(id: number, prospect: Partial<InsertProspect>): Promise<Prospect | undefined>;
  deleteProspect(id: number): Promise<boolean>;
  
  // Region methods
  getAllRegions(): Promise<Region[]>;
  getRegion(id: number): Promise<Region | undefined>;
  getRegionByNumber(regionNumber: number): Promise<Region | undefined>;
  updateRegion(id: number, region: Partial<InsertRegion>): Promise<Region | undefined>;
  
  // OODA Loop methods
  getTodayOodaLoop(): Promise<OodaLoop | undefined>;
  createOodaLoop(loop: InsertOodaLoop): Promise<OodaLoop>;
  updateOodaLoop(id: number, loop: Partial<InsertOodaLoop>): Promise<OodaLoop | undefined>;
  getOodaStreak(): Promise<number>;
  
  // OODA Opportunities methods
  getTopOodaOpportunities(limit: number): Promise<OodaOpportunity[]>;
  createOodaOpportunity(opportunity: InsertOodaOpportunity): Promise<OodaOpportunity>;
  updateOodaOpportunity(id: number, opportunity: Partial<InsertOodaOpportunity>): Promise<OodaOpportunity | undefined>;
  
  // Daily Moves methods
  getTodayDailyMove(): Promise<DailyMove | undefined>;
  createDailyMove(move: InsertDailyMove): Promise<DailyMove>;
  updateDailyMove(id: number, move: Partial<InsertDailyMove>): Promise<DailyMove | undefined>;
  getRecentMoves(limit: number): Promise<DailyMove[]>;
  
  // School methods
  getAllSchools(): Promise<School[]>;
  getSchoolsByRegion(regionId: number): Promise<School[]>;
  getSchool(id: number): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined>;
  deleteSchool(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goalsData: Map<number, Goal>;
  private metricsData: Map<number, Metric>;
  private goalStatusData: Map<number, GoalStatus>;
  private executionTasksData: Map<number, ExecutionTask>;
  private subtasksData: Map<number, Subtask>;
  private weeksData: Map<number, Week>;
  private prospectsData: Map<number, Prospect>;

  
  private currentUserId: number;
  private currentGoalId: number;
  private currentMetricId: number;
  private currentGoalStatusId: number;
  private currentExecutionTaskId: number;
  private currentSubtaskId: number;
  private currentWeekId: number;
  private currentProspectId: number;


  constructor() {
    this.users = new Map();
    this.goalsData = new Map();
    this.metricsData = new Map();
    this.goalStatusData = new Map();
    this.executionTasksData = new Map();
    this.subtasksData = new Map();
    this.weeksData = new Map();
    this.prospectsData = new Map();

    
    this.currentUserId = 1;
    this.currentGoalId = 1;
    this.currentMetricId = 1;
    this.currentGoalStatusId = 1;
    this.currentExecutionTaskId = 1;
    this.currentSubtaskId = 1;
    this.currentWeekId = 1;
    this.currentProspectId = 1;

    
    // Call initializeData as async function
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    // Initialize with sample data
    // Goals
    const sampleGoals: InsertGoal[] = [
      { name: "Funding", current: 3.2, target: 10, unit: "M", color: "primary" },
      { name: "Revenue", current: 28.5, target: 100, unit: "M", color: "primary" },
      { name: "User Growth", current: 42.8, target: 100, unit: "M", color: "primary" },
      { name: "School Expansion", current: 2145, target: 10000, unit: "", color: "primary" },
    ];
    
    const createdGoals = [];
    for (const goal of sampleGoals) {
      createdGoals.push(await this.createGoal(goal));
    }
    
    // Metrics
    const growthMetrics: InsertMetric[] = [
      { name: "Monthly Active Users", value: "32.6M", previousValue: "31.6M", trend: 3.2, trendDirection: "up", category: "growth" },
      { name: "User Retention Rate", value: "87.3%", previousValue: "86.1%", trend: 1.5, trendDirection: "up", category: "growth" },
      { name: "Net Promoter Score", value: "72", previousValue: "69", trend: 4.0, trendDirection: "up", category: "growth" },
      { name: "School Onboarding Rate", value: "876/month", previousValue: "1000/month", trend: -12.4, trendDirection: "down", category: "growth" },
    ];
    
    const revenueMetrics: InsertMetric[] = [
      { name: "Monthly Recurring Revenue", value: "$2.37M", previousValue: "$2.20M", trend: 7.8, trendDirection: "up", category: "revenue" },
      { name: "Annual Recurring Revenue", value: "$28.5M", previousValue: "$26.7M", trend: 6.9, trendDirection: "up", category: "revenue" },
      { name: "Average Revenue Per User", value: "$5.12", previousValue: "$5.01", trend: 2.3, trendDirection: "up", category: "revenue" },
      { name: "Churn Rate", value: "1.2%", previousValue: "1.5%", trend: 0.3, trendDirection: "up", category: "revenue" },
    ];
    
    for (const metric of [...growthMetrics, ...revenueMetrics]) {
      await this.createMetric(metric);
    }
    
    // Goal Statuses
    const statuses: InsertGoalStatus[] = [
      { goalId: 3, goalName: "User Growth", status: "on-track" },
      { goalId: 2, goalName: "Revenue", status: "needs-attention" },
      { goalId: 1, goalName: "Funding", status: "on-track" },
      { goalId: 4, goalName: "School Expansion", status: "off-track" },
    ];
    
    for (const status of statuses) {
      await this.createGoalStatus(status);
    }
    
    // Week
    const week: InsertWeek = {
      number: 24,
      dateRange: "June 10 - 16, 2024",
      completionRate: 78,
    };
    
    const createdWeek = await this.createWeek(week);
    
    // Tasks
    const tasks: InsertExecutionTask[] = [
      { 
        task: "Finalize investor pitch deck", 
        owner: "Sarah Thompson", 
        ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        goalCategory: "Funding", 
        categoryColor: "blue", 
        dueDate: "June 12, 2024", 
        status: "done",
        weekId: createdWeek.id
      },
      { 
        task: "Complete partnership agreement with EdTech Alliance", 
        owner: "Michael Rodriguez", 
        ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        goalCategory: "School Expansion", 
        categoryColor: "indigo", 
        dueDate: "June 15, 2024", 
        status: "in-progress",
        weekId: createdWeek.id
      },
      { 
        task: "Launch revenue optimization A/B test", 
        owner: "James Wilson", 
        ownerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        goalCategory: "Revenue", 
        categoryColor: "purple", 
        dueDate: "June 14, 2024", 
        status: "missed",
        weekId: createdWeek.id
      },
      { 
        task: "User onboarding flow optimization", 
        owner: "Emily Chen", 
        ownerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
        goalCategory: "User Growth", 
        categoryColor: "green", 
        dueDate: "June 16, 2024", 
        status: "done",
        weekId: createdWeek.id
      },
    ];
    
    const createdTasks = [];
    for (const task of tasks) {
      createdTasks.push(await this.createTask(task));
    }
    
    // Sample Subtasks for the first task
    if (createdTasks.length > 0) {
      const sampleSubtasks: InsertSubtask[] = [
        { 
          parentTaskId: createdTasks[0].id, 
          description: "Create executive summary", 
          completed: true, 
          priority: "high" 
        },
        { 
          parentTaskId: createdTasks[0].id, 
          description: "Develop financial projections", 
          completed: true, 
          priority: "high" 
        },
        { 
          parentTaskId: createdTasks[0].id, 
          description: "Design slide deck", 
          completed: true, 
          priority: "medium" 
        },
        { 
          parentTaskId: createdTasks[0].id, 
          description: "Rehearse presentation", 
          completed: false, 
          priority: "medium" 
        }
      ];
      
      for (const subtask of sampleSubtasks) {
        await this.createSubtask(subtask);
      }
    }
    
    // Sample prospects
    const sampleProspects: InsertProspect[] = [
      {
        name: "Bowling Green Junior High",
        organization: "Bowling Green Public Schools",
        value: 250000.00,
        probability: 85.0,
        stage: "negotiation",
        expectedCloseDate: "2024-08-15",
        notes: "High priority district with 1200+ students. Key decision maker is Principal Sarah Johnson.",
        priority: 10
      },
      {
        name: "Summit Private Academy",
        organization: "Summit Education Group",
        value: 180000.00,
        probability: 70.0,
        stage: "initial",
        expectedCloseDate: "2024-09-30",
        notes: "Prestigious private school chain, looking to implement our system across 5 campuses.",
        priority: 8
      },
      {
        name: "Westside School District",
        organization: "Westside Unified Schools",
        value: 350000.00,
        probability: 60.0,
        stage: "negotiation",
        expectedCloseDate: "2024-10-15",
        notes: "Large district with 15 schools. Budget approval pending.",
        priority: 7
      },
      {
        name: "Riverdale Elementary",
        organization: "Riverdale School System",
        value: 120000.00,
        probability: 90.0,
        stage: "closing",
        expectedCloseDate: "2024-07-30",
        notes: "Contract nearly finalized, just waiting on final signatures.",
        priority: 9
      },
      {
        name: "Tech Prep Institute",
        organization: "Future Tech Education",
        value: 200000.00,
        probability: 40.0,
        stage: "initial",
        expectedCloseDate: "2024-11-20",
        notes: "Innovative tech-focused charter school. Early discussions.",
        priority: 5
      }
    ];
    
    for (const prospect of sampleProspects) {
      await this.createProspect(prospect);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      latitude: insertUser.latitude ?? null,
      longitude: insertUser.longitude ?? null,
      country: insertUser.country ?? null,
      city: insertUser.city ?? null,
      lastActive: new Date(),
      goalsCreated: insertUser.goalsCreated ?? null,
      tasksCompleted: insertUser.tasksCompleted ?? null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserLocation(id: number, latitude: number, longitude: number, country: string, city: string): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      latitude, 
      longitude, 
      country, 
      city,
      lastActive: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Goal methods
  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goalsData.values());
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goalsData.get(id);
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const goal: Goal = { 
      ...insertGoal, 
      id,
      unit: insertGoal.unit ?? null,
      color: insertGoal.color ?? null,
      deadline: insertGoal.deadline ?? null
    };
    this.goalsData.set(id, goal);
    return goal;
  }
  
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existingGoal = this.goalsData.get(id);
    if (!existingGoal) return undefined;
    
    const updatedGoal = { ...existingGoal, ...goal };
    this.goalsData.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goalsData.delete(id);
  }
  
  // Metric methods
  async getAllMetrics(): Promise<Metric[]> {
    return Array.from(this.metricsData.values());
  }
  
  async getMetricsByCategory(category: string): Promise<Metric[]> {
    return Array.from(this.metricsData.values()).filter(metric => metric.category === category);
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.currentMetricId++;
    const metric: Metric = { 
      ...insertMetric, 
      id,
      previousValue: insertMetric.previousValue ?? null,
      trend: insertMetric.trend ?? null,
      trendDirection: insertMetric.trendDirection ?? null
    };
    this.metricsData.set(id, metric);
    return metric;
  }
  
  async updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined> {
    const existingMetric = this.metricsData.get(id);
    if (!existingMetric) return undefined;
    
    const updatedMetric = { ...existingMetric, ...metric };
    this.metricsData.set(id, updatedMetric);
    return updatedMetric;
  }
  
  // Goal Status methods
  async getAllGoalStatuses(): Promise<GoalStatus[]> {
    return Array.from(this.goalStatusData.values());
  }
  
  async updateGoalStatus(id: number, status: Partial<InsertGoalStatus>): Promise<GoalStatus | undefined> {
    const existingStatus = this.goalStatusData.get(id);
    if (!existingStatus) return undefined;
    
    const updatedStatus = { ...existingStatus, ...status };
    this.goalStatusData.set(id, updatedStatus);
    return updatedStatus;
  }
  
  async createGoalStatus(insertStatus: InsertGoalStatus): Promise<GoalStatus> {
    const id = this.currentGoalStatusId++;
    const status: GoalStatus = { ...insertStatus, id };
    this.goalStatusData.set(id, status);
    return status;
  }
  
  // Execution Task methods
  async getTasksByWeek(weekId: number): Promise<ExecutionTask[]> {
    return Array.from(this.executionTasksData.values()).filter(task => task.weekId === weekId);
  }
  
  async getAllTasks(): Promise<ExecutionTask[]> {
    return Array.from(this.executionTasksData.values());
  }
  
  async getTask(id: number): Promise<ExecutionTask | undefined> {
    return this.executionTasksData.get(id);
  }
  
  async createTask(insertTask: InsertExecutionTask): Promise<ExecutionTask> {
    const id = this.currentExecutionTaskId++;
    const task: ExecutionTask = {
      ...insertTask,
      id,
      ownerAvatar: insertTask.ownerAvatar ?? null,
      categoryColor: insertTask.categoryColor ?? null
    };
    this.executionTasksData.set(id, task);
    return task;
  }
  
  async updateTask(id: number, task: Partial<InsertExecutionTask>): Promise<ExecutionTask | undefined> {
    const existingTask = this.executionTasksData.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.executionTasksData.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.executionTasksData.delete(id);
  }
  
  // Subtask methods
  async getSubtasksByParentId(parentTaskId: number): Promise<Subtask[]> {
    return Array.from(this.subtasksData.values()).filter(subtask => subtask.parentTaskId === parentTaskId);
  }
  
  async getAllSubtasks(): Promise<Subtask[]> {
    return Array.from(this.subtasksData.values());
  }
  
  async getSubtask(id: number): Promise<Subtask | undefined> {
    return this.subtasksData.get(id);
  }
  
  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    const id = this.currentSubtaskId++;
    const subtask: Subtask = { 
      ...insertSubtask, 
      id, 
      completed: insertSubtask.completed ?? false,
      createdAt: new Date(),
      priority: insertSubtask.priority ?? "medium"
    };
    this.subtasksData.set(id, subtask);
    return subtask;
  }
  
  async updateSubtask(id: number, subtask: Partial<InsertSubtask>): Promise<Subtask | undefined> {
    const existingSubtask = this.subtasksData.get(id);
    if (!existingSubtask) return undefined;
    
    const updatedSubtask = { ...existingSubtask, ...subtask };
    this.subtasksData.set(id, updatedSubtask);
    return updatedSubtask;
  }
  
  async deleteSubtask(id: number): Promise<boolean> {
    return this.subtasksData.delete(id);
  }
  
  // Week methods
  async getAllWeeks(): Promise<Week[]> {
    return Array.from(this.weeksData.values());
  }
  
  async getWeek(id: number): Promise<Week | undefined> {
    return this.weeksData.get(id);
  }
  
  async createWeek(insertWeek: InsertWeek): Promise<Week> {
    const id = this.currentWeekId++;
    const week: Week = { 
      ...insertWeek, 
      id,
      completionRate: insertWeek.completionRate ?? null 
    };
    this.weeksData.set(id, week);
    return week;
  }
  
  async updateWeek(id: number, week: Partial<InsertWeek>): Promise<Week | undefined> {
    const existingWeek = this.weeksData.get(id);
    if (!existingWeek) return undefined;
    
    const updatedWeek = { ...existingWeek, ...week };
    this.weeksData.set(id, updatedWeek);
    return updatedWeek;
  }
  
  // Prospect methods
  async getAllProspects(): Promise<Prospect[]> {
    return Array.from(this.prospectsData.values());
  }
  
  async getProspect(id: number): Promise<Prospect | undefined> {
    return this.prospectsData.get(id);
  }
  
  async getTopProspects(limit: number): Promise<Prospect[]> {
    // Sort prospects by priority (high to low) and probability (high to low)
    return Array.from(this.prospectsData.values())
      .filter(prospect => prospect.stage !== "won" && prospect.stage !== "lost") // Only include active prospects
      .sort((a, b) => {
        // First sort by priority
        const aPriority = a.priority ?? 0;
        const bPriority = b.priority ?? 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        // Then by probability
        return b.probability - a.probability; // Higher probability first
      })
      .slice(0, limit);
  }
  
  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const id = this.currentProspectId++;
    const prospect: Prospect = { 
      ...insertProspect, 
      id,
      notes: insertProspect.notes ?? null,
      priority: insertProspect.priority ?? 0
    };
    this.prospectsData.set(id, prospect);
    return prospect;
  }
  
  async updateProspect(id: number, prospect: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const existingProspect = this.prospectsData.get(id);
    if (!existingProspect) return undefined;
    
    const updatedProspect = { ...existingProspect, ...prospect };
    this.prospectsData.set(id, updatedProspect);
    return updatedProspect;
  }
  
  async deleteProspect(id: number): Promise<boolean> {
    return this.prospectsData.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserLocation(id: number, latitude: number, longitude: number, country: string, city: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        latitude,
        longitude,
        country,
        city,
        lastActive: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  // Goal methods
  async getAllGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }
  
  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }
  
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }
  
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db
      .update(goals)
      .set(goal)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return !!result;
  }
  
  // Metric methods
  async getAllMetrics(): Promise<Metric[]> {
    return await db.select().from(metrics);
  }
  
  async getMetricsByCategory(category: string): Promise<Metric[]> {
    return await db.select().from(metrics).where(eq(metrics.category, category));
  }
  
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const [metric] = await db.insert(metrics).values(insertMetric).returning();
    return metric;
  }
  
  async updateMetric(id: number, metric: Partial<InsertMetric>): Promise<Metric | undefined> {
    const [updatedMetric] = await db
      .update(metrics)
      .set(metric)
      .where(eq(metrics.id, id))
      .returning();
    return updatedMetric;
  }
  
  // Goal Status methods
  async getAllGoalStatuses(): Promise<GoalStatus[]> {
    return await db.select().from(goalStatus);
  }
  
  async updateGoalStatus(id: number, status: Partial<InsertGoalStatus>): Promise<GoalStatus | undefined> {
    const [updatedStatus] = await db
      .update(goalStatus)
      .set(status)
      .where(eq(goalStatus.id, id))
      .returning();
    return updatedStatus;
  }
  
  async createGoalStatus(insertStatus: InsertGoalStatus): Promise<GoalStatus> {
    const [status] = await db.insert(goalStatus).values(insertStatus).returning();
    return status;
  }
  
  // Execution Task methods
  async getTasksByWeek(weekId: number): Promise<ExecutionTask[]> {
    return await db
      .select()
      .from(executionTasks)
      .where(eq(executionTasks.weekId, weekId));
  }
  
  async getAllTasks(): Promise<ExecutionTask[]> {
    return await db.select().from(executionTasks);
  }
  
  async getTask(id: number): Promise<ExecutionTask | undefined> {
    const [task] = await db
      .select()
      .from(executionTasks)
      .where(eq(executionTasks.id, id));
    return task;
  }
  
  async createTask(insertTask: InsertExecutionTask): Promise<ExecutionTask> {
    const [task] = await db
      .insert(executionTasks)
      .values(insertTask)
      .returning();
    return task;
  }
  
  async updateTask(id: number, task: Partial<InsertExecutionTask>): Promise<ExecutionTask | undefined> {
    const [updatedTask] = await db
      .update(executionTasks)
      .set(task)
      .where(eq(executionTasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(executionTasks).where(eq(executionTasks.id, id));
    return !!result;
  }
  
  // Subtask methods
  async getSubtasksByParentId(parentTaskId: number): Promise<Subtask[]> {
    return await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.parentTaskId, parentTaskId));
  }
  
  async getAllSubtasks(): Promise<Subtask[]> {
    return await db.select().from(subtasks);
  }
  
  async getSubtask(id: number): Promise<Subtask | undefined> {
    const [subtask] = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.id, id));
    return subtask;
  }
  
  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    const [subtask] = await db
      .insert(subtasks)
      .values(insertSubtask)
      .returning();
    return subtask;
  }
  
  async updateSubtask(id: number, subtask: Partial<InsertSubtask>): Promise<Subtask | undefined> {
    const [updatedSubtask] = await db
      .update(subtasks)
      .set(subtask)
      .where(eq(subtasks.id, id))
      .returning();
    return updatedSubtask;
  }
  
  async deleteSubtask(id: number): Promise<boolean> {
    const result = await db.delete(subtasks).where(eq(subtasks.id, id));
    return !!result;
  }
  
  // Week methods
  async getAllWeeks(): Promise<Week[]> {
    return await db.select().from(weeks).orderBy(asc(weeks.number));
  }
  
  async getWeek(id: number): Promise<Week | undefined> {
    const [week] = await db.select().from(weeks).where(eq(weeks.id, id));
    return week;
  }
  
  async createWeek(insertWeek: InsertWeek): Promise<Week> {
    const [week] = await db.insert(weeks).values(insertWeek).returning();
    return week;
  }
  
  async updateWeek(id: number, week: Partial<InsertWeek>): Promise<Week | undefined> {
    const [updatedWeek] = await db
      .update(weeks)
      .set(week)
      .where(eq(weeks.id, id))
      .returning();
    return updatedWeek;
  }
  
  // Prospect methods
  async getAllProspects(): Promise<Prospect[]> {
    return await db.select().from(prospects);
  }
  
  async getProspect(id: number): Promise<Prospect | undefined> {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, id));
    return prospect;
  }
  
  async getTopProspects(limit: number): Promise<Prospect[]> {
    // Get all prospects first, then filter in memory
    const allProspects = await db.select().from(prospects);
    
    // Filter out won/lost prospects and sort by priority, then probability
    return allProspects
      .filter(prospect => prospect.stage !== 'won' && prospect.stage !== 'lost')
      .sort((a, b) => {
        // First sort by priority
        const aPriority = a.priority ?? 0;
        const bPriority = b.priority ?? 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Higher priority first
        }
        // Then by probability
        return b.probability - a.probability; // Higher probability first
      })
      .slice(0, limit);
  }
  
  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const [prospect] = await db.insert(prospects).values(insertProspect).returning();
    return prospect;
  }
  
  async updateProspect(id: number, prospect: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const [updatedProspect] = await db
      .update(prospects)
      .set(prospect)
      .where(eq(prospects.id, id))
      .returning();
    return updatedProspect;
  }
  
  async deleteProspect(id: number): Promise<boolean> {
    const result = await db.delete(prospects).where(eq(prospects.id, id));
    return !!result;
  }
  
  // Region methods
  async getAllRegions(): Promise<Region[]> {
    return await db.select().from(regions).orderBy(asc(regions.regionNumber));
  }
  
  async getRegion(id: number): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.id, id));
    return region;
  }
  
  async getRegionByNumber(regionNumber: number): Promise<Region | undefined> {
    const [region] = await db.select().from(regions).where(eq(regions.regionNumber, regionNumber));
    return region;
  }
  
  async updateRegion(id: number, region: Partial<InsertRegion>): Promise<Region | undefined> {
    const [updatedRegion] = await db
      .update(regions)
      .set(region)
      .where(eq(regions.id, id))
      .returning();
    return updatedRegion;
  }
  
  // School methods
  async getAllSchools(): Promise<School[]> {
    return await db.select().from(schools);
  }
  
  async getSchoolsByRegion(regionId: number): Promise<School[]> {
    return await db
      .select()
      .from(schools)
      .where(eq(schools.regionId, regionId))
      .orderBy(asc(schools.type), asc(schools.name));
  }
  
  async getSchool(id: number): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(eq(schools.id, id));
    return school;
  }
  
  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const [school] = await db.insert(schools).values(insertSchool).returning();
    return school;
  }
  
  async updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined> {
    const [updatedSchool] = await db
      .update(schools)
      .set(school)
      .where(eq(schools.id, id))
      .returning();
    return updatedSchool;
  }
  
  async deleteSchool(id: number): Promise<boolean> {
    const result = await db.delete(schools).where(eq(schools.id, id));
    return !!result;
  }


  // Initialize database with sample data
  async initializeData() {
    // Check if database is empty
    const existingGoals = await this.getAllGoals();
    
    if (existingGoals.length === 0) {
      // Goals
      const sampleGoals: InsertGoal[] = [
        { name: "Funding", current: 3.2, target: 10, unit: "M", color: "primary" },
        { name: "Revenue", current: 28.5, target: 100, unit: "M", color: "primary" },
        { name: "User Growth", current: 42.8, target: 100, unit: "M", color: "primary" },
        { name: "School Expansion", current: 2145, target: 10000, unit: "", color: "primary" },
      ];
      
      const createdGoals = await Promise.all(sampleGoals.map(goal => this.createGoal(goal)));
      
      // Metrics
      const growthMetrics: InsertMetric[] = [
        { 
          name: "Monthly Active Users", 
          value: "32.6M", 
          previousValue: "31.6M", 
          trend: 3.2, 
          trendDirection: "up", 
          category: "growth" 
        },
        { 
          name: "User Retention Rate", 
          value: "87.3%", 
          previousValue: "86.1%", 
          trend: 1.5, 
          trendDirection: "up", 
          category: "growth" 
        },
        { 
          name: "Net Promoter Score", 
          value: "72", 
          previousValue: "69", 
          trend: 4.0, 
          trendDirection: "up", 
          category: "growth" 
        },
        { 
          name: "School Onboarding Rate", 
          value: "876/month", 
          previousValue: "1000/month", 
          trend: -12.4, 
          trendDirection: "down", 
          category: "growth" 
        },
      ];
      
      const revenueMetrics: InsertMetric[] = [
        { 
          name: "Monthly Recurring Revenue", 
          value: "$2.37M", 
          previousValue: "$2.20M", 
          trend: 7.8, 
          trendDirection: "up", 
          category: "revenue" 
        },
        { 
          name: "Annual Recurring Revenue", 
          value: "$28.5M", 
          previousValue: "$26.7M", 
          trend: 6.9, 
          trendDirection: "up", 
          category: "revenue" 
        },
        { 
          name: "Average Revenue Per User", 
          value: "$5.12", 
          previousValue: "$5.01", 
          trend: 2.3, 
          trendDirection: "up", 
          category: "revenue" 
        },
        { 
          name: "Churn Rate", 
          value: "1.2%", 
          previousValue: "1.5%", 
          trend: 0.3, 
          trendDirection: "up", 
          category: "revenue" 
        },
      ];
      
      await Promise.all([...growthMetrics, ...revenueMetrics].map(metric => this.createMetric(metric)));
      
      // Week
      const week: InsertWeek = {
        number: 24,
        dateRange: "June 10 - 16, 2024",
        completionRate: 78,
      };
      
      const createdWeek = await this.createWeek(week);
      
      // Goal Statuses - add with goalId
      const goalMap = new Map(createdGoals.map(goal => [goal.name, goal.id]));
      
      const statuses: InsertGoalStatus[] = [
        { goalId: goalMap.get("User Growth") || 3, goalName: "User Growth", status: "on-track" },
        { goalId: goalMap.get("Revenue") || 2, goalName: "Revenue", status: "needs-attention" },
        { goalId: goalMap.get("Funding") || 1, goalName: "Funding", status: "on-track" },
        { goalId: goalMap.get("School Expansion") || 4, goalName: "School Expansion", status: "off-track" },
      ];
      
      await Promise.all(statuses.map(status => this.createGoalStatus(status)));
      
      // Tasks
      const tasks: InsertExecutionTask[] = [
        { 
          task: "Finalize investor pitch deck", 
          owner: "Sarah Thompson", 
          ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
          goalCategory: "Funding", 
          categoryColor: "blue", 
          dueDate: "June 12, 2024", 
          status: "done",
          weekId: createdWeek.id
        },
        { 
          task: "Complete partnership agreement with EdTech Alliance", 
          owner: "Michael Rodriguez", 
          ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
          goalCategory: "School Expansion", 
          categoryColor: "indigo", 
          dueDate: "June 15, 2024", 
          status: "in-progress",
          weekId: createdWeek.id
        },
        { 
          task: "Launch revenue optimization A/B test", 
          owner: "James Wilson", 
          ownerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
          goalCategory: "Revenue", 
          categoryColor: "purple", 
          dueDate: "June 14, 2024", 
          status: "missed",
          weekId: createdWeek.id
        },
        { 
          task: "User onboarding flow optimization", 
          owner: "Emily Chen", 
          ownerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
          goalCategory: "User Growth", 
          categoryColor: "green", 
          dueDate: "June 16, 2024", 
          status: "done",
          weekId: createdWeek.id
        },
      ];
      
      await Promise.all(tasks.map(task => this.createTask(task)));
      
      // Sample prospects
      const sampleProspects: InsertProspect[] = [
        {
          name: "Bowling Green Junior High",
          organization: "Bowling Green Public Schools",
          value: 250000.00,
          probability: 85.0,
          stage: "negotiation",
          expectedCloseDate: "2024-08-15",
          notes: "High priority district with 1200+ students. Key decision maker is Principal Sarah Johnson.",
          priority: 10
        },
        {
          name: "Summit Private Academy",
          organization: "Summit Education Group",
          value: 180000.00,
          probability: 70.0,
          stage: "initial",
          expectedCloseDate: "2024-09-30",
          notes: "Prestigious private school chain, looking to implement our system across 5 campuses.",
          priority: 8
        },
        {
          name: "Westside School District",
          organization: "Westside Unified Schools",
          value: 350000.00,
          probability: 60.0,
          stage: "negotiation",
          expectedCloseDate: "2024-10-15",
          notes: "Large district with 15 schools. Budget approval pending.",
          priority: 7
        },
        {
          name: "Riverdale Elementary",
          organization: "Riverdale School System",
          value: 120000.00,
          probability: 90.0,
          stage: "closing",
          expectedCloseDate: "2024-07-30",
          notes: "Contract nearly finalized, just waiting on final signatures.",
          priority: 9
        },
        {
          name: "Tech Prep Institute",
          organization: "Future Tech Education",
          value: 200000.00,
          probability: 40.0,
          stage: "initial",
          expectedCloseDate: "2024-11-20",
          notes: "Innovative tech-focused charter school. Early discussions.",
          priority: 5
        }
      ];
      
      await Promise.all(sampleProspects.map(prospect => this.createProspect(prospect)));
    }
  }
}

// Create a database storage instance
export const storage = new DatabaseStorage();

// Initialize the database with sample data
storage.initializeData().catch(console.error);
