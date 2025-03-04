import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Comprehensive handling of Vite HMR WebSocket connection errors
if (import.meta.hot) {
  // Suppress WebSocket connection errors in console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
       (args[0].includes('WebSocket connection') || 
        args[0].includes('Failed to construct \'WebSocket\'') ||
        args[0].includes('WebSocket connection to') ||
        args[0].includes('DOMException'))) {
      // Suppress all WebSocket connection errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Global unhandledrejection handler for WebSocket errors
  window.addEventListener('unhandledrejection', (event) => {
    // Check if the error is related to WebSocket connections
    if (event.reason && 
        (event.reason.message?.includes('WebSocket') || 
         event.reason.name === 'DOMException' || 
         event.reason.toString().includes('WebSocket'))) {
      // Prevent the error from being reported
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Add a custom error handler for the HMR connection
  import.meta.hot.on('error', (err) => {
    // Silently handle WebSocket-related errors
    if (err && (
        (err.message && (
          err.message.includes('WebSocket') || 
          err.message.includes('Failed to connect')
        )) || 
        err.name === 'DOMException'
      )) {
      console.log('HMR connection issue detected. Will retry automatically.');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
