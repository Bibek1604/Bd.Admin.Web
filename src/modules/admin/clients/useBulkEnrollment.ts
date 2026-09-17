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
    if (!agentId || !file) return;
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
  }, [agentId, file]);

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
    step, agentId, setAgentId, file, setFile,
    previewResult, importResult, loading, error, setError,
    validate, confirmImport, downloadTemplate, downloadErrorReport, reset,
  };
};

export default useBulkEnrollment;
