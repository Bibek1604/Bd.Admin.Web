/**
 * File Validation Utilities
 * Validates file size, MIME type, and filename for security
 */

import { sanitizeFileName } from './sanitization';

export interface FileValidationResult {
  valid: boolean;
  error: string;
  sanitizedName?: string;
}

export interface FileValidationConfig {
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  errorMessageSize: string;
  errorMessageType: string;
}

/**
 * Preset configurations for common file types
 */
export const FILE_VALIDATION_PRESETS = {
  IMAGE: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
    errorMessageSize: 'Profile picture must be less than 10MB',
    errorMessageType: 'Only PNG and JPEG images are allowed',
  } as FileValidationConfig,

  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ],
    errorMessageSize: 'Document must be less than 10MB',
    errorMessageType: 'Only PDF, Word documents, or images are allowed',
  } as FileValidationConfig,

  PDF: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
    errorMessageSize: 'PDF must be less than 10MB',
    errorMessageType: 'Only PDF files are allowed',
  } as FileValidationConfig,
};

/**
 * Validate a file against configuration
 */
export const validateFile = (
  file: File | null | undefined,
  config: FileValidationConfig
): FileValidationResult => {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
    };
  }

  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: config.errorMessageSize,
    };
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: config.errorMessageType,
    };
  }

  // Sanitize filename
  const sanitizedName = sanitizeFileName(file.name);

  return {
    valid: true,
    error: '',
    sanitizedName,
  };
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file type is dangerous
 */
export const isDangerousFileType = (fileName: string): boolean => {
  const dangerousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.zip',
    '.rar',
  ];

  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  return dangerousExtensions.includes(extension);
};

/**
 * Validate multiple files
 */
export const validateFiles = (
  files: File[] | FileList | null | undefined,
  config: FileValidationConfig
): { valid: boolean; errors: string[] } => {
  if (!files || files.length === 0) {
    return {
      valid: false,
      errors: ['No files selected'],
    };
  }

  const errors: string[] = [];

  Array.from(files).forEach((file, index) => {
    const result = validateFile(file, config);
    if (!result.valid) {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
