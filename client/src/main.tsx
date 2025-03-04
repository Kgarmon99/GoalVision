import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle Vite HMR WebSocket connection errors gracefully
if (import.meta.hot) {
  // This prevents the WebSocket connection error from appearing in the console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
       (args[0].includes('WebSocket connection') || 
        args[0].includes('Failed to construct \'WebSocket\''))) {
      // Suppress WebSocket connection errors
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Add a custom error handler for the HMR connection
  import.meta.hot.on('error', (err) => {
    // Silently handle WebSocket-related errors
    if (err && err.message && 
       (err.message.includes('WebSocket') || 
        err.message.includes('Failed to connect'))) {
      // Do nothing, just prevent the error from bubbling up
      console.log('HMR connection issue detected. Will retry automatically.');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);