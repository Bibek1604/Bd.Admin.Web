import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Briefcase, HelpCircle, Palette, Phone, Plus, Save, Trash2, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { ErrorState, LoadingState, Page, PageHeader } from '../../../components/ui/Page';
import { ModalField, ModalGrid, ModalInput, ModalTextarea } from '../../../components/ui/AppModal';
import { websiteService, type Branding, type SiteContent, type SiteFaq, type SiteJob } from './websiteService';
import BrandingSection from './BrandingSection';
import { useBrandingStore } from '../../../store/brandingStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Exactly 10 digits; a leading +977 is accepted (same rule as the backend's parsePhone). */
const tenDigits = (raw: string) => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('977') && digits.length === 13) digits = digits.slice(3);
  return digits.length === 10;
};

type Errors = Record<string, string>;

/** Mirrors backend/src/validators/siteContent.validator.js, so the admin sees problems before saving. */
const validate = (c: SiteContent): Errors => {
  const e: Errors = {};
  if (!c.branding.site_name.trim()) e['branding.site_name'] = 'Brand name is required.';
  if (!c.contact.email.trim()) e['contact.email'] = 'Email is required.';
  else if (!EMAIL_RE.test(c.contact.email.trim())) e['contact.email'] = 'Enter a valid email address.';
  if (!c.contact.phone.trim()) e['contact.phone'] = 'Phone is required.';
  else if (!tenDigits(c.contact.phone)) e['contact.phone'] = 'Phone must be exactly 10 digits.';
  c.help_faqs.forEach((f, i) => {
    if (!f.question.trim()) e[`faq.${i}.question`] = 'Question is required.';
    if (!f.answer.trim()) e[`faq.${i}.answer`] = 'Answer is required.';
  });
  c.jobs.forEach((j, i) => {
    if (!j.title.trim()) e[`job.${i}.title`] = 'Title is required.';
  });
  return e;
};

