import { create } from 'zustand';
import api from '../api/axiosInstance';
import { resolveImage } from '../utils/resolveImage';

/**
 * Brand name, logos and favicon, as set on the admin panel's Website page
 * (backend: GET /api/public/site-content -> branding). Shared, so an upload on
 * the Website page updates every logo in the admin panel straight away.
 */
export interface Branding {
  site_name: string;
  tagline: string;
  copyright_holder: string;
  logo_url: string | null;
  admin_logo_url: string | null;
  favicon_url: string | null;
}

interface BrandingState {
  branding: Branding | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  load: () => Promise<void>;
  setBranding: (branding: Branding) => void;
}

export const useBrandingStore = create<BrandingState>((set, get) => ({
  branding: null,
  status: 'idle',
  load: async () => {
    if (get().status === 'loading' || get().status === 'ready') return;
    set({ status: 'loading' });
    try {
      const res = await api.get<{ branding?: Branding }>('/api/public/site-content');
      set({ branding: res.data?.branding ?? null, status: 'ready' });
    } catch {
      // The built-in logo and icon stay in place; nothing else depends on this.
      set({ status: 'error' });
    }
  },
  setBranding: (branding) => set({ branding, status: 'ready' }),
}));

/** An uploaded image URL, made absolute against the backend. '' when not set. */
export const brandImageUrl = (url: string | null | undefined): string => resolveImage(url || '');
