import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  // Resolve the async vite config
  const resolvedConfig = typeof viteConfig === 'function' ? await viteConfig() : viteConfig;

  const vite = await createViteServer({
    ...resolvedConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // Don't exit on Vite errors - let the server continue running
        // process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Catch-all route for HTML pages only (not API routes or Vite assets)
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes, Vite client, and any requests that look like assets
    // Let Vite middleware handle those first
    if (url.startsWith("/api") || 
        url.startsWith("/@") || 
        url.startsWith("/node_modules") ||
        url.startsWith("/src/") ||
        (url.includes(".") && !url.endsWith(".html"))) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the built server runs from dist/index.js
  // So __dirname is dist/, and static files are in dist/public
  // But we need to handle both local and deployed paths
  const possiblePaths = [
    path.resolve(__dirname, "public"),           // dist/public (when running from dist/)
    path.resolve(__dirname, "..", "dist", "public"), // dist/public (alternative)
    path.resolve(process.cwd(), "dist", "public"),    // dist/public (from project root)
  ];

  let distPath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      distPath = possiblePath;
      break;
    }
  }

  if (!distPath) {
    // Log all attempted paths for debugging
    log(`Static files not found. Tried: ${possiblePaths.join(", ")}`, "server-error");
    log(`Current __dirname: ${__dirname}`, "server-error");
    log(`Current cwd: ${process.cwd()}`, "server-error");
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}. Make sure to build the client first with 'npm run build'`,
    );
  }

  log(`Serving static files from: ${distPath}`, "express");
  app.use(express.static(distPath));

  // fall through to index.html for SPA routing (but skip API routes)
  app.get("*", (req, res, next) => {
    // Skip API routes - they should be handled by registerRoutes
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Not found", message: "Static files not built. Run 'npm run build' first." });
    }
  });
}
