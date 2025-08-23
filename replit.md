# 2025 Goals Tracking Platform

## Overview

The 2025 Goals Tracking Platform is a comprehensive web application designed to help users track and manage their personal and professional goals for the year 2025. The platform transforms objective setting into an engaging, motivational journey with dynamic visual progress tracking, interactive goal management, task organization, and gamification elements.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with Shadcn UI component library
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **3D Graphics**: Three.js for globe visualization and enhanced visual effects

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API**: RESTful architecture with proper error handling and caching

### Shared Layer
- **Schema**: Drizzle schema definitions shared between frontend and backend
- **Type Safety**: Full TypeScript integration across the stack
- **Validation**: Zod for runtime type validation

## Key Components

### Database Layer
The application uses a relational database schema with the following main entities:
- **Goals**: Core goal tracking with progress, targets, and deadlines
- **Metrics**: Key performance indicators grouped by categories
- **Goal Status**: Status tracking (on-track, needs-attention, off-track)
- **Execution Tasks**: Task management with Kanban-style organization
- **Weeks**: Weekly planning and progress tracking
- **Users**: User management with location data for global visualization
- **Prospects**: Sales/business prospect tracking

### Frontend Components
- **Dashboard**: Main overview with goal cards, metrics, and quick actions
- **Goal Management**: Create, edit, and delete goals with visual progress tracking
- **Task Board**: Drag-and-drop Kanban board for task management
- **Visualizations**: Multiple chart types and 3D globe for data visualization
- **Gamification**: XP bars, celebrations, and achievement recognition
- **OODA Dashboard**: Trillion-Dollar Daily Revenue Ritual with Atomic Habits principles built-in
- **Pomodoro Timer**: Focus timer with work/break cycles, notifications, and session tracking

### API Endpoints
- Goals CRUD operations (`/api/goals`)
- Metrics management (`/api/metrics`)
- Task management (`/api/tasks`)
- Status tracking (`/api/goal-statuses`)
- User management (`/api/users`)
- Weekly planning (`/api/weeks`)
- OODA Loop system (`/api/ooda/*`)

## OODA Dashboard System

### Overview
The OODA Dashboard implements a "Trillion-Dollar Daily Revenue Ritual" based on the military OODA Loop (Observe, Orient, Decide, Act) combined with Atomic Habits principles. It transforms daily revenue activities into a systematic, habit-forming process.

### Atomic Habits Integration
1. **Make it Obvious**: Clear visual progress, time-based greetings, immediate visual feedback
2. **Make it Easy**: 2-minute minimum actions, simple one-field inputs, guided workflow
3. **Make it Attractive**: Progressive completion rewards, streak tracking, celebration animations
4. **Make it Satisfying**: Immediate feedback, progress bars, completion celebrations

### Key Features
- **Daily OODA Loop**: 4-phase guided workflow (Observe → Orient → Decide → Act)
- **Habit Persistence**: Local storage saves progress and notes automatically
- **Minimum Viable Actions**: Each phase has a 2-minute default action to reduce friction
- **Progress Tracking**: Visual progress bar and phase completion indicators
- **Streak System**: Daily completion tracking with celebration effects
- **Revenue Opportunities**: AI-suggested high-leverage actions with priority scoring
- **Time-Based Context**: Dynamic greetings and context based on time of day

### User Experience Flow
1. User opens OODA dashboard with clear progress indicator
2. Current phase highlighted with specific 2-minute action suggestion
3. Simple text input for quick notes with auto-save
4. One-click completion advances to next phase
5. Visual feedback and celebration upon full loop completion
6. Streak tracking encourages daily consistency

### Database Schema
- `ooda_loops`: Daily loop completion tracking
- `ooda_opportunities`: Revenue opportunities with priority scoring
- `daily_moves`: Individual actions and outcomes tracking

## Data Flow

1. **Client Requests**: Frontend makes API calls using React Query
2. **Server Processing**: Express.js routes handle requests with validation
3. **Database Operations**: Drizzle ORM executes SQL queries against PostgreSQL
4. **Response Caching**: Server-side caching reduces database load
5. **Client Updates**: React Query manages cache invalidation and UI updates
6. **Real-time Feedback**: Optimistic updates and loading states provide smooth UX

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **three**: 3D graphics for globe visualization
- **react-beautiful-dnd**: Drag and drop functionality
- **date-fns**: Date manipulation utilities

### UI Libraries
- **@radix-ui**: Accessible component primitives
- **@hookform/resolvers**: Form validation
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Development Tools
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Vite configuration for both development and production builds
- ESBuild for server-side bundling

### Build Process
1. **Development**: `npm run dev` starts Vite dev server with HMR
2. **Build**: `npm run build` creates optimized production bundles
3. **Database**: `npm run db:push` applies schema changes
4. **Production**: `npm start` runs the built application

### Replit Integration
- Special WebSocket handling for Replit environment
- Enhanced HMR configuration for cloud development
- Emergency navigation fallback for development reliability

## Changelog

- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.