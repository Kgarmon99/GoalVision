# 2025 Goals Tracking Platform Database Schema

This document provides comprehensive information about the database schema used in the 2025 Goals Tracking Platform. It describes the tables, their columns, relationships, and usage patterns.

## Overview

The application uses PostgreSQL as its database management system and Drizzle ORM for database operations. The schema is defined in `shared/schema.ts` and includes tables for goals, metrics, tasks, and more.

## Connection

The database connection is established in `server/db.ts` using the Neon PostgreSQL serverless client. The connection string is provided through the `DATABASE_URL` environment variable.

## Tables

### Goals

The `goals` table stores information about user-defined goals and their progress.

**Table Name**: `goals`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each goal
- `name`: TEXT NOT NULL - Goal name
- `current`: REAL NOT NULL - Current progress value
- `target`: REAL NOT NULL - Target value to achieve
- `unit`: TEXT DEFAULT '' - Unit of measurement (e.g., "M" for million)
- `color`: TEXT DEFAULT 'primary' - Visual indicator color
- `deadline`: TEXT DEFAULT '' - Target date for completion (ISO format string)

**TypeScript Definition**:
```typescript
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  current: real("current").notNull(),
  target: real("target").notNull(),
  unit: text("unit").default(""),
  color: text("color").default("primary"),
  deadline: text("deadline").default(""),
});
```

**Relationships**:
- One-to-many relationship with `goalStatus`

**Indexes**:
- Primary key on `id`

**Usage**:
- Used to track progress towards objectives
- Core entity for the goal tracking functionality
- Referenced by execution tasks for categorization
- Used for metrics calculations

### Metrics

The `metrics` table stores metrics related to goals and their trends.

**Table Name**: `metrics`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each metric
- `name`: TEXT NOT NULL - Metric name
- `value`: TEXT NOT NULL - Current value (stored as text to allow various formats)
- `previousValue`: TEXT DEFAULT '' - Previous value for trend calculation
- `trend`: REAL DEFAULT 0 - Calculated trend percentage
- `trendDirection`: TEXT DEFAULT 'stable' - Direction of trend (up/down/stable)
- `category`: TEXT NOT NULL - Category grouping (e.g., "growth", "revenue")

**TypeScript Definition**:
```typescript
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  previousValue: text("previous_value").default(""),
  trend: real("trend").default(0),
  trendDirection: text("trend_direction").default("stable"),
  category: text("category").notNull(),
});
```

**Indexes**:
- Primary key on `id`

**Usage**:
- Provides additional context for goal progress
- Used for dashboard displays and data visualization
- Automatically calculated based on goal progress
- Grouped by category for organized presentation

### Goal Status

The `goal_status` table tracks the current status of goals.

**Table Name**: `goal_status`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each status record
- `goalId`: INTEGER NOT NULL - Associated goal ID
- `goalName`: TEXT NOT NULL - Associated goal name
- `status`: TEXT NOT NULL - Current status ("on-track", "needs-attention", "off-track")

**TypeScript Definition**:
```typescript
export const goalStatus = pgTable("goal_status", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  goalName: text("goal_name").notNull(),
  status: text("status").notNull(),
});
```

**Relationships**:
- Many-to-one relationship with `goals`
  ```typescript
  export const goalStatusRelations = relations(goalStatus, ({ one }) => ({
    goal: one(goals, {
      fields: [goalStatus.goalId],
      references: [goals.id]
    })
  }));
  ```

**Indexes**:
- Primary key on `id`

**Usage**:
- Tracks goal status independent of progress percentage
- Used for filtering and visualization of goal health
- Provides context for goal progress assessment
- Referenced in dashboard for status summaries

### Execution Tasks

The `execution_tasks` table stores tasks that contribute to achieving goals.

**Table Name**: `execution_tasks`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each task
- `task`: TEXT NOT NULL - Task description
- `owner`: TEXT NOT NULL - Person responsible
- `ownerAvatar`: TEXT DEFAULT '' - Avatar image for the owner
- `goalCategory`: TEXT NOT NULL - Associated goal category
- `categoryColor`: TEXT DEFAULT 'blue' - Visual indicator color
- `dueDate`: TEXT NOT NULL - Due date for the task
- `status`: TEXT NOT NULL - Current status ("done", "in-progress", "missed")
- `weekId`: INTEGER NOT NULL - Associated week ID

