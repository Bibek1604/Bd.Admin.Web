import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'info' | 'warning';
}

const variantMap: Record<string, string> = {
  default: 'bg-surface-50 text-slate-700 border border-surface-100',
  success: 'bg-success-light text-success border border-success/20',
  error: 'bg-error-light text-error border border-error/20',
  info: 'bg-info-light text-info border border-info/20',
  warning: 'bg-warning-light text-warning border border-warning/20',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => {
  return (
    <span {...props} className={cn('inline-flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-md', variantMap[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;
