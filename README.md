# 2025 Goals Tracking Platform

A comprehensive platform that transforms personal and professional objective setting into an engaging, motivational journey. Track your 2025 goals with dynamic visual progress tracking, interactive goal management, and intelligent insights to help you stay motivated and aligned with your aspirations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

- **Comprehensive Goal Tracking**: Set, track, and visualize progress toward your 2025 goals
- **Intuitive Dashboard**: Get a quick overview of all your goals, metrics, and tasks
- **Visual Analytics**: Multiple chart types for visualizing progress and forecasting achievements
- **Task Management**: Kanban-style task board with drag-and-drop functionality
- **Weekly Planning**: Organize tasks by week and track completion rates
- **Progress Celebrations**: Enjoy visual celebrations when achieving milestones
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🖥️ Screenshots

![Dashboard](./public/images/dashboard-screenshot.png)
![Goal Visualizations](./public/images/goal-visualizations-screenshot.png)
![Task Board](./public/images/task-board-screenshot.png)

## 📋 Requirements

- Node.js (v16 or higher)
- PostgreSQL database
- Web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/2025-goals-tracking-platform.git
   cd 2025-goals-tracking-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your PostgreSQL database connection string:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```

4. Apply database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## 🏗️ Project Structure

```
├── client/               # Frontend code
│   ├── src/              # React application
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── pages/        # Application pages
│   │   └── utils/        # Helper functions
│   └── index.html        # HTML entry point
├── docs/                 # Documentation
│   ├── API.md            # API documentation
│   ├── COMPONENTS.md     # Component reference
│   ├── DATABASE.md       # Database schema info
│   ├── DEVELOPER.md      # Developer guide
│   └── USER_GUIDE.md     # End-user manual
├── public/               # Static assets
├── server/               # Backend code
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared code
│   └── schema.ts         # Database schema
└── .env                  # Environment variables
```

## 📊 Core Technologies

### Frontend
- React: UI library for building component-based interfaces
- TypeScript: Type-safe JavaScript superset
- React Query: Data fetching, caching, and state management
- Tailwind CSS: Utility-first CSS framework
- Framer Motion: Animation library
- Recharts: Data visualization
- react-beautiful-dnd: Drag and drop functionality

### Backend
- Express: Web framework for Node.js
- Drizzle ORM: Type-safe database toolkit
- PostgreSQL: Relational database
- Zod: Schema validation
- TypeScript: Type-safe JavaScript superset

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[API.md](/docs/API.md)**: Detailed API documentation
- **[COMPONENTS.md](/docs/COMPONENTS.md)**: Component reference guide
- **[DATABASE.md](/docs/DATABASE.md)**: Database schema information
- **[DEVELOPER.md](/docs/DEVELOPER.md)**: Guide for developers
- **[USER_GUIDE.md](/docs/USER_GUIDE.md)**: End-user manual

## 🎮 Usage

After installation, navigate to the application URL in your browser. The dashboard will be displayed, showing your goals, metrics, and tasks.

### Quick Start Guide

1. **Create a Goal**: Click "Add Goal" in the navigation bar
2. **Add Tasks**: Create tasks that contribute to your goals
3. **Track Progress**: Update goal progress regularly
4. **Visualize**: Use the visualization tools to track your journey

For detailed usage instructions, refer to the [User Guide](/docs/USER_GUIDE.md).

## ⚙️ Configuration

The application can be configured through environment variables:

| Variable      | Description               | Default Value        |
|---------------|---------------------------|----------------------|
| PORT          | Server port               | 5000                 |
| DATABASE_URL  | PostgreSQL connection URL | (required)           |
| NODE_ENV      | Environment               | development          |

## 🧪 Development

To run the application in development mode:

```bash
npm run dev
```

This starts both the frontend and backend servers with hot reloading.

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database migrations
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run tests

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify your DATABASE_URL is correct
- Check that PostgreSQL is running
- Ensure your database user has proper permissions

**Application Won't Start**
- Check for errors in the console
- Verify all dependencies are installed
- Make sure ports 5000 (server) and 3000 (development server) are available

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [React Query](https://tanstack.com/query/latest)
- [Shadcn UI](https://ui.shadcn.com/)

---

Built with ❤️ for a productive and goal-oriented 2025!

For questions or support, please open an issue on the repository.