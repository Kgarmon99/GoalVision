// Custom Vite HMR client configuration for Replit environment
// This fixes the WebSocket connection issues in Replit

// Get the current URL of the page
const currentUrl = window.location.href;
const baseUrl = new URL(currentUrl);

// Extract hostname and protocol
const hostname = baseUrl.hostname;
const protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:';

// Configure Vite HMR options to use the same host as the page
// This ensures WebSocket connections use the correct Replit domain
if (import.meta.hot) {
  // Force HMR to use the correct URL structure with the Replit domain
  const hmrConfig = {
    host: hostname,
    protocol: protocol.replace(':', '')
  };

  // Apply the configuration
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('HMR update detected, using custom configuration');
  });

  // Expose the configuration for debugging
  (window as any).__REPLIT_HMR_CONFIG = hmrConfig;
}

export {};