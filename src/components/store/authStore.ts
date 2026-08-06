// Re-export the canonical auth store so all imports resolve to the same singleton.
// Previously this file had a separate store instance which caused state mismatches
// (e.g. ProtectedRoute seeing stale auth state while axiosInstance used the real store).
export { useAuthStore } from '../../store/authStore';
