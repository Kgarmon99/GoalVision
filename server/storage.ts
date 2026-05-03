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
  type InsertSchool,
  gamificationProfiles,
  type GamificationProfile,
  type InsertGamificationProfile,
  xpEvents,
  type XpEvent,
  type InsertXpEvent,
  achievements,
  type Achievement,
  type InsertAchievement,
  userAchievements,
  type UserAchievement,
  type InsertUserAchievement,
  dailyChallenges,
  type DailyChallenge,
  type InsertDailyChallenge,
  userDailyChallenges,
  type UserDailyChallenge,
  type InsertUserDailyChallenge,
  startupMetrics,
  type StartupMetrics,
  type InsertStartupMetrics,
  startupMetricSnapshots,
  type StartupMetricSnapshot,
  type InsertStartupMetricSnapshot
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
  resetAllSchools(): Promise<void>;
  getSchool(id: number): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined>;
  deleteSchool(id: number): Promise<boolean>;
  
  // Gamification methods
  getOrCreateProfile(userId?: number): Promise<GamificationProfile>;
  updateProfile(id: number, profile: Partial<InsertGamificationProfile>): Promise<GamificationProfile | undefined>;
  addXpEvent(event: InsertXpEvent): Promise<XpEvent>;
  getRecentXpEvents(profileId: number, limit: number): Promise<XpEvent[]>;
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(profileId: number): Promise<UserAchievement[]>;
  unlockAchievement(profileId: number, achievementId: number): Promise<UserAchievement | undefined>;
  updateAchievementProgress(profileId: number, achievementId: number, progress: number): Promise<UserAchievement | undefined>;
  getTodayChallenge(profileId: number): Promise<UserDailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertUserDailyChallenge): Promise<UserDailyChallenge>;
  updateDailyChallengeProgress(id: number, progress: number): Promise<UserDailyChallenge | undefined>;
  completeDailyChallenge(id: number, xpEarned: number): Promise<UserDailyChallenge | undefined>;
  
  // Startup Metrics methods
  getStartupMetrics(): Promise<StartupMetrics | undefined>;
  updateStartupMetrics(metrics: Partial<InsertStartupMetrics>): Promise<StartupMetrics>;
  getMetricSnapshots(limit?: number): Promise<StartupMetricSnapshot[]>;
  createMetricSnapshot(snapshot: InsertStartupMetricSnapshot): Promise<StartupMetricSnapshot>;
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
  private regionsData: Map<number, Region>;
  private schoolsData: Map<number, School>;

  
  private currentUserId: number;
  private currentGoalId: number;
  private currentMetricId: number;
  private currentGoalStatusId: number;
  private currentExecutionTaskId: number;
  private currentSubtaskId: number;
  private currentWeekId: number;
  private currentProspectId: number;
  private currentRegionId: number;
  private currentSchoolId: number;


  constructor() {
    this.users = new Map();
    this.goalsData = new Map();
    this.metricsData = new Map();
    this.goalStatusData = new Map();
    this.executionTasksData = new Map();
    this.subtasksData = new Map();
    this.weeksData = new Map();
    this.prospectsData = new Map();
    this.regionsData = new Map();
    this.schoolsData = new Map();

    
    this.currentUserId = 1;
    this.currentGoalId = 1;
    this.currentMetricId = 1;
    this.currentGoalStatusId = 1;
    this.currentExecutionTaskId = 1;
    this.currentSubtaskId = 1;
    this.currentWeekId = 1;
    this.currentProspectId = 1;
    this.currentRegionId = 1;
    this.currentSchoolId = 1;

    
    // Call initializeData as async function
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    // Initialize with sample data
    // Goals
    const sampleGoals: InsertGoal[] = [
      { name: "Revenue", current: 1.42, target: 20, unit: "M", color: "primary" },
      { name: "Students Served", current: 0.11, target: 5, unit: "M", color: "primary" },
      { name: "School Outreach", current: 110, target: 10000, unit: "", color: "primary" },
    ];
    
    const createdGoals = [];
    for (const goal of sampleGoals) {
      createdGoals.push(await this.createGoal(goal));
    }
    
    // Metrics
    const growthMetrics: InsertMetric[] = [
      { name: "Monthly Active Students", value: "110K", previousValue: "0", trend: 100, trendDirection: "up", category: "growth" },
      { name: "Daily Velocity", value: "1,000/day", previousValue: "0", trend: 0, trendDirection: "neutral", category: "growth" },
    ];
    
    const revenueMetrics: InsertMetric[] = [
      { name: "Monthly Revenue", value: "$1,428", previousValue: "$0", trend: 100, trendDirection: "up", category: "revenue" },
      { name: "ARR Target", value: "$20.0M", previousValue: "$0", trend: 0, trendDirection: "neutral", category: "revenue" },
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
    
    // Initialize regions and schools
    await this.initializeRegionsAndSchools();
  }
  
  // Initialize all KASS regions and schools
  private async initializeRegionsAndSchools() {
    // Initialize all 18 KASS regions
    const kassRegions: InsertRegion[] = [
      { regionNumber: 1, name: "Region 1 - Far West", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 2, name: "Region 2 - West", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 3, name: "Region 3 - Northwest", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 4, name: "Region 4 - Southwest", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 5, name: "Region 5 - West Central", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 6, name: "Region 6 - North Central", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 7, name: "Region 7 - Northern", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 8, name: "Region 8 - Central North", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 9, name: "Region 9 - Northeast", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 10, name: "Region 10 - East", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 11, name: "Region 11 - Far East", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 12, name: "Region 12 - Southeast", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 13, name: "Region 13 - South", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 14, name: "Region 14 - South Central", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 15, name: "Region 15 - South", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 16, name: "Region 16 - South Central", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 17, name: "Region 17 - Central", conquered: false, conqueredDate: null, targetDate: null },
      { regionNumber: 18, name: "Region 18 - Central", conquered: false, conqueredDate: null, targetDate: null },
    ];
    
    // Create regions if they don't exist
    for (const regionData of kassRegions) {
      const existing = Array.from(this.regionsData.values()).find(r => r.regionNumber === regionData.regionNumber);
      if (!existing) {
        await this.createRegion(regionData);
      }
    }
    
    // Initialize schools
    await this.initializeSchools();
  }
  
  // Initialize comprehensive school data for all Kentucky KASS regions
  private async initializeSchools() {
    const existingSchools = await this.getAllSchools();
    if (existingSchools.length > 0) {
      return; // Schools already initialized
    }
    
    // Get all regions to map region numbers to IDs
    const allRegions = await this.getAllRegions();
    const regionMap = new Map(allRegions.map(r => [r.regionNumber, r.id]));
    
    // Get comprehensive Kentucky school data
    const kentuckySchools = this.getKentuckySchoolData();
    
    // Create schools for each region
    for (const schoolData of kentuckySchools) {
      const regionId = regionMap.get(schoolData.regionNumber);
      if (regionId) {
        await this.createSchool({
          regionId,
          name: schoolData.name,
          type: schoolData.type,
          district: schoolData.district,
          contacted: false,
          contactedDate: null,
          responseStatus: "pending",
          notes: schoolData.notes || "",
          priority: schoolData.priority || 0,
        });
      }
    }
  }
  
  // Get comprehensive Kentucky school data (shared method)
  private getKentuckySchoolData(): Array<{
    regionNumber: number;
    name: string;
    type: "middle" | "high";
    district: string;
    notes?: string;
    priority?: number;
  }> {
    return [
      // Region 1 - Far West (Fulton, Hickman, Carlisle, Ballard counties)
      { regionNumber: 1, name: "Fulton County High School", type: "high", district: "Fulton County Schools", priority: 3 },
      { regionNumber: 1, name: "Fulton County Middle School", type: "middle", district: "Fulton County Schools", priority: 3 },
      { regionNumber: 1, name: "Hickman County High School", type: "high", district: "Hickman County Schools", priority: 3 },
      { regionNumber: 1, name: "Hickman County Middle School", type: "middle", district: "Hickman County Schools", priority: 3 },
      { regionNumber: 1, name: "Carlisle County High School", type: "high", district: "Carlisle County Schools", priority: 2 },
      { regionNumber: 1, name: "Carlisle County Middle School", type: "middle", district: "Carlisle County Schools", priority: 2 },
      { regionNumber: 1, name: "Ballard Memorial High School", type: "high", district: "Ballard County Schools", priority: 2 },
      { regionNumber: 1, name: "Ballard Memorial Middle School", type: "middle", district: "Ballard County Schools", priority: 2 },
      
      // Region 2 - West (Calloway, Marshall, Graves, McCracken counties)
      { regionNumber: 2, name: "Calloway County High School", type: "high", district: "Calloway County Schools", priority: 4 },
      { regionNumber: 2, name: "Calloway County Middle School", type: "middle", district: "Calloway County Schools", priority: 4 },
      { regionNumber: 2, name: "Marshall County High School", type: "high", district: "Marshall County Schools", priority: 4 },
      { regionNumber: 2, name: "Marshall County Middle School", type: "middle", district: "Marshall County Schools", priority: 4 },
      { regionNumber: 2, name: "Graves County High School", type: "high", district: "Graves County Schools", priority: 3 },
      { regionNumber: 2, name: "Graves County Middle School", type: "middle", district: "Graves County Schools", priority: 3 },
      { regionNumber: 2, name: "McCracken County High School", type: "high", district: "McCracken County Schools", priority: 5 },
      { regionNumber: 2, name: "McCracken County Middle School", type: "middle", district: "McCracken County Schools", priority: 5 },
      { regionNumber: 2, name: "Paducah Tilghman High School", type: "high", district: "Paducah Independent Schools", priority: 5 },
      { regionNumber: 2, name: "Paducah Middle School", type: "middle", district: "Paducah Independent Schools", priority: 5 },
      
      // Region 3 - Northwest (Henderson, Daviess, Ohio, McLean counties)
      { regionNumber: 3, name: "Henderson County High School", type: "high", district: "Henderson County Schools", priority: 4 },
      { regionNumber: 3, name: "Henderson County Middle School", type: "middle", district: "Henderson County Schools", priority: 4 },
      { regionNumber: 3, name: "Daviess County High School", type: "high", district: "Daviess County Schools", priority: 5 },
      { regionNumber: 3, name: "Daviess County Middle School", type: "middle", district: "Daviess County Schools", priority: 5 },
      { regionNumber: 3, name: "Ohio County High School", type: "high", district: "Ohio County Schools", priority: 3 },
      { regionNumber: 3, name: "Ohio County Middle School", type: "middle", district: "Ohio County Schools", priority: 3 },
      { regionNumber: 3, name: "McLean County High School", type: "high", district: "McLean County Schools", priority: 2 },
      { regionNumber: 3, name: "McLean County Middle School", type: "middle", district: "McLean County Schools", priority: 2 },
      { regionNumber: 3, name: "Owensboro High School", type: "high", district: "Owensboro Independent Schools", priority: 5 },
      { regionNumber: 3, name: "Owensboro Middle School", type: "middle", district: "Owensboro Independent Schools", priority: 5 },
      
      // Region 4 - Southwest (Christian, Todd, Trigg, Logan counties)
      { regionNumber: 4, name: "Christian County High School", type: "high", district: "Christian County Schools", priority: 4 },
      { regionNumber: 4, name: "Christian County Middle School", type: "middle", district: "Christian County Schools", priority: 4 },
      { regionNumber: 4, name: "Todd County Central High School", type: "high", district: "Todd County Schools", priority: 3 },
      { regionNumber: 4, name: "Todd County Central Middle School", type: "middle", district: "Todd County Schools", priority: 3 },
      { regionNumber: 4, name: "Trigg County High School", type: "high", district: "Trigg County Schools", priority: 3 },
      { regionNumber: 4, name: "Trigg County Middle School", type: "middle", district: "Trigg County Schools", priority: 3 },
      { regionNumber: 4, name: "Logan County High School", type: "high", district: "Logan County Schools", priority: 3 },
      { regionNumber: 4, name: "Logan County Middle School", type: "middle", district: "Logan County Schools", priority: 3 },
      { regionNumber: 4, name: "Hopkinsville High School", type: "high", district: "Hopkinsville Independent Schools", priority: 4 },
      { regionNumber: 4, name: "Hopkinsville Middle School", type: "middle", district: "Hopkinsville Independent Schools", priority: 4 },
      
      // Region 5 - West Central (Butler, Muhlenberg, Edmonson, Warren counties)
      { regionNumber: 5, name: "Butler County High School", type: "high", district: "Butler County Schools", priority: 3 },
      { regionNumber: 5, name: "Butler County Middle School", type: "middle", district: "Butler County Schools", priority: 3 },
      { regionNumber: 5, name: "Muhlenberg County High School", type: "high", district: "Muhlenberg County Schools", priority: 3 },
      { regionNumber: 5, name: "Muhlenberg County Middle School", type: "middle", district: "Muhlenberg County Schools", priority: 3 },
      { regionNumber: 5, name: "Edmonson County High School", type: "high", district: "Edmonson County Schools", priority: 2 },
      { regionNumber: 5, name: "Edmonson County Middle School", type: "middle", district: "Edmonson County Schools", priority: 2 },
      { regionNumber: 5, name: "Warren Central High School", type: "high", district: "Warren County Schools", priority: 5 },
      { regionNumber: 5, name: "Warren Central Middle School", type: "middle", district: "Warren County Schools", priority: 5 },
      { regionNumber: 5, name: "Bowling Green High School", type: "high", district: "Bowling Green Independent Schools", priority: 5 },
      { regionNumber: 5, name: "Bowling Green Middle School", type: "middle", district: "Bowling Green Independent Schools", priority: 5 },
      
      // Region 6 - North Central (Jefferson County - Louisville area)
      { regionNumber: 6, name: "DuPont Manual High School", type: "high", district: "Jefferson County Public Schools", priority: 5 },
      { regionNumber: 6, name: "Male High School", type: "high", district: "Jefferson County Public Schools", priority: 5 },
      { regionNumber: 6, name: "Ballard High School", type: "high", district: "Jefferson County Public Schools", priority: 5 },
      { regionNumber: 6, name: "Butler Traditional High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Eastern High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Fern Creek High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Iroquois High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Jeffersontown High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Moore Traditional High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Pleasure Ridge Park High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Seneca High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Southern High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Valley High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Western High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Atherton High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Brown School", type: "high", district: "Jefferson County Public Schools", priority: 3 },
      { regionNumber: 6, name: "Central High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Doss High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Fairdale High School", type: "high", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Barret Traditional Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Crosby Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Farnsley Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Kammerer Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Meyzeek Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Newburg Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Noe Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Ramsey Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Westport Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      { regionNumber: 6, name: "Wheatley Middle School", type: "middle", district: "Jefferson County Public Schools", priority: 4 },
      
      // Region 7 - Northern (Kenton, Boone, Campbell, Grant counties)
      { regionNumber: 7, name: "Kenton County High School", type: "high", district: "Kenton County Schools", priority: 4 },
      { regionNumber: 7, name: "Kenton County Middle School", type: "middle", district: "Kenton County Schools", priority: 4 },
      { regionNumber: 7, name: "Boone County High School", type: "high", district: "Boone County Schools", priority: 5 },
      { regionNumber: 7, name: "Boone County Middle School", type: "middle", district: "Boone County Schools", priority: 5 },
      { regionNumber: 7, name: "Campbell County High School", type: "high", district: "Campbell County Schools", priority: 4 },
      { regionNumber: 7, name: "Campbell County Middle School", type: "middle", district: "Campbell County Schools", priority: 4 },
      { regionNumber: 7, name: "Grant County High School", type: "high", district: "Grant County Schools", priority: 3 },
      { regionNumber: 7, name: "Grant County Middle School", type: "middle", district: "Grant County Schools", priority: 3 },
      { regionNumber: 7, name: "Covington Catholic High School", type: "high", district: "Covington Independent Schools", priority: 4 },
      { regionNumber: 7, name: "Covington Middle School", type: "middle", district: "Covington Independent Schools", priority: 4 },
      { regionNumber: 7, name: "Newport High School", type: "high", district: "Newport Independent Schools", priority: 3 },
      { regionNumber: 7, name: "Newport Middle School", type: "middle", district: "Newport Independent Schools", priority: 3 },
      
      // Region 8 - Central North (Shelby, Henry, Oldham, Trimble counties)
      { regionNumber: 8, name: "Shelby County High School", type: "high", district: "Shelby County Schools", priority: 4 },
      { regionNumber: 8, name: "Shelby County Middle School", type: "middle", district: "Shelby County Schools", priority: 4 },
      { regionNumber: 8, name: "Henry County High School", type: "high", district: "Henry County Schools", priority: 3 },
      { regionNumber: 8, name: "Henry County Middle School", type: "middle", district: "Henry County Schools", priority: 3 },
      { regionNumber: 8, name: "Oldham County High School", type: "high", district: "Oldham County Schools", priority: 5 },
      { regionNumber: 8, name: "Oldham County Middle School", type: "middle", district: "Oldham County Schools", priority: 5 },
      { regionNumber: 8, name: "Trimble County High School", type: "high", district: "Trimble County Schools", priority: 2 },
      { regionNumber: 8, name: "Trimble County Middle School", type: "middle", district: "Trimble County Schools", priority: 2 },
      { regionNumber: 8, name: "North Oldham High School", type: "high", district: "Oldham County Schools", priority: 4 },
      { regionNumber: 8, name: "South Oldham High School", type: "high", district: "Oldham County Schools", priority: 4 },
      
      // Region 9 - Northeast (Boyd, Carter, Greenup, Lawrence counties)
      { regionNumber: 9, name: "Boyd County High School", type: "high", district: "Boyd County Schools", priority: 4 },
      { regionNumber: 9, name: "Boyd County Middle School", type: "middle", district: "Boyd County Schools", priority: 4 },
      { regionNumber: 9, name: "Carter County High School", type: "high", district: "Carter County Schools", priority: 3 },
      { regionNumber: 9, name: "Carter County Middle School", type: "middle", district: "Carter County Schools", priority: 3 },
      { regionNumber: 9, name: "Greenup County High School", type: "high", district: "Greenup County Schools", priority: 3 },
      { regionNumber: 9, name: "Greenup County Middle School", type: "middle", district: "Greenup County Schools", priority: 3 },
      { regionNumber: 9, name: "Lawrence County High School", type: "high", district: "Lawrence County Schools", priority: 3 },
      { regionNumber: 9, name: "Lawrence County Middle School", type: "middle", district: "Lawrence County Schools", priority: 3 },
      { regionNumber: 9, name: "Ashland Blazer High School", type: "high", district: "Ashland Independent Schools", priority: 5 },
      { regionNumber: 9, name: "Ashland Middle School", type: "middle", district: "Ashland Independent Schools", priority: 5 },
      { regionNumber: 9, name: "Russell High School", type: "high", district: "Russell Independent Schools", priority: 4 },
      { regionNumber: 9, name: "Russell Middle School", type: "middle", district: "Russell Independent Schools", priority: 4 },
      
      // Region 10 - East (Pike, Floyd, Johnson, Magoffin counties)
      { regionNumber: 10, name: "Pike County Central High School", type: "high", district: "Pike County Schools", priority: 4 },
      { regionNumber: 10, name: "Pike County Middle School", type: "middle", district: "Pike County Schools", priority: 4 },
      { regionNumber: 10, name: "Floyd Central High School", type: "high", district: "Floyd County Schools", priority: 4 },
      { regionNumber: 10, name: "Floyd County Middle School", type: "middle", district: "Floyd County Schools", priority: 4 },
      { regionNumber: 10, name: "Johnson Central High School", type: "high", district: "Johnson County Schools", priority: 3 },
      { regionNumber: 10, name: "Johnson County Middle School", type: "middle", district: "Johnson County Schools", priority: 3 },
      { regionNumber: 10, name: "Magoffin County High School", type: "high", district: "Magoffin County Schools", priority: 3 },
      { regionNumber: 10, name: "Magoffin County Middle School", type: "middle", district: "Magoffin County Schools", priority: 3 },
      { regionNumber: 10, name: "Pikeville High School", type: "high", district: "Pikeville Independent Schools", priority: 5 },
      { regionNumber: 10, name: "Pikeville Middle School", type: "middle", district: "Pikeville Independent Schools", priority: 5 },
      { regionNumber: 10, name: "Prestonsburg High School", type: "high", district: "Floyd County Schools", priority: 4 },
      { regionNumber: 10, name: "Prestonsburg Middle School", type: "middle", district: "Floyd County Schools", priority: 4 },
      
      // Region 11 - Far East (Pike, Letcher, Perry, Knott counties)
      { regionNumber: 11, name: "East Ridge High School", type: "high", district: "Pike County Schools", priority: 3 },
      { regionNumber: 11, name: "Shelby Valley High School", type: "high", district: "Pike County Schools", priority: 3 },
      { regionNumber: 11, name: "Letcher County Central High School", type: "high", district: "Letcher County Schools", priority: 4 },
      { regionNumber: 11, name: "Letcher County Middle School", type: "middle", district: "Letcher County Schools", priority: 4 },
      { regionNumber: 11, name: "Perry County Central High School", type: "high", district: "Perry County Schools", priority: 4 },
      { regionNumber: 11, name: "Perry County Middle School", type: "middle", district: "Perry County Schools", priority: 4 },
      { regionNumber: 11, name: "Knott County Central High School", type: "high", district: "Knott County Schools", priority: 3 },
      { regionNumber: 11, name: "Knott County Middle School", type: "middle", district: "Knott County Schools", priority: 3 },
      { regionNumber: 11, name: "Hazard High School", type: "high", district: "Perry County Schools", priority: 4 },
      { regionNumber: 11, name: "Hazard Middle School", type: "middle", district: "Perry County Schools", priority: 4 },
      
      // Region 12 - Southeast (Harlan, Bell, Leslie, Clay counties)
      { regionNumber: 12, name: "Harlan County High School", type: "high", district: "Harlan County Schools", priority: 4 },
      { regionNumber: 12, name: "Harlan County Middle School", type: "middle", district: "Harlan County Schools", priority: 4 },
      { regionNumber: 12, name: "Bell County High School", type: "high", district: "Bell County Schools", priority: 3 },
      { regionNumber: 12, name: "Bell County Middle School", type: "middle", district: "Bell County Schools", priority: 3 },
      { regionNumber: 12, name: "Leslie County High School", type: "high", district: "Leslie County Schools", priority: 3 },
      { regionNumber: 12, name: "Leslie County Middle School", type: "middle", district: "Leslie County Schools", priority: 3 },
      { regionNumber: 12, name: "Clay County High School", type: "high", district: "Clay County Schools", priority: 3 },
      { regionNumber: 12, name: "Clay County Middle School", type: "middle", district: "Clay County Schools", priority: 3 },
      { regionNumber: 12, name: "Harlan High School", type: "high", district: "Harlan Independent Schools", priority: 4 },
      { regionNumber: 12, name: "Harlan Middle School", type: "middle", district: "Harlan Independent Schools", priority: 4 },
      
      // Region 13 - South (Knox, Whitley, Laurel, Rockcastle counties)
      { regionNumber: 13, name: "Knox Central High School", type: "high", district: "Knox County Schools", priority: 4 },
      { regionNumber: 13, name: "Knox County Middle School", type: "middle", district: "Knox County Schools", priority: 4 },
      { regionNumber: 13, name: "Whitley County High School", type: "high", district: "Whitley County Schools", priority: 4 },
      { regionNumber: 13, name: "Whitley County Middle School", type: "middle", district: "Whitley County Schools", priority: 4 },
      { regionNumber: 13, name: "North Laurel High School", type: "high", district: "Laurel County Schools", priority: 4 },
      { regionNumber: 13, name: "South Laurel High School", type: "high", district: "Laurel County Schools", priority: 4 },
      { regionNumber: 13, name: "Laurel County Middle School", type: "middle", district: "Laurel County Schools", priority: 4 },
      { regionNumber: 13, name: "Rockcastle County High School", type: "high", district: "Rockcastle County Schools", priority: 3 },
      { regionNumber: 13, name: "Rockcastle County Middle School", type: "middle", district: "Rockcastle County Schools", priority: 3 },
      { regionNumber: 13, name: "Corbin High School", type: "high", district: "Corbin Independent Schools", priority: 5 },
      { regionNumber: 13, name: "Corbin Middle School", type: "middle", district: "Corbin Independent Schools", priority: 5 },
      
      // Region 14 - South Central (Pulaski, Wayne, Russell, Casey counties)
      { regionNumber: 14, name: "Pulaski County High School", type: "high", district: "Pulaski County Schools", priority: 4 },
      { regionNumber: 14, name: "Pulaski County Middle School", type: "middle", district: "Pulaski County Schools", priority: 4 },
      { regionNumber: 14, name: "Wayne County High School", type: "high", district: "Wayne County Schools", priority: 3 },
      { regionNumber: 14, name: "Wayne County Middle School", type: "middle", district: "Wayne County Schools", priority: 3 },
      { regionNumber: 14, name: "Russell County High School", type: "high", district: "Russell County Schools", priority: 3 },
      { regionNumber: 14, name: "Russell County Middle School", type: "middle", district: "Russell County Schools", priority: 3 },
      { regionNumber: 14, name: "Casey County High School", type: "high", district: "Casey County Schools", priority: 3 },
      { regionNumber: 14, name: "Casey County Middle School", type: "middle", district: "Casey County Schools", priority: 3 },
      { regionNumber: 14, name: "Somerset High School", type: "high", district: "Somerset Independent Schools", priority: 5 },
      { regionNumber: 14, name: "Somerset Middle School", type: "middle", district: "Somerset Independent Schools", priority: 5 },
      
      // Region 15 - South (Monroe, Cumberland, Clinton, Adair counties)
      { regionNumber: 15, name: "Monroe County High School", type: "high", district: "Monroe County Schools", priority: 3 },
      { regionNumber: 15, name: "Monroe County Middle School", type: "middle", district: "Monroe County Schools", priority: 3 },
      { regionNumber: 15, name: "Cumberland County High School", type: "high", district: "Cumberland County Schools", priority: 2 },
      { regionNumber: 15, name: "Cumberland County Middle School", type: "middle", district: "Cumberland County Schools", priority: 2 },
      { regionNumber: 15, name: "Clinton County High School", type: "high", district: "Clinton County Schools", priority: 2 },
      { regionNumber: 15, name: "Clinton County Middle School", type: "middle", district: "Clinton County Schools", priority: 2 },
      { regionNumber: 15, name: "Adair County High School", type: "high", district: "Adair County Schools", priority: 3 },
      { regionNumber: 15, name: "Adair County Middle School", type: "middle", district: "Adair County Schools", priority: 3 },
      
      // Region 16 - South Central (Cumberland, Metcalfe, Barren, Hart counties)
      { regionNumber: 16, name: "Barren County High School", type: "high", district: "Barren County Schools", priority: 4 },
      { regionNumber: 16, name: "Barren County Middle School", type: "middle", district: "Barren County Schools", priority: 4 },
      { regionNumber: 16, name: "Metcalfe County High School", type: "high", district: "Metcalfe County Schools", priority: 2 },
      { regionNumber: 16, name: "Metcalfe County Middle School", type: "middle", district: "Metcalfe County Schools", priority: 2 },
      { regionNumber: 16, name: "Hart County High School", type: "high", district: "Hart County Schools", priority: 3 },
      { regionNumber: 16, name: "Hart County Middle School", type: "middle", district: "Hart County Schools", priority: 3 },
      { regionNumber: 16, name: "Glasgow High School", type: "high", district: "Glasgow Independent Schools", priority: 4 },
      { regionNumber: 16, name: "Glasgow Middle School", type: "middle", district: "Glasgow Independent Schools", priority: 4 },
      
      // Region 17 - Central (Fayette, Madison, Jessamine, Woodford counties)
      { regionNumber: 17, name: "Lafayette High School", type: "high", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Paul Laurence Dunbar High School", type: "high", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Henry Clay High School", type: "high", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Tates Creek High School", type: "high", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Bryan Station High School", type: "high", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Frederick Douglass High School", type: "high", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Lexington Traditional Magnet School", type: "high", district: "Fayette County Public Schools", priority: 4 },
      { regionNumber: 17, name: "Edwin O. Smith Middle School", type: "middle", district: "Fayette County Public Schools", priority: 5 },
      { regionNumber: 17, name: "Jessamine County Middle School", type: "middle", district: "Fayette County Public Schools", priority: 4 },
      { regionNumber: 17, name: "Madison Central High School", type: "high", district: "Madison County Schools", priority: 5 },
      { regionNumber: 17, name: "Madison Southern High School", type: "high", district: "Madison County Schools", priority: 4 },
      { regionNumber: 17, name: "Madison Middle School", type: "middle", district: "Madison County Schools", priority: 4 },
      { regionNumber: 17, name: "Jessamine County High School", type: "high", district: "Jessamine County Schools", priority: 4 },
      { regionNumber: 17, name: "West Jessamine High School", type: "high", district: "Jessamine County Schools", priority: 4 },
      { regionNumber: 17, name: "Jessamine County Middle School", type: "middle", district: "Jessamine County Schools", priority: 4 },
      { regionNumber: 17, name: "Woodford County High School", type: "high", district: "Woodford County Schools", priority: 4 },
      { regionNumber: 17, name: "Woodford County Middle School", type: "middle", district: "Woodford County Schools", priority: 4 },
      { regionNumber: 17, name: "Berea Community High School", type: "high", district: "Berea Independent Schools", priority: 4 },
      { regionNumber: 17, name: "Berea Community Middle School", type: "middle", district: "Berea Independent Schools", priority: 4 },
      
      // Region 18 - Central (Casey, Lincoln, Garrard, Boyle counties)
      { regionNumber: 18, name: "Casey County High School", type: "high", district: "Casey County Schools", priority: 3 },
      { regionNumber: 18, name: "Casey County Middle School", type: "middle", district: "Casey County Schools", priority: 3 },
      { regionNumber: 18, name: "Lincoln County High School", type: "high", district: "Lincoln County Schools", priority: 4 },
      { regionNumber: 18, name: "Lincoln County Middle School", type: "middle", district: "Lincoln County Schools", priority: 4 },
      { regionNumber: 18, name: "Garrard County High School", type: "high", district: "Garrard County Schools", priority: 3 },
      { regionNumber: 18, name: "Garrard County Middle School", type: "middle", district: "Garrard County Schools", priority: 3 },
      { regionNumber: 18, name: "Boyle County High School", type: "high", district: "Boyle County Schools", priority: 4 },
      { regionNumber: 18, name: "Boyle County Middle School", type: "middle", district: "Boyle County Schools", priority: 4 },
      { regionNumber: 18, name: "Danville High School", type: "high", district: "Danville Independent Schools", priority: 5 },
      { regionNumber: 18, name: "Danville Middle School", type: "middle", district: "Danville Independent Schools", priority: 5 },
    ];
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
  
  // Region methods
  async getAllRegions(): Promise<Region[]> {
    return Array.from(this.regionsData.values()).sort((a, b) => a.regionNumber - b.regionNumber);
  }
  
  async getRegion(id: number): Promise<Region | undefined> {
    return this.regionsData.get(id);
  }
  
  async getRegionByNumber(regionNumber: number): Promise<Region | undefined> {
    return Array.from(this.regionsData.values()).find(r => r.regionNumber === regionNumber);
  }
  
  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const id = this.currentRegionId++;
    const region: Region = {
      ...insertRegion,
      id,
      conquered: insertRegion.conquered ?? false,
      conqueredDate: insertRegion.conqueredDate ?? null,
      targetDate: insertRegion.targetDate ?? null,
    };
    this.regionsData.set(id, region);
    return region;
  }
  
  async updateRegion(id: number, region: Partial<InsertRegion>): Promise<Region | undefined> {
    const existingRegion = this.regionsData.get(id);
    if (!existingRegion) return undefined;
    
    const updatedRegion = { ...existingRegion, ...region };
    this.regionsData.set(id, updatedRegion);
    return updatedRegion;
  }
  
  // School methods
  async getAllSchools(): Promise<School[]> {
    return Array.from(this.schoolsData.values());
  }
  
  async getSchoolsByRegion(regionId: number): Promise<School[]> {
    return Array.from(this.schoolsData.values()).filter(s => s.regionId === regionId);
  }
  
  async getSchool(id: number): Promise<School | undefined> {
    return this.schoolsData.get(id);
  }
  
  async createSchool(insertSchool: InsertSchool): Promise<School> {
    const id = this.currentSchoolId++;
    const school: School = {
      ...insertSchool,
      id,
      contacted: insertSchool.contacted ?? false,
      contactedDate: insertSchool.contactedDate ?? null,
      responseStatus: insertSchool.responseStatus ?? "pending",
      notes: insertSchool.notes ?? "",
      priority: insertSchool.priority ?? 0,
    };
    this.schoolsData.set(id, school);
    return school;
  }
  
  async updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined> {
    const existingSchool = this.schoolsData.get(id);
    if (!existingSchool) return undefined;
    
    const updatedSchool = { ...existingSchool, ...school };
    this.schoolsData.set(id, updatedSchool);
    return updatedSchool;
  }
  
  async deleteSchool(id: number): Promise<boolean> {
    return this.schoolsData.delete(id);
  }
  
  async resetAllSchools(): Promise<void> {
    for (const school of this.schoolsData.values()) {
      this.schoolsData.set(school.id, {
        ...school,
        contacted: false,
        contactedDate: null,
        responseStatus: "pending",
      });
    }
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
  
  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const [region] = await db.insert(regions).values(insertRegion).returning();
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

  async resetAllSchools(): Promise<void> {
    await db.update(schools).set({
      contacted: false,
      contactedDate: null,
      responseStatus: "pending",
      notes: "",
    });
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

  // Gamification methods
  async getOrCreateProfile(userId: number = 1): Promise<GamificationProfile> {
    const [profile] = await db
      .select()
      .from(gamificationProfiles)
      .where(eq(gamificationProfiles.userId, userId));
    
    if (profile) {
      return profile;
    }
    
    // Create new profile with default values
    const [newProfile] = await db
      .insert(gamificationProfiles)
      .values({
        userId,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        totalGoalsCompleted: 0,
        totalProspectsWon: 0,
        streakFreezeCount: 1,
        motivationScore: 100
      })
      .returning();
    
    return newProfile;
  }
  
  async updateProfile(id: number, profile: Partial<InsertGamificationProfile>): Promise<GamificationProfile | undefined> {
    const [updated] = await db
      .update(gamificationProfiles)
      .set(profile)
      .where(eq(gamificationProfiles.id, id))
      .returning();
    return updated;
  }
  
  async addXpEvent(event: InsertXpEvent): Promise<XpEvent> {
    const [xpEvent] = await db.insert(xpEvents).values(event).returning();
    return xpEvent;
  }
  
  async getRecentXpEvents(profileId: number, limit: number): Promise<XpEvent[]> {
    return await db
      .select()
      .from(xpEvents)
      .where(eq(xpEvents.profileId, profileId))
      .orderBy(asc(xpEvents.createdAt))
      .limit(limit);
  }
  
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }
  
  async getUserAchievements(profileId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.profileId, profileId));
  }
  
  async unlockAchievement(profileId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const [achievement] = await db
      .update(userAchievements)
      .set({ unlocked: true, unlockedAt: new Date() })
      .where(
        and(
          eq(userAchievements.profileId, profileId),
          eq(userAchievements.achievementId, achievementId)
        )
      )
      .returning();
    return achievement;
  }
  
  async updateAchievementProgress(profileId: number, achievementId: number, progress: number): Promise<UserAchievement | undefined> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.profileId, profileId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
    
    if (existing) {
      const [updated] = await db
        .update(userAchievements)
        .set({ progress })
        .where(eq(userAchievements.id, existing.id))
        .returning();
      return updated;
    }
    
    // Create if doesn't exist
    const [newAchievement] = await db
      .insert(userAchievements)
      .values({
        profileId,
        achievementId,
        progress,
        unlocked: false
      })
      .returning();
    return newAchievement;
  }
  
  async getTodayChallenge(profileId: number): Promise<UserDailyChallenge | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [challenge] = await db
      .select()
      .from(userDailyChallenges)
      .where(
        and(
          eq(userDailyChallenges.profileId, profileId),
          eq(userDailyChallenges.assignedDate, today)
        )
      );
    return challenge;
  }
  
  async createDailyChallenge(challenge: InsertUserDailyChallenge): Promise<UserDailyChallenge> {
    const [newChallenge] = await db
      .insert(userDailyChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }
  
  async updateDailyChallengeProgress(id: number, progress: number): Promise<UserDailyChallenge | undefined> {
    const [updated] = await db
      .update(userDailyChallenges)
      .set({ progress })
      .where(eq(userDailyChallenges.id, id))
      .returning();
    return updated;
  }
  
  async completeDailyChallenge(id: number, xpEarned: number): Promise<UserDailyChallenge | undefined> {
    const [completed] = await db
      .update(userDailyChallenges)
      .set({
        completed: true,
        completedAt: new Date(),
        xpEarned
      })
      .where(eq(userDailyChallenges.id, id))
      .returning();
    return completed;
  }

  // Startup Metrics methods
  async getStartupMetrics(): Promise<StartupMetrics | undefined> {
    const [metrics] = await db.select().from(startupMetrics).limit(1);
    return metrics;
  }

  async updateStartupMetrics(metrics: Partial<InsertStartupMetrics>): Promise<StartupMetrics> {
    // Get existing metrics or create if doesn't exist
    const existing = await this.getStartupMetrics();
    
    if (existing) {
      const [updated] = await db
        .update(startupMetrics)
        .set({ ...metrics, updatedAt: new Date() })
        .where(eq(startupMetrics.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(startupMetrics)
        .values(metrics as InsertStartupMetrics)
        .returning();
      return created;
    }
  }

  async getMetricSnapshots(limit: number = 12): Promise<StartupMetricSnapshot[]> {
    return await db
      .select()
      .from(startupMetricSnapshots)
      .orderBy(asc(startupMetricSnapshots.reportingPeriod))
      .limit(limit);
  }

  async createMetricSnapshot(snapshot: InsertStartupMetricSnapshot): Promise<StartupMetricSnapshot> {
    const [created] = await db
      .insert(startupMetricSnapshots)
      .values(snapshot)
      .returning();
    return created;
  }

  // Initialize database with sample data
  async initializeData() {
    try {
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
    
    // Initialize regions and schools for all KASS regions
    await this.initializeRegionsAndSchools();
    } catch (error) {
      console.error("Failed to initialize database data:", error);
      // Don't throw - allow server to start even if initialization fails
    }
  }
  
  // Initialize all KASS regions and schools
  async initializeRegionsAndSchools() {
    try {
      // Initialize all 18 KASS regions
      const kassRegions: InsertRegion[] = [
        { regionNumber: 1, name: "Region 1 - Far West", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 2, name: "Region 2 - West", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 3, name: "Region 3 - Northwest", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 4, name: "Region 4 - Southwest", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 5, name: "Region 5 - West Central", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 6, name: "Region 6 - North Central", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 7, name: "Region 7 - Northern", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 8, name: "Region 8 - Central North", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 9, name: "Region 9 - Northeast", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 10, name: "Region 10 - East", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 11, name: "Region 11 - Far East", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 12, name: "Region 12 - Southeast", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 13, name: "Region 13 - South", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 14, name: "Region 14 - South Central", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 15, name: "Region 15 - South", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 16, name: "Region 16 - South Central", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 17, name: "Region 17 - Central", conquered: false, conqueredDate: null, targetDate: null },
        { regionNumber: 18, name: "Region 18 - Central", conquered: false, conqueredDate: null, targetDate: null },
      ];
      
      // Create regions if they don't exist
      const existingRegions = await this.getAllRegions();
      const existingRegionNumbers = new Set(existingRegions.map(r => r.regionNumber));
      
      for (const regionData of kassRegions) {
        if (!existingRegionNumbers.has(regionData.regionNumber)) {
          try {
            await this.createRegion(regionData);
          } catch (error) {
            console.error(`Failed to create region ${regionData.regionNumber}:`, error);
          }
        }
      }
      
      // Initialize schools
      await this.initializeSchools();
    } catch (error) {
      console.error("Failed to initialize regions and schools:", error);
    }
  }
  
  // Initialize comprehensive school data for all Kentucky KASS regions
  async initializeSchools() {
    try {
      // Check if schools already exist
      const existingSchools = await this.getAllSchools();
      if (existingSchools.length > 0) {
        console.log(`Schools already initialized (${existingSchools.length} schools found)`);
        return;
      }
      
      // Get all regions to map region numbers to IDs
      const allRegions = await this.getAllRegions();
      if (allRegions.length === 0) {
        console.log("No regions found, skipping school initialization");
        return;
      }
      
      const regionMap = new Map(allRegions.map(r => [r.regionNumber, r.id]));
      
      // Comprehensive Kentucky school data organized by KASS region
      const kentuckySchools = this.getKentuckySchoolData();
      
      let createdCount = 0;
      // Create schools for each region
      for (const schoolData of kentuckySchools) {
        const regionId = regionMap.get(schoolData.regionNumber);
        if (regionId) {
          try {
            await this.createSchool({
              regionId,
              name: schoolData.name,
              type: schoolData.type,
              district: schoolData.district,
              contacted: false,
              contactedDate: null,
              responseStatus: "pending",
              notes: schoolData.notes || "",
              priority: schoolData.priority || 0,
            });
            createdCount++;
          } catch (error) {
            console.error(`Failed to create school ${schoolData.name}:`, error);
            // Continue with other schools
          }
        } else {
          console.warn(`Region ${schoolData.regionNumber} not found for school ${schoolData.name}`);
        }
      }
      
      console.log(`Initialized ${createdCount} schools across ${allRegions.length} regions`);
    } catch (error) {
      console.error("Failed to initialize schools:", error);
      // Don't throw - allow server to continue
    }
  }
  
  // Get comprehensive Kentucky school data (shared method)
  // Uses MemStorage's method to ensure consistency
  getKentuckySchoolData(): Array<{
    regionNumber: number;
    name: string;
    type: "middle" | "high";
    district: string;
    notes?: string;
    priority?: number;
  }> {
    // Use MemStorage's comprehensive data
    const tempMemStorage = new MemStorage();
    return (tempMemStorage as any).getKentuckySchoolData();
  }
}

// Note: School data is defined in MemStorage.getKentuckySchoolData() method
// DatabaseStorage uses that method to ensure consistency

// Use MemStorage for local development if database is not available
// Otherwise use DatabaseStorage for production
// For now, default to MemStorage to avoid connection issues during local development
let storageInstance: IStorage;

// Only use DatabaseStorage if explicitly enabled and DATABASE_URL is set
if (db && process.env.USE_DATABASE === 'true' && process.env.DATABASE_URL) {
  storageInstance = new DatabaseStorage();
  // Initialize the database with sample data (non-blocking)
  storageInstance.initializeData().catch((error) => {
    console.error("Failed to initialize database:", error.message);
    // Continue anyway - server can still start
  });
} else {
  // Default to MemStorage for local development
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
