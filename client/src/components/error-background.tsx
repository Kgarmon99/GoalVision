
import { useEffect, useState } from "react";

export function ErrorBackground() {
  const [showError, setShowError] = useState(false);
  
  useEffect(() => {
    // Check if error background is set
    const errorBackground = getComputedStyle(document.documentElement)
      .getPropertyValue('--error-background-image');
    
    if (errorBackground && errorBackground !== 'none') {
      setShowError(true);
    }
    
    // Listen for unhandled rejections
    const handleUnhandledRejection = () => {
      setShowError(true);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  if (!showError) return null;
  
  return (
    <div className="fixed inset-0 z-[-1] opacity-10 bg-contain bg-center bg-no-repeat pointer-events-none" 
         style={{ backgroundImage: 'url("/attached_assets/IMG_0152.jpeg")' }}>
    </div>
  );
}
