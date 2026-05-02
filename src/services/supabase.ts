import type { ApiMethods } from './api-types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mevrcomujfroqfopdcok.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_l_fVzTQLk6Zpgyl5gzCr8A_STe2ZPTM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  return {
    success: false,
    message: error.message || 'An error occurred',
    error
  };
};

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Mock data for development (replace with actual Supabase queries)
const mockData = {
  users: [
    { id: '1', email: 'user@example.com', full_name: 'Test User', role: 'user', created_at: new Date().toISOString() },
    { id: '2', email: 'admin@momincore.com', full_name: 'Admin User', role: 'admin', created_at: new Date().toISOString() }
  ],
  dashboardStats: {
    totalUsers: 1234,
    activeUsers: 856,
    newSignups: 42,
    revenue: 5678
  }
};

export const supabaseApi = {
  // Authentication
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    city?: string;
    madhab?: string;
    age_confirmed: boolean;
    shariah_rules_agreed: boolean;
  }) => {
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            city: data.city,
            madhab: data.madhab,
            age_confirmed: data.age_confirmed,
            shariah_rules_agreed: data.shariah_rules_agreed,
            role: 'user'
          }
        }
      });

      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  adminLogin: async (email: string, password: string) => {
    console.log('Making admin login request with Supabase');
    console.log('Request body:', { email, password: '***' });
    
    try {
      // For admin login, check against hardcoded credentials first
      // In production, this should check user role in Supabase
      if (email === 'admin@momincore.com' && password === 'admin123') {
        const mockAdminUser = {
          id: 'admin-1',
          email: 'admin@momincore.com',
          full_name: 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        
        console.log('Admin login successful');
        return {
          success: true,
          message: 'Admin login successful',
          user: mockAdminUser
        };
      } else {
        // Try regular auth for other admin users
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          // Handle email confirmation error specifically
          if (error.message.includes('Email not confirmed')) {
            return {
              success: false,
              message: 'Email not confirmed. Please check your email and confirm your account.',
              requiresConfirmation: true
            };
          }
          throw error;
        }
        
        // Check if user has admin role (this would come from user metadata or a separate table)
        const isAdmin = user?.user_metadata?.role === 'admin';
        
        if (!isAdmin) {
          return {
            success: false,
            message: 'Access denied. Admin privileges required.'
          };
        }

        console.log('Admin login successful');
        return { success: true, user };
      }
    } catch (error) {
      console.log('Admin login error:', error);
      return handleSupabaseError(error);
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  // User data
  getUserDashboard: async () => {
    // Mock implementation - replace with actual Supabase query
    return {
      success: true,
      data: {
        stats: {
          prayersToday: 3,
          quranMinutes: 15,
          lessonsCompleted: 2,
          streakDays: 7
        },
        recentActivity: [],
        goals: []
      }
    };
  },

  getUserProgress: async () => {
    return {
      success: true,
      data: {
        prayerConsistency: 85,
        quranProgress: 60,
        lessonsCompleted: 12,
        communityPosts: 8
      }
    };
  },

  // Admin functions
  getAllUsers: async () => {
    // Mock implementation - replace with actual Supabase query
    return {
      success: true,
      data: mockData.users
    };
  },

  getDashboardStats: async () => {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (users who created profiles in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get total threads
      const { count: totalThreads, error: threadsError } = await supabase
        .from('threads')
        .select('*', { count: 'exact', head: true });

      // Get pending reports
      const { count: pendingReports, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (usersError || activeError || threadsError || reportsError) {
        throw new Error('Error fetching dashboard stats');
      }

      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalThreads: totalThreads || 0,
          pendingReports: pendingReports || 0
        }
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },

  // Simplified mock functions for development
  fetchTable: async (tableName: string, options = {}) => {
    return { success: true, data: [] };
  },

  insertTable: async (tableName: string, data: any) => {
    return { success: true, data: { ...data, id: Date.now().toString() } };
  },

  updateTable: async (tableName: string, id: string, data: any) => {
    return { success: true, data: { id, ...data } };
  },

  deleteTable: async (tableName: string, id: string) => {
    return { success: true };
  }
};

// Export all the mock functions to maintain compatibility with existing API
export const api: ApiMethods = {
  register: supabaseApi.register,
  login: supabaseApi.login,
  adminLogin: supabaseApi.adminLogin,
  getCurrentUser: supabaseApi.getCurrentUser,
  getUserDashboard: supabaseApi.getUserDashboard,
  getUserProgress: supabaseApi.getUserProgress,
  getAllUsers: supabaseApi.getAllUsers,
  getDashboardStats: supabaseApi.getDashboardStats,
  
  // Mock implementations for other endpoints
  getUserLessons: () => Promise.resolve({ success: true, data: [] }),
  getUserSounds: () => Promise.resolve({ success: true, data: [] }),
  getUserCommunity: () => Promise.resolve({ success: true, data: [] }),
  getUserProfile: () => Promise.resolve({ success: true, data: {} }),
  getUserSubscription: () => Promise.resolve({ success: true, data: {} }),
  getUserSettings: () => Promise.resolve({ success: true, data: {} }),
  updateUserSettings: () => Promise.resolve({ success: true, data: {} }),
  getUser: (id: string) => Promise.resolve({ success: true, data: { id } }),
  updateUser: (id: string, data: any) => Promise.resolve({ success: true, data: { id, ...data } }),
  
  // Daily goals
  getDailyGoals: () => Promise.resolve({ success: true, data: [] }),
  updateDailyGoals: () => Promise.resolve({ success: true, data: {} }),
  
  // Streaks
  getStreaks: () => Promise.resolve({ success: true, data: {} }),
  updateStreaks: () => Promise.resolve({ success: true, data: {} }),
  
  getUserGrowth: async () => {
    try {
      // Get user growth data for the last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', twelveMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: { [key: string]: number } = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize all months with 0
      const currentMonth = new Date().getMonth();
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth - 11 + i + 12) % 12;
        monthlyData[months[monthIndex]] = 0;
      }

      // Count users per month
      data?.forEach(user => {
        const date = new Date(user.created_at);
        const monthName = months[date.getMonth()];
        if (monthlyData.hasOwnProperty(monthName)) {
          monthlyData[monthName]++;
        }
      });

      // Convert to chart format
      const chartData = Object.entries(monthlyData).map(([name, users]) => ({
        name,
        users
      }));

      return {
        success: true,
        data: chartData
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getTopContent: async () => {
    try {
      // Get top content by view count with average completion
      const { data, error } = await supabase
        .from('library_content')
        .select(`
          id,
          title,
          content_type,
          view_count,
          duration
        `)
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Get average completion for each content
      const contentWithCompletion = await Promise.all(
        (data || []).map(async (content) => {
          const { data: progressData } = await supabase
            .from('user_library_progress')
            .select('progress_percentage')
            .eq('content_id', content.id);

          const avgCompletion = progressData && progressData.length > 0
            ? Math.round(progressData.reduce((sum, p) => sum + p.progress_percentage, 0) / progressData.length)
            : 0;

          return {
            id: content.id,
            title: content.title,
            type: content.content_type,
            views: content.view_count,
            completion: avgCompletion
          };
        })
      );

      return {
        success: true,
        data: contentWithCompletion
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getRecentActivity: async () => {
    try {
      // Get recent activities from available sources
      const [recentThreads, recentReports] = await Promise.all([
        // Recent threads
        supabase
          .from('threads')
          .select(`
            content,
            created_at,
            user_id
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent reports
        supabase
          .from('reports')
          .select(`
            reason,
            created_at,
            reporter_id,
            content_type
          `)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activities = [];

      // Add thread activities
      if (recentThreads.data) {
        for (const thread of recentThreads.data) {
          // Get user info for this thread
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', thread.user_id)
            .single();

          const fullName = profile?.full_name || 'Unknown User';
          activities.push({
            user: fullName,
            action: `Posted new thread: ${thread.content.substring(0, 50)}...`,
            time: formatRelativeTime(thread.created_at),
            avatar: fullName.charAt(0).toUpperCase()
          });
        }
      }

      // Add report activities
      if (recentReports.data) {
        for (const report of recentReports.data) {
          // Get reporter info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', report.reporter_id)
            .single();

          const fullName = profile?.full_name || 'Unknown User';
          activities.push({
            user: fullName,
            action: `Reported ${report.content_type}: ${report.reason}`,
            time: formatRelativeTime(report.created_at),
            avatar: fullName.charAt(0).toUpperCase()
          });
        }
      }

      // Sort by time and limit to 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      return {
        success: true,
        data: sortedActivities
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  getPendingItems: async () => {
    try {
      // Get counts for various pending items
      const [supportTickets, flaggedPosts, pendingReviews, draftLessons] = await Promise.all([
        // Support tickets (could be implemented as reports with type 'support')
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // Flagged posts
        supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('content_type', 'thread')
          .eq('status', 'pending'),
        
        // Pending reviews (content awaiting approval)
        supabase
          .from('library_content')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', false),
        
        // Draft lessons (unpublished content)
        supabase
          .from('library_content')
          .select('*', { count: 'exact', head: true })
          .is('audio_url', null)
          .is('text_content', null)
      ]);

      const pendingItems = [
        { label: 'Support tickets', count: supportTickets.count || 0, icon: 'AlertTriangle', color: 'text-red-400' },
        { label: 'Flagged posts', count: flaggedPosts.count || 0, icon: 'MessageSquare', color: 'text-yellow-400' },
        { label: 'Pending reviews', count: pendingReviews.count || 0, icon: 'Clock', color: 'text-blue-400' },
        { label: 'Draft lessons', count: draftLessons.count || 0, icon: 'BookOpen', color: 'text-primary' }
      ];

      return {
        success: true,
        data: pendingItems
      };
    } catch (error) {
      return handleSupabaseError(error);
    }
  },
  deleteUser: (id: string) => Promise.resolve({ success: true, message: 'User deleted' }),
  addUser: (userData: any) => Promise.resolve({ 
    success: true, 
    data: { ...userData, id: Date.now().toString(), tempPassword: 'temp123' } 
  }),
  updateUserRole: (userId: string, newRole: string) => Promise.resolve({ success: true, message: 'Role updated' }),
  toggleBanUser: (userId: string) => Promise.resolve({ success: true, message: 'User ban status toggled' }),
  sendUserEmail: (userId: string, subject: string, message: string) => Promise.resolve({ success: true, message: 'Email sent' }),
  getUserDetails: (userId: string) => Promise.resolve({ success: true, data: { id: userId } }),
  
  // All other functions - return empty data
  getRoleStats: () => Promise.resolve({ success: true, data: {} }),
  getUsersByRole: () => Promise.resolve({ success: true, data: [] }),
  getServicesStats: () => Promise.resolve({ success: true, data: {} }),
  getLibraryContent: () => Promise.resolve({ success: true, data: [] }),
  getRecentThreads: () => Promise.resolve({ success: true, data: [] }),
  getLessonsStats: () => Promise.resolve({ success: true, data: {} }),
  getLessons: () => Promise.resolve({ success: true, data: [] }),
  getAudioTracks: () => Promise.resolve({ success: true, data: [] }),
  getVoiceTracks: () => Promise.resolve({ success: true, data: [] }),
  getCommunityStats: () => Promise.resolve({ success: true, data: {} }),
  getCommunityPosts: () => Promise.resolve({ success: true, data: [] }),
  getCommunityReports: () => Promise.resolve({ success: true, data: [] }),
  getSubscriptionStats: () => Promise.resolve({ success: true, data: {} }),
  getSubscriptionPlans: () => Promise.resolve({ success: true, data: [] }),
  getSubscribers: () => Promise.resolve({ success: true, data: [] }),
  getSupportStats: () => Promise.resolve({ success: true, data: {} }),
  getSupportTickets: () => Promise.resolve({ success: true, data: [] }),
  getNotificationStats: () => Promise.resolve({ success: true, data: {} }),
  getNotificationCampaigns: () => Promise.resolve({ success: true, data: [] }),
  getContentSections: () => Promise.resolve({ success: true, data: [] }),
  getBlogPosts: () => Promise.resolve({ success: true, data: [] }),
  getFaqs: () => Promise.resolve({ success: true, data: [] }),
  getTestimonials: () => Promise.resolve({ success: true, data: [] }),
  getSeoPages: () => Promise.resolve({ success: true, data: [] }),
  getMediaFiles: () => Promise.resolve({ success: true, data: [] }),
  getStorageStats: () => Promise.resolve({ success: true, data: {} }),
  getKpis: () => Promise.resolve({ success: true, data: {} }),
  getReportsUserGrowth: () => Promise.resolve({ success: true, data: [] }),
  getRevenue: () => Promise.resolve({ success: true, data: {} }),
  getRetention: () => Promise.resolve({ success: true, data: {} }),
  getPlanDistribution: () => Promise.resolve({ success: true, data: {} }),
  getFeatureUsage: () => Promise.resolve({ success: true, data: {} }),
  getAffiliates: () => Promise.resolve({ success: true, data: [] }),
  getAffiliateStats: () => Promise.resolve({ success: true, data: {} }),
  getAffiliatePayouts: () => Promise.resolve({ success: true, data: [] }),
  getAffiliateReferrals: () => Promise.resolve({ success: true, data: [] }),
  getAffiliateTiers: () => Promise.resolve({ success: true, data: [] }),
  getAuditLogs: () => Promise.resolve({ success: true, data: [] }),
  getAuditStats: () => Promise.resolve({ success: true, data: {} }),
  getGeneralSettings: () => Promise.resolve({ success: true, data: {} }),
  getBrandingSettings: () => Promise.resolve({ success: true, data: {} }),
  getEmailTemplates: () => Promise.resolve({ success: true, data: [] }),
  getIntegrations: () => Promise.resolve({ success: true, data: [] }),
  getApiKeys: () => Promise.resolve({ success: true, data: [] }),
  getSecuritySettings: () => Promise.resolve({ success: true, data: {} }),
};
