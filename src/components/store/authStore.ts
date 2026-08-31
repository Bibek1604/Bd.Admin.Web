/**
 * DEAD CODE — not imported by anything in the active module architecture.
 * The active API layer is src\/api\/ (axiosInstance, adminRoutes, baseUrl).
 * The active hooks live in src\/modules\/*\/use*.ts.
 * Safe to delete this entire src\/components\/api\/, src\/components\/hooks\/,
 * and src\/components\/store\/ tree.
 *\/
// Re-export the canonical auth store so all imports resolve to the same singleton.
// Previously this file had a separate store instance which caused state mismatches
// (e.g. ProtectedRoute seeing stale auth state while axiosInstance used the real store).
export { useAuthStore } from '../../store/authStore';
