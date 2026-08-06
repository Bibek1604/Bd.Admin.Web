import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-12 w-auto' }) => {
  return <img src="/logo.png" alt="Beema Diary logo" className={className} />;
};
