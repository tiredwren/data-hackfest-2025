import { useEffect, useState } from 'react';
import { useUsageTracking } from './useUsageTracking';

export function useNotifications() {
  const { usageStats } = useUsageTracking();
  const [dailySummary, setDailySummary] = useState<string>('');

  useEffect(() => {
    // Check if it's end of day (8 PM) and generate summary
    const checkEndOfDay = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour === 20 && !localStorage.getItem(`summary-${now.toDateString()}`)) {
        generateDailySummary();
      }
    };

    const generateDailySummary = async () => {
      if (!usageStats) return;

      const focusPercentage = Math.round((usageStats.focusTime / usageStats.totalScreenTime) * 100);
      const yesterdayFocus = parseInt(localStorage.getItem('yesterday-focus') || '35');
      const improvement = focusPercentage - yesterdayFocus;
      
      // Rule-based summary generation
      let summary = '';
      
      if (focusPercentage > 60) {
        summary = `Great focus today! You stayed concentrated ${focusPercentage}% of the time`;
      } else if (focusPercentage > 40) {
        summary = `Decent focus session - ${focusPercentage}% focused time`;
      } else {
        summary = `Challenging day with ${focusPercentage}% focus time`;
      }

      if (improvement > 0) {
        summary += ` — ${improvement}% higher than yesterday! 🎉`;
      } else if (improvement < 0) {
        summary += ` — ${Math.abs(improvement)}% lower than yesterday.`;
      }

      // Add distraction insights
      if (usageStats.appSwitches > 75) {
        summary += ` High app switching detected (${usageStats.appSwitches} switches).`;
      }

      // Add suggestion
      if (usageStats.distractionTime > usageStats.focusTime) {
        summary += ` Consider blocking social apps during peak work hours tomorrow?`;
      } else {
        summary += ` Keep up the great work! 💪`;
      }

      setDailySummary(summary);
      
      // Store summary and update yesterday's focus
      localStorage.setItem(`summary-${new Date().toDateString()}`, summary);
      localStorage.setItem('yesterday-focus', focusPercentage.toString());
      
      // Show notification if browser supports it
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Daily Focus Summary', {
          body: summary,
          icon: '/favicon.ico'
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkEndOfDay, 60000);
    
    // Initial check
    checkEndOfDay();

    return () => clearInterval(interval);
  }, [usageStats]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    dailySummary,
    requestNotificationPermission
  };
}