import { useEffect, useRef, useState } from 'react';

interface LocalUsageData {
  focusTime: number;
  screenTime: number;
  tabSwitches: number;
  distractions: number;
  focusSessions: number;
  distractionTime: number;
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
  const distractionTimeRef = useRef<number>(0);

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
      distractionTimeRef.current = data.distractionTime || 0;
    }
  }, []);

  // Track page visibility and activity
  useEffect(() => {
    let activityInterval: NodeJS.Timeout;
    let focusInterval: NodeJS.Timeout;
    let lastVisibilityChange = Date.now();

    const handleVisibilityChange = () => {
      const now = Date.now();
      const wasActive = !document.hidden;

      if (wasActive !== isActive) {
        if (!wasActive) {
          // User switched away - count as tab switch
          tabSwitchCountRef.current += 1;

          // Every tab switch adds to distraction time
          // Base distraction penalty: 2 minutes per switch
          const baseDistraction = 2 * 60 * 1000; // 2 minutes in milliseconds

          // Quick switches (less than 30 seconds) are more distracting
          const timeSinceLastSwitch = now - lastVisibilityChange;
          const isQuickSwitch = timeSinceLastSwitch < 30000;

          if (isQuickSwitch) {
            // Quick switch penalty: 3 minutes
            distractionCountRef.current += 1;
            distractionTimeRef.current += baseDistraction * 1.5; // 3 minutes penalty
          } else {
            // Regular switch penalty: 2 minutes
            distractionTimeRef.current += baseDistraction;
          }
        }
        setIsActive(wasActive);
        lastActiveRef.current = now;
        lastVisibilityChange = now;
        saveUsageData();
      }
    };

    const handleUserActivity = () => {
      lastActiveRef.current = Date.now();
    };

    // Track active time every second when page is visible
    if (isActive && !document.hidden) {
      activityInterval = setInterval(() => {
        activeTimeRef.current += 1000;

        // Auto-increment focus time for productive activities
        // Check if we're on a focus-friendly domain or in focus mode
        const currentDomain = window.location.hostname;
        const isProductiveDomain = !isDistractionDomain(currentDomain);

        if (isFocusMode || isProductiveDomain) {
          focusTimeRef.current += 1000;
        }

        saveUsageData();
      }, 1000);
    }

    // Additional focus time tracking when explicitly in focus mode
    if (isFocusMode && isActive && !document.hidden) {
      focusInterval = setInterval(() => {
        // Extra focus time credit for being in explicit focus mode
        focusTimeRef.current += 500; // Bonus for focus mode
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

  const isDistractionDomain = (domain: string): boolean => {
    const distractionDomains = [
      'youtube.com', 'instagram.com', 'facebook.com', 'twitter.com',
      'x.com', 'tiktok.com', 'reddit.com', 'netflix.com', 'hulu.com', 'twitch.tv'
    ];
    return distractionDomains.some(d => domain.includes(d));
  };

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
    saveUsageData();
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
