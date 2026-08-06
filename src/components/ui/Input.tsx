import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<string, string> = {
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-12 text-base px-4',
};

const Input: React.FC<InputProps> = ({ size = 'md', className, ...props }) => {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-surface-200 bg-surface-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white outline-none transition-all',
        sizeMap[size],
        className
      )}
    />
  );
};

export default Input;
