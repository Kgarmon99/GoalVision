import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/components/ui/glow-effects.css";

// Improved Vite HMR connection handling
if (import.meta.hot) {
  // Suppress WebSocket connection errors in console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
       (args[0].includes('WebSocket connection') || 
        args[0].includes('Failed to construct \'WebSocket\'') ||
        args[0].includes('server connection lost'))) {
      // Suppress connection errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Custom error handler for HMR connection
  import.meta.hot.on('error', (err) => {
    if (err && err.message && 
       (err.message.includes('WebSocket') || 
        err.message.includes('Failed to connect'))) {
      console.log('HMR connection issue detected. Will retry automatically.');
    }
  });

  // Add auto-reconnect feature
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  
  import.meta.hot.on('disconnect', () => {
    console.log('Development server disconnected. Attempting to reconnect...');
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      // Try to reconnect after a delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Reset reconnect attempts when connected
  import.meta.hot.on('connect', () => {
    reconnectAttempts = 0;
  });
}

// Add a page load event handler to help with initial connection
window.addEventListener('load', () => {
  // Check if we need to bypass cache for a fresh load
  if (sessionStorage.getItem('app_first_load') !== 'complete') {
    sessionStorage.setItem('app_first_load', 'complete');
    // Force a clean reload after brief delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
});

createRoot(document.getElementById("root")!).render(<App />);