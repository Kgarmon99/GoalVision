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

// Habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  goalId: integer("goal_id"), // Make goalId optional
  createdAt: timestamp("created_at").defaultNow(),
  targetStreakDays: integer("target_streak_days").default(7),
  targetDaysPerWeek: integer("target_days_per_week").default(5),
  reminderTime: text("reminder_time").default("08:00"), // Format: HH:MM
  color: text("color").default("primary"),
  priority: text("priority").default("medium"), // high, medium, low
  category: text("category").default("general"),
});

export const habitsRelations = relations(habits, ({ one, many }) => ({
  goal: one(goals, {
    fields: [habits.goalId],
    references: [goals.id]
  }),
  streaks: many(habitStreaks)
}));

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  description: true,
  frequency: true,
  goalId: true,
  targetStreakDays: true,
  targetDaysPerWeek: true,
  reminderTime: true,
  color: true,
  priority: true,
  category: true,
});

// Habit streaks table
export const habitStreaks = pgTable("habit_streaks", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: timestamp("date").notNull(),
  completed: boolean("completed").default(false),
  notes: text("notes").default(""),
});

export const habitStreaksRelations = relations(habitStreaks, ({ one }) => ({
  habit: one(habits, {
    fields: [habitStreaks.habitId],
    references: [habits.id]
  })
}));

export const insertHabitStreakSchema = createInsertSchema(habitStreaks).pick({
  habitId: true,
  date: true,
  completed: true,
  notes: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertHabitStreak = z.infer<typeof insertHabitStreakSchema>;
export type HabitStreak = typeof habitStreaks.$inferSelect;
