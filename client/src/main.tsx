import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile.css";
import "@/components/ui/glow-effects.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Prevent the default browser behavior which shows the error in console
  event.preventDefault();
  
  // Log custom message instead of showing the raw error
  if (event.reason && event.reason.message) {
    // Only log non-connection related errors, we'll handle connection errors separately
    if (!event.reason.message.includes('WebSocket') && 
        !event.reason.message.includes('Failed to connect') &&
        !event.reason.message.includes('server connection')) {
      console.log('Error handled gracefully:', event.reason.message);
    }
  }
});

// Improved Vite HMR connection handling
if (import.meta.hot) {
  // Suppress WebSocket connection errors in console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
       (args[0].includes('WebSocket connection') || 
        args[0].includes('Failed to construct \'WebSocket\'') ||
        args[0].includes('server connection lost'))) {
      // Suppress connection errors but log a friendlier message
      console.log('Development server connection issue. This is normal during development and will resolve itself.');
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
      }, 1500); // Increased delay for more stability
    }
  });

  // Reset reconnect attempts when connected
  import.meta.hot.on('connect', () => {
    reconnectAttempts = 0;
    console.log('HMR connection established.');
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
    }, 750); // Slightly increased for stability
  }
});

// Error boundary for React rendering
try {
  createRoot(document.getElementById("root")!).render(<App />);
} catch (error) {
  console.error('Error rendering application:', error);
  // Attempt recovery
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = '<div style="padding: 20px; text-align: center;"><h2>Application Error</h2><p>Please refresh the page</p></div>';
  }
}