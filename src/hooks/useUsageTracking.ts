import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface AppUsage {
  packageName: string;
  appName: string;
  totalTimeInForeground: number;
  firstTimeStamp: number;
  lastTimeStamp: number;
  lastTimeUsed: number;
}

export interface UsageStats {
  apps: AppUsage[];
  totalScreenTime: number;
  appSwitches: number;
  focusTime: number;
  distractionTime: number;
}

export const useUsageTracking = () => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Mock data for web development
      setHasPermission(true);
      return true;
    }

    try {
      const { UsageStatsPlugin } = await import('../plugins/usageStats');
      const result = await UsageStatsPlugin.requestPermission();
      setHasPermission(result.granted);
      return result.granted;
    } catch (error) {
      console.error('Failed to request usage permission:', error);
      return false;
    }
  };

  const fetchUsageStats = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    setIsLoading(true);
    
    try {
      if (!Capacitor.isNativePlatform()) {
        // Mock data for web development
        const mockStats: UsageStats = {
          apps: [
            { packageName: 'com.instagram.android', appName: 'Instagram', totalTimeInForeground: 2700000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 3600000 },
            { packageName: 'com.microsoft.vscode', appName: 'VS Code', totalTimeInForeground: 10800000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 1800000 },
            { packageName: 'com.google.android.apps.chrome', appName: 'Chrome', totalTimeInForeground: 5400000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 900000 },
            { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', totalTimeInForeground: 1800000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 7200000 },
            { packageName: 'notion.id', appName: 'Notion', totalTimeInForeground: 4500000, firstTimeStamp: Date.now() - 86400000, lastTimeStamp: Date.now(), lastTimeUsed: Date.now() - 10800000 },
          ],
          totalScreenTime: 25200000, // 7 hours
          appSwitches: 89,
          focusTime: 15300000, // 4.25 hours
          distractionTime: 4500000 // 1.25 hours
        };
        setUsageStats(mockStats);
      } else {
        const { UsageStatsPlugin } = await import('../plugins/usageStats');
        const stats = await UsageStatsPlugin.getUsageStats({
          startTime: Date.now() - 86400000, // Last 24 hours
          endTime: Date.now()
        });
        setUsageStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasPermission) {
      fetchUsageStats();
    }
  }, [hasPermission]);

  return {
    usageStats,
    isLoading,
    hasPermission,
    requestPermission,
    fetchUsageStats
  };
};