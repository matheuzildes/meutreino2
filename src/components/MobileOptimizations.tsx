
import React, { useEffect } from 'react';

const MobileOptimizations: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Prevent zoom on input focus for iOS
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Add mobile-specific classes to body
    document.body.classList.add('mobile-app');
    
    // Prevent pull-to-refresh
    document.body.style.overscrollBehavior = 'none';
    
    // Add safe area insets for devices with notches
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

    return () => {
      document.body.classList.remove('mobile-app');
    };
  }, []);

  return <>{children}</>;
};

export default MobileOptimizations;
