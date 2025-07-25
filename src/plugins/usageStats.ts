import { registerPlugin } from '@capacitor/core';
import type { AppUsage, UsageStats } from '../hooks/useUsageTracking';

export interface UsageStatsPlugin {
  requestPermission(): Promise<{ granted: boolean }>;
  getUsageStats(options: { startTime: number; endTime: number }): Promise<UsageStats>;
  getCurrentForegroundApp(): Promise<{ packageName: string; appName: string }>;
  detectAppSwitch(): Promise<{ switched: boolean; fromApp: string; toApp: string; timestamp: number }>;
}

export const UsageStatsPlugin = registerPlugin<UsageStatsPlugin>('UsageStats', {
  web: () => import('./usageStats.web').then(m => new m.UsageStatsWeb()),
});