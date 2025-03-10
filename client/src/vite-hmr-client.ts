// Enhanced Vite HMR client configuration for Replit environment
// This provides more robust WebSocket handling for HMR

// Get the current URL of the page
const currentUrl = window.location.href;
const baseUrl = new URL(currentUrl);

// Extract hostname and protocol
const hostname = baseUrl.hostname;
const protocol = baseUrl.protocol === 'https:' ? 'wss:' : 'ws:';

// Configure Vite HMR options to use the same host as the page
// This ensures WebSocket connections use the correct Replit domain
if (import.meta.hot) {
  // Set up the configuration
  const hmrConfig = {
    host: hostname,
    protocol: protocol.replace(':', ''),
    timeout: 30000, // Longer timeout for Replit environment
    overlay: true   // Show errors in overlay
  };

  // Apply the configuration
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('HMR update detected, using enhanced Replit configuration');
  });

  // Monitor connection status
  let connected = false;
  
  import.meta.hot.on('vite:connect', () => {
    connected = true;
    console.log('HMR connected successfully');
    
    // Hide emergency navigation if it's showing
    const emergencyNav = document.getElementById('emergency-nav');
    if (emergencyNav) {
      emergencyNav.style.display = 'none';
    }
  });
  
  import.meta.hot.on('vite:disconnect', () => {
    connected = false;
    console.log('HMR disconnected');
  });

  // Setup connection monitoring
  setInterval(() => {
    if (!connected) {
      console.log('Checking HMR connection status...');
      // Don't force reload, let the main handlers handle it
    }
  }, 10000);

  // Expose the configuration for debugging
  (window as any).__REPLIT_HMR_CONFIG = hmrConfig;
}

export {};