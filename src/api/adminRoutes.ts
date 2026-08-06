export const ADMIN_ROUTES = {
  // Backend exposes admin login at /api/admin/login (also has /api/auth/login alias)
  login: '/api/admin/login',
  refresh: '/api/auth/refresh',
  logoutAll: '/api/auth/logout-all',
  dashboardOverview: '/api/admin/dashboard-overview/',
  users: '/api/admin/users/',
  companies: '/api/admin/companies/',
  bulkNotifications: '/api/admin/bulk-notifications/',
} as const;

export const AGENT_ROUTES = {
  // Backend agent login route is /api/agent/login
  login: '/api/agent/login',
} as const;


