import { registerPlugin } from '@capacitor/core';

export interface UsageStats {
  totalScreenTime: number;
  focusTime: number;
  distractionTime: number;
  appSwitches: number;
}

export interface ForegroundAppInfo {
  packageName: string;
  appName: string;
}

export interface AppSwitchInfo {
  switched: boolean;
  fromApp: string;
  toApp: string;
  timestamp: number;
}

export interface UsageStatsPlugin {
  requestPermission(): Promise<{ granted: boolean }>;
  getUsageStats(options: { startTime: number; endTime: number }): Promise<UsageStats>;
  getCurrentForegroundApp(): Promise<ForegroundAppInfo>;
  detectAppSwitch(): Promise<AppSwitchInfo>;
}

export const UsageStatsPlugin = registerPlugin<UsageStatsPlugin>('UsageStatsPlugin', {
  web: () => import('./usageStats.web').then(m => new m.UsageStatsWeb()),
});
