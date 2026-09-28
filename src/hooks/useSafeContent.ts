/**
 * Hook for safe rendering of user-generated content
 * Prevents XSS attacks by escaping HTML
 */

import { useMemo } from 'react';
import { escapeHtml, sanitizeInput, sanitizeUrl } from '../utils/sanitization';

/**
 * Hook to safely display user content
 * Escapes HTML and sanitizes input
 */
export const useSafeContent = (content: string | null | undefined): string => {
  return useMemo(() => {
    if (!content) return '';

    // First sanitize input to remove dangerous patterns
    const sanitized = sanitizeInput(content);

    // Then escape HTML to prevent rendering of tags
    return escapeHtml(sanitized);
  }, [content]);
};

/**
 * Hook to safely create HTML element from user content
 * Uses textContent instead of innerHTML for safety
 */
export const useSafeHTML = (
  content: string | null | undefined
): { __html: string } => {
  return useMemo(() => {
    if (!content) return { __html: '' };

    // Never use dangerouslySetInnerHTML with user content
    // This hook returns escaped content only
    const sanitized = sanitizeInput(content);
    return { __html: escapeHtml(sanitized) };
  }, [content]);
};

/**
 * Hook to validate and display user URLs
 * Only allows http, https, and relative URLs
 */
export const useSafeUrl = (url: string | null | undefined): string => {
  // One rule for hooks and plain code — this used to be a copy of
  // sanitizeUrl that drifted (it let "//evil.com" through too).
  return useMemo(() => (url ? sanitizeUrl(String(url)) : ''), [url]);
};
