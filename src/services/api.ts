const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Auth endpoints
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    city?: string;
    madhab?: string;
    age_confirmed: boolean;
    shariah_rules_agreed: boolean;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  adminLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  logout: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },

  getCurrentUser: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // User endpoints
  getUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`);
    return response.json();
  },

  updateUser: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Daily Goals endpoints
  getDailyGoals: async (userId: string, date?: string) => {
    const url = date 
      ? `${API_BASE_URL}/api/daily-goals/user/${userId}?date=${date}`
      : `${API_BASE_URL}/api/daily-goals/user/${userId}`;
    const response = await fetch(url);
    return response.json();
  },

  updateDailyGoals: async (userId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/daily-goals/user/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Streaks endpoints
  getStreaks: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/streaks/user/${userId}`);
    return response.json();
  },

  updateStreaks: async (userId: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/streaks/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Dashboard endpoints
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    return response.json();
  },

  getUserGrowth: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/user-growth`);
    return response.json();
  },

  getTopContent: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/top-content`);
    return response.json();
  },

  getRecentActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-activity`);
    return response.json();
  },

  getPendingItems: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/pending-items`);
    return response.json();
  },

  // Admin users endpoints
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/admin/all`);
    return response.json();
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/admin/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/users/admin/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Roles endpoints
  getRoleStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/roles/stats`);
    return response.json();
  },

  getUsersByRole: async (role: string) => {
    const response = await fetch(`${API_BASE_URL}/api/roles/users/${role}`);
    return response.json();
  },

  // Services endpoints
  getServicesStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/services/stats`);
    return response.json();
  },

  getLibraryContent: async () => {
    const response = await fetch(`${API_BASE_URL}/api/services/library`);
    return response.json();
  },

  getRecentThreads: async () => {
    const response = await fetch(`${API_BASE_URL}/api/services/threads`);
    return response.json();
  },

  // Lessons endpoints
  getLessonsStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/stats`);
    return response.json();
  },

  getLessons: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lessons`);
    return response.json();
  },

  getAudioTracks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/audio`);
    return response.json();
  },

  getVoiceTracks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/voice`);
    return response.json();
  },

  // Community endpoints
  getCommunityStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/community/stats`);
    return response.json();
  },

  getCommunityPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/community/posts`);
    return response.json();
  },

  getCommunityReports: async () => {
    const response = await fetch(`${API_BASE_URL}/api/community/reports`);
    return response.json();
  },
};
