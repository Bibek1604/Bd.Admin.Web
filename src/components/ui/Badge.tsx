import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'info' | 'warning';
  /** Show a leading dot instead of relying on background colour alone. */
  dot?: boolean;
}

const variantMap: Record<string, string> = {
  default: 'bg-surface-100 text-slate-600',
  success: 'bg-brand-50 text-brand-700',
  error: 'bg-rose-50 text-rose-700',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
};

const dotMap: Record<string, string> = {
  default: 'bg-slate-400',
  success: 'bg-brand-500',
  error: 'bg-rose-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'default', dot, className, children, ...props }) => (
  <span
    {...props}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
      variantMap[variant],
      className,
    )}
  >
    {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotMap[variant])} />}
    {children}
  </span>
);

export default Badge;
