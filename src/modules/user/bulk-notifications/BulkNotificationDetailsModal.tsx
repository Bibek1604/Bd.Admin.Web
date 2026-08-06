import React from 'react';
import { type BulkNotification } from './bulkNotificationsService';
import AppModal, { DetailGroup, DetailRow } from '../../../components/ui/AppModal';
import { Bell, Calendar, UserCheck, Activity } from 'lucide-react';

interface BulkNotificationDetailsModalProps {
  notification: BulkNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

const BulkNotificationDetailsModal: React.FC<BulkNotificationDetailsModalProps> = ({ notification, isOpen, onClose }) => {
  if (!notification) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Details"
      mode="details"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div>
          <div className="flex gap-2 mb-3">
             <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 text-[10px] font-bold uppercase tracking-widest border border-sky-100">
               Audience: {notification.target_audience}
             </span>
             <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
               notification.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
             }`}>
               {notification.status}
             </span>
          </div>
          <h3 className="text-2xl font-black text-slate-800 leading-tight">{notification.title}</h3>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed shadow-inner">
          {notification.content}
        </div>

        <DetailGroup title="Delivery Timeline">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <DetailRow
              label="Created"
              value={new Date(notification.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              icon={<Calendar size={16} />}
            />
            {notification.sent_at && (
              <DetailRow
                label="Dispatched"
                value={new Date(notification.sent_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                icon={<Activity size={16} />}
              />
            )}
            {notification.scheduled_time && (
              <DetailRow
                label="Scheduled"
                value={new Date(notification.scheduled_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                icon={<Calendar size={16} />}
              />
            )}
          </div>
        </DetailGroup>

        <DetailGroup title="Audience Reach">
          <DetailRow
            label="Target Method"
            value={notification.target_audience === 'ALL' ? 'Total Userbase Broadcast' : `Segment: ${notification.target_audience}`}
            icon={<UserCheck size={16} />}
          />
          {notification.selected_users && notification.selected_users.length > 0 && (
            <DetailRow
              label="Recipient Count"
              value={`${notification.selected_users.length} Users`}
              icon={<Bell size={16} />}
            />
          )}
        </DetailGroup>
      </div>
    </AppModal>
  );
};

export default BulkNotificationDetailsModal;
