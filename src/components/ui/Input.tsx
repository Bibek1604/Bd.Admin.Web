import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, string> = {
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-10 px-3 text-sm',
  lg: 'h-11 px-3.5 text-sm',
};

const Input: React.FC<InputProps> = ({ size = 'md', className, ...props }) => (
  <input
    {...props}
    className={cn(
      'w-full rounded-[var(--radius-control)] border border-surface-200 bg-surface-50 text-slate-800 outline-none transition-colors',
      'placeholder:text-slate-400 focus:border-brand-500 focus:bg-white',
      'disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-slate-400',
      sizeMap[size],
      className,
    )}
  />
);

export default Input;
