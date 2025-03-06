import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/mobile.css";
import "./styles/gamification.css";
import "@/components/ui/glow-effects.css";
// Import our custom Vite HMR client configuration for Replit environment
import "./vite-hmr-client";

// Custom function to fix WebSocket URL in Replit environment
const fixReplitWebSocketURL = () => {
  // Get the current hostname from the page URL
  const hostname = window.location.hostname;
  
  // This will be used to patch the WebSocket connection URL
  const patchWebSocket = () => {
    // Store the original WebSocket constructor
    const OriginalWebSocket = window.WebSocket;
    
    // Override the WebSocket constructor
    window.WebSocket = function(url, protocols) {
      // Check if this is a Vite HMR WebSocket connection with an invalid URL
      if (url && typeof url === 'string' && 
          url.includes('localhost:undefined') && 
          url.includes('?token=')) {
        // Extract the token from the original URL
        const tokenMatch = url.match(/\?token=([^&]+)/);
        const token = tokenMatch ? tokenMatch[1] : '';
        
        // Create a new URL using the current hostname
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const newUrl = `${protocol}//${hostname}/?token=${token}`;
        
        console.log('WebSocket URL corrected:', newUrl);
        
        // Use the corrected URL instead
        return new OriginalWebSocket(newUrl, protocols);
      }
      
      // For other WebSocket connections, use the original URL
      return new OriginalWebSocket(url, protocols);
    };
    
    // Copy prototype and properties from the original WebSocket
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    Object.defineProperties(window.WebSocket, 
      Object.getOwnPropertyDescriptors(OriginalWebSocket));
  };
  
  // Apply the patch
  try {
    patchWebSocket();
    console.log('WebSocket patch applied for Replit environment');
  } catch (err) {
    console.error('Failed to patch WebSocket:', err);
  }
};

// Apply the WebSocket fix immediately
fixReplitWebSocketURL();

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
    } else {
      // For WebSocket errors, attempt to fix and reload after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
      console.log('Development server connection issue. Applying WebSocket patches...');
      // Re-apply the WebSocket fix
      fixReplitWebSocketURL();
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Add auto-reconnect feature with improved logic for Replit
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10; // Increased for Replit environment
  
  import.meta.hot.on('disconnect', () => {
    console.log('Development server disconnected. Attempting to reconnect...');
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      // Re-apply the WebSocket fix and reload
      fixReplitWebSocketURL();
      // Try to reconnect after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000 + (reconnectAttempts * 500)); // Progressive backoff
    }
  });

  // Reset reconnect attempts when connected
  import.meta.hot.on('connect', () => {
    reconnectAttempts = 0;
    console.log('HMR connection established successfully!');
  });
}

// Add a page load event handler to help with initial connection
window.addEventListener('load', () => {
  // Apply WebSocket fix on each page load
  fixReplitWebSocketURL();
  
  // Check if we need to bypass cache for a fresh load
  if (sessionStorage.getItem('app_first_load') !== 'complete') {
    sessionStorage.setItem('app_first_load', 'complete');
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