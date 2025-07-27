import { useEffect, useRef, useState } from 'react';

interface LocalUsageData {
  focusTime: number;
  screenTime: number;
  tabSwitches: number;
  distractions: number;
  focusSessions: number;
  lastUpdate: string;
}

export const useLocalUsageTracker = () => {
  const [isActive, setIsActive] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const activeTimeRef = useRef<number>(0);
  const focusTimeRef = useRef<number>(0);
  const lastActiveRef = useRef<number>(Date.now());
  const tabSwitchCountRef = useRef<number>(0);
  const distractionCountRef = useRef<number>(0);

  // Initialize data from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem(`usage_${today}`);
    
    if (storedData) {
      const data: LocalUsageData = JSON.parse(storedData);
      activeTimeRef.current = data.screenTime;
      focusTimeRef.current = data.focusTime;
      tabSwitchCountRef.current = data.tabSwitches;
      distractionCountRef.current = data.distractions;
    }
  }, []);

  // Track page visibility and activity
  useEffect(() => {
    let activityInterval: NodeJS.Timeout;
    let focusInterval: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      const now = Date.now();
      const wasActive = !document.hidden;
      
      if (wasActive !== isActive) {
        if (!wasActive) {
          // User switched away - count as tab switch
          tabSwitchCountRef.current += 1;
          
          // Check if it's a distraction (based on simple heuristics)
          const timeSinceLastActive = now - lastActiveRef.current;
          if (timeSinceLastActive < 30000) { // Less than 30 seconds = quick switch = potential distraction
            distractionCountRef.current += 1;
          }
        }
        setIsActive(wasActive);
        lastActiveRef.current = now;
        saveUsageData();
      }
    };

    const handleUserActivity = () => {
      lastActiveRef.current = Date.now();
    };

    // Track active time every second
    if (isActive) {
      activityInterval = setInterval(() => {
        activeTimeRef.current += 1000;
        saveUsageData();
      }, 1000);
    }

    // Track focus time when in focus mode
    if (isFocusMode && isActive) {
      focusInterval = setInterval(() => {
        focusTimeRef.current += 1000;
        saveUsageData();
      }, 1000);
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keypress', handleUserActivity);
    document.addEventListener('click', handleUserActivity);

    return () => {
      clearInterval(activityInterval);
      clearInterval(focusInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keypress', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
    };
  }, [isActive, isFocusMode]);

  const saveUsageData = () => {
    const today = new Date().toISOString().split('T')[0];
    const data: LocalUsageData = {
      focusTime: focusTimeRef.current,
      screenTime: activeTimeRef.current,
      tabSwitches: tabSwitchCountRef.current,
      distractions: distractionCountRef.current,
      focusSessions: parseInt(localStorage.getItem('todayFocusSessions') || '0'),
      lastUpdate: new Date().toISOString()
    };

    localStorage.setItem(`usage_${today}`, JSON.stringify(data));
    
    // Also store in individual keys for backwards compatibility
    localStorage.setItem('todayFocusTime', focusTimeRef.current.toString());
    localStorage.setItem('todayScreenTime', activeTimeRef.current.toString());
    localStorage.setItem('todayTabSwitches', tabSwitchCountRef.current.toString());
    localStorage.setItem('todayDistractions', distractionCountRef.current.toString());
  };

  const startFocusMode = () => {
    setIsFocusMode(true);
    const currentSessions = parseInt(localStorage.getItem('todayFocusSessions') || '0');
    localStorage.setItem('todayFocusSessions', (currentSessions + 1).toString());
  };

  const stopFocusMode = () => {
    setIsFocusMode(false);
  };

  const getCurrentStats = () => {
    return {
      focusTime: focusTimeRef.current,
      screenTime: activeTimeRef.current,
      tabSwitches: tabSwitchCountRef.current,
      distractions: distractionCountRef.current,
      focusSessions: parseInt(localStorage.getItem('todayFocusSessions') || '0')
    };
  };

  return {
    isActive,
    isFocusMode,
    startFocusMode,
    stopFocusMode,
    getCurrentStats,
    saveUsageData
  };
};
