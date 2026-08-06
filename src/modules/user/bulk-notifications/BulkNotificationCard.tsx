import React from 'react';
import { type BulkNotification } from './bulkNotificationsService';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

interface BulkNotificationCardProps {
  notification: BulkNotification;
  onClick: (id: number) => void;
}

const BulkNotificationCard: React.FC<BulkNotificationCardProps> = ({ notification, onClick }) => {
  const isCompleted = notification.status === 'COMPLETED';

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  return (
    <Card onClick={() => onClick(notification.id)} className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg p-6">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="info" className="uppercase text-xs font-black">{notification.target_audience}</Badge>
        <Badge variant={notification.status === 'COMPLETED' ? 'success' : notification.status === 'PROCESSING' ? 'warning' : 'default'} className="uppercase text-[11px] font-extrabold">
          {notification.status}
        </Badge>
      </div>

      <div className="flex flex-col">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">{notification.title}</h3>
        <p className="text-sm text-slate-500 mb-4 leading-relaxed">{truncate(notification.content, 120)}</p>

        <div className="mt-auto pt-4 border-t border-surface-100 flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Created</span>
            <span className="text-sm font-semibold text-slate-700">{new Date(notification.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
          {notification.scheduled_time && !isCompleted && (
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Scheduled</span>
              <span className="text-sm font-semibold text-slate-700">{new Date(notification.scheduled_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const BulkNotifSkeleton: React.FC = () => (
  <div className="h-60 bg-surface-50 rounded-2xl p-6 border border-surface-100 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="w-20 h-6 bg-surface-100 rounded-md" />
      <div className="w-16 h-6 bg-surface-100 rounded-md" />
    </div>
    <div className="w-3/4 h-4 bg-surface-100 rounded-md mb-3" />
    <div className="w-full h-3 bg-surface-100 rounded-md mb-2" />
    <div className="w-full h-3 bg-surface-100 rounded-md mb-2" />
    <div className="w-full h-8 bg-surface-100 rounded-md mt-4" />
  </div>
);

export default BulkNotificationCard;
