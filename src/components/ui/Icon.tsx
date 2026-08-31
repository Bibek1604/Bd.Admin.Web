import React, { isValidElement, cloneElement } from 'react';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  size?: number;
  className?: string;
  children: React.ReactElement<{ size?: number; className?: string }>;
}

const Icon: React.FC<IconProps> = ({ size = 16, className = 'text-slate-500', children }) => {
  if (!isValidElement(children)) return null;
  return cloneElement(children, {
    size,
    className: [className, children.props.className || ''].filter(Boolean).join(' '),
  });
};

export default Icon;
