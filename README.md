# 2025 Goals Tracking Platform

A comprehensive platform that transforms personal and professional objective setting into an engaging, motivational journey. Track your 2025 goals with dynamic visual progress tracking, interactive management tools, and intelligent insights to stay motivated and aligned with your aspirations.

![2025 Goals Tracking Platform](./public/images/goals-screenshot.png)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [Usage Guide](#usage-guide)
  - [Setting Goals](#setting-goals)
  - [Tracking Progress](#tracking-progress)
  - [Managing Tasks](#managing-tasks)
  - [Visualizing Data](#visualizing-data)
- [Architecture](#architecture)
  - [Technology Stack](#technology-stack)
  - [Project Structure](#project-structure)
  - [Data Model](#data-model)
- [API Reference](#api-reference)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Features

### Goal Tracking
- Create and track progress towards 2025 goals
- Visual progress indicators with customizable colors
- Deadline monitoring with urgency levels
- Automatic metrics calculation based on goal progress

### Task Management
- Kanban-style task board with drag-and-drop functionality
- Task assignment and ownership tracking
- Deadline tracking with status updates
- Subtask management for complex tasks

### Visual Analytics
- Multiple chart types (area, bar, pie, line, radial)
- Progress tracking visualizations
- Metrics dashboards with trend indicators
- Weekly completion rate tracking

### Gamification Elements
- XP bars and level tracking
- Celebration effects for completed goals
- Achievement recognition
- Quest-style task presentation

### Interactive UI
- Rich animations and transitions
- 3D background effects
- Particle effects for celebrations
- Cursor effects and visual feedback

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/2025-goals-tracker.git
   cd 2025-goals-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   PORT=5000
   ```

4. Build and start the application:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

### Database Setup

The application uses Drizzle ORM to manage the database schema. To set up your database:

1. Ensure your PostgreSQL database is running and accessible via the DATABASE_URL in your .env file.

2. Run the database migration to create tables:
   ```bash
   npm run db:push
   ```

## Usage Guide

### Setting Goals

1. Click the "Add Goal" button in the navigation bar
2. Fill in the goal details:
   - Name: Descriptive title for your goal
   - Current Value: Starting point
   - Target Value: End point to achieve
   - Unit (optional): Unit of measurement (e.g., M for million)
   - Color: Visual indicator color
   - Deadline: Target completion date
3. Click "Add Goal" to create the goal

### Tracking Progress

1. Navigate to the Dashboard
2. Click on a goal card or "Update Progress" button
3. Enter the new current value
4. The system will automatically:
   - Update progress visualization
   - Recalculate metrics
   - Trigger celebration effects if completed

### Managing Tasks

1. Navigate to the Task Board
2. Tasks are organized in three columns:
   - In Progress: Active tasks
   - Completed: Finished tasks
   - Missed: Overdue or failed tasks
3. Drag and drop tasks between columns to update status
4. Click "Add Task" to create new tasks
5. Click on a task to view details and manage subtasks

### Visualizing Data

1. Navigate to Goal Visualizations
2. Choose from multiple visualization types:
   - Area chart: Progress over time
   - Bar chart: Comparison between goals
   - Pie chart: Proportion analysis
   - Line chart: Trend analysis
   - Radial chart: Goal completion percentage
3. Filter and sort visualizations as needed

## Architecture

### Technology Stack

#### Backend
- **Express.js**: Powers the server-side API
- **PostgreSQL**: Database for persistent storage
- **Drizzle ORM**: Database schema management and queries
- **Zod**: Schema validation for data integrity

#### Frontend
- **React**: UI component library
- **TypeScript**: Type-safe code development
- **React Query**: Data fetching, caching, and state management
- **Tailwind CSS**: Responsive design framework
- **Shadcn UI**: Component library built on Radix UI primitives
- **Framer Motion**: Advanced animations
- **Three.js**: 3D visualizations and effects
- **Chart.js/Recharts**: Data visualization
- **react-beautiful-dnd**: Drag and drop functionality

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Application pages/routes
│   │   ├── utils/          # Helper functions
│   │   └── context/        # React context providers
├── server/                 # Backend Express application
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage layer (DB operations)
│   └── vite.ts             # Vite integration for development
└── shared/                 # Shared code between frontend and backend
    └── schema.ts           # Database schema and type definitions
```

### Data Model

The application is built around the following core data entities:

#### Goals
Goals represent the primary tracking objectives with progress measured against targets.

**Properties**:
- `id`: Unique identifier
- `name`: Goal name
- `current`: Current progress value
- `target`: Target value to achieve
- `unit`: Unit of measurement (e.g., "M" for million)
- `color`: Visual indicator color
- `deadline`: Target date for completion (ISO format)

#### Metrics
Metrics provide additional context and measurements related to goals.

**Properties**:
- `id`: Unique identifier
- `name`: Metric name
- `value`: Current value
- `previousValue`: Previous value for trend calculation
- `trend`: Calculated trend percentage
- `trendDirection`: Direction of trend (up/down/stable)
- `category`: Category grouping (e.g., "growth", "revenue")

#### Goal Status
Tracks the current status of goals.

**Properties**:
- `id`: Unique identifier
- `goalId`: Associated goal ID
- `goalName`: Associated goal name
- `status`: Current status ("on-track", "needs-attention", "off-track")

#### Execution Tasks
Tasks that contribute to achieving goals.

**Properties**:
- `id`: Unique identifier
- `task`: Task description
- `owner`: Person responsible
- `ownerAvatar`: Avatar image for the owner
- `goalCategory`: Associated goal category
- `categoryColor`: Visual indicator color
- `dueDate`: Due date for the task
- `status`: Current status ("done", "in-progress", "missed")
- `weekId`: Associated week ID

#### Subtasks
Component parts of execution tasks.

**Properties**:
- `id`: Unique identifier
- `parentTaskId`: Associated parent task ID
- `description`: Subtask description
- `completed`: Completion status
- `createdAt`: Creation timestamp
- `priority`: Priority level ("high", "medium", "low")

#### Weeks
Time periods for grouping and tracking tasks.

**Properties**:
- `id`: Unique identifier
- `number`: Week number
- `dateRange`: Human-readable date range
- `completionRate`: Task completion rate

## API Reference

### Goals API
- `GET /api/goals`: Retrieves all goals
- `POST /api/goals`: Creates a new goal
- `PATCH /api/goals/:id`: Updates an existing goal
- `DELETE /api/goals/:id`: Deletes a goal

### Metrics API
- `GET /api/metrics`: Retrieves all metrics
- `GET /api/metrics/category/:category`: Retrieves metrics by category
- `POST /api/metrics`: Creates a new metric
- `PATCH /api/metrics/:id`: Updates an existing metric
- `POST /api/metrics/refresh`: Recalculates metrics based on goal data

### Goal Status API
- `GET /api/goal-statuses`: Retrieves all goal statuses
- `POST /api/goal-statuses`: Creates a new goal status
- `PATCH /api/goal-statuses/:id`: Updates an existing goal status

### Tasks API
- `GET /api/tasks`: Retrieves all tasks
- `GET /api/tasks/:id`: Retrieves a specific task
- `GET /api/tasks/week/:weekId`: Retrieves tasks for a specific week
- `GET /api/tasks/week`: Retrieves tasks for the current week
- `POST /api/tasks`: Creates a new task
- `PATCH /api/tasks/:id`: Updates an existing task
- `DELETE /api/tasks/:id`: Deletes a task

### Subtasks API
- `GET /api/subtasks/parent/:parentId`: Retrieves subtasks for a parent task
- `POST /api/subtasks`: Creates a new subtask
- `PATCH /api/subtasks/:id`: Updates an existing subtask
- `DELETE /api/subtasks/:id`: Deletes a subtask

### Weeks API
- `GET /api/weeks`: Retrieves all weeks
- `GET /api/weeks/:id`: Retrieves a specific week
- `POST /api/weeks`: Creates a new week
- `PATCH /api/weeks/:id`: Updates an existing week

## Customization

### Adding New Goal Types

1. Add new categories in the goal form component
2. Update metric calculations in `/server/routes.ts` if needed
3. Add appropriate visualizations in goal visualization components

### Customizing Visualization Styles

1. Update theme settings in `/theme.json`
2. Modify color schemes in visualization components
3. Adjust animation parameters for visual effects

### Adding Gamification Elements

1. Extend the game-elements.tsx component with new elements
2. Configure reward thresholds and celebration triggers
3. Customize achievement recognition logic

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.