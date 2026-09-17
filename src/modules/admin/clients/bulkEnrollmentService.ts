import api from '../../../api/axiosInstance';

/** A row either failed validation (never attempted), failed the actual
 * write ("invalid" vs "failed"), or was created. There is no "updated" —
 * the template has no ID column and duplicates are not checked, so every
 * valid row is a brand-new client. */
export type RowStatus = 'created' | 'invalid' | 'failed';

export interface RowIssue {
  rowNumber: number;
  status: RowStatus;
  identifier: string;
  errors?: Array<{ field: string | null; message: string }>;
}

export interface RowResult {
  rowNumber: number;
  status: RowStatus;
  identifier: string;
  clientId?: string;
  errors?: Array<{ field: string | null; message: string }>;
}

export interface BulkImportTotals {
  total: number;
  created: number;
  failed: number;
  successful: number;
}

export interface BulkImportResult {
  mode: 'preview' | 'commit';
  agent: { id: string; name: string };
  file: { name: string };
  totals: BulkImportTotals;
  preview_rows?: RowResult[];
  issues: RowIssue[];
  issues_truncated: boolean;
  unmapped_columns: string[];
  agent_column_ignored: boolean;
  importId?: string;
}

export interface ImportHistoryEntry {
  id: string;
  admin_id: string;
  agent_id: string;
  agent_name: string;
  file_name: string;
  totals: BulkImportTotals;
  status: 'COMPLETED' | 'PARTIAL';
  created_at: string;
}

export interface ImportHistoryPage {
  results: ImportHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BASE = '/api/admin/clients/bulk-upload';

/**
 * Bulk import gets its own, much longer timeout than the 30s default.
 *
 * A commit writes a client, a policy and roughly one premium installment per
 * policy year FOR EVERY ROW, so a few hundred rows comfortably outlast the
 * default — and the browser giving up does not stop the server, it just hides
 * the outcome. Ten minutes is chosen to exceed the 5,000-row ceiling the parser
 * enforces rather than to be generous.
 *
 * This does not make a timeout impossible, so the "we don't know what happened"
 * handling in useBulkEnrollment stays as the backstop.
 */
const BULK_TIMEOUT_MS = 10 * 60 * 1000;

/** Shared by the template and error-report downloads — the browser saves the blob. */
const saveBlob = (data: Blob, fileName: string): void => {
  const blobUrl = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
};

const buildFormData = (file: File, agentId: string): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('agentId', agentId);
  return formData;
};

export const bulkEnrollmentService = {
  /** Parses + validates the file — nothing is written yet. */
  validate: async (file: File, agentId: string): Promise<BulkImportResult> => {
    const response = await api.post<BulkImportResult>(
      `${BASE}/validate`,
      buildFormData(file, agentId),
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: BULK_TIMEOUT_MS }
    );
    return response.data;
  },

  /** Re-runs the same pipeline and actually imports every eligible row. */
  commit: async (file: File, agentId: string): Promise<BulkImportResult> => {
    const response = await api.post<BulkImportResult>(
      BASE,
      buildFormData(file, agentId),
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: BULK_TIMEOUT_MS }
    );
    return response.data;
  },

  getHistory: async (params?: { page?: number; limit?: number; agentId?: string }): Promise<ImportHistoryPage> => {
    const response = await api.get<ImportHistoryPage>(`${BASE}/history`, { params });
    return response.data;
  },

  /** Downloads the CSV error report for one import and saves it via the browser. */
  downloadErrorReport: async (importId: string, suggestedName = 'bulk-enrollment-errors.csv'): Promise<void> => {
    const response = await api.get(`${BASE}/${importId}/error-report`, { responseType: 'blob' });
    saveBlob(response.data as Blob, suggestedName);
  },

  /** Downloads the .xlsx template — generated server-side from the importer's
   *  own field definitions, so it always matches what the validator accepts. */
  downloadTemplate: async (): Promise<void> => {
    const response = await api.get(`${BASE}/template`, { responseType: 'blob' });
    saveBlob(response.data as Blob, 'Client_Enrollment_Template.xlsx');
  },
};

export default bulkEnrollmentService;