const emptyJob = (): SiteJob => ({ title: '', location: '', type: 'Full-time', department: '', description: '', is_open: true });

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const Section: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  icon, title, description, action, children,
}) => (
  <section className="panel p-5 sm:p-6">
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

/**
 * The public Contact, Help Center and Careers pages read everything shown here.
 * One save writes all three sections together.
 */
const WebsitePage: React.FC = () => {
  const [saved, setSaved] = useState<SiteContent | null>(null);
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const setBrandingStore = useBrandingStore((s) => s.setBranding);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const content = await websiteService.getContent();
      setSaved(content);
      setDraft(content);
    } catch (err: any) {
      setLoadError(err.errorMessage || err.message || 'Could not load the website content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dirty = useMemo(() => {
    if (!saved || !draft) return false;
    const pick = (c: SiteContent) => JSON.stringify({
      contact: c.contact,
      help_faqs: c.help_faqs,
      jobs: c.jobs,
      brand: [c.branding.site_name, c.branding.tagline, c.branding.copyright_holder],
    });
    return pick(saved) !== pick(draft);
  }, [saved, draft]);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const update = (fn: (c: SiteContent) => SiteContent) => setDraft((prev) => (prev ? fn(prev) : prev));
  const setContact = (key: keyof SiteContent['contact'], value: string) =>
    update((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));
  const setBrandText = (key: 'site_name' | 'tagline' | 'copyright_holder', value: string) =>
    update((c) => ({ ...c, branding: { ...c.branding, [key]: value } }));
  /** Images are saved the moment they upload: fold the new URLs into both copies. */
  const applyImages = (branding: Branding) => {
    const urls = { logo_url: branding.logo_url, admin_logo_url: branding.admin_logo_url, favicon_url: branding.favicon_url };
    setSaved((prev) => (prev ? { ...prev, branding: { ...prev.branding, ...urls } } : prev));
    setDraft((prev) => (prev ? { ...prev, branding: { ...prev.branding, ...urls } } : prev));
    // Keep the live store's saved TEXT, not unsaved edits from the form.
    setBrandingStore({ ...(saved?.branding ?? branding), ...urls });
    setNotice({ kind: 'success', text: 'Image updated. It is live now.' });
  };
  const setFaq = (i: number, patch: Partial<SiteFaq>) =>
    update((c) => ({ ...c, help_faqs: c.help_faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }));
  const setJob = (i: number, patch: Partial<SiteJob>) =>
    update((c) => ({ ...c, jobs: c.jobs.map((j, idx) => (idx === i ? { ...j, ...patch } : j)) }));

  const handleSave = async () => {
    if (!draft) return;
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setNotice({ kind: 'error', text: 'Some fields need attention before saving.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const content = await websiteService.saveContent(draft);
      setSaved(content);
      setDraft(content);
      setBrandingStore(content.branding);
      setNotice({ kind: 'success', text: 'Website content saved. The public pages now show these changes.' });
    } catch (err: any) {
      const list = err?.response?.data?.errors;
      const detail = Array.isArray(list) && list.length ? ` ${list.map((e: any) => e?.message).filter(Boolean).join(' ')}` : '';
      setNotice({ kind: 'error', text: `${err.errorMessage || err.message || 'Could not save.'}${detail}` });
    } finally {
      setSaving(false);
    }
  };

  const err = (key: string) => errors[key];

  if (loadError) return <Page><ErrorState title="Couldn't load website content" message={loadError} onRetry={load} /></Page>;
  if (loading || !draft) return <Page><LoadingState label="Loading website content…" /></Page>;

  return (
    <Page>
      <PageHeader
        title="Website"
        description="Branding, contact details, Help Center FAQs and job openings shown on the website, the user panel and this admin panel."
        actions={
          <>
            {dirty && (
              <Button variant="outline" onClick={() => { setDraft(saved); setErrors({}); setNotice(null); }} disabled={saving}>
                Discard
              </Button>
            )}
            <Button onClick={handleSave} disabled={!dirty || saving}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />

      {notice && (
        <div
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`flex items-start justify-between gap-3 rounded-[var(--radius-control)] border px-4 py-3 text-sm ${
            notice.kind === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-brand-100 bg-brand-50 text-brand-700'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="opacity-70 hover:opacity-100"><X size={15} /></button>
        </div>
      )}

      <Section icon={<Palette size={17} />} title="Branding" description="Brand name, logos and the browser tab icon used across the website, the user panel and this admin panel.">
        <BrandingSection
          branding={draft.branding}
          errors={errors}
          onTextChange={setBrandText}
          onImagesChanged={applyImages}
          onError={(text) => setNotice({ kind: 'error', text })}
        />
      </Section>

      <Section icon={<Phone size={17} />} title="Contact details" description="Shown on the Contact and Help Center pages. Job applications on the Careers page go to this email.">
        <ModalGrid>
          <ModalField label="Email" required error={err('contact.email')}>
            <ModalInput type="email" value={draft.contact.email} maxLength={254} error={!!err('contact.email')}
              onChange={(e) => setContact('email', e.target.value)} />
          </ModalField>
          <ModalField label="Phone" required error={err('contact.phone')}>
            <ModalInput type="tel" inputMode="numeric" placeholder="98XXXXXXXX" value={draft.contact.phone} maxLength={15} error={!!err('contact.phone')}
              onChange={(e) => setContact('phone', e.target.value)} />
          </ModalField>
          <ModalField label="Office hours (optional)">
            <ModalInput value={draft.contact.hours} maxLength={100} placeholder="Leave blank to hide"
              onChange={(e) => setContact('hours', e.target.value)} />
          </ModalField>
          <ModalField label="Address (optional)">
            <ModalInput value={draft.contact.address} maxLength={255} placeholder="Leave blank to hide"
              onChange={(e) => setContact('address', e.target.value)} />
          </ModalField>
        </ModalGrid>
      </Section>

      <Section
        icon={<HelpCircle size={17} />}
        title="Help Center FAQs"
        description="Shown on the Help Center page, in this order."
        action={
          <Button variant="outline" size="sm" onClick={() => update((c) => ({ ...c, help_faqs: [...c.help_faqs, { question: '', answer: '' }] }))}>
            <Plus size={15} /> Add question
          </Button>
        }
      >
        {draft.help_faqs.length === 0 ? (
          <p className="text-sm text-slate-500">No questions. The Help Center will say none have been added yet.</p>
        ) : (
          <div className="space-y-4">
            {draft.help_faqs.map((faq, i) => (
              <div key={faq.id || `new-faq-${i}`} className="rounded-[var(--radius-control)] border border-surface-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Question {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Move question ${i + 1} up`} disabled={i === 0}
                      onClick={() => update((c) => ({ ...c, help_faqs: move(c.help_faqs, i, i - 1) }))}
                      className="rounded p-1.5 text-slate-400 hover:bg-surface-100 hover:text-slate-700 disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button type="button" aria-label={`Move question ${i + 1} down`} disabled={i === draft.help_faqs.length - 1}
                      onClick={() => update((c) => ({ ...c, help_faqs: move(c.help_faqs, i, i + 1) }))}
                      className="rounded p-1.5 text-slate-400 hover:bg-surface-100 hover:text-slate-700 disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button type="button" aria-label={`Remove question ${i + 1}`}
                      onClick={() => update((c) => ({ ...c, help_faqs: c.help_faqs.filter((_, idx) => idx !== i) }))}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="space-y-3">
                  <ModalField label="Question" required error={err(`faq.${i}.question`)}>
                    <ModalInput value={faq.question} maxLength={200} error={!!err(`faq.${i}.question`)}
                      onChange={(e) => setFaq(i, { question: e.target.value })} />
                  </ModalField>
                  <ModalField label="Answer" required error={err(`faq.${i}.answer`)}>
                    <ModalTextarea rows={3} value={faq.answer} maxLength={2000} error={!!err(`faq.${i}.answer`)}
                      onChange={(e) => setFaq(i, { answer: e.target.value })} />
                  </ModalField>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        icon={<Briefcase size={17} />}
        title="Careers: job openings"
        description="Open positions are listed on the Careers page. Untick “Open” to hide one without deleting it."
        action={
          <Button variant="outline" size="sm" onClick={() => update((c) => ({ ...c, jobs: [...c.jobs, emptyJob()] }))}>
            <Plus size={15} /> Add job opening
          </Button>
        }
      >
        {draft.jobs.length === 0 ? (
          <p className="text-sm text-slate-500">No job openings. The Careers page will say there are no open positions.</p>
        ) : (
          <div className="space-y-4">
            {draft.jobs.map((job, i) => (
              <div key={job.id || `new-job-${i}`} className="rounded-[var(--radius-control)] border border-surface-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={job.is_open} onChange={(e) => setJob(i, { is_open: e.target.checked })}
                      className="h-4 w-4 accent-[var(--color-brand-600,#16a34a)]" />
                    Open (shown on the Careers page)
                  </label>
                  <button type="button" aria-label={`Remove job opening ${i + 1}`}
                    onClick={() => update((c) => ({ ...c, jobs: c.jobs.filter((_, idx) => idx !== i) }))}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                </div>
                <ModalGrid>
                  <ModalField label="Job title" required error={err(`job.${i}.title`)}>
                    <ModalInput value={job.title} maxLength={100} error={!!err(`job.${i}.title`)}
                      onChange={(e) => setJob(i, { title: e.target.value })} />
                  </ModalField>
                  <ModalField label="Location">
                    <ModalInput value={job.location} maxLength={100} placeholder="e.g. Kathmandu"
                      onChange={(e) => setJob(i, { location: e.target.value })} />
                  </ModalField>
                  <ModalField label="Type">
                    <ModalInput value={job.type} maxLength={50} placeholder="e.g. Full-time"
                      onChange={(e) => setJob(i, { type: e.target.value })} />
                  </ModalField>
                  <ModalField label="Department">
                    <ModalInput value={job.department} maxLength={100}
                      onChange={(e) => setJob(i, { department: e.target.value })} />
                  </ModalField>
                  <ModalField label="Description" fullWidth>
                    <ModalTextarea rows={3} value={job.description} maxLength={2000}
                      onChange={(e) => setJob(i, { description: e.target.value })} />
                  </ModalField>
                </ModalGrid>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Page>
  );
};

export default WebsitePage;
