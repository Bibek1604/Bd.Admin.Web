import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import agentsService from '../agents/agentsService';
import { useBulkEnrollment } from './useBulkEnrollment';
import { bulkEnrollmentService, type ImportHistoryEntry } from './bulkEnrollmentService';
import { Page, PageHeader } from '../../../components/ui/Page';
import { Button } from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { DataTable, type Column } from '../../../components/ui/DataTable';
import { ModalField, ModalSelect } from '../../../components/ui/AppModal';
import { UploadCloud, Download, RotateCcw, Users } from 'lucide-react';

// GET /api/admin/agents returns { first_name, last_name, username, ... }
// (see serializeAgent in admin.routes.ts) — there is no full_name/agent_code
// on the response. agentsService's `Agent` type already reflects this
// correctly; kept loosely typed here only to match the existing convention
// in CreateNotificationModal.tsx, the other place this same list is used.
interface PreviewOrIssueRow {
  rowNumber: number;
  status: string;
  identifier: string;
  errors?: Array<{ field: string | null; message: string }>;
}

const STATUS_TONE: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  created: 'success',
  invalid: 'error', failed: 'error',
};

const StatCard: React.FC<{ label: string; value: number; tone?: 'success' | 'error' | 'warning' | 'default' }> = ({ label, value, tone = 'default' }) => {
  const toneClass: Record<string, string> = {
    default: 'text-slate-900', success: 'text-brand-700', error: 'text-rose-700', warning: 'text-amber-700',
  };
  return (
    <div className="panel p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass[tone]}`}>{value}</div>
    </div>
  );
};

const BulkEnrollmentPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [searchParams] = useSearchParams();

  const {
    step, agentId, setAgentId, setFile,
    previewResult, importResult, loading, error,
    validate, confirmImport, downloadTemplate, downloadErrorReport, reset,
  } = useBulkEnrollment();

  // Arriving from the Agents page ("Bulk upload clients" on a row) preselects
  // that agent, so the admin lands here with the agent already chosen rather
  // than having to find the same person again in the dropdown.
  useEffect(() => {
    const preselected = searchParams.get('agentId');
    if (preselected) setAgentId(preselected);
  }, [searchParams, setAgentId]);

  const loadHistory = useCallback(() => {
    setHistoryLoading(true);
    bulkEnrollmentService.getHistory({ limit: 5 })
      .then((page) => setHistory(page.results))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    agentsService.getAgents().then(setAgents).catch(() => {}).finally(() => setAgentsLoading(false));
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    // Refresh the audit trail right after a commit — and after a TIMED-OUT one
    // too, because that is exactly when the admin needs to see whether an import
    // record was written before deciding what to do next.
    if (step === 'completed' || step === 'unknown') loadHistory();
  }, [step, loadHistory]);

  // 'unknown' locks the form too: after a timed-out commit the server may still
  // be writing, so nothing here should be re-submittable.
  const locked = step === 'validating' || step === 'importing' || step === 'completed' || step === 'unknown';
  const activeResult = step === 'completed' ? importResult : previewResult;
  // Every row is exactly one of created / invalid (validation failed, never
  // attempted) / failed (attempted, write error) — so the count never
  // carried in `totals` (invalid) is just what's left over.
  const invalidCount = activeResult ? activeResult.totals.total - activeResult.totals.successful - activeResult.totals.failed : 0;

  const previewColumns: Column<PreviewOrIssueRow>[] = [
    { header: 'Row', cell: (r) => r.rowNumber },
    { header: 'Client', cell: (r) => r.identifier },
    { header: 'Status', cell: (r) => <Badge variant={STATUS_TONE[r.status] || 'default'}>{r.status}</Badge> },
  ];

  const issueColumns: Column<PreviewOrIssueRow>[] = [
    { header: 'Row', cell: (r) => r.rowNumber },
    { header: 'Client', cell: (r) => r.identifier },
    { header: 'Status', cell: (r) => <Badge variant={STATUS_TONE[r.status] || 'default'}>{r.status}</Badge> },
    { header: 'Reason', cell: (r) => (r.errors || []).map((e) => e.message).join('; ') || '—' },
  ];

  const historyColumns: Column<ImportHistoryEntry>[] = [
    { header: 'Date', cell: (r) => new Date(r.created_at).toLocaleString() },
    { header: 'Agent', cell: (r) => r.agent_name },
    { header: 'File', cell: (r) => r.file_name },
    { header: 'Created', cell: (r) => r.totals?.created ?? 0 },
    { header: 'Failed', cell: (r) => r.totals?.failed ?? 0 },
    {
      header: 'Status',
      // A PARTIAL run with "Failed: 0" is a real outcome, not a contradiction:
      // the rows were written but the import could not confirm they are linked
      // to the chosen agent. Carry the reason on the badge, or the history row
      // says something is wrong without saying what.
      cell: (r) => (
        <span title={(r.warnings || []).join(' ') || undefined}>
          <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>{r.status}</Badge>
        </span>
      ),
    },
  ];

  return (
    <Page>
      <PageHeader
        title="Bulk Client Enrollment"
        description="Upload an XLSX or CSV file to enroll many clients at once, all assigned to one agent."
      />

      <div className="panel space-y-4 p-5">
        <ModalField label="Select Agent" required>
          <ModalSelect
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            disabled={locked}
            aria-label="Select agent"
          >
            <option value="">{agentsLoading ? 'Loading agents…' : 'Choose an agent'}</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.first_name} {a.last_name} (@{a.username})
              </option>
            ))}
          </ModalSelect>
        </ModalField>

        <ModalField label="Upload File (.xlsx, .xls or .csv)" required>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            disabled={locked}
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-[11px] file:font-bold file:text-slate-700 transition-all hover:file:bg-slate-200"
          />
        </ModalField>

        <p className="max-w-full break-words text-xs text-slate-500">
          Every row in the file enrolls a new client under the selected agent. Required columns
          are marked <strong>*</strong> in the template — a row missing one is reported as
          Invalid and is not imported, never completed with placeholder data. Duplicates
          (matching email, phone or policy number) are not checked, so re-uploading the same
          file will create the clients again.
        </p>

        {/* A timed-out COMMIT is shown on its own, in amber not red, because it
            is not a failure — it is an unknown outcome, and the required action
            is to go and look rather than to try again. */}
        {step === 'unknown' ? (
          <div className="rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800">
            <strong>The import may still be running.</strong> The server did not answer in time,
            but it does not stop working when the browser stops waiting — some or all of these
            clients may already have been created.
            <br />
            <strong>Do not upload this file again.</strong> Check Recent Imports below and the
            agent&rsquo;s client list first. Re-importing would create every client a second time.
          </div>
        ) : error ? (
          <div className="rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={validate} isLoading={step === 'validating'} disabled={locked && step !== 'validating'}>
            <UploadCloud size={16} /> Validate File
          </Button>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download size={16} /> Download Template
          </Button>
          {(step === 'completed' || step === 'unknown') && (
            <Button variant="outline" onClick={reset}>
              <RotateCcw size={16} /> Start New Import
            </Button>
          )}
        </div>
      </div>

      {activeResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total Rows" value={activeResult.totals.total} />
            <StatCard label={step === 'completed' ? 'Created' : 'Will Create'} value={activeResult.totals.created} tone="success" />
            <StatCard label={step === 'completed' ? 'Failed' : 'Invalid'} value={step === 'completed' ? activeResult.totals.failed : invalidCount} tone="error" />
          </div>

          {/*
            Whole-import warnings, above the per-row table: the rows were
            written, so the counters read as a success, but something about the
            import as a whole needs saying — today that the written clients
            could not be confirmed as linked to the selected agent. Rendered as
            an alert rather than in the muted "ignored columns" note, because
            this one means the admin has to go and check.
          */}
          {activeResult.warnings && activeResult.warnings.length > 0 && (
            <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {activeResult.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          {(activeResult.unmapped_columns.length > 0 || activeResult.agent_column_ignored) && (
            <div className="space-y-1 text-xs text-slate-500">
              {activeResult.agent_column_ignored && (
                <p>An "Agent" column was found in the file and ignored — every row is assigned to <strong>{activeResult.agent.name}</strong>, the agent selected above.</p>
              )}
              {activeResult.unmapped_columns.length > 0 && (
                <p>Columns not recognized and ignored: {activeResult.unmapped_columns.join(', ')}</p>
              )}
            </div>
          )}

          {step === 'previewed' && previewResult?.preview_rows && previewResult.preview_rows.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-900">
                Preview (first {previewResult.preview_rows.length} rows)
              </h3>
              <DataTable columns={previewColumns} rows={previewResult.preview_rows} rowKey={(r) => String(r.rowNumber)} />
            </div>
          )}

          {activeResult.issues.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-900">
                Rows needing attention {activeResult.issues_truncated ? `(showing first ${activeResult.issues.length})` : `(${activeResult.issues.length})`}
              </h3>
              <DataTable columns={issueColumns} rows={activeResult.issues} rowKey={(r) => String(r.rowNumber)} />
            </div>
          )}

          {step === 'previewed' && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={confirmImport}
                isLoading={loading}
                disabled={activeResult.totals.successful === 0}
              >
                Import Clients
              </Button>
              <span className="text-xs text-slate-500">
                This will create {activeResult.totals.created} client(s) under {activeResult.agent.name}.
              </span>
            </div>
          )}

          {step === 'completed' && (
            <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="text-sm text-slate-700">
                <strong>Bulk Enrollment Completed</strong> — Agent: {activeResult.agent.name} · File: {activeResult.file.name}
              </div>
              {activeResult.issues.length > 0 && (
                <Button variant="outline" onClick={downloadErrorReport}>
                  <Download size={16} /> Download Error Report
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-900">
          <Users size={15} /> Recent Imports
        </h2>
        {historyLoading ? (
          <div className="panel p-6 text-sm text-slate-500">Loading…</div>
        ) : history.length === 0 ? (
          <div className="panel p-6 text-sm text-slate-500">No bulk enrollments yet.</div>
        ) : (
          <DataTable columns={historyColumns} rows={history} rowKey={(r) => r.id} />
        )}
      </div>
    </Page>
  );
};

export default BulkEnrollmentPage;
