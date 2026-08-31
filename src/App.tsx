import { useEffect, Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ConnectionGuard from './components/ConnectionGuard';

// Lazy-loaded components
const AdminLogin = lazy(() => import('./modules/admin/auth/AdminLoginPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const OverviewPage = lazy(() => import('./modules/admin/dashboard/OverviewPage'));
const AgentsPage = lazy(() => import('./modules/admin/agents/AgentsPage'));
const CompaniesPage = lazy(() => import('./modules/admin/companies/CompaniesPage'));
const NotificationsPage = lazy(() => import('./modules/user/bulk-notifications/BulkNotificationsPage'));

// Simple loading indicator
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
  </div>
);

function App() {
  const { isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Check if token exists in localStorage if we think we are authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (isAuthenticated && !token) {
        logout();
      }
    };

    // Run check on mount
    checkAuth();

    // Also listen for storage changes (e.g. if deleted in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Check on window focus to be more proactive
    window.addEventListener('focus', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [isAuthenticated, logout]);

  return (
    <ConnectionGuard>
      <div className="App">
        <Suspense fallback={<LoadingScreen />}>
          {isAuthenticated ? (
            // Every sidebar entry is a real route, so the URL reflects the page
            // and back/forward, refresh and deep links all work.
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="*" element={<AdminLogin />} />
            </Routes>
          )}
        </Suspense>
      </div>
    </ConnectionGuard>
  );
}

export default App;
