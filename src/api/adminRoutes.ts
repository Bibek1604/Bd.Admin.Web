/**
 * Admin API paths, in one place.
 *
 * EVERY path here includes the leading `/api` segment, because the axios
 * baseURL is VITE_API_BASE_URL and does NOT. Two services previously spelled
 * their own URLs out and left it off ('/admin/companies/', '/admin/agents/');
 * both 404'd. If a path is not in this map, that is the bug to fix.
 */
export const ADMIN_ROUTES = {
  // Backend exposes admin login at /api/admin/login (also has /api/auth/login alias)
  login: '/api/admin/login',
  refresh: '/api/auth/refresh',
  logoutAll: '/api/auth/logout-all',
  dashboardOverview: '/api/admin/dashboard-overview/',
  adminBase: '/api/admin/',
  users: '/api/admin/users/',
  agents: '/api/admin/agents/',
  companies: '/api/admin/companies/',
  bulkNotifications: '/api/admin/bulk-notifications/',
  bulkClientImport: '/api/admin/clients/bulk-upload',
} as const;

export const AGENT_ROUTES = {
  // Backend agent login route is /api/agent/login
  login: '/api/agent/login',
} as const;


