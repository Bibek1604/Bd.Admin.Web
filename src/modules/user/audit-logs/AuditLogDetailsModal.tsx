import React from 'react';
import { type AuditLog } from './auditLogsService';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  const formattedTimeFull = new Date(log.timestamp).toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Information`}>
      <div className="space-y-6">
        <div className="flex items-center gap-6 p-4 bg-surface-50 rounded-lg border border-surface-100">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-extrabold ${log.action.toLowerCase().includes('delete') ? 'text-rose-500' : 'text-indigo-500'} bg-white matte-shadow`}> 
            {log.action.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-extrabold text-slate-900">{log.action}</h3>
            <p className="text-sm text-slate-500">{formattedTimeFull}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold">Performed By</div>
            <div className="flex items-center gap-3 mt-2 text-sm font-semibold text-slate-700">
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold">{String(log.admin_user || 'A').charAt(0)}</div>
              <span>{log.admin_user || 'System Administrator'}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 uppercase font-bold">Origin IP</div>
            <p className="mt-2 text-sm font-semibold text-slate-700">{log.ip_address || '127.0.0.1'}</p>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-slate-400 uppercase font-bold">Detailed Description</div>
            <div className="mt-2 bg-white p-4 rounded-lg border border-surface-100 text-sm text-slate-600">
              {log.details || 'No extended metadata available for this event.'}
            </div>
          </div>

          {log.details && log.details.startsWith('{') && (
            <div className="md:col-span-2">
              <div className="text-xs text-slate-400 uppercase font-bold">System Metadata</div>
              <div className="mt-2 bg-slate-900 p-4 rounded-lg text-slate-100 overflow-auto max-h-48">
                <pre className="m-0 text-sm font-mono">{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close View</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuditLogDetailsModal;
