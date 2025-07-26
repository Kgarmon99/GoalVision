import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  current: real("current").notNull(),
  target: real("target").notNull(),
  unit: text("unit").default(""),
  color: text("color").default("primary"),
  deadline: text("deadline").default(""), // Store as ISO string format (e.g., "2025-12-31")
});

export const goalsRelations = relations(goals, ({ many }) => ({
  statuses: many(goalStatus),
}));

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  current: true,
  target: true,
  unit: true,
  color: true,
  deadline: true,
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  previousValue: text("previous_value").default(""),
  trend: real("trend").default(0),
  trendDirection: text("trend_direction").default("stable"),
  category: text("category").notNull(),
});

export const insertMetricSchema = createInsertSchema(metrics).pick({
  name: true,
  value: true,
  previousValue: true,
  trend: true,
  trendDirection: true,
  category: true,
});

export const goalStatus = pgTable("goal_status", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  goalName: text("goal_name").notNull(),
  status: text("status").notNull(), // "on-track", "needs-attention", "off-track"
});

export const goalStatusRelations = relations(goalStatus, ({ one }) => ({
  goal: one(goals, {
    fields: [goalStatus.goalId],
    references: [goals.id]
  })
}));

export const insertGoalStatusSchema = createInsertSchema(goalStatus).pick({
  goalId: true,
  goalName: true,
  status: true,
});

export const executionTasks = pgTable("execution_tasks", {
  id: serial("id").primaryKey(),
  task: text("task").notNull(),
  owner: text("owner").notNull(),
  ownerAvatar: text("owner_avatar").default(""),
  goalCategory: text("goal_category").notNull(),
  categoryColor: text("category_color").default("blue"),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(), // "done", "in-progress", "missed"
  weekId: integer("week_id").notNull(),
});

export const executionTasksRelations = relations(executionTasks, ({ one, many }) => ({
  week: one(weeks, {
    fields: [executionTasks.weekId],
    references: [weeks.id]
  }),
  subtasks: many(subtasks)
}));

export const insertExecutionTaskSchema = createInsertSchema(executionTasks).pick({
  task: true,
  owner: true,
  ownerAvatar: true,
  goalCategory: true,
  categoryColor: true,
  dueDate: true,
  status: true,
  weekId: true,
});

// New subtasks table
export const subtasks = pgTable("subtasks", {
  id: serial("id").primaryKey(),
  parentTaskId: integer("parent_task_id").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  priority: text("priority").default("medium"), // "high", "medium", "low"
});

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  parentTask: one(executionTasks, {
    fields: [subtasks.parentTaskId],
    references: [executionTasks.id]
  })
}));

export const insertSubtaskSchema = createInsertSchema(subtasks).pick({
  parentTaskId: true,
  description: true,
  completed: true,
  priority: true,
});

export const weeks = pgTable("weeks", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  dateRange: text("date_range").notNull(),
  completionRate: real("completion_rate").default(0),
});

export const weeksRelations = relations(weeks, ({ many }) => ({
  tasks: many(executionTasks)
}));

export const goalTemplates = pgTable("goal_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // industry, best-practice, quick-start, custom
  description: text("description").notNull(),
  goals: text("goals").notNull(), // JSON string of goal objects
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGoalTemplateSchema = createInsertSchema(goalTemplates).pick({
  name: true,
  category: true,
  description: true,
  goals: true,
});

export type InsertGoalTemplate = z.infer<typeof insertGoalTemplateSchema>;
export type GoalTemplate = typeof goalTemplates.$inferSelect;


export const insertWeekSchema = createInsertSchema(weeks).pick({
  number: true,
  dateRange: true,
  completionRate: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;

export type InsertGoalStatus = z.infer<typeof insertGoalStatusSchema>;
export type GoalStatus = typeof goalStatus.$inferSelect;

export type InsertExecutionTask = z.infer<typeof insertExecutionTaskSchema>;
export type ExecutionTask = typeof executionTasks.$inferSelect;

export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type Subtask = typeof subtasks.$inferSelect;

export type InsertWeek = z.infer<typeof insertWeekSchema>;
export type Week = typeof weeks.$inferSelect;

// User schema with location data for globe visualization
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Location data for globe visualization
  latitude: real("latitude").default(0),
  longitude: real("longitude").default(0),
  country: text("country").default(""),
  city: text("city").default(""),
  lastActive: timestamp("last_active").defaultNow(),
  goalsCreated: integer("goals_created").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  latitude: true,
  longitude: true,
  country: true,
  city: true,
  goalsCreated: true,
  tasksCompleted: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Prospects schema for sales pipeline
export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  value: real("value").notNull(), // Deal value
  probability: real("probability").notNull(), // Probability of closing (0-100)
  stage: text("stage").notNull(), // e.g. "initial", "negotiation", "closing", "won", "lost"
  expectedCloseDate: text("expected_close_date").notNull(), // ISO date string
  notes: text("notes").default(""),
  priority: integer("priority").default(0), // Higher number = higher priority
});

export const insertProspectSchema = createInsertSchema(prospects).pick({
  name: true,
  organization: true,
  value: true,
  probability: true,
  stage: true,
  expectedCloseDate: true,
  notes: true,
  priority: true,
});

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;


