import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "server-error");
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error}`, "server-error");
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Set NODE_ENV to production if not set (for cloud deployments)
    // Railway and other platforms set PORT, so use that as indicator
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
      log(`NODE_ENV not set, defaulting to: ${process.env.NODE_ENV}`, "express");
    }
    
    log(`Starting server in ${process.env.NODE_ENV} mode`, "express");
    log(`PORT: ${process.env.PORT || 'not set (using default 5000)'}`, "express");
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error but don't throw it after sending response
    log(`ERROR (${status}): ${message}`, "server-error");
    
    // Only send the response if it hasn't been sent already
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // Default to development if NODE_ENV is not set
  const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    // In production, serve static files after API routes are registered
    serveStatic(app);
  }

  // Use PORT from environment variable (required for cloud platforms) or default to 5000
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
  
  // In production (cloud), always use 0.0.0.0 to accept connections from any interface
  // In development on Windows, use localhost
  const isProduction = process.env.NODE_ENV === 'production';
  const host = isProduction ? '0.0.0.0' : (process.platform === 'win32' ? 'localhost' : '0.0.0.0');
  
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
    if (isProduction) {
      log(`Production mode: Application is ready to accept connections`);
    }
  }).on('error', (err: any) => {
    log(`Error starting server: ${err.message}`, "server-error");
    throw err;
  });
  } catch (error) {
    log(`Failed to start server: ${error}`, "server-error");
    process.exit(1);
  }
})();