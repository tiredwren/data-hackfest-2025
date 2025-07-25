import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7bfbd50263ff49688f558365875f8497',
  appName: 'mindful-mobile-zen',
  webDir: 'dist',
  server: {
    url: 'https://7bfbd502-63ff-4968-8f55-8365875f8497.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    UsageStats: {
      requestPermissions: true
    }
  }
};

export default config;