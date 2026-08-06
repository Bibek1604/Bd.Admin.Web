/**
 * DEPRECATED: This file used to duplicate src/api/baseUrl.ts.
 * It now re-exports from the canonical source so there is a single source of
 * truth for the backend URL.
 *
 * New code should import from '@/api/baseUrl' or '../../api/baseUrl' directly.
 */
export { BASE_URL, getHeaders, apiConfig } from '../api/baseUrl';
