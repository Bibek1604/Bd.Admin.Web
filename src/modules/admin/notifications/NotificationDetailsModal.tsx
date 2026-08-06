import React from 'react';
import type { Notification } from './notificationsService';
import AppModal, { DetailGroup, DetailRow } from '../../../components/ui/AppModal';
import { Bell, Info, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationDetailsModal: React.FC<ModalProps> = ({ isOpen, onClose, notification }) => {
  if (!notification) return null;

  const typeIcons = {
    info: <Info size={16} className="text-blue-500" />,
    alert: <AlertTriangle size={16} className="text-rose-500" />,
    warning: <AlertTriangle size={16} className="text-amber-500" />,
    system: <Settings size={16} className="text-slate-500" />,
    success: <CheckCircle size={16} className="text-emerald-500" />
  };

  const icon = typeIcons[notification.type as keyof typeof typeIcons] || <Bell size={16} />;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Review"
      mode="details"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
              {notification.type || 'system'}
            </span>
            <span className={notification.status === 'READ' ? 'text-[10px] font-bold text-slate-400' : 'text-[10px] font-bold text-brand-600'}>
              {notification.status === 'READ' ? 'READ' : 'UNREAD'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight">{notification.title}</h3>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-600 text-[13.5px] leading-relaxed">
          "{notification.content}"
        </div>

        <DetailGroup title="Metadata">
          <DetailRow
            label="Notification Type"
            value={notification.type?.toUpperCase() || 'SYSTEM'}
            icon={icon}
          />
          <DetailRow
            label="Timestamp"
            value={new Date(notification.created_at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}
            icon={<Bell size={16} />}
          />
        </DetailGroup>
      </div>
    </AppModal>
  );
};

export default NotificationDetailsModal;
