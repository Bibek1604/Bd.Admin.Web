import React, { useState } from 'react';
import { useAuditLogs } from './useAuditLogs';
import AuditLogTable, { TableSkeleton } from './AuditLogTable';
import AuditLogDetailsModal from './AuditLogDetailsModal';
import { type AuditLog } from './auditLogsService';
import { Search, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { logs, loading, error, refetch } = useAuditLogs(searchTerm);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-20 bg-error-light rounded-2xl border border-error/30">
        <XCircle size={64} color="#ef4444" className="mb-4" />
        <h3 className="text-xl font-bold text-error">Error Loading Audit Registry</h3>
        <p className="text-sm text-error-dark my-4">{error}</p>
        <Button variant="primary" onClick={refetch}><RefreshCw size={16} className="mr-2" />Re-fetch Logs</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in px-8 py-8">
      <header className="flex flex-wrap justify-between items-start gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[13px] text-success font-semibold uppercase tracking-wider"><ShieldCheck size={16} /> Security Intelligence</div>
          <h2 className="text-2xl font-extrabold text-slate-900">Administrative Activity Log</h2>
          <p className="text-sm text-slate-500">Complete immutable history of all system configuration and user management actions.</p>
        </div>

        <div className="max-w-md w-full">
          <div className="relative bg-white border border-surface-100 rounded-lg px-4 py-2 flex items-center">
            <Search size={18} className="text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search activity, users, or system events..."
              className="w-full border-none outline-none text-sm font-medium text-slate-800"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <TableSkeleton />
      ) : logs.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-surface-100">
          <div className="text-4xl mb-4 opacity-30">📄</div>
          <h3 className="text-lg font-bold text-slate-900">No Logs Recorded</h3>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">We couldn't find any audit logs matching your current search parameters.</p>
          {searchTerm && <Button variant="ghost" className="mt-4" onClick={clearSearch}>Clear Search</Button>}
        </div>
      ) : (
        <>
          <AuditLogTable logs={paginatedLogs} onRowClick={handleRowClick} />
          
          <footer className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-500">
              Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> - <b>{Math.min(currentPage * itemsPerPage, logs.length)}</b> of <b>{logs.length}</b> events
            </div>

            <div className="flex items-center gap-4">
              <button
                className={`px-4 py-2 rounded-lg border border-surface-100 text-sm font-bold ${currentPage === 1 ? 'text-slate-400 bg-surface-50' : 'text-success'}`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>

              <div className="px-3 py-1 rounded-lg bg-surface-50 border border-surface-100 text-sm font-bold">Page {currentPage} of {totalPages}</div>

              <button
                className={`px-4 py-2 rounded-lg border border-surface-100 text-sm font-bold ${currentPage === totalPages ? 'text-slate-400 bg-surface-50' : 'text-success'}`}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </footer>
        </>
      )}

      <AuditLogDetailsModal 
        isOpen={!!selectedLog} 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />

      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalSlideUp { from { transform: translateY(30px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
          .audit-row-hover:hover { background: #f8fafc !important; }
        `}
      </style>
    </div>
  );
};

export default AuditLogsPage;
