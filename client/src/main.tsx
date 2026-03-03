import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import App from "./App";
import "./index.css";
import "./styles/mobile.css";
import "./styles/visual-effects.css";
import "./components/ui/3d-effects.css";
import "./styles/no-blur.css";

// Mobile app: always use hash routing (native shell loads from capacitor:// or file://)
try {
  createRoot(document.getElementById("root")!).render(
    <Router hook={useHashLocation}>
      <App />
    </Router>
  );
} catch (error) {
  console.error("App failed to render:", error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML =
      '<div style="padding: 2rem; text-align: center; color: #fff;"><p>Something went wrong. Restart the app.</p></div>';
  }
}
