import React, { useState, useEffect } from 'react';
import { User as UserIcon, Calendar, Mail, Shield, Activity, Clock, Phone } from 'lucide-react';
import { usersService } from './usersService';
import type { User } from './usersService';
import AppModal, { DetailGroup, DetailRow } from '../../../components/ui/AppModal';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const data = await usersService.getById(userId);
          setUser(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, userId]);

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : '';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile Details"
      mode="details"
      maxWidth="max-w-md"
    >
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium">Loading profile details...</div>
      ) : user ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl font-bold shadow-sm">
              {fullName.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">{fullName}</h3>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">System ID: #{user.id}</p>
            </div>
          </div>

          <DetailGroup title="Identity & Contact">
            <DetailRow
              label="Username"
              value={`@${user.username}`}
              icon={<UserIcon size={16} />}
            />
            <DetailRow
              label="Email Address"
              value={user.email}
              icon={<Mail size={16} />}
            />
            <DetailRow
              label="Phone Number"
              value={user.phone_number || 'Not provided'}
              icon={<Phone size={16} />}
            />
          </DetailGroup>

          <DetailGroup title="System Access">
            <div className="grid grid-cols-2 gap-4">
              <DetailRow
                label="Role / Type"
                value={
                  <span className="text-brand-600 font-bold">{user.role}</span>
                }
                icon={<Shield size={16} />}
              />
              <DetailRow
                label="Current Status"
                value={
                  <span className={user.is_active ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                }
                icon={<Activity size={16} />}
              />
            </div>
          </DetailGroup>

          <DetailGroup title="Chronology">
            <DetailRow
              label="Account Created"
              value="N/A"
              icon={<Calendar size={16} />}
            />
            <DetailRow
              label="Last Activity"
              value="N/A (Tracking Disabled)"
              icon={<Clock size={16} />}
            />
          </DetailGroup>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 font-medium">No data found for this user.</div>
      )}
    </AppModal>
  );
};

export default UserDetailsModal;
