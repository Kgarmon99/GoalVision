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
  try {
    // Get the current hostname from the page URL
    const hostname = window.location.hostname;
    
    // Store the original WebSocket constructor
    const OriginalWebSocket = window.WebSocket;
    
    // Create a new constructor that patches URLs
    const PatchedWebSocket = function(url: string | URL, protocols?: string | string[]) {
      let fixedUrl = url;
      
      if (typeof url === 'string') {
        // Fix for localhost URLs in Replit environment
        if ((url.includes('localhost:') || url.includes('127.0.0.1:')) && url.includes('?token=')) {
          const tokenMatch = url.match(/\?token=([^&]+)/);
          const token = tokenMatch ? tokenMatch[1] : '';
          
          // Create a new URL using the current hostname
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          fixedUrl = `${protocol}//${hostname}/?token=${token}`;
          
          console.log('WebSocket URL fixed:', fixedUrl);
        }
      }
      
      // Use the original constructor with the fixed URL
      return new OriginalWebSocket(fixedUrl, protocols);
    };
    
    // Copy prototype and static properties
    PatchedWebSocket.prototype = OriginalWebSocket.prototype;
    Object.defineProperties(PatchedWebSocket, Object.getOwnPropertyDescriptors(OriginalWebSocket));
    
    // Replace the WebSocket constructor
    window.WebSocket = PatchedWebSocket as typeof WebSocket;
    
    console.log('WebSocket patch applied for Replit environment');
  } catch (err) {
    console.error('Failed to patch WebSocket:', err);
  }
};

// First, render the application immediately to avoid blank screen
createRoot(document.getElementById("root")!).render(<App />);

// Then apply websocket fixes and other configurations
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

// Apply WebSocket fix on page load completion
window.addEventListener('load', () => {
  // Ensure WebSocket patch is applied
  fixReplitWebSocketURL();
  
  // Mark first load complete
  if (sessionStorage.getItem('app_first_load') !== 'complete') {
    sessionStorage.setItem('app_first_load', 'complete');
  }
});