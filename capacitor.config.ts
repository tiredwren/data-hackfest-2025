import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.duodevelopers.clarity',
  appName: 'Clarity',
  webDir: 'dist',
  server: {
      androidScheme: "http",
      cleartext: true
    },
    plugins: {
      CapacitorHttp: {
        enabled: true
      }
    }
  android: {
    intentFilters: [
      {
        action: 'android.intent.action.VIEW',
        data: [
          {
            scheme: 'clarity',
            host: 'dev-a2jy8021kbq84xg3.us.auth0.com',
            pathPrefix: '/android/com.duodevelopers.clarity/callback',
          },
        ],
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
      },
    ],
  },
};

export default config;