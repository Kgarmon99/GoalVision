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
  type InsertWeek
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, sql } from "drizzle-orm";

// Added for goal dependencies
import { createTable, integer, varchar, uniqueIndex } from 'drizzle-orm/pg-core';
import { pgTableCreator } from 'drizzle-orm/pg';

export interface GoalDependency {
  id: number;
  goalId: number;
  dependsOnGoalId: number;
}

export interface InsertGoalDependency {
  goalId: number;
  dependsOnGoalId: number;
}


const goalDependencies = pgTableCreator('goal_dependencies')({
  id: integer('id').primaryKey().autoincrement(),
  goalId: integer('goal_id').notNull(),
  dependsOnGoalId: integer('depends_on_goal_id').notNull(),
  uniqueIndex: uniqueIndex('unique_dependency').on(['goalId', 'dependsOnGoalId'])
});


// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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

  // Week methods
  getAllWeeks(): Promise<Week[]>;
  getWeek(id: number): Promise<Week | undefined>;
  createWeek(week: InsertWeek): Promise<Week>;
  updateWeek(id: number, week: Partial<InsertWeek>): Promise<Week | undefined>;

  // Goal Dependency methods
  getGoalDependencies(goalId: number): Promise<GoalDependency[]>;
  getGoalDependents(goalId: number): Promise<GoalDependency[]>;
  createGoalDependency(data: InsertGoalDependency): Promise<GoalDependency>;
  updateGoalDependency(id: number, data: Partial<InsertGoalDependency>): Promise<GoalDependency | undefined>;
  deleteGoalDependency(id: number): Promise<boolean>;
  getGoalWithDependencies(id: number): Promise<{goal: Goal, dependencies: (GoalDependency & {dependsOnGoal: Goal})[], dependents: (GoalDependency & {goal: Goal})[]}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private goalsData: Map<number, Goal>;
  private metricsData: Map<number, Metric>;
  private goalStatusData: Map<number, GoalStatus>;
  private executionTasksData: Map<number, ExecutionTask>;
  private weeksData: Map<number, Week>;
  private goalDependenciesData: Map<number, GoalDependency>;

  private currentUserId: number;
  private currentGoalId: number;
  private currentMetricId: number;
  private currentGoalStatusId: number;
  private currentExecutionTaskId: number;
  private currentWeekId: number;
  private currentGoalDependencyId: number;

  constructor() {
    this.users = new Map();
    this.goalsData = new Map();
    this.metricsData = new Map();
    this.goalStatusData = new Map();
    this.executionTasksData = new Map();
    this.weeksData = new Map();
    this.goalDependenciesData = new Map();

    this.currentUserId = 1;
    this.currentGoalId = 1;
    this.currentMetricId = 1;
    this.currentGoalStatusId = 1;
    this.currentExecutionTaskId = 1;
    this.currentWeekId = 1;
    this.currentGoalDependencyId = 1;

    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    // Goals
    const sampleGoals: InsertGoal[] = [
      { name: "Funding", current: 3.2, target: 10, unit: "M", color: "primary" },
      { name: "Revenue", current: 28.5, target: 100, unit: "M", color: "primary" },
      { name: "User Growth", current: 42.8, target: 100, unit: "M", color: "primary" },
      { name: "School Expansion", current: 2145, target: 10000, unit: "", color: "primary" },
    ];

    sampleGoals.forEach(goal => this.createGoal(goal));

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

    [...growthMetrics, ...revenueMetrics].forEach(metric => this.createMetric(metric));

    // Goal Statuses
    const statuses: InsertGoalStatus[] = [
      { goalId: 3, goalName: "User Growth", status: "on-track" },
      { goalId: 2, goalName: "Revenue", status: "needs-attention" },
      { goalId: 1, goalName: "Funding", status: "on-track" },
      { goalId: 4, goalName: "School Expansion", status: "off-track" },
    ];

    statuses.forEach(status => this.createGoalStatus(status));

    // Week
    const week: InsertWeek = {
      number: 24,
      dateRange: "June 10 - 16, 2024",
      completionRate: 78,
    };

    const createdWeek = this.createWeek(week);

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

    tasks.forEach(task => this.createTask(task));
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const goal: Goal = { ...insertGoal, id };
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
    const metric: Metric = { ...insertMetric, id };
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
    const task: ExecutionTask = { ...insertTask, id };
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

  // Week methods
  async getAllWeeks(): Promise<Week[]> {
    return Array.from(this.weeksData.values());
  }

  async getWeek(id: number): Promise<Week | undefined> {
    return this.weeksData.get(id);
  }

  async createWeek(insertWeek: InsertWeek): Promise<Week> {
    const id = this.currentWeekId++;
    const week: Week = { ...insertWeek, id };
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

  //Added methods for goal dependencies
  async getGoalDependencies(goalId: number): Promise<GoalDependency[]> {
    return Array.from(this.goalDependenciesData.values()).filter(dep => dep.goalId === goalId);
  }
  async getGoalDependents(goalId: number): Promise<GoalDependency[]> {
    return Array.from(this.goalDependenciesData.values()).filter(dep => dep.dependsOnGoalId === goalId);
  }
  async createGoalDependency(data: InsertGoalDependency): Promise<GoalDependency> {
    const id = this.currentGoalDependencyId++;
    const dependency: GoalDependency = { ...data, id };
    this.goalDependenciesData.set(id, dependency);
    return dependency;
  }
  async updateGoalDependency(id: number, data: Partial<InsertGoalDependency>): Promise<GoalDependency | undefined> {
    const existingDependency = this.goalDependenciesData.get(id);
    if (!existingDependency) return undefined;

    const updatedDependency = { ...existingDependency, ...data };
    this.goalDependenciesData.set(id, updatedDependency);
    return updatedDependency;
  }
  async deleteGoalDependency(id: number): Promise<boolean> {
    return this.goalDependenciesData.delete(id);
  }
  async getGoalWithDependencies(id: number): Promise<{goal: Goal; dependencies: (GoalDependency & { dependsOnGoal: Goal; })[]; dependents: (GoalDependency & { goal: Goal; })[];}> {
    const goal = await this.getGoal(id);
    if (!goal) throw new Error("Goal not found");

    const dependencies = await this.getGoalDependencies(id);
    const dependents = await this.getGoalDependents(id);

    return {
      goal,
      dependencies: dependencies,
      dependents: dependents
    };
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

  async getGoalDependencies(goalId: number): Promise<GoalDependency[]> {
    return db.select().from(goalDependencies).where(eq(goalDependencies.goalId, goalId));
  }

  async getGoalDependents(goalId: number): Promise<GoalDependency[]> {
    return db.select().from(goalDependencies).where(eq(goalDependencies.dependsOnGoalId, goalId));
  }

  async createGoalDependency(data: InsertGoalDependency): Promise<GoalDependency> {
    const [dependency] = await db.insert(goalDependencies).values(data).returning();
    return dependency;
  }

  async updateGoalDependency(id: number, data: Partial<InsertGoalDependency>): Promise<GoalDependency | undefined> {
    const [updatedDependency] = await db
      .update(goalDependencies)
      .set(data)
      .where(eq(goalDependencies.id, id))
      .returning();
    return updatedDependency;
  }

  async deleteGoalDependency(id: number): Promise<boolean> {
    const result = await db.delete(goalDependencies).where(eq(goalDependencies.id, id));
    return result.length > 0;
  }

  async getGoalWithDependencies(id: number): Promise<{goal: Goal, dependencies: (GoalDependency & {dependsOnGoal: Goal})[], dependents: (GoalDependency & {goal: Goal})[]}> {
    const goal = await this.getGoal(id);
    if (!goal) throw new Error("Goal not found");

    // Get dependencies (goals this one depends on)
    const dependencies = await db.select()
      .from(goalDependencies)
      .where(eq(goalDependencies.goalId, id))
      .leftJoin(goals, eq(goalDependencies.dependsOnGoalId, goals.id));

    // Get dependents (goals that depend on this one)
    const dependents = await db.select()
      .from(goalDependencies)
      .where(eq(goalDependencies.dependsOnGoalId, id))
      .leftJoin(goals, eq(goalDependencies.goalId, goals.id));

    return {
      goal,
      dependencies: dependencies.map(d => ({
        ...d.goal_dependencies,
        dependsOnGoal: d.goals
      })),
      dependents: dependents.map(d => ({
        ...d.goal_dependencies,
        goal: d.goals
      }))
    };
  }

  // Initialize database with sample data (added goal dependency initialization)
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

      // Add some sample goal dependencies after goals are created.
      const goalDependenciesToCreate: InsertGoalDependency[] = [
        { goalId: goalMap.get("Revenue") || 2, dependsOnGoalId: goalMap.get("Funding") || 1 }, // Revenue depends on Funding
        { goalId: goalMap.get("School Expansion") || 4, dependsOnGoalId: goalMap.get("Revenue") || 2 }, // School Expansion depends on Revenue
      ];

      await Promise.all(goalDependenciesToCreate.map(dep => this.createGoalDependency(dep)));
    }
  }
}

// Create a database storage instance
export const storage = new DatabaseStorage();

// Initialize the database with sample data
storage.initializeData().catch(console.error);