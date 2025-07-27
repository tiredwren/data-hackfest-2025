import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

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
  const [stats, setStats] = useState<RealUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!isAuthenticated || !user?.sub) return;

    setIsLoading(true);
    setError(null);

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
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isAuthenticated, user?.sub, dateRange.startDate, dateRange.endDate]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};