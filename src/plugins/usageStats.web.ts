import { WebPlugin } from '@capacitor/core';
import type { UsageStatsPlugin } from './usageStats';
import type { UsageStats } from '../hooks/useUsageTracking';

export class UsageStatsWeb extends WebPlugin implements UsageStatsPlugin {
  async requestPermission(): Promise<{ granted: boolean }> {
    console.log('Web platform: Usage stats permission automatically granted');
    return { granted: true };
  }

  async getUsageStats(options: { startTime: number; endTime: number }): Promise<UsageStats> {
    console.log('Web platform: Returning mock usage stats', options);
    
    // Mock data for web development
    return {
      apps: [
        { packageName: 'com.instagram.android', appName: 'Instagram', totalTimeInForeground: 2700000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 3600000 },
        { packageName: 'com.microsoft.vscode', appName: 'VS Code', totalTimeInForeground: 10800000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 1800000 },
        { packageName: 'com.google.android.apps.chrome', appName: 'Chrome', totalTimeInForeground: 5400000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 900000 },
        { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', totalTimeInForeground: 1800000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 7200000 },
        { packageName: 'notion.id', appName: 'Notion', totalTimeInForeground: 4500000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 10800000 },
      ],
      totalScreenTime: 25200000,
      appSwitches: 89,
      focusTime: 15300000,
      distractionTime: 4500000
    };
  }

  async getCurrentForegroundApp(): Promise<{ packageName: string; appName: string }> {
    return { packageName: 'com.browser.web', appName: 'Web Browser' };
  }

  async detectAppSwitch(): Promise<{ switched: boolean; fromApp: string; toApp: string; timestamp: number }> {
    return { switched: false, fromApp: '', toApp: '', timestamp: Date.now() };
  }
}