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
    const url = `${API_BASE_URL}/api/auth/admin/login`;
    console.log('Making admin login request to:', url);
    console.log('Request body:', { email, password: '***' });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Response body:', result);
    
    return result;
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

  // Subscriptions endpoints
  getSubscriptionStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/stats`);
    return response.json();
  },

  getSubscriptionPlans: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/plans`);
    return response.json();
  },

  getSubscribers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscriptions/subscribers`);
    return response.json();
  },

  // Support tickets endpoints
  getSupportStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/support/stats`);
    return response.json();
  },

  getSupportTickets: async () => {
    const response = await fetch(`${API_BASE_URL}/api/support/tickets`);
    return response.json();
  },

  // Notifications endpoints
  getNotificationStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/stats`);
    return response.json();
  },

  getNotificationCampaigns: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notifications/campaigns`);
    return response.json();
  },

  // Content management endpoints
  getContentSections: async () => {
    const response = await fetch(`${API_BASE_URL}/api/content/sections`);
    return response.json();
  },

  getBlogPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/content/blog`);
    return response.json();
  },

  getFaqs: async () => {
    const response = await fetch(`${API_BASE_URL}/api/content/faqs`);
    return response.json();
  },

  getTestimonials: async () => {
    const response = await fetch(`${API_BASE_URL}/api/content/testimonials`);
    return response.json();
  },

  getSeoPages: async () => {
    const response = await fetch(`${API_BASE_URL}/api/content/seo`);
    return response.json();
  },

  // Media library endpoints
  getMediaFiles: async () => {
    const response = await fetch(`${API_BASE_URL}/api/media/files`);
    return response.json();
  },

  getStorageStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/media/storage`);
    return response.json();
  },

  // Reports & analytics endpoints
  getKpis: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/kpis`);
    return response.json();
  },

  getReportsUserGrowth: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/user-growth`);
    return response.json();
  },

  getRevenue: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/revenue`);
    return response.json();
  },

  getRetention: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/retention`);
    return response.json();
  },

  getPlanDistribution: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/plan-distribution`);
    return response.json();
  },

  getFeatureUsage: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/feature-usage`);
    return response.json();
  },

  // Affiliate management endpoints
  getAffiliates: async () => {
    const response = await fetch(`${API_BASE_URL}/api/affiliates/affiliates`);
    return response.json();
  },

  getAffiliateStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/affiliates/stats`);
    return response.json();
  },

  getAffiliatePayouts: async () => {
    const response = await fetch(`${API_BASE_URL}/api/affiliates/payouts`);
    return response.json();
  },

  getAffiliateReferrals: async () => {
    const response = await fetch(`${API_BASE_URL}/api/affiliates/referrals`);
    return response.json();
  },

  getAffiliateTiers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/affiliates/tiers`);
    return response.json();
  },

  // Audit logs endpoints
  getAuditLogs: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/audit/logs?${queryParams}`);
    return response.json();
  },

  getAuditStats: async (days = 30) => {
    const response = await fetch(`${API_BASE_URL}/api/audit/stats?days=${days}`);
    return response.json();
  },

  // Settings endpoints
  getGeneralSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/general`);
    return response.json();
  },

  getBrandingSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/branding`);
    return response.json();
  },

  getEmailTemplates: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/emails`);
    return response.json();
  },

  getIntegrations: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/integrations`);
    return response.json();
  },

  getApiKeys: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/api-keys`);
    return response.json();
  },

  getSecuritySettings: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/security`);
    return response.json();
  },
};
