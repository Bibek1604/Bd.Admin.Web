/**
 * DEAD CODE — not imported by anything in the active module architecture.
 * The active API layer is src/api/ (axiosInstance, adminRoutes, baseUrl);
 * the active hooks live under src/modules/. Safe to delete
 * src/components/api/, src/components/hooks/ and src/components/store/.
 */
// Re-export the canonical auth store so all imports resolve to the same singleton.
// Previously this file had a separate store instance which caused state mismatches
// (e.g. ProtectedRoute seeing stale auth state while axiosInstance used the real store).
export { useAuthStore } from '../../store/authStore';
