import React from 'react';
import { type BulkNotification } from './bulkNotificationsService';
import AppModal, { DetailGroup, DetailRow } from '../../../components/ui/AppModal';
import Badge from '../../../components/ui/Badge';

interface BulkNotificationDetailsModalProps {
  notification: BulkNotification | null;
  isOpen: boolean;
  onClose: () => void;
}

const BulkNotificationDetailsModal: React.FC<BulkNotificationDetailsModalProps> = ({ notification, isOpen, onClose }) => {
  if (!notification) return null;

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Notification" mode="details" maxWidth="max-w-xl">
      <div className="space-y-5 pt-1">
        <div>
          <Badge variant={notification.target_type === 'SINGLE' ? 'info' : 'default'}>
            {notification.target_type === 'SINGLE'
              ? notification.target_agent?.full_name || 'Single agent'
              : 'All agents'}
          </Badge>
          <h3 className="mt-3 text-lg font-medium leading-snug text-slate-900">{notification.title}</h3>
        </div>

        <p className="whitespace-pre-wrap rounded-[var(--radius-panel)] border border-surface-200 bg-surface-50 p-4 text-sm leading-relaxed text-slate-700">
          {notification.content}
        </p>

        <DetailGroup title="Details">
          <DetailRow
            label="Sent"
            value={new Date(notification.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          />
          <DetailRow label="Sent by" value={notification.creator?.username} />
          {notification.target_type === 'SINGLE' && (
            <DetailRow label="Recipient" value={notification.target_agent?.email} />
          )}
        </DetailGroup>
      </div>
    </AppModal>
  );
};

export default BulkNotificationDetailsModal;
