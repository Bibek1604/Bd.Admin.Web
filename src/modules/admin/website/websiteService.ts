import api from '../../../api/axiosInstance';
import { ADMIN_ROUTES } from '../../../api/adminRoutes';
import type { Branding } from '../../../store/brandingStore';

export type { Branding };
/** Uploadable brand images (backend BRANDING_ASSETS). */
export type BrandingAsset = 'logo' | 'admin_logo' | 'favicon';

/** Mirrors backend/src/models/siteContent.model.js. */
export interface SiteContact { email: string; phone: string; address: string; hours: string }
export interface SiteFaq { id?: string; question: string; answer: string }
export interface SiteJob {
  id?: string;
  title: string;
  location: string;
  type: string;
  department: string;
  description: string;
  /** Only open jobs are shown on the public Careers page. */
  is_open: boolean;
}
export interface SiteContent {
  contact: SiteContact;
  help_faqs: SiteFaq[];
  jobs: SiteJob[];
  branding: Branding;
  updated_at?: string | null;
}

export type MessageStatus = 'NEW' | 'HANDLED';
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  handled_at: string | null;
  created_at: string;
}
export interface MessagesPage {
  results: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** NEW messages across the whole inbox, regardless of filters. */
  unhandled: number;
}

export const SUBJECT_LABELS: Record<string, string> = {
  support: 'Support',
  sales: 'Sales Inquiry',
  partnership: 'Partnership',
  bug: 'Bug Report',
  feedback: 'Feedback',
  other: 'Other',
};

export const websiteService = {
  getContent: async (): Promise<SiteContent> => {
    const response = await api.get<SiteContent>(ADMIN_ROUTES.siteContent);
    return response.data;
  },

  /**
   * Saves contact details, FAQs, jobs and the brand TEXT together. The brand
   * images are not part of this save; they are uploaded on their own below.
   */
  saveContent: async (content: SiteContent): Promise<SiteContent> => {
    const { contact, help_faqs, jobs, branding } = content;
    const response = await api.put<SiteContent>(ADMIN_ROUTES.siteContent, {
      contact,
      help_faqs,
      jobs,
      branding: {
        site_name: branding.site_name,
        tagline: branding.tagline,
        copyright_holder: branding.copyright_holder,
      },
    });
    return response.data;
  },

  /** Upload one brand image; it is saved and goes live immediately. */
  uploadBrandingAsset: async (asset: BrandingAsset, file: File): Promise<Branding> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post<Branding>(`${ADMIN_ROUTES.siteBranding}/${asset}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Back to the image the app ships with. */
  resetBrandingAsset: async (asset: BrandingAsset): Promise<Branding> => {
    const response = await api.delete<Branding>(`${ADMIN_ROUTES.siteBranding}/${asset}`);
    return response.data;
  },

  getMessages: async (params: { page: number; limit: number; status?: MessageStatus; search?: string }): Promise<MessagesPage> => {
    const response = await api.get<MessagesPage>(ADMIN_ROUTES.contactMessages, { params });
    const data = response.data;
    return {
      results: Array.isArray(data?.results) ? data.results : [],
      total: data?.total ?? 0,
      page: data?.page ?? params.page,
      limit: data?.limit ?? params.limit,
      totalPages: data?.totalPages ?? 0,
      unhandled: data?.unhandled ?? 0,
    };
  },

  setMessageHandled: async (id: string, handled: boolean): Promise<ContactMessage> => {
    const response = await api.patch<ContactMessage>(`${ADMIN_ROUTES.contactMessages}/${id}/status`, { handled });
    return response.data;
  },
};

export default websiteService;
