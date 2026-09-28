import { useCallback, useState } from 'react';
import { bulkEnrollmentService, type BulkImportResult } from './bulkEnrollmentService';
import { extractMessage, isOutcomeUnknown } from '../../../utils/formErrors';

/**
 * `unknown` is a real terminal state, not an error state.
 *
 * When a commit times out the browser has stopped waiting but the SERVER has
 * not stopped working — it keeps writing rows. Returning to 'previewed' put the
 * Import button back within reach, and pressing it re-imported every client the
 * server had already created. Duplicates are not blocked by design, so that is
 * a silent doubling of a whole spreadsheet.
 */
/** Mirrors the backend (bulkClientImport.routes.js: MAX_FILE_SIZE_MB, isAcceptableUpload). */
export const MAX_IMPORT_FILE_MB = 15;
const IMPORT_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

/**
 * Why a picked file cannot be imported, or null when it can. Checked before
 * any upload: the `accept` attribute is only a hint ("All files" bypasses it),
 * and a 40MB PDF used to travel all the way to the server to be refused there.
 */
export const importFileProblem = (file: File): string | null => {
  const name = file.name.toLowerCase();
  if (!IMPORT_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return 'Only .xlsx, .xls or .csv files can be imported.';
  }
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_IMPORT_FILE_MB * 1024 * 1024) {
    return `The file is larger than ${MAX_IMPORT_FILE_MB}MB. Split it into smaller files.`;
  }
  return null;
};

export type BulkEnrollmentStep = 'idle' | 'validating' | 'previewed' | 'importing' | 'completed' | 'unknown';

/** Drives the Admin Panel flow: pick agent -> upload file -> validate/preview -> confirm import -> result.
 * Every valid row is always a create — the template has no ID column and its
 * Instructions sheet says duplicates aren't checked — so there's no
 * duplicate-handling strategy to carry through this flow. */
export const useBulkEnrollment = () => {
  const [step, setStep] = useState<BulkEnrollmentStep>('idle');
  const [agentId, setAgentId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewResult, setPreviewResult] = useState<BulkImportResult | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The preview describes ONE file for ONE agent. The inputs stay editable in
  // the 'previewed' step, and changing either used to leave the old preview on
  // screen while Import committed the NEW selection — a file nobody reviewed,
  // or the right file into the wrong agent's book. Any change drops the preview.
  const selectAgent = useCallback((id: string) => {
    setAgentId(id);
    setPreviewResult(null);
    setStep((s) => (s === 'previewed' ? 'idle' : s));
  }, []);

  const selectFile = useCallback((next: File | null) => {
    const problem = next ? importFileProblem(next) : null;
    setError(problem);
    setFile(problem ? null : next);
    setPreviewResult(null);
    setStep((s) => (s === 'previewed' ? 'idle' : s));
  }, []);

  const reset = useCallback(() => {
    setStep('idle');
    setFile(null);
    setPreviewResult(null);
    setImportResult(null);
    setError(null);
  }, []);

  const validate = useCallback(async () => {
    if (!agentId) { setError('Select the agent these clients will be assigned to.'); return; }
    if (!file) { setError('Choose an .xlsx, .xls or .csv file.'); return; }
    const problem = importFileProblem(file);
    if (problem) { setError(problem); return; }
    setError(null);
    setStep('validating');
    setLoading(true);
    try {
      const result = await bulkEnrollmentService.validate(file, agentId);
      setPreviewResult(result);
      setStep('previewed');
    } catch (err) {
      setError(extractMessage(err, 'Could not validate this file.'));
      setStep('idle');
    } finally {
      setLoading(false);
    }
  }, [agentId, file]);

  const confirmImport = useCallback(async () => {
    // Only ever commit what was previewed (selectAgent/selectFile clear it).
    if (!agentId || !file || !previewResult) return;
    setError(null);
    setStep('importing');
    setLoading(true);
    try {
      const result = await bulkEnrollmentService.commit(file, agentId);
      setImportResult(result);
      setStep('completed');
    } catch (err) {
      setError(extractMessage(err, 'Import failed.'));
      // An unknown OUTCOME is not a failure we can offer to retry — the server
      // is still importing. Anything else (a 4xx, a rejected file) genuinely
      // did not write, so returning to the reviewed preview is safe there.
      //
      // This tested isTimeoutError, which only catches the BROWSER giving up.
      // nginx gives up first: proxy_read_timeout is 90s and a 5,000-row import
      // can outlast it, and a 504 IS a response — so `!err.response` was false,
      // this took the 'previewed' branch, and the admin was shown the Import
      // button again while the server was still writing the same file.
      setStep(isOutcomeUnknown(err) ? 'unknown' : 'previewed');
    } finally {
      setLoading(false);
    }
  }, [agentId, file, previewResult]);

  const downloadTemplate = useCallback(async () => {
    try {
      await bulkEnrollmentService.downloadTemplate();
    } catch (err) {
      setError(extractMessage(err, 'Could not download the template.'));
    }
  }, []);

  const downloadErrorReport = useCallback(async () => {
    if (!importResult?.importId) return;
    try {
      await bulkEnrollmentService.downloadErrorReport(
        importResult.importId,
        `bulk-enrollment-errors-${importResult.file.name.replace(/\.[^.]+$/, '')}.csv`
      );
    } catch (err) {
      setError(extractMessage(err, 'Could not download the error report.'));
    }
  }, [importResult]);

  return {
    step, agentId, setAgentId: selectAgent, file, setFile: selectFile,
    previewResult, importResult, loading, error, setError,
    validate, confirmImport, downloadTemplate, downloadErrorReport, reset,
  };
};

export default useBulkEnrollment;
