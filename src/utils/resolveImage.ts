export const resolveImage = (img?: string | null): string => {
  if (!img) return '';
  const trimmed = img.trim();
  if (!trimmed) return '';
  // data:/blob: are complete in-browser URLs (a picked file's preview);
  // prefixing the API base turned them into broken paths.
  if (/^(https?:\/\/|blob:|data:image\/)/i.test(trimmed)) return trimmed;
  const base = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (!base) return trimmed;
  // Ensure img starts with /
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export default resolveImage;
