import { useEffect, Suspense, lazy } from 'react';
import { useAuthStore } from './store/authStore';
import ConnectionGuard from './components/ConnectionGuard';

// Lazy-loaded components
const AdminLogin = lazy(() => import('./modules/admin/auth/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./components/admin/Dashboard'));

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
          {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
        </Suspense>
      </div>
    </ConnectionGuard>
  );
}

export default App;