**TypeScript Definition**:
```typescript
export const executionTasks = pgTable("execution_tasks", {
  id: serial("id").primaryKey(),
  task: text("task").notNull(),
  owner: text("owner").notNull(),
  ownerAvatar: text("owner_avatar").default(""),
  goalCategory: text("goal_category").notNull(),
  categoryColor: text("category_color").default("blue"),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(),
  weekId: integer("week_id").notNull(),
});
```

**Relationships**:
- Many-to-one relationship with `weeks`
- One-to-many relationship with `subtasks`
  ```typescript
  export const executionTasksRelations = relations(executionTasks, ({ one, many }) => ({
    week: one(weeks, {
      fields: [executionTasks.weekId],
      references: [weeks.id]
    }),
    subtasks: many(subtasks)
  }));
  ```

**Indexes**:
- Primary key on `id`

**Usage**:
- Core entity for task management functionality
- Used in Kanban board for drag-and-drop task management
- Associated with goals through the goalCategory field
- Organized by weeks for time-based planning

### Subtasks

The `subtasks` table stores smaller components of execution tasks.

**Table Name**: `subtasks`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each subtask
- `parentTaskId`: INTEGER NOT NULL - Associated parent task ID
- `description`: TEXT NOT NULL - Subtask description
- `completed`: BOOLEAN DEFAULT false - Completion status
- `createdAt`: TIMESTAMP DEFAULT NOW() - Creation timestamp
- `priority`: TEXT DEFAULT 'medium' - Priority level ("high", "medium", "low")

**TypeScript Definition**:
```typescript
export const subtasks = pgTable("subtasks", {
  id: serial("id").primaryKey(),
  parentTaskId: integer("parent_task_id").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  priority: text("priority").default("medium"),
});
```

**Relationships**:
- Many-to-one relationship with `executionTasks`
  ```typescript
  export const subtasksRelations = relations(subtasks, ({ one }) => ({
    parentTask: one(executionTasks, {
      fields: [subtasks.parentTaskId],
      references: [executionTasks.id]
    })
  }));
  ```

**Indexes**:
- Primary key on `id`

**Usage**:
- Allows breaking down complex tasks into smaller components
- Used for detailed task management
- Tracked for overall task completion status
- Supports priority-based organization

### Weeks

The `weeks` table represents time periods for grouping and tracking tasks.

**Table Name**: `weeks`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each week
- `number`: INTEGER NOT NULL - Week number
- `dateRange`: TEXT NOT NULL - Human-readable date range
- `completionRate`: REAL DEFAULT 0 - Task completion rate

**TypeScript Definition**:
```typescript
export const weeks = pgTable("weeks", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  dateRange: text("date_range").notNull(),
  completionRate: real("completion_rate").default(0),
});
```

**Relationships**:
- One-to-many relationship with `executionTasks`
  ```typescript
  export const weeksRelations = relations(weeks, ({ many }) => ({
    tasks: many(executionTasks)
  }));
  ```

**Indexes**:
- Primary key on `id`

**Usage**:
- Organizes tasks into weekly periods
- Used for time-based planning and tracking
- Provides context for task deadlines
- Tracks completion rates for weekly performance

### Users

The `users` table stores user account information.

**Table Name**: `users`

**Columns**:
- `id`: SERIAL PRIMARY KEY - Unique identifier for each user
- `username`: TEXT NOT NULL UNIQUE - Unique username
- `password`: TEXT NOT NULL - Hashed password

