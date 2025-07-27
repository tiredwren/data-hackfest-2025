import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocalUsageTracker } from './useLocalUsageTracker';

const API_BASE = 'http://localhost:5000/api';

export interface RealUsageStats {
  totalFocusTime: number;
  totalScreenTime: number;
  appSwitches: number;
  distractionTime: number;
  sessionCount: number;
  distractionCount: number;
  activities: any[];
  focusSessions: any[];
}

export const useRealUsageStats = (dateRange: { startDate: string; endDate: string }) => {
  const { user, isAuthenticated } = useAuth0();
  const { getCurrentStats } = useLocalUsageTracker();
  const [stats, setStats] = useState<RealUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocalStats = (): RealUsageStats => {
    const localData = getCurrentStats();

    // Calculate distraction time based on multiple factors
    // 1. Base distraction time from tab switches (2 minutes per switch)
    const tabSwitchPenalty = localData.tabSwitches * 2 * 60 * 1000; // 2 minutes per switch

    // 2. Additional penalty for quick switches (logged as distractions)
    const quickSwitchPenalty = localData.distractions * 3 * 60 * 1000; // 3 minutes per quick switch

    // 3. Time spent on non-focus activities
    const nonFocusTime = Math.max(0, localData.screenTime - localData.focusTime);

    // Total distraction time is the sum of penalties and non-focus time
    // But cap it at 80% of total screen time to be realistic
    const calculatedDistractionTime = Math.min(
      tabSwitchPenalty + quickSwitchPenalty + nonFocusTime,
      localData.screenTime * 0.8
    );

    return {
      totalFocusTime: localData.focusTime,
      totalScreenTime: localData.screenTime,
      appSwitches: localData.tabSwitches,
      distractionTime: Math.max(0, calculatedDistractionTime),
      sessionCount: localData.focusSessions,
      distractionCount: localData.distractions,
      activities: [],
      focusSessions: []
    };
  };

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to get data from backend if authenticated
      if (isAuthenticated && user?.sub) {
        try {
          // Fetch focus stats
          const focusResponse = await fetch(
            `${API_BASE}/focus/stats/${user.sub}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          );
          const focusData = await focusResponse.json();

          // Fetch activity stats
          const activityResponse = await fetch(
            `${API_BASE}/activity/stats/${user.sub}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          );
          const activityData = await activityResponse.json();

          const combinedStats: RealUsageStats = {
            totalFocusTime: focusData.totalFocusTime || 0,
            totalScreenTime: activityData.totalScreenTime || 0,
            appSwitches: activityData.appSwitches || 0,
            distractionTime: activityData.distractionTime || 0,
            sessionCount: focusData.sessionCount || 0,
            distractionCount: activityData.distractionCount || 0,
            activities: activityData.activities || [],
            focusSessions: focusData.sessions || []
          };

          setStats(combinedStats);
          return;
        } catch (err) {
          console.warn('Backend unavailable, falling back to local data:', err);
        }
      }

      // Fallback to local stats
      const localStats = getLocalStats();
      setStats(localStats);

      if (!isAuthenticated) {
        setError('Connect to sync data across devices');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      // Even if there's an error, show local stats
      const localStats = getLocalStats();
      setStats(localStats);
      setError('Using local data only');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isAuthenticated, user?.sub, dateRange.startDate, dateRange.endDate]);

  // Refresh stats periodically to get updated local data
  useEffect(() => {
    const interval = setInterval(() => {
      const localStats = getLocalStats();
      setStats(localStats);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};
