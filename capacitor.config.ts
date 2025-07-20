
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.bb614855f1bc4d98b047e40ec9720e37',
  appName: 'apptreino',
  webDir: 'dist',
  server: {
    url: 'https://bb614855-f1bc-4d98-b047-e40ec9720e37.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false
    },
    StatusBar: {
      backgroundColor: '#1a1a1a',
      style: 'DARK'
    }
  }
};

export default config;
