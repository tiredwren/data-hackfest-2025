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

    // Calculate distraction time more accurately
    // Distraction time should be the difference between screen time and focus time
    // But never exceed screen time or be negative
    const rawDistractionTime = Math.max(0, localData.screenTime - localData.focusTime);

    // If we don't have focus tracking data, estimate based on distraction events
    // Each distraction represents about 2-3 minutes of lost focus (conservative estimate)
    const estimatedFromDistractions = localData.distractions * 120000; // 2 minutes per distraction

    // Use the smaller of the two estimates, but cap at total screen time
    const calculatedDistractionTime = localData.focusTime > 0
      ? Math.min(rawDistractionTime, localData.screenTime)
      : Math.min(estimatedFromDistractions, localData.screenTime * 0.6); // Max 60% if no focus data

    return {
      totalFocusTime: localData.focusTime,
      totalScreenTime: localData.screenTime,
      appSwitches: localData.tabSwitches,
      distractionTime: calculatedDistractionTime,
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
