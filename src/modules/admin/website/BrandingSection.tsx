import React, { useRef, useState } from 'react';
import { ImageUp, RotateCcw } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { ModalField, ModalGrid, ModalInput } from '../../../components/ui/AppModal';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { brandImageUrl } from '../../../store/brandingStore';
import { websiteService, type Branding, type BrandingAsset } from './websiteService';

const MAX_BYTES = 2 * 1024 * 1024;

const ASSETS: Array<{ key: BrandingAsset; field: keyof Branding; label: string; help: string; fallback: string; box: string }> = [
  {
    key: 'logo',
    field: 'logo_url',
    label: 'Website and user panel logo',
    help: 'Shown on the public website, the login page and the agent panel. A wide PNG with a transparent background works best.',
    fallback: '/logo.png',
    box: 'h-16 w-40',
  },
  {
    key: 'admin_logo',
    field: 'admin_logo_url',
    label: 'Admin panel logo',
    help: 'Shown in this admin panel: the sidebar and the login page.',
    fallback: '/logo.png',
    box: 'h-16 w-40',
  },
  {
    key: 'favicon',
    field: 'favicon_url',
    label: 'Browser tab icon (favicon)',
    help: 'The small icon in the browser tab, for both the website and the admin panel. Use a square image, at least 64×64.',
    fallback: '/favicon.png',
    box: 'h-16 w-16',
  },
];

interface Props {
  branding: Branding;
  errors: Record<string, string>;
  onTextChange: (field: 'site_name' | 'tagline' | 'copyright_holder', value: string) => void;
  /** An image was uploaded or reset: it is already saved and live. */
  onImagesChanged: (branding: Branding) => void;
  onError: (message: string) => void;
}

/**
 * Brand name, tagline, copyright line, and the three brand images. The text is
 * saved with the page's "Save changes"; each image is uploaded and goes live
 * on its own, immediately.
 */
const BrandingSection: React.FC<Props> = ({ branding, errors, onTextChange, onImagesChanged, onError }) => {
  const confirm = useConfirm();
  const [busy, setBusy] = useState<BrandingAsset | null>(null);
  const inputs = useRef<Partial<Record<BrandingAsset, HTMLInputElement | null>>>({});

  const upload = async (asset: BrandingAsset, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return onError(`"${file.name}" is not an image. Use PNG, JPEG or WebP.`);
    if (file.size > MAX_BYTES) return onError(`"${file.name}" is larger than 2 MB. Please use a smaller image.`);
    setBusy(asset);
    try {
      onImagesChanged(await websiteService.uploadBrandingAsset(asset, file));
    } catch (err: any) {
      onError(err.errorMessage || err.message || 'The image could not be uploaded.');
    } finally {
      setBusy(null);
    }
  };

  const reset = async (asset: BrandingAsset, label: string) => {
    const ok = await confirm({
      title: 'Use the default image?',
      message: `The uploaded ${label.toLowerCase()} will be replaced by the one that comes with the app.`,
      confirmLabel: 'Use default',
      tone: 'danger',
    });
    if (!ok) return;
    setBusy(asset);
    try {
      onImagesChanged(await websiteService.resetBrandingAsset(asset));
    } catch (err: any) {
      onError(err.errorMessage || err.message || 'The image could not be reset.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <ModalGrid>
        <ModalField label="Brand name" required error={errors['branding.site_name']}>
          <ModalInput value={branding.site_name} maxLength={60} error={!!errors['branding.site_name']}
            onChange={(e) => onTextChange('site_name', e.target.value)} />
        </ModalField>
        <ModalField label="Copyright holder">
          <ModalInput value={branding.copyright_holder} maxLength={100} placeholder="Shown as © year Name. All rights reserved."
            onChange={(e) => onTextChange('copyright_holder', e.target.value)} />
        </ModalField>
        <ModalField label="Tagline" fullWidth>
          <ModalInput value={branding.tagline} maxLength={200} placeholder="Shown under the logo in the website footer"
            onChange={(e) => onTextChange('tagline', e.target.value)} />
        </ModalField>
      </ModalGrid>

      <div className="grid gap-4 md:grid-cols-3">
        {ASSETS.map((a) => {
          const url = branding[a.field] as string | null;
          const custom = brandImageUrl(url);
          return (
            <div key={a.key} className="flex flex-col rounded-[var(--radius-control)] border border-surface-200 p-4">
              <p className="text-sm font-medium text-slate-800">{a.label}</p>
              <p className="mt-1 flex-1 text-xs text-slate-500">{a.help}</p>
              <div
                className="mt-3 flex h-24 items-center justify-center rounded-[var(--radius-control)] border border-dashed border-surface-200"
                style={{ backgroundImage: 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%)', backgroundSize: '16px 16px' }}
              >
                <img
                  src={custom || a.fallback}
                  alt={`${a.label} preview`}
                  className={`${a.box} object-contain`}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = a.fallback; }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{custom ? 'Uploaded image' : 'Default image'}</p>
              <input
                ref={(el) => { inputs.current[a.key] = el; }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                aria-label={`Upload ${a.label}`}
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; upload(a.key, f); }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => inputs.current[a.key]?.click()}>
                  <ImageUp size={14} /> {busy === a.key ? 'Uploading…' : custom ? 'Replace' : 'Upload'}
                </Button>
                {custom && (
                  <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => reset(a.key, a.label)}>
                    <RotateCcw size={14} /> Use default
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Images go live as soon as they are uploaded. The brand name, tagline and copyright holder are saved with "Save changes".
      </p>
    </div>
  );
};

export default BrandingSection;
