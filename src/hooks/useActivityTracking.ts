import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const DISTRACTION_DOMAINS = [
  'youtube.com',
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'reddit.com',
  'netflix.com',
  'hulu.com',
  'twitch.tv'
];

const API_BASE = 'http://localhost:5000/api';

export const useActivityTracking = () => {
  const { user, isAuthenticated } = useAuth0();
  const [isTracking, setIsTracking] = useState(false);
  const [currentFocusSession, setCurrentFocusSession] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  const logActivity = useCallback(async (activityData: {
    type: string;
    url?: string;
    title?: string;
    domain?: string;
    isDistraction?: boolean;
  }) => {
    if (!isAuthenticated || !user?.sub) return;

    try {
      await fetch(`${API_BASE}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.sub,
          ...activityData
        })
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [user?.sub, isAuthenticated]);

  const logDistraction = useCallback(async (type: string, details: string) => {
    if (!currentFocusSession || !user?.sub) return;

    try {
      await fetch(`${API_BASE}/focus/distraction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentFocusSession,
          userId: user.sub,
          type,
          details,
          url: window.location.href,
          domain: window.location.hostname
        })
      });
    } catch (error) {
      console.error('Failed to log distraction:', error);
    }
  }, [currentFocusSession, user?.sub]);

  const startFocusSession = useCallback(async () => {
    if (!isAuthenticated || !user?.sub) return null;

    try {
      const response = await fetch(`${API_BASE}/focus/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.sub })
      });
      
      const session = await response.json();
      setCurrentFocusSession(session._id);
      return session._id;
    } catch (error) {
      console.error('Failed to start focus session:', error);
      return null;
    }
  }, [user?.sub, isAuthenticated]);

  const endFocusSession = useCallback(async () => {
    if (!currentFocusSession || !user?.sub) return;

    try {
      await fetch(`${API_BASE}/focus/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentFocusSession,
          userId: user.sub
        })
      });
      
      setCurrentFocusSession(null);
    } catch (error) {
      console.error('Failed to end focus session:', error);
    }
  }, [currentFocusSession, user?.sub]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentFocusSession) {
        logDistraction('click_away', 'User switched away from focus tab');
      }
      
      const activityType = document.hidden ? 'tab_switch' : 'page_view';
      logActivity({
        type: activityType,
        url: window.location.href,
        title: document.title,
        domain: window.location.hostname
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentFocusSession, logActivity, logDistraction]);

  // Track URL changes
  useEffect(() => {
    const domain = window.location.hostname;
    const isDistraction = DISTRACTION_DOMAINS.some(d => domain.includes(d));
    
    logActivity({
      type: 'page_view',
      url: window.location.href,
      title: document.title,
      domain,
      isDistraction
    });

    if (isDistraction && currentFocusSession) {
      logDistraction('distraction_site', `Visited distraction site: ${domain}`);
    }

    setLastActivity(new Date());
  }, [window.location.href, currentFocusSession, logActivity, logDistraction]);

  // Register user on authentication
  useEffect(() => {
    const registerUser = async () => {
      if (!isAuthenticated || !user) return;

      try {
        await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auth0Id: user.sub,
            email: user.email,
            name: user.name
          })
        });
      } catch (error) {
        console.error('Failed to register user:', error);
      }
    };

    registerUser();
  }, [isAuthenticated, user]);

  return {
    isTracking,
    currentFocusSession,
    lastActivity,
    startFocusSession,
    endFocusSession,
    logActivity,
    logDistraction
  };
};