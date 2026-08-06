import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from '../utils/authUtils';

/**
 * useSessionMonitor Hook
 * Monitors user session and automatically logs out if:
 * - Token expires
 * - User manually logs out
 * - Session becomes invalid
 *
 * Usage in any component:
 * ```tsx
 * export const MyComponent = () => {
 *   useSessionMonitor();
 *   // ... rest of component
 * }
 * ```
 */
export const useSessionMonitor = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // If no token, ensure user is on login page
    if (!isAuthenticated || !token) {
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      logout();
      navigate('/login', { replace: true });
      return;
    }

    // Set up periodic check for token expiration
    // Check every 30 seconds
    const interval = setInterval(() => {
      const currentToken = useAuthStore.getState().token;
      const currentAuth = useAuthStore.getState().isAuthenticated;

      if (!currentAuth || !currentToken) {
        clearInterval(interval);
        navigate('/login', { replace: true });
        return;
      }

      if (isTokenExpired(currentToken)) {
        useAuthStore.getState().logout();
        clearInterval(interval);
        navigate('/login', { replace: true });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [token, isAuthenticated, navigate, logout]);
};

export default useSessionMonitor;
