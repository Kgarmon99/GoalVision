import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced HMR error handling
if (import.meta.hot) {
  // This prevents the WebSocket connection error from appearing in the console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
       (args[0].includes('WebSocket connection') || 
        args[0].includes('Failed to construct \'WebSocket\'') ||
        args[0].includes('Failed to reload'))) {
      // Log a more useful message instead
      console.log('HMR connection issue detected. Will retry automatically.');
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Handle unhandled promise rejections related to HMR
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && 
        (event.reason.message?.includes('WebSocket') || 
         event.reason.message?.includes('Failed to fetch') ||
         event.reason.message?.includes('Network Error'))) {
      event.preventDefault();
      console.log('HMR network issue detected. Will retry connection automatically.');
    }
  });

  // Add a custom error handler for the HMR connection
  import.meta.hot.on('error', (err) => {
    // Improved handling of WebSocket-related errors
    if (err && err.message && 
       (err.message.includes('WebSocket') || 
        err.message.includes('Failed to connect') ||
        err.message.includes('Network Error'))) {
      console.log('HMR connection issue detected. Will retry automatically.');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);