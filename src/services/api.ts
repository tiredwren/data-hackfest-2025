const API_BASE = 'http://localhost:5000/api';

export const apiService = {
  // User management
  registerUser: async (auth0Id: string, email: string, name: string) => {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth0Id, email, name })
    });
    return response.json();
  },

  // Focus sessions
  startFocusSession: async (userId: string) => {
    const response = await fetch(`${API_BASE}/focus/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  endFocusSession: async (sessionId: string, userId: string) => {
    const response = await fetch(`${API_BASE}/focus/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId })
    });
    return response.json();
  },

  logDistraction: async (sessionId: string, userId: string, type: string, details: string, url?: string, domain?: string) => {
    const response = await fetch(`${API_BASE}/focus/distraction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userId, type, details, url, domain })
    });
    return response.json();
  },

  getFocusStats: async (userId: string, startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE}/focus/stats/${userId}?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  },

  // Activity tracking
  logActivity: async (userId: string, type: string, url?: string, title?: string, domain?: string, isDistraction?: boolean) => {
    const response = await fetch(`${API_BASE}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, url, title, domain, isDistraction })
    });
    return response.json();
  },

  getActivityStats: async (userId: string, startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE}/activity/stats/${userId}?startDate=${startDate}&endDate=${endDate}`);
    return response.json();
  }
};