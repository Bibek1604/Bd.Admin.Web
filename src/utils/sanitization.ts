/**
 * Input/Output Sanitization Utilities
 * Prevents XSS attacks by escaping HTML and removing dangerous patterns
 */

/**
 * Sanitize user input to remove HTML and special characters
 * Safe for database storage
 */
/**
 * Clean a value typed into a controlled input. sanitizeInput must NOT be used
 * for that: its pattern-stripping runs on every keystroke, so "Jonas=" lost
 * "onas=" (read as an `on…=` event handler) and the mangled text was saved.
 * React escapes on output; storage wants the literal text. Angle brackets are
 * dropped and length is capped.
 */
export const sanitizeTextInput = (input: string | null | undefined, maxLength = 1000): string => {
  if (!input) return '';
  return String(input).replace(/[<>]/g, '').slice(0, maxLength);
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
};

/**
 * Escape HTML entities to prevent XSS
 * Safe for display in HTML
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Remove dangerous patterns from user input
 * Blocks javascript:, data:, onclick=, etc.
 */
export const removeDangerousPatterns = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  const result = input
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

  return result.trim();
};

/**
 * Sanitize URLs to prevent open redirect attacks
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';

  const str = url.trim();

  // Block dangerous protocols
  if (/^(javascript|data|vbscript|file):/i.test(str)) {
    return '';
  }

  // "//evil.com" and "/\evil.com" start with "/" but browsers read them as
  // protocol-relative links to ANOTHER host, so a same-site path check let an
  // open redirect through.
  if (/^\/[/\\]/.test(str)) {
    return '';
  }

  // Allow only safe URLs
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/')) {
    return str;
  }

  return '';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
  return typeof phone === 'string' && phoneRegex.test(phone);
};

/**
 * Sanitize file name to prevent path traversal
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') return 'file';

  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');

  // Remove special characters except . and -
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  return sanitized || 'file';
};

/**
 * Recursively sanitize object properties
 */
export const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