**TypeScript Definition**:
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
```

**Indexes**:
- Primary key on `id`
- Unique index on `username`

**Usage**:
- Stores user authentication information
- Used for login functionality
- Potential for future user-specific data and permissions

## Type Definitions

The schema includes TypeScript type definitions for all tables, including both insert and select types:

```typescript
// Insert types (for creating new records)
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type InsertGoalStatus = z.infer<typeof insertGoalStatusSchema>;
export type InsertExecutionTask = z.infer<typeof insertExecutionTaskSchema>;
export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type InsertWeek = z.infer<typeof insertWeekSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Select types (for retrieved records)
export type Goal = typeof goals.$inferSelect;
export type Metric = typeof metrics.$inferSelect;
export type GoalStatus = typeof goalStatus.$inferSelect;
export type ExecutionTask = typeof executionTasks.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type Week = typeof weeks.$inferSelect;
export type User = typeof users.$inferSelect;
```

## Schema Validation

The schema uses Zod for validation of database operations. Insert schemas are created using `createInsertSchema` from drizzle-zod and are used to validate data before insertion or updates.

Example:
```typescript
export const insertGoalSchema = createInsertSchema(goals).pick({
  name: true,
  current: true,
  target: true,
  unit: true,
  color: true,
  deadline: true,
});
```

These schemas are used in API routes to validate request bodies:

```typescript
// In routes.ts
const goalData = insertGoalSchema.parse(req.body);
const goal = await storage.createGoal(goalData);
```

## Storage Interface

The application uses a `DatabaseStorage` class that implements the `IStorage` interface for database operations. This class is defined in `server/storage.ts` and provides methods for all CRUD operations on the database tables.

Key methods include:
- `getAllGoals()`, `getGoal(id)`, `createGoal(goal)`, `updateGoal(id, goal)`, `deleteGoal(id)`
- `getAllMetrics()`, `getMetricsByCategory(category)`, `createMetric(metric)`, `updateMetric(id, metric)`
- `getAllGoalStatuses()`, `updateGoalStatus(id, status)`, `createGoalStatus(status)`
- `getTasksByWeek(weekId)`, `getAllTasks()`, `getTask(id)`, `createTask(task)`, `updateTask(id, task)`, `deleteTask(id)`
- `getSubtasksByParentId(parentTaskId)`, `getAllSubtasks()`, `getSubtask(id)`, `createSubtask(subtask)`, `updateSubtask(id, subtask)`, `deleteSubtask(id)`
- `getAllWeeks()`, `getWeek(id)`, `createWeek(week)`, `updateWeek(id, week)`
- `getUser(id)`, `getUserByUsername(username)`, `createUser(user)`

## Migrations

The application handles database migrations using Drizzle Kit. Migrations can be applied using:

```bash
npm run db:push
```

This will push changes in the schema directly to the database using Drizzle Kit's push functionality.

## Best Practices

1. **Use the Storage Interface**: Always interact with the database through the storage interface rather than directly using the Drizzle ORM in route handlers.

2. **Validate Data**: Always validate incoming data using the Zod schemas before performing database operations.

3. **Handle Relationships**: When deleting records, make sure to handle related records appropriately (e.g., deleting subtasks when deleting a task).

4. **Use Transactions**: For operations that affect multiple tables, use transactions to ensure data consistency.

5. **Cache Results**: For frequently accessed data, consider using the server-side cache implemented in `routes.ts`.

6. **Error Handling**: Always handle database errors and provide appropriate error messages to the client.

## Entity Relationship Diagram

```
goals 1 --- * goal_status
       |
       |  (referenced by category)
       v
execution_tasks 1 --- * subtasks
              |
              |
              v
        weeks 1 --- * execution_tasks
```

## Sample Queries

Here are some sample SQL queries for common operations:

1. **Get all goals with their status**:
```sql
SELECT g.*, gs.status
FROM goals g
LEFT JOIN goal_status gs ON g.id = gs.goal_id;
```

2. **Get tasks for a specific week with their subtasks**:
```sql
SELECT t.*, s.*
FROM execution_tasks t
LEFT JOIN subtasks s ON t.id = s.parent_task_id
WHERE t.week_id = $1;
```

3. **Get task completion rate for a week**:
```sql
SELECT 
  w.id,
  w.number,
  w.date_range,
  COUNT(CASE WHEN t.status = 'done' THEN 1 END) / COUNT(t.id)::float * 100 AS completion_rate
FROM weeks w
LEFT JOIN execution_tasks t ON w.id = t.week_id
WHERE w.id = $1
GROUP BY w.id;
```

4. **Get metrics by category**:
```sql
SELECT *
FROM metrics
WHERE category = $1;
```

5. **Get goals with progress percentage**:
```sql
SELECT 
  id,
  name,
  current,
  target,
  (current / target) * 100 AS progress_percentage
FROM goals;
```