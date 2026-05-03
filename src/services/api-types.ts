export interface ApiUser {
  id: string;
  email?: string;
  full_name?: string;
  name?: string;
  role?: string;
  plan?: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface ApiMethods {
  // Auth methods
  register(data: any): Promise<ApiResponse>;
  login(email: string, password: string): Promise<ApiResponse>;
  adminLogin(email: string, password: string): Promise<ApiResponse>;
  getCurrentUser(): Promise<ApiResponse>;
  
  // User methods
  getUserDashboard(): Promise<ApiResponse>;
  getUserProgress(): Promise<ApiResponse>;
  getAllUsers(): Promise<ApiResponse<ApiUser[]>>;
  getDashboardStats(): Promise<ApiResponse>;
  
  // Admin user management
  updateUserRole(userId: string, newRole: string): Promise<ApiResponse>;
  toggleBanUser(userId: string): Promise<ApiResponse>;
  sendUserEmail(userId: string, subject: string, message: string): Promise<ApiResponse>;
  deleteUser(userId: string): Promise<ApiResponse>;
  addUser(userData: {
    name: string;
    email: string;
    role: string;
    plan: string;
  }): Promise<ApiResponse<{
    id: string;
    email: string;
    name: string;
    role: string;
    plan: string;
    tempPassword: string;
  }>>;
  
  // Role management
  createRole(roleData: {
    name: string;
    color: string;
    permissions: Record<string, boolean>;
  }): Promise<ApiResponse>;
  deleteRole(roleId: string): Promise<ApiResponse>;
  updateRolePermission(roleId: string, permissionKey: string, enabled: boolean): Promise<ApiResponse>;
  getAllRoles(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    color: string;
    system: boolean;
    created_at: string;
  }>>>;
  
  // Service management
  getServices(): Promise<ApiResponse>;
  createService(serviceData: {
    name: string;
    description: string;
    category: string;
  }): Promise<ApiResponse>;
  updateService(serviceId: string, serviceData: {
    name: string;
    description: string;
    category: string;
  }): Promise<ApiResponse>;
  toggleService(serviceId: string): Promise<ApiResponse>;
  deleteService(serviceId: string): Promise<ApiResponse>;
  
  // Additional methods (mock implementations)
  getUserLessons(): Promise<ApiResponse>;
  getUserSounds(): Promise<ApiResponse>;
  getUserCommunity(): Promise<ApiResponse>;
  getUserProfile(): Promise<ApiResponse>;
  getUserSubscription(): Promise<ApiResponse>;
  getUserSettings(): Promise<ApiResponse>;
  updateUserSettings(): Promise<ApiResponse>;
  getUser(id: string): Promise<ApiResponse>;
  updateUser(id: string, data: any): Promise<ApiResponse>;
  getDailyGoals(): Promise<ApiResponse>;
  updateDailyGoals(): Promise<ApiResponse>;
  getStreaks(): Promise<ApiResponse>;
  updateStreaks(): Promise<ApiResponse>;
  getUserGrowth(): Promise<ApiResponse>;
  getTopContent(): Promise<ApiResponse>;
  getRecentActivity(): Promise<ApiResponse>;
  getPendingItems(): Promise<ApiResponse>;
  getUserDetails(userId: string): Promise<ApiResponse>;
  getRoleStats(): Promise<ApiResponse>;
  getUsersByRole(): Promise<ApiResponse>;
  getServicesStats(): Promise<ApiResponse>;
  getServices(): Promise<ApiResponse>;
  getLibraryContent(): Promise<ApiResponse>;
  getRecentThreads(): Promise<ApiResponse>;
  getLessonsStats(): Promise<ApiResponse>;
  getLessons(): Promise<ApiResponse>;
  getAudioTracks(): Promise<ApiResponse>;
  getVoiceTracks(): Promise<ApiResponse>;
  getCommunityStats(): Promise<ApiResponse>;
  getCommunityPosts(): Promise<ApiResponse>;
  getCommunityReports(): Promise<ApiResponse>;
  getSubscriptionStats(): Promise<ApiResponse>;
  getSubscriptionPlans(): Promise<ApiResponse>;
  getSubscribers(): Promise<ApiResponse>;
  getSupportStats(): Promise<ApiResponse>;
  getSupportTickets(): Promise<ApiResponse>;
  getNotificationStats(): Promise<ApiResponse>;
  getNotificationCampaigns(): Promise<ApiResponse>;
  getContentSections(): Promise<ApiResponse>;
  getBlogPosts(): Promise<ApiResponse>;
  getFaqs(): Promise<ApiResponse>;
  getTestimonials(): Promise<ApiResponse>;
  getSeoPages(): Promise<ApiResponse>;
  getMediaFiles(): Promise<ApiResponse>;
  getStorageStats(): Promise<ApiResponse>;
  getKpis(): Promise<ApiResponse>;
  getReportsUserGrowth(): Promise<ApiResponse>;
  getRevenue(): Promise<ApiResponse>;
  getRetention(): Promise<ApiResponse>;
  getPlanDistribution(): Promise<ApiResponse>;
  getFeatureUsage(): Promise<ApiResponse>;
  getAffiliates(): Promise<ApiResponse>;
  getAffiliateStats(): Promise<ApiResponse>;
  getAffiliatePayouts(): Promise<ApiResponse>;
  getAffiliateReferrals(): Promise<ApiResponse>;
  getAffiliateTiers(): Promise<ApiResponse>;
  getAuditLogs(): Promise<ApiResponse>;
  getAuditStats(): Promise<ApiResponse>;
  getGeneralSettings(): Promise<ApiResponse>;
  getBrandingSettings(): Promise<ApiResponse>;
  getEmailTemplates(): Promise<ApiResponse>;
  getIntegrations(): Promise<ApiResponse>;
  getApiKeys(): Promise<ApiResponse>;
  getSecuritySettings(): Promise<ApiResponse>;
}
