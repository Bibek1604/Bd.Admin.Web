export const resolveImage = (img?: string | null): string => {
  if (!img) return '';
  const trimmed = img.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('blob:')) return trimmed;
  const base = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  if (!base) return trimmed;
  // Ensure img starts with /
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

export default resolveImage;
