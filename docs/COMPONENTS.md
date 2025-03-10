# 2025 Goals Tracking Platform Components

This document provides comprehensive information about the React components used in the 2025 Goals Tracking Platform, their props, and usage examples.

## Table of Contents

- [Page Components](#page-components)
- [Core Components](#core-components)
- [UI Components](#ui-components)
- [Layout Components](#layout-components)
- [Animation Components](#animation-components)
- [Utility Components](#utility-components)

## Page Components

Page components represent full pages in the application and are typically used as routes.

### Dashboard

The main overview page showing goals, metrics, tasks, and other key information.

**File**: `client/src/pages/dashboard.tsx`

**Features**:
- Displays goal cards with progress information
- Shows metrics grouped by category
- Presents execution tasks for the current week
- Provides quick actions for adding goals and updating progress

**Example**:
```tsx
// Main App component
function App() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}
```

### AddGoal

Form page for creating new goals.

**File**: `client/src/pages/add-goal.tsx`

**Features**:
- Form with validation for goal creation
- Deadline selection with calendar
- Color selection options
- Form submission with error handling

**Example**:
```tsx
// Link to add goal page
<Link href="/add-goal">
  <Button>Add Goal</Button>
</Link>
```

### AddProgress

Form page for updating progress on existing goals.

**File**: `client/src/pages/add-progress.tsx`

**Features**:
- Goal selection dropdown
- Current progress input with validation
- Progress visualization
- Success celebration on goal completion

**Example**:
```tsx
// Link to update progress with a specific goal selected
<Link href={`/add-progress?goalId=${goal.id}`}>
  <Button>Update Progress</Button>
</Link>
```

### TaskBoard

Kanban board for managing tasks.

**File**: `client/src/pages/task-board.tsx`

**Features**:
- Drag and drop task management
- Task filtering by status and goal
- Task sorting options
- Visualization toggle between board and progress view

**Example**:
```tsx
// Link to task board
<Link href="/task-board">
  <Button>Task Board</Button>
</Link>
```

### GoalVisualizations

Visualizations and charts for goal progress.

**File**: `client/src/pages/goal-visualizations.tsx`

**Features**:
- Multiple chart types for visualizing progress
- Goal filtering and sorting
- Detailed metrics and analytics
- Progress forecasting

**Example**:
```tsx
// Link to goal visualizations
<Link href="/goal-visualizations">
  <Button>Goal Visualizations</Button>
</Link>
```

### TaskDetails

Detailed view of a specific task.

**File**: `client/src/pages/task-details.tsx`

**Features**:
- Task information display
- Subtask management
- Task editing
- Task status updates

**Example**:
```tsx
// Link to task details
<Link href={`/tasks/${task.id}`}>
  <Button>View Task</Button>
</Link>
```

### GoalTasks

Tasks associated with a specific goal.

**File**: `client/src/pages/goal-tasks.tsx`

**Features**:
- List of tasks for a specific goal
- Task filtering and sorting
- Task status updates
- Progress tracking for goal completion

**Example**:
```tsx
// Link to goal tasks
<Link href={`/goal-tasks/${goal.id}`}>
  <Button>View Tasks</Button>
</Link>
```

### AddTask

Form page for creating new tasks.

**File**: `client/src/pages/add-task.tsx`

**Features**:
- Task creation form with validation
- Goal category association
- Due date selection
- Task owner assignment

**Example**:
```tsx
// Link to add task
<Link href="/add-task">
  <Button>Add Task</Button>
</Link>
```

## Core Components

Core components are reusable across multiple pages and provide key functionality.

### GoalProgressCard

Displays goal progress with visual indicators.

**File**: `client/src/components/goal-progress-card.tsx`

**Props**:
- `goal`: Goal object with progress information
- `onDelete`: Optional callback function for deleting goals

**Features**:
- Progress bar visualization
- Percentage completion display
- Color-coded status indicators
- Deadline information with urgency indicators

**Example**:
```tsx
<GoalProgressCard 
  goal={{
    id: 1,
    name: "Revenue Goal",
    current: 25,
    target: 100,
    unit: "M",
    color: "primary",
    deadline: "2025-12-31"
  }}
  onDelete={(id) => handleDeleteGoal(id)}
/>
```

### DragDropTaskBoard

Kanban board for task management with drag and drop functionality.

**File**: `client/src/components/drag-drop-task-board.tsx`

**Props**:
- `tasks`: Array of execution tasks
- `onTaskStatusChange`: Optional callback for handling status changes

**Features**:
- Drag and drop between columns
- Task details display
- Priority indicators
- Task status updates

**Example**:
```tsx
<DragDropTaskBoard 
  tasks={tasks}
  onTaskStatusChange={(taskId, newStatus) => handleStatusChange(taskId, newStatus)}
/>
```

### AnimatedProgressChart

Animated charts for goal visualization.

**File**: `client/src/components/animated-progress-chart.tsx`

**Props**:
- `goal`: Goal object with progress information
- `chartType`: Type of chart to display (area, bar, pie, etc.)
- `defaultChartType`: Initial chart type
- `height`: Optional chart height
- `showControls`: Whether to show chart type controls

**Features**:
- Multiple chart type options
- Animated transitions between chart types
- Interactive data display
- Progress visualization

**Example**:
```tsx
<AnimatedProgressChart 
  goal={goal}
  chartType="radial"
  height={300}
  showControls={true}
/>
```

### MetricsCard

Displays metrics with trend indicators.

**File**: `client/src/components/metrics-card.tsx`

**Props**:
- `title`: Card title
- `metrics`: Array of metric objects
- `category`: Optional category for filtering

**Features**:
- Metric value display
- Trend indicators (up/down)
- Percentage change visualization
- Category grouping

**Example**:
```tsx
<MetricsCard 
  title="Growth Metrics"
  metrics={growthMetrics}
  category="growth"
/>
```

### StatusIndicator

Shows goal status summaries.

**File**: `client/src/components/status-indicator.tsx`

**Props**:
- `statuses`: Array of goal status objects

**Features**:
- Status count visualization
- Color-coded status indicators
- Status breakdown

**Example**:
```tsx
<StatusIndicator statuses={goalStatuses} />
```

### VisualProgressTracker

Visual representation of goal progress.

**File**: `client/src/components/visual-progress-tracker.tsx`

**Props**:
- `goals`: Array of goal objects
- `tasks`: Array of task objects

**Features**:
- Progress visualization across goals
- Task completion indicators
- Visual timeline representation
- Goal relationships visualization

**Example**:
```tsx
<VisualProgressTracker 
  goals={goals}
  tasks={tasks}
/>
```

### WeeklyExecutionTracker

Tracks tasks by week.

**File**: `client/src/components/weekly-execution-tracker.tsx`

**Props**:
- `tasks`: Array of task objects
- `week`: Current week object
- `onPreviousWeek`: Callback function for navigating to previous week
- `onNextWeek`: Callback function for navigating to next week

**Features**:
- Weekly task breakdown
- Task completion rate visualization
- Week navigation
- Due date highlighting

**Example**:
```tsx
<WeeklyExecutionTracker 
  tasks={weekTasks}
  week={currentWeek}
  onPreviousWeek={handlePreviousWeek}
  onNextWeek={handleNextWeek}
/>
```

### QuickStartGuide

Onboarding component for new users.

**File**: `client/src/components/quick-start-guide.tsx`

**Props**: None

**Features**:
- Step-by-step guide for setting up goals
- Interactive form for quick setup
- Progress indicators
- Helpful tips and information

**Example**:
```tsx
<QuickStartGuide />
```

## UI Components

The application uses a comprehensive set of UI components, many built on top of shadcn/ui.

### AnimatedButton

Enhanced button with animation effects.

**File**: `client/src/components/ui/animated-button.tsx`

**Props**:
- Extends standard Button props
- `animation`: Animation type ("bounce", "pulse", "expand", etc.)
- `icon`: Optional icon element
- `iconPosition`: Position of icon ("left" or "right")
- `label`: Button text

**Example**:
```tsx
<AnimatedButton
  animation="bounce"
  variant="outline"
  size="sm"
  icon={<PlusCircle className="h-4 w-4" />}
  label="Add Item"
/>
```

### AnimatedProgress

Progress bar with animation effects.

**File**: `client/src/components/ui/animated-progress.tsx`

**Props**:
- `value`: Current progress value
- `maxValue`: Maximum progress value
- `showPercentage`: Whether to show percentage text
- `showValue`: Whether to show raw value
- `label`: Optional label text
- `height`: Height of progress bar
- `animationDuration`: Duration of animation
- `threshold`: Object defining threshold levels
- `thresholdColors`: Colors for different threshold levels
- `onComplete`: Callback function when progress completes

**Example**:
```tsx
<AnimatedProgress
  value={75}
  maxValue={100}
  showPercentage={true}
  height="8px"
  animationDuration={1000}
  threshold={{ high: 75, medium: 50, low: 25 }}
  thresholdColors={{
    high: "green",
    medium: "yellow",
    low: "orange",
    veryLow: "red"
  }}
  onComplete={() => console.log("Progress complete!")}
/>
```

### AnimatedTooltip

Tooltip with animation effects.

**File**: `client/src/components/ui/animated-tooltip.tsx`

**Props**:
- `content`: Tooltip content
- `children`: Element to trigger tooltip
- `position`: Tooltip position ("top", "bottom", "left", "right")
- `delay`: Delay before showing tooltip
- `duration`: Animation duration
- `animation`: Animation type ("fade", "scale", "slide", etc.)

**Example**:
```tsx
<AnimatedTooltip
  content="This is a tooltip"
  position="top"
  animation="fade"
>
  <Button>Hover Me</Button>
</AnimatedTooltip>
```

### Animated3DBackground

3D background effect with particles.

**File**: `client/src/components/ui/animated-3d-background.tsx`

**Props**:
- `color`: Particle color
- `particleCount`: Number of particles
- `speed`: Animation speed
- `interactive`: Whether particles react to mouse movement

**Example**:
```tsx
<Animated3DBackground
  color="#10b981"
  particleCount={150}
  speed={0.05}
  interactive={true}
/>
```

### ParticleEffect

Customizable particle effects for celebrations and visual feedback.

**File**: `client/src/components/ui/particle-effect.tsx`

**Props**:
- `type`: Effect type ("confetti", "sparkles", "bubbles", etc.)
- `count`: Number of particles
- `colors`: Array of colors
- `speed`: Animation speed
- `gravity`: Gravity effect
- `autoPlay`: Whether to start automatically
- `duration`: Effect duration

**Example**:
```tsx
<ParticleEffect
  type="confetti"
  count={100}
  colors={["#ff0000", "#00ff00", "#0000ff"]}
  autoPlay={true}
  duration={3000}
/>
```

### CursorEffect

Custom cursor effects.

**File**: `client/src/components/ui/cursor-effect.tsx`

**Props**:
- `cursorSize`: Size of cursor
- `trailCount`: Number of trailing elements
- `color`: Cursor color
- `glowColor`: Glow effect color
- `glowSize`: Size of glow effect

**Example**:
```tsx
<CursorEffect
  cursorSize={16}
  trailCount={8}
  color="#10b981"
  glowColor="rgba(16, 185, 129, 0.3)"
  glowSize={40}
/>
```

## Game Elements

Gamification components to enhance user engagement.

### XPBar

Experience points progress bar.

**File**: `client/src/components/game-elements.tsx`

**Props**:
- `current`: Current XP value
- `total`: Total XP required for next level
- `level`: Current level
- `showLevel`: Whether to display level

**Example**:
```tsx
<XPBar
  current={750}
  total={1000}
  level={5}
  showLevel={true}
/>
```

### StatusBar

Health/mana style status bar.

**File**: `client/src/components/game-elements.tsx`

**Props**:
- `current`: Current value
- `total`: Maximum value
- `type`: Bar type ("health" or "mana")
- `showLabel`: Whether to show labels

**Example**:
```tsx
<StatusBar
  current={75}
  total={100}
  type="health"
  showLabel={true}
/>
```

### QuestItem

Quest-style task presentation.

**File**: `client/src/components/game-elements.tsx`

**Props**:
- `title`: Quest title
- `description`: Quest description
- `completed`: Completion status
- `priority`: Priority level ("low", "medium", "high")
- `reward`: Reward object with XP and coins

**Example**:
```tsx
<QuestItem
  title="Complete Marketing Campaign"
  description="Launch and monitor Q2 marketing campaign"
  completed={false}
  priority="high"
  reward={{ xp: 100, coins: 50 }}
  onClick={() => handleQuestClick()}
/>
```

### Celebration

Celebration effects for achievements.

**File**: `client/src/components/game-elements.tsx`

**Props**:
- `isActive`: Whether celebration is active
- `duration`: Duration of celebration
- `onComplete`: Callback when celebration ends

**Example**:
```tsx
<Celebration
  isActive={showCelebration}
  duration={5000}
  onComplete={() => setShowCelebration(false)}
/>
```

## Layout Components

Components for page structure and layout.

### SimpleNav

Simple navigation bar.

**File**: `client/src/components/layout/simple-nav.tsx`

**Props**: None

**Features**:
- Consistent navigation links
- Mobile-responsive design
- Active link highlighting

**Example**:
```tsx
<SimpleNav />
```

## Custom Hooks

Custom React hooks for reusable functionality.

### useGoalCelebration

Hook for managing goal celebration effects.

**File**: `client/src/hooks/use-goal-celebration.ts`

**Returns**:
- `triggerCelebration`: Function to trigger celebration with data

**Example**:
```tsx
const { triggerCelebration } = useGoalCelebration();

// When a goal is completed
triggerCelebration({
  goalName: "Revenue Goal",
  progressPercentage: 100,
  username: "John Doe"
});
```

### useIsMobile

Hook for detecting mobile viewport.

**File**: `client/src/hooks/use-mobile.tsx`

**Returns**:
- `isMobile`: Boolean indicating if viewport is mobile size

**Example**:
```tsx
const isMobile = useIsMobile();

return (
  <div>
    {isMobile ? (
      <MobileView />
    ) : (
      <DesktopView />
    )}
  </div>
);
```

### useToast

Hook for displaying toast notifications.

**File**: `client/src/hooks/use-toast.ts`

**Returns**:
- `toast`: Function for showing toast notifications

**Example**:
```tsx
const { toast } = useToast();

// Show success toast
toast({
  title: "Success",
  description: "Goal updated successfully",
  variant: "default"
});

// Show error toast
toast({
  title: "Error",
  description: "Failed to update goal",
  variant: "destructive"
});
```

## Utility Functions

Helper functions used throughout the application.

### Date Utilities

**File**: `client/src/utils/date-utils.ts`

**Functions**:
- `formatDate`: Formats a date string
- `isDatePast`: Checks if a date is in the past
- `getDaysUntil`: Gets days until/since a date
- `getDaysUntilDescription`: Gets a description of days until/since a date
- `getUrgencyLevel`: Gets urgency level based on due date

**Example**:
```tsx
// Format a date
const formattedDate = formatDate("2025-12-31"); // "Dec 31, 2025"

// Get days until description
const daysDescription = getDaysUntilDescription("2025-12-31"); // "245 days left"

// Get urgency level
const urgency = getUrgencyLevel("2025-03-15"); // "high", "medium", or "low"
```

### String Utilities

**File**: `client/src/utils/string-utils.ts`

**Functions**:
- `getFirstCharacter`: Gets the first character of a string safely
- `getStringOrFallback`: Provides a fallback for null/undefined strings

**Example**:
```tsx
// Get first character
const initial = getFirstCharacter("John"); // "J"
const initialWithFallback = getFirstCharacter(null, "U"); // "U"

// Get string or fallback
const name = getStringOrFallback(user.name, "Unassigned"); // Returns user.name or "Unassigned" if null/undefined
```

## Integration Guidance

### Using Components Together

Here's an example of integrating multiple components for a comprehensive goal tracking view:

```tsx
function GoalTrackingView({ goalId }) {
  const { toast } = useToast();
  const { data: goal } = useQuery<Goal>({ queryKey: ['/api/goals', goalId] });
  const { data: tasks } = useQuery<ExecutionTask[]>({ queryKey: ['/api/tasks'] });
  const { triggerCelebration } = useGoalCelebration();
  
  const goalTasks = tasks?.filter(task => task.goalCategory === goal?.name) || [];
  
  const handleUpdateProgress = async (newValue: number) => {
    try {
      await apiRequest('PATCH', `/api/goals/${goalId}`, { current: newValue });
      
      // If goal is completed, trigger celebration
      if (newValue >= goal.target) {
        triggerCelebration({
          goalName: goal.name,
          progressPercentage: 100
        });
      }
      
      toast({
        title: "Progress Updated",
        description: "Goal progress has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };
  
  if (!goal) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      <GoalProgressCard goal={goal} />
      
      <AnimatedProgressChart 
        goal={goal}
        chartType="radial"
        height={300}
        showControls={true}
      />
      
      <h2>Tasks for {goal.name}</h2>
      <DragDropTaskBoard
        tasks={goalTasks}
        onTaskStatusChange={(taskId, status) => {
          toast({
            title: "Task Updated",
            description: `Task status changed to ${status}`
          });
        }}
      />
      
      <Button onClick={() => handleUpdateProgress(goal.current + 5)}>
        Update Progress (+5)
      </Button>
    </div>
  );
}
```

### Best Practices

1. **Component Composition**:
   - Build complex UIs by composing smaller, reusable components
   - Use layout components to maintain consistent structure

2. **State Management**:
   - Use React Query for server state
   - Use local state for UI interactions
   - Use context for shared state (like celebrations)

3. **Performance Optimization**:
   - Memoize expensive components with React.memo
   - Use useCallback for event handlers
   - Implement proper dependency arrays in useEffect

4. **Animation Usage**:
   - Use animations purposefully to enhance user experience
   - Ensure animations are accessible and don't interfere with usability
   - Provide options to reduce motion for users who prefer it

5. **Responsive Design**:
   - Use the useIsMobile hook to adapt UI for different viewport sizes
   - Implement alternative layouts for mobile devices
   - Test on various screen sizes