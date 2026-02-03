// Vercel serverless function - exports Express app
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes (without starting a server)
// For Vercel, we just need the app with routes, not a running server
let routesRegistered = false;

async function setupApp() {
  if (routesRegistered) return;
  
  // Register routes - this returns a Server but we don't need to use it for Vercel
  // The routes are attached to the app, which is what we need
  await registerRoutes(app);
  
  // Don't serve static files here - Vercel handles that via vercel.json
  // Static files are served from dist/public via Vercel's outputDirectory
  
  routesRegistered = true;
}

// Initialize routes immediately
setupApp().catch(console.error);

// Export the app for Vercel serverless functions
export default app;
