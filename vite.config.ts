import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isReplit = process.env.REPL_ID !== undefined;

export default defineConfig(async () => {
  const plugins = [react()];

  // Theme: use if available (Replit or local install)
  try {
    const themePlugin = (await import("@replit/vite-plugin-shadcn-theme-json")).default;
    plugins.push(themePlugin());
  } catch {
    // Optional: skip if not installed (local-only mobile builds)
  }

  // Replit-only: error overlay + cartographer
  if (isReplit) {
    try {
      const runtimeErrorOverlay = (await import("@replit/vite-plugin-runtime-error-modal")).default;
      plugins.push(runtimeErrorOverlay());
      const cartographer = await import("@replit/vite-plugin-cartographer");
      plugins.push(cartographer.cartographer());
    } catch {
      // Ignore when running locally
    }
  }

  const isMobileBuild = process.env.CAPACITOR === "1" || process.env.VITE_MOBILE === "true";

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },
    root: path.resolve(__dirname, "client"),
    base: "./", // Mobile app: relative paths for native shell (iOS/Android)
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: isMobileBuild
            ? (id) => {
                if (id.includes("node_modules/react") || id.includes("node_modules/react-dom"))
                  return "react";
                if (id.includes("node_modules")) return "vendor";
                return undefined;
              }
            : undefined,
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
        },
      },
      sourcemap: !isMobileBuild,
    },
  };
});
