import React, { useEffect, useState } from 'react';
import { brandImageUrl, useBrandingStore } from '../store/brandingStore';

interface BrandLogoProps {
  className?: string;
}

const DEFAULT_LOGO = '/logo.png';

/**
 * The admin panel's logo: the one uploaded on the Website page (Branding ->
 * Admin panel logo), or the built-in image when none has been uploaded or the
 * uploaded one fails to load.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-12 w-auto' }) => {
  const branding = useBrandingStore((s) => s.branding);
  const load = useBrandingStore((s) => s.load);
  const [failed, setFailed] = useState(false);

  useEffect(() => { load(); }, [load]);

  const custom = brandImageUrl(branding?.admin_logo_url);
  useEffect(() => { setFailed(false); }, [custom]);

  const src = custom && !failed ? custom : DEFAULT_LOGO;
  const name = branding?.site_name || 'BeemaDiary';

  return <img src={src} alt={`${name} logo`} className={className} onError={() => setFailed(true)} />;
};
