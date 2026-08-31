import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { isTokenExpired } from '../utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * Ensures only authenticated users can access protected pages
 * Redirects to login if:
 *  - No token exists
 *  - Token is expired
 *  - Session is invalid (caught by API interceptor)
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token } = useAuthStore();
  const hasRefreshToken = !!localStorage.getItem('adminRefreshToken');

  // Check if token exists and is not expired
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // If the access token is expired but a refresh token exists, keep the user on the app.
  // The axios interceptor will rotate the session on the next API call.
  if (isTokenExpired(token)) {
    if (!hasRefreshToken) {
      useAuthStore.getState().logout();
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
