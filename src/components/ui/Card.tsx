import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface';
}

const Card: React.FC<CardProps> = ({ variant = 'default', className, children, ...props }) => {
  return (
    <div {...props} className={cn('bg-white rounded-3xl border border-surface-100 p-6 matte-shadow', className)}>
      {children}
    </div>
  );
};

export default Card;
