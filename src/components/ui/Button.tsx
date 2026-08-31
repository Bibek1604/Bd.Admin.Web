import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Weight caps at 500: Poppins 600+ on a filled button reads as shouting.
const variants: Record<string, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-surface-100 text-slate-700 hover:bg-surface-200',
  outline: 'border border-surface-200 bg-white text-slate-700 hover:bg-surface-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-surface-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

const sizes: Record<string, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-[var(--radius-control)] font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
      'disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      sizes[size],
      className,
    )}
    disabled={isLoading || props.disabled}
    {...props}
  >
    {isLoading && (
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
);

export default Button;
