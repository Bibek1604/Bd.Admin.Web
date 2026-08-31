import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Drop the default padding when the card wraps its own layout. */
  flush?: boolean;
}

const Card: React.FC<CardProps> = ({ flush, className, children, ...props }) => (
  <div {...props} className={cn('panel', flush ? '' : 'p-5', className)}>
    {children}
  </div>
);

export default Card;
