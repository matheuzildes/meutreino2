// capacitor.config.ts

import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.bb614855f1bc4d98b047e40ec9720e37',
  appName: 'apptreino',
  webDir: 'dist',
  // O objeto 'server' foi removido daqui
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