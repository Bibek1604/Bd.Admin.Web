import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import PremiumCalculator from '../../components/PremiumCalculator';
import type { CalculatorPlan, CalculatorTransport, RateVersion } from '../../components/PremiumCalculator';

const transport: CalculatorTransport = {
  catalog: async () => (await api.get('/api/calculator/plans')).data.data,
  calculate: async input => (await api.post('/api/calculator/quotes', input)).data.data,
  history: async () => (await api.get('/api/calculator/quotes')).data.data,
};
interface AdminCatalog { versions: RateVersion[]; baseRates: Record<string, Record<string, number>>; plans: CalculatorPlan[] }
function RateTableEditor({ rows, sheet, version, changes, onChange, onError }: {
  rows: [string, number][]; sheet: string; version?: RateVersion; changes: string;
  onChange: (value: string) => void; onError: (message: string) => void;
}) {
  let draft: Record<string, Record<string, number>> = {};
  try { draft = JSON.parse(changes); } catch { /* The advanced import displays its validation error on save. */ }
  const edit = (cell: string, raw: string) => {
    try {
      const parsed = JSON.parse(changes);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Fix the imported rate changes before editing a rate.');
      parsed[sheet] = { ...parsed[sheet] };
      if (raw === '') delete parsed[sheet][cell];
      else {
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 0 || value > 100000) throw new Error('Enter a rate from 0 to 100,000.');
        parsed[sheet][cell] = value;
      }
      onChange(JSON.stringify(parsed, null, 2));
    } catch (e) { onError(e instanceof Error ? e.message : 'Fix the imported rate changes before editing a rate.'); }
  };
  return <div className="mt-3 max-h-72 overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th className="py-2 pr-3">Workbook cell</th><th className="pr-3">Workbook rate</th><th className="pr-3">Selected version</th><th>New version rate</th></tr></thead><tbody>{rows.map(([cell,value]) => <tr key={cell} className="border-t border-slate-100"><td className="py-2 pr-3">{cell}</td><td className="pr-3">{value}</td><td className="pr-3">{version?.rates?.[sheet]?.[cell] ?? version?.overrides?.[sheet]?.[cell] ?? value}</td><td className="py-1"><input aria-label={`New rate ${sheet}!${cell}`} type="number" min="0" max="100000" step="any" className="w-28 rounded-lg border border-slate-300 px-2 py-1" value={draft?.[sheet]?.[cell] ?? value} onChange={e => edit(cell,e.target.value)} /></td></tr>)}</tbody></table></div>;
}
export default function PremiumCalculatorPage() {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [companyId, setCompanyId] = useState('');
  useEffect(() => {
    api.get('/api/admin/companies').then(response => {
      const data = response.data?.data;
      const rows = Array.isArray(data) ? data : data?.companies || data?.items || [];
      setCompanies(rows.map((row: { id: string; name?: string; company_name?: string }) => ({ id: row.id, name: row.name || row.company_name || row.id })));
    }).catch(() => setError('Unable to load insurers. Refresh before verifying a rate version.'));
  }, []);
  const [tab, setTab] = useState('calculator'), [catalog, setCatalog] = useState<AdminCatalog | null>(null);
  const [error, setError] = useState(''), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [label, setLabel] = useState(''), [source, setSource] = useState(''), [status, setStatus] = useState('REFERENCE');
  const [effectiveFrom, setEffectiveFrom] = useState(''), [effectiveTo, setEffectiveTo] = useState(''), [note, setNote] = useState('');
  const [changes, setChanges] = useState('{}'), [selectedVersion, setSelectedVersion] = useState('lic-workbook-2021-09-01');
  const [sheet, setSheet] = useState('333 Endow'), [search, setSearch] = useState(''), [reviewed, setReviewed] = useState(false);
  const load = async () => {
    try { setCatalog((await api.get('/api/admin/calculator/rates')).data.data); }
    catch (e) { setError((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Unable to load rate versions.'); }
  };
  useEffect(() => { void load(); }, []);
  const selectVersion = (id: string) => {
    setSelectedVersion(id); const version = catalog?.versions.find(v => v.id === id);
    setChanges(JSON.stringify(version?.rates || version?.overrides || {}, null, 2)); setReviewed(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (status === 'VERIFIED' && !reviewed) { setError('Confirm that the rates and all supported plan rules were reviewed.'); return; }
    setBusy(true);
    try {
      let overrides;
      try { overrides = JSON.parse(changes); } catch { throw new Error('Rate changes must be valid JSON.'); }
      await api.post('/api/admin/calculator/rates', { label, source, status, company_id: companyId || null, effectiveFrom: effectiveFrom || null, effectiveTo: effectiveTo || null, verificationNote: note, overrides });
      setMessage('Rate version saved. Existing versions and quotes are unchanged.'); setLabel(''); setReviewed(false); await load();
    } catch (e) { const err = e as { response?: { data?: { message?: string } }; message?: string }; setError(err.response?.data?.message || err.message || 'Unable to save the rate version.'); }
    finally { setBusy(false); }
  };
  const download = () => {
    if (!catalog) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'LIC-rate-catalog.json'; a.click(); URL.revokeObjectURL(url);
  };
  const retireVersion = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      await api.post(`/api/admin/calculator/rates/${encodeURIComponent(selectedVersion)}/retire`);
      setMessage('Version retired. Its rates and historical quotes are retained; new quotes and enrollments cannot use it.');
      await load();
    } catch (e) { setError((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Unable to retire this version.'); }
    finally { setBusy(false); }
  };
  const version = catalog?.versions.find(v => v.id === selectedVersion);
  const rows = Object.entries(catalog?.baseRates[sheet] || {}).filter(([cell]) => cell.toLowerCase().includes(search.toLowerCase())).slice(0, 150);
  const fieldClass = 'mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5';
  return <div className="pb-8">
    <nav className="flex gap-2 px-4 pt-4 sm:px-6" aria-label="Calculator sections">{[['calculator','Quote calculator'],['rates','Rate versions and rules']].map(([key,title]) => <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === key ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'}`}>{title}</button>)}</nav>
    {tab === 'calculator' ? <PremiumCalculator transport={transport} /> : <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div><h1 className="text-2xl font-bold">Premium rate versions</h1><p className="mt-2 text-slate-600">Review historical rates, create new versions, and record their source and effective dates.</p></div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}{message && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-800">{message}</p>}
      {!catalog ? <p>Loading rate catalog…</p> : <>
        {selectedVersion !== 'lic-workbook-2021-09-01' && catalog.versions.find(v => v.id === selectedVersion)?.status !== 'RETIRED' && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm text-amber-900">Retire this version to stop new quotes and enrollments using it. Historical rates and quotes will remain available.</p><button type="button" disabled={busy} onClick={retireVersion} className="mt-2 rounded-lg border border-amber-400 px-3 py-2 text-sm font-medium disabled:opacity-50">Retire selected version</button></div>}
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Review an existing version</h2><label className="mt-3 block text-sm">Version<select className={fieldClass} value={selectedVersion} onChange={e => selectVersion(e.target.value)}>{catalog.versions.map(v => <option value={v.id} key={v.id}>{v.label} ({v.status})</option>)}</select></label><p className="mt-3 break-words text-sm">Source: {version?.source}</p><p className="mt-1 text-sm">Effective: {version?.effectiveFrom || 'Not established'} {version?.effectiveTo ? `to ${version.effectiveTo}` : ''}</p><p className="mt-2 text-sm text-slate-600">{version?.verificationNote}</p><button type="button" className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm" onClick={download}>Download rate catalog and rules</button></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Rate table cells</h2><p className="mt-1 text-sm text-slate-600">Workbook addresses identify editable premium and rider rates. Edit the new-version rate directly in the table. Formula cells, ages, term headings, and input cells cannot be changed here.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">Sheet<select className={fieldClass} value={sheet} onChange={e => setSheet(e.target.value)}>{Object.keys(catalog.baseRates).map(s => <option key={s}>{s}</option>)}</select></label><label className="text-sm">Find cell<input className={fieldClass} value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. AK12" /></label></div><RateTableEditor rows={rows} sheet={sheet} version={version} changes={changes} onChange={value => { setChanges(value); setReviewed(false); setError(''); }} onError={setError} /><p className="mt-2 text-xs text-slate-500">Showing up to 150 matching cells. Download the catalog to review all rates.</p></section>
        <form onSubmit={save} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Create a new immutable version</h2><label className="block text-sm">Insurer<select required={status === 'VERIFIED'} className={fieldClass} value={companyId} onChange={event => { setCompanyId(event.target.value); setReviewed(false); }}><option value="">Select insurer</option>{companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label><p className="text-sm text-slate-600">Rates start from the workbook. Changes below contain all overrides for the new version, including overrides copied from the selected version. Plan formulas and eligibility rules are maintained in backend code.</p><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Version label<input required minLength={3} maxLength={100} className={fieldClass} value={label} onChange={e => setLabel(e.target.value)} /></label><label className="text-sm">Source document or URL<input required minLength={5} maxLength={500} className={fieldClass} value={source} onChange={e => setSource(e.target.value)} /></label><label className="text-sm">Status<select className={fieldClass} value={status} onChange={e => { setStatus(e.target.value); setReviewed(false); }}><option value="REFERENCE">Reference (estimates only)</option><option value="VERIFIED">Verified (eligible for enrollment)</option></select></label><label className="text-sm">Effective from (AD)<input type="date" required={status === 'VERIFIED'} className={fieldClass} value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} /></label><label className="text-sm">Effective to (AD, optional)<input type="date" min={effectiveFrom} className={fieldClass} value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} /></label></div><label className="block text-sm">Review note<textarea className={fieldClass} required={status === 'VERIFIED'} minLength={status === 'VERIFIED' ? 20 : undefined} maxLength={2000} rows={3} value={note} onChange={e => { setNote(e.target.value); setReviewed(false); }} placeholder="Describe the source and confirmation of rates, eligibility, riders, discounts, and rounding." /></label><details className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer text-sm font-medium">Advanced: import rate changes</summary><label className="mt-3 block text-sm">Rate changes (JSON)<textarea className={`${fieldClass} font-mono text-xs`} rows={9} value={changes} onChange={e => { setChanges(e.target.value); setReviewed(false); }} spellCheck={false} /></label><p className="text-xs text-slate-500">Example: {'{"333 Endow":{"AK12":36.2}}'}. Only the numeric rate cells listed above are accepted.</p></details>{status === 'VERIFIED' && <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={reviewed} onChange={e => setReviewed(e.target.checked)} className="mt-1" />I have verified rates and all supported plan rules against the stated source, including age conventions, discounts, riders, terms, and rounding.</label>}<button disabled={busy} className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50">{busy ? 'Saving…' : 'Create rate version'}</button></form>
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Plan eligibility and implementation notes</h2><div className="mt-3 space-y-3">{catalog.plans.map(p => <details key={p.code} className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer font-medium">{p.name} ({p.code})</summary><ul className="mt-3 list-inside list-disc space-y-1 text-sm">{p.fields.map(f => <li key={f.key}>{f.label}: {f.options ? f.options.join(', ') : `${f.min}–${f.max}; increment ${f.step}`}</li>)}{p.notes.map(n => <li key={n}>{n}</li>)}</ul>{p.checks.map(c => <p key={c.cell} className="mt-2 break-all font-mono text-xs text-slate-500">{c.cell}: {c.formula}</p>)}</details>)}</div></section>
      </>}
    </div>}
  </div>;
}
