# 2025 Goals Tracking Platform Developer Guide

This developer guide provides comprehensive information for developers working on the 2025 Goals Tracking Platform. It covers setup instructions, architecture overview, code standards, and guidelines for extending the application.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Architecture](#project-architecture)
- [Codebase Overview](#codebase-overview)
- [Key Technologies](#key-technologies)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Performance Considerations](#performance-considerations)
- [Contributing Guidelines](#contributing-guidelines)
- [Deployment](#deployment)

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- PostgreSQL database
- Git

### Local Setup

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

4. Run the database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. The server will be running at [http://localhost:5000](http://localhost:5000)

### IDE Configuration

#### Recommended Extensions (VS Code)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Hero
- ES7+ React/Redux/GraphQL/React-Native snippets

#### Settings (VS Code)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Project Architecture

The 2025 Goals Tracking Platform follows a client-server architecture with a clear separation between the frontend and backend.

### High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  React UI   │◄───►│ Express API  │◄───►│ PostgreSQL  │
│  (Frontend) │     │  (Backend)   │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Frontend Architecture

The frontend uses a component-based architecture with React, organizing components by feature and function.

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── pages/          # Application pages/routes
│   └── utils/          # Helper functions
```

### Backend Architecture

The backend follows a layered architecture with clear separation of concerns:

```
server/
├── db.ts               # Database connection
├── index.ts            # Server entry point
├── routes.ts           # API route definitions
├── storage.ts          # Data storage layer
└── vite.ts             # Vite integration
```

### Data Flow

1. User interacts with React components
2. React Query manages API calls to the backend
3. Express routes handle API requests
4. Storage layer performs database operations via Drizzle ORM
5. Data is returned to the frontend
6. React components update to reflect the new data

## Codebase Overview

### Key Files and Directories

- `/shared/schema.ts`: Database schema definitions and shared types
- `/server/storage.ts`: Data storage interface and implementation
- `/server/routes.ts`: API route definitions and handlers
- `/server/db.ts`: Database connection setup
- `/client/src/pages`: Application pages and routes
- `/client/src/components`: Reusable UI components
- `/client/src/lib/queryClient.ts`: React Query configuration
- `/client/src/hooks`: Custom React hooks

### Code Organization Principles

1. **Component-Based Architecture**: UI is built using small, reusable components
2. **Shared Types**: TypeScript types are shared between frontend and backend
3. **Separation of Concerns**: Clear separation between UI, data fetching, and business logic
4. **DRY Principle**: Common functionality is extracted into reusable hooks and utilities

## Key Technologies

### Frontend

- **React**: UI library for building component-based interfaces
- **TypeScript**: Type-safe JavaScript superset
- **React Query**: Data fetching, caching, and state management
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Shadcn UI**: Component library built on Radix UI
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Recharts/Chart.js**: Data visualization
- **react-beautiful-dnd**: Drag and drop functionality

### Backend

- **Express**: Web framework for Node.js
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Relational database
- **Zod**: Schema validation
- **TypeScript**: Type-safe JavaScript superset

## Development Workflow

### Feature Development Process

1. **Branch Creation**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Development**: Implement the feature, following code standards
   - Start with database schema if needed in `shared/schema.ts`
   - Implement backend storage methods in `server/storage.ts`
   - Add API routes in `server/routes.ts`
   - Create/update React components in `client/src/components`
   - Add/update pages in `client/src/pages`

3. **Local Testing**: Test the feature locally
   ```bash
   npm run dev
   ```

4. **Commit Changes**: Commit changes with descriptive messages
   ```bash
   git add .
   git commit -m "Add feature: Feature description"
   ```

5. **Push Branch**: Push the branch to the remote repository
   ```bash
   git push origin feature/feature-name
   ```

6. **Create Pull Request**: Create a pull request for review

### Code Standards

#### TypeScript

- Use TypeScript for all new code
- Define interfaces/types for all data structures
- Use proper typing for function parameters and return values
- Avoid using `any` type unless absolutely necessary

#### Component Guidelines

- Use functional components with hooks
- Use TypeScript interfaces for props
- Destructure props at the top of components
- Extract complex logic into custom hooks
- Use memoization for expensive computations

#### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions**: camelCase
- **Variables**: camelCase
- **Types/Interfaces**: PascalCase
- **CSS Classes**: kebab-case (via Tailwind)

#### CSS/Styling

- Use Tailwind CSS utility classes for styling
- Use CSS modules for complex components if needed
- Follow mobile-first approach for responsive design
- Use theme variables for colors and spacing

## Adding New Features

### Adding a New Entity

To add a new entity to the system (e.g., "Projects"):

1. **Update Schema**:
   ```typescript
   // In shared/schema.ts
   export const projects = pgTable("projects", {
     id: serial("id").primaryKey(),
     name: text("name").notNull(),
     description: text("description").default(""),
     goalId: integer("goal_id").notNull(),
     // ... other fields
   });

   export const projectsRelations = relations(projects, ({ one }) => ({
     goal: one(goals, {
       fields: [projects.goalId],
       references: [goals.id]
     })
   }));

   export const insertProjectSchema = createInsertSchema(projects).pick({
     name: true,
     description: true,
     goalId: true,
     // ... other fields
   });

   export type InsertProject = z.infer<typeof insertProjectSchema>;
   export type Project = typeof projects.$inferSelect;
   ```

2. **Update Storage Interface**:
   ```typescript
   // In server/storage.ts
   export interface IStorage {
     // ... existing methods
     
     // Project methods
     getAllProjects(): Promise<Project[]>;
     getProject(id: number): Promise<Project | undefined>;
     createProject(project: InsertProject): Promise<Project>;
     updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
     deleteProject(id: number): Promise<boolean>;
   }
   ```

3. **Implement Storage Methods**:
   ```typescript
   // In server/storage.ts (DatabaseStorage class)
   async getAllProjects(): Promise<Project[]> {
     return await db.select().from(projects);
   }

   async getProject(id: number): Promise<Project | undefined> {
     const result = await db.select().from(projects).where(eq(projects.id, id));
     return result[0];
   }

   async createProject(insertProject: InsertProject): Promise<Project> {
     const result = await db.insert(projects).values(insertProject).returning();
     return result[0];
   }

   async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
     const result = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
     return result[0];
   }

   async deleteProject(id: number): Promise<boolean> {
     const result = await db.delete(projects).where(eq(projects.id, id));
     return !!result;
   }
   ```

4. **Add API Routes**:
   ```typescript
   // In server/routes.ts
   app.get("/api/projects", async (req, res) => {
     try {
       const projects = await storage.getAllProjects();
       res.json(projects);
     } catch (error) {
       res.status(500).json({ message: "Error fetching projects" });
     }
   });

   app.get("/api/projects/:id", async (req, res) => {
     try {
       const id = parseInt(req.params.id);
       const project = await storage.getProject(id);
       
       if (!project) {
         return res.status(404).json({ message: "Project not found" });
       }
       
       res.json(project);
     } catch (error) {
       res.status(500).json({ message: "Error fetching project" });
     }
   });

   // ... other CRUD routes
   ```

5. **Create React Components**:
   ```tsx
   // In client/src/components/project-card.tsx
   interface ProjectCardProps {
     project: Project;
     onDelete?: (id: number) => void;
   }

   export function ProjectCard({ project, onDelete }: ProjectCardProps) {
     return (
       <Card>
         <CardHeader>
           <CardTitle>{project.name}</CardTitle>
         </CardHeader>
         <CardContent>
           <p>{project.description}</p>
         </CardContent>
         {onDelete && (
           <CardFooter>
             <Button variant="destructive" onClick={() => onDelete(project.id)}>
               Delete
             </Button>
           </CardFooter>
         )}
       </Card>
     );
   }
   ```

6. **Add Page Components**:
   ```tsx
   // In client/src/pages/projects.tsx
   export default function Projects() {
     const { data: projects = [] } = useQuery<Project[]>({
       queryKey: ['/api/projects'],
     });
     
     return (
       <div>
         <h1>Projects</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {projects.map(project => (
             <ProjectCard key={project.id} project={project} />
           ))}
         </div>
       </div>
     );
   }
   ```

7. **Update App Routes**:
   ```tsx
   // In client/src/App.tsx
   // Update the routing switch statement to include the new page
   switch (path) {
     // ... existing routes
     case '/projects':
       setCurrentPage(<Projects />);
       break;
   }
   ```

8. **Apply Database Migration**:
   ```bash
   npm run db:push
   ```

### Adding New Visualizations

To add a new visualization type:

1. **Create Visualization Component**:
   ```tsx
   // In client/src/components/bubble-chart.tsx
   interface BubbleChartProps {
     data: any[];
     width?: number;
     height?: number;
   }

   export function BubbleChart({ data, width = 500, height = 300 }: BubbleChartProps) {
     return (
       <ResponsiveContainer width="100%" height={height}>
         <ScatterChart>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="x" />
           <YAxis dataKey="y" />
           <ZAxis dataKey="z" range={[60, 400]} />
           <Tooltip cursor={{ strokeDasharray: '3 3' }} />
           <Legend />
           <Scatter data={data} fill="#8884d8" />
         </ScatterChart>
       </ResponsiveContainer>
     );
   }
   ```

2. **Update Chart Type Options**:
   ```tsx
   // In client/src/components/animated-progress-chart.tsx
   // Update chartOptions array
   const chartOptions: { type: ChartType; icon: React.ReactNode; label: string }[] = [
     // ... existing options
     { type: 'bubble', icon: <CircleIcon className="h-4 w-4" />, label: 'Bubble' },
   ];
   ```

3. **Update Chart Type Definition**:
   ```tsx
   // In client/src/components/animated-progress-chart.tsx
   // Update ChartType type
   type ChartType = 'area' | 'bar' | 'pie' | 'line' | 'radial' | 'combo' | 'forecast' | 'radar' | 'heatmap' | 'multiaxis' | 'bubble';
   ```

4. **Implement Chart Rendering**:
   ```tsx
   // In client/src/components/animated-progress-chart.tsx
   // Update renderChart function to include the new chart type
   const renderChart = useCallback(() => {
     switch (chartType) {
       // ... existing cases
       case 'bubble':
         return (
           <BubbleChart
             data={[
               { x: goal.current, y: goal.target, z: (goal.current / goal.target) * 100, name: goal.name },
               // ... other data points
             ]}
             height={height}
           />
         );
       default:
         return null;
     }
   }, [chartType, goal, height]);
   ```

## Testing

### Unit Testing

The project uses Jest for unit testing. To run tests:

```bash
npm test
```

#### Writing Unit Tests

- Test files should be located next to the file they test with a `.test.ts` or `.test.tsx` extension
- Use React Testing Library for testing React components
- Mock external dependencies and API calls
- Focus on testing behavior, not implementation details

Example component test:

```tsx
// In client/src/components/goal-progress-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalProgressCard } from './goal-progress-card';

describe('GoalProgressCard', () => {
  const mockGoal = {
    id: 1,
    name: 'Test Goal',
    current: 50,
    target: 100,
    unit: '',
    color: 'primary',
    deadline: '2025-12-31'
  };

  it('renders correctly', () => {
    render(<GoalProgressCard goal={mockGoal} />);
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('of 100')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<GoalProgressCard goal={mockGoal} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<GoalProgressCard goal={mockGoal} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
```

### End-to-End Testing

The project uses Cypress for end-to-end testing. To run E2E tests:

```bash
npm run e2e
```

#### Writing E2E Tests

- E2E tests are located in the `cypress/integration` directory
- Focus on testing critical user flows
- Test from the user's perspective

Example E2E test:

```js
// In cypress/integration/goal-creation.spec.js
describe('Goal Creation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should create a new goal', () => {
    cy.get('[data-cy=add-goal-button]').click();
    cy.url().should('include', '/add-goal');
    
    cy.get('[data-cy=goal-name-input]').type('Cypress Test Goal');
    cy.get('[data-cy=current-value-input]').type('10');
    cy.get('[data-cy=target-value-input]').type('100');
    cy.get('[data-cy=unit-input]').type('units');
    cy.get('[data-cy=color-select]').click();
    cy.get('[data-cy=color-option-blue]').click();
    
    cy.get('[data-cy=submit-button]').click();
    
    cy.url().should('equal', Cypress.config().baseUrl + '/');
    cy.get('[data-cy=goal-card]').should('contain', 'Cypress Test Goal');
  });
});
```

## Performance Considerations

### Frontend Optimization

1. **Component Memoization**:
   - Use React.memo for components that render frequently but with the same props
   - Use useCallback for callback functions passed to child components
   - Use useMemo for expensive calculations

   ```tsx
   const MemoizedComponent = React.memo(({ prop1, prop2 }) => {
     // Component implementation
   });

   const handleClick = useCallback(() => {
     // Handle click
   }, [dependencies]);

   const expensiveResult = useMemo(() => {
     return computeExpensiveValue(a, b);
   }, [a, b]);
   ```

2. **React Query Optimization**:
   - Use appropriate staleTime and cacheTime settings
   - Implement optimistic updates for mutations
   - Use query invalidation strategically

   ```tsx
   const { data } = useQuery({
     queryKey: ['/api/goals'],
     staleTime: 60 * 1000, // 1 minute
     cacheTime: 5 * 60 * 1000, // 5 minutes
   });

   const mutation = useMutation({
     mutationFn: async (data) => {
       return apiRequest('POST', '/api/goals', data);
     },
     onMutate: async (newGoal) => {
       // Implement optimistic update
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
     },
   });
   ```

3. **Code Splitting**:
   - Use React.lazy and Suspense for code splitting
   - Split code by route to reduce initial bundle size

   ```tsx
   const Dashboard = React.lazy(() => import('./pages/dashboard'));
   const GoalVisualizations = React.lazy(() => import('./pages/goal-visualizations'));

   function App() {
     return (
       <Suspense fallback={<LoadingSpinner />}>
         <Switch>
           <Route path="/" exact component={Dashboard} />
           <Route path="/goals" component={GoalVisualizations} />
           {/* Other routes */}
         </Switch>
       </Suspense>
     );
   }
   ```

### Backend Optimization

1. **Caching**:
   - Use the server-side cache for frequently accessed data
   - Set appropriate TTL (Time-To-Live) values

   ```typescript
   // In server/routes.ts
   const cacheKey = "goals:all";
   const cachedGoals = serverCache.get(cacheKey);
   
   if (cachedGoals) {
     res.set('X-Cache', 'HIT');
     return res.json(cachedGoals);
   }
   
   // Cache miss, fetch from database
   const goals = await storage.getAllGoals();
   
   // Cache for 30 seconds
   serverCache.set(cacheKey, goals, 30 * 1000);
   ```

2. **Database Queries**:
   - Use indexes for frequently queried fields
   - Limit the amount of data returned
   - Use joins efficiently

   ```typescript
   // In server/storage.ts
   async getGoalWithStatus(id: number): Promise<GoalWithStatus | undefined> {
     const result = await db
       .select({
         ...goals,
         status: goalStatus.status,
       })
       .from(goals)
       .leftJoin(goalStatus, eq(goals.id, goalStatus.goalId))
       .where(eq(goals.id, id))
       .limit(1);
     
     return result[0];
   }
   ```

3. **API Response Size**:
   - Select only the fields you need
   - Use pagination for large collections
   - Compress responses for larger payloads

   ```typescript
   // In server/routes.ts
   app.get("/api/tasks", async (req, res) => {
     try {
       const page = parseInt(req.query.page as string) || 1;
       const limit = parseInt(req.query.limit as string) || 20;
       const offset = (page - 1) * limit;
       
       const tasks = await db
         .select()
         .from(executionTasks)
         .limit(limit)
         .offset(offset);
       
       const total = await db
         .select({ count: count() })
         .from(executionTasks);
       
       res.json({
         data: tasks,
         pagination: {
           page,
           limit,
           total: total[0].count,
           pages: Math.ceil(total[0].count / limit)
         }
       });
     } catch (error) {
       res.status(500).json({ message: "Error fetching tasks" });
     }
   });
   ```

## Contributing Guidelines

### Pull Request Process

1. Ensure all tests pass before submitting a pull request
2. Update documentation to reflect any changes
3. Include a clear description of the changes in the pull request
4. Reference any related issues in the pull request description
5. Request code review from at least one team member

### Code Review Guidelines

1. **Readability**: Is the code easy to understand?
2. **Functionality**: Does the code perform its intended function?
3. **Performance**: Are there any performance concerns?
4. **Testing**: Are there appropriate tests?
5. **Documentation**: Is the code adequately documented?
6. **Security**: Are there any security concerns?

## Deployment

### Building for Production

To build the application for production:

```bash
npm run build
```

This will:
1. Build the React frontend with Vite
2. Bundle the Express backend with esbuild
3. Output the production files to the `dist` directory

### Deployment Process

1. **Environment Variables**:
   - Ensure all required environment variables are set in the production environment
   - Use production database credentials in `DATABASE_URL`

2. **Database Migration**:
   - Run database migrations if needed
   ```bash
   NODE_ENV=production npm run db:push
   ```

3. **Start the Server**:
   ```bash
   NODE_ENV=production node dist/index.js
   ```

### Deployment Checklist

- [ ] Build application for production
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Configure and run server
- [ ] Verify application is running correctly
- [ ] Monitor for errors

## Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)