import { useEffect, Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ConnectionGuard from './components/ConnectionGuard';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { brandImageUrl, useBrandingStore } from './store/brandingStore';

/** Point the browser tab icon at the uploaded favicon (Website -> Branding). */
const useBrandFavicon = () => {
  const load = useBrandingStore((s) => s.load);
  const favicon = useBrandingStore((s) => brandImageUrl(s.branding?.favicon_url));
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    if (!link.dataset.defaultHref) link.dataset.defaultHref = link.getAttribute('href') || '/favicon.png';
    link.removeAttribute('type'); // the uploaded icon is WebP, not the PNG the tag declares
    link.href = favicon || link.dataset.defaultHref;
  }, [favicon]);
};

// Lazy-loaded components
const AdminLogin = lazy(() => import('./modules/admin/auth/AdminLoginPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const OverviewPage = lazy(() => import('./modules/admin/dashboard/OverviewPage'));
const AgentsPage = lazy(() => import('./modules/admin/agents/AgentsPage'));
const CompaniesPage = lazy(() => import('./modules/admin/companies/CompaniesPage'));
const NotificationsPage = lazy(() => import('./modules/user/bulk-notifications/BulkNotificationsPage'));
const BulkEnrollmentPage = lazy(() => import('./modules/admin/clients/BulkEnrollmentPage'));
const RequestsPage = lazy(() => import('./modules/admin/requests/RequestsPage'));
const WebsitePage = lazy(() => import('./modules/admin/website/WebsitePage'));
const MessagesPage = lazy(() => import('./modules/admin/website/MessagesPage'));

// Simple loading indicator
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
  </div>
);

function App() {
  const { isAuthenticated, logout, isRestoring, restoreSession } = useAuthStore();
  useBrandFavicon();

  // A reload with an expired access token tries the refresh cookie once
  // before deciding between the console and the login screen.
  useEffect(() => {
    if (isRestoring) void restoreSession();
  }, [isRestoring, restoreSession]);

  useEffect(() => {
    // Check if token exists in localStorage if we think we are authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (isAuthenticated && !token && !useAuthStore.getState().isRestoring) {
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
      <ConfirmProvider>
      <div className="App">
        <Suspense fallback={<LoadingScreen />}>
          {isRestoring ? (
            <LoadingScreen />
          ) : isAuthenticated ? (
            // Every sidebar entry is a real route, so the URL reflects the page
            // and back/forward, refresh and deep links all work.
            <Routes>
              <Route element={<AdminLayout />}>
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/clients/bulk-enrollment" element={<BulkEnrollmentPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/website" element={<WebsitePage />} />
                <Route path="/messages" element={<MessagesPage />} />
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
      </ConfirmProvider>
    </ConnectionGuard>
  );
}

export default App;
