import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
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
});

export const goalsRelations = relations(goals, ({ many }) => ({
  statuses: many(goalStatus),
  dependsOn: many(goalDependencies, { relationName: "dependsOn" }),
  dependents: many(goalDependencies, { relationName: "dependents" }),
}));

export const goalDependencies = pgTable("goal_dependencies", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => goals.id),
  dependsOnGoalId: integer("depends_on_goal_id").notNull().references(() => goals.id),
  impact: real("impact").default(0).notNull(), // Impact factor (0-10) of how much this dependency affects the main goal
  description: text("description").default(""),
});

export const goalDependenciesRelations = relations(goalDependencies, ({ one }) => ({
  goal: one(goals, {
    fields: [goalDependencies.goalId],
    references: [goals.id],
    relationName: "dependents"
  }),
  dependsOn: one(goals, {
    fields: [goalDependencies.dependsOnGoalId],
    references: [goals.id],
    relationName: "dependsOn"
  }),
}));

export const insertGoalDependencySchema = createInsertSchema(goalDependencies).pick({
  goalId: true,
  dependsOnGoalId: true,
  impact: true,
  description: true,
});

export type InsertGoalDependency = z.infer<typeof insertGoalDependencySchema>;
export type GoalDependency = typeof goalDependencies.$inferSelect;

export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  current: true,
  target: true,
  unit: true,
  color: true,
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

export const executionTasksRelations = relations(executionTasks, ({ one }) => ({
  week: one(weeks, {
    fields: [executionTasks.weekId],
    references: [weeks.id]
  })
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

export const weeks = pgTable("weeks", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  dateRange: text("date_range").notNull(),
  completionRate: real("completion_rate").default(0),
});

export const weeksRelations = relations(weeks, ({ many }) => ({
  tasks: many(executionTasks)
}));

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

export type InsertWeek = z.infer<typeof insertWeekSchema>;
export type Week = typeof weeks.$inferSelect;

// Original schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
