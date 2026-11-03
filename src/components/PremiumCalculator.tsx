import { useEffect, useRef, useState } from 'react';

export interface CalculatorField { key: string; label: string; min: number; max: number; step: number; options?: number[] }
export interface CalculatorPlan {
  id?: string; engine?: 'WORKBOOK' | 'STANDARD'; category?: string; description?: string;
  rateSource?: { status: string; source: string; effectiveFrom: string | null; effectiveTo: string | null };
  code: string; name: string; sheet: string | null; fields: CalculatorField[]; defaults: Record<string, number>;
  frequencies: string[]; supportsWaiver: boolean; supportsAccident: boolean; supportsAdvance: boolean;
  notes: string[]; checks: { cell: string; formula: string }[];
}
export interface RateVersion {
  company_id?: string | null;
  id: string; label: string; status: string; source: string; effectiveFrom: string | null; effectiveTo: string | null;
  verificationNote?: string; overrides?: Record<string, Record<string, number>>;
  rates?: Record<string, Record<string, number>>;
}
export interface PremiumQuote {
  id: string; planCode: string; planName: string; premium: number; frequency: string; policyTerm: number;
  premiumPayingTerm: number; maturityAge: number; inputs: Record<string, number>; quoteDate: string;
  withWaiver: boolean; withAccident: boolean; canUseForEnrollment: boolean; warnings: string[];
  rateVersion: RateVersion; breakdown: { label: string; value: number; cell: string; formula: string | null }[];
  benefits: { label: string; value: number; cell: string }[];
  advance: null | { years: number; additionalAmount: number; totalIncludingCurrentPremium: number; assumedDiscountRate: number };
}
export interface CalculatorTransport {
  catalog: () => Promise<{ plans: CalculatorPlan[]; versions: RateVersion[] }>;
  calculate: (input: Record<string, unknown>) => Promise<PremiumQuote>;
  history: () => Promise<PremiumQuote[]>;
}
const modeLabels: Record<string, string> = { ANNUAL: 'Yearly', SEMI_ANNUAL: 'Half-yearly', QUARTERLY: 'Quarterly', SINGLE: 'Single premium' };
// Plans are shown the way the workbook names them, e.g. "Endowment (333)".
const planLabel = (name: string, code: string) => `${name} (${code})`;
const amount = (value: number) => new Intl.NumberFormat('en-NP', { maximumFractionDigits: 2 }).format(value);
const errorMessage = (error: unknown) => {
  const e = error as { response?: { data?: { message?: string } }; message?: string };
  return e.response?.data?.message || e.message || 'Unable to complete this request.';
};
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export default function PremiumCalculator({ transport, onApply, convertBs }: {
  transport: CalculatorTransport; onApply?: (quote: PremiumQuote) => void; convertBs?: (date: string) => string;
}) {
  const [plans, setPlans] = useState<CalculatorPlan[]>([]), [versions, setVersions] = useState<RateVersion[]>([]);
  const [planCode, setPlanCode] = useState('333'), [versionId, setVersionId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({}), [frequency, setFrequency] = useState('ANNUAL');
  const [quoteDate, setQuoteDate] = useState(today), [waiver, setWaiver] = useState(false), [accident, setAccident] = useState(false);
  const [advanceYears, setAdvanceYears] = useState('0'), [birthDate, setBirthDate] = useState(''), [calendar, setCalendar] = useState('AD');
  const [quote, setQuote] = useState<PremiumQuote | null>(null), [history, setHistory] = useState<PremiumQuote[]>([]);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const revision = useRef(0);
  const plan = plans.find(p => p.code === planCode);
  const clearResult = () => { revision.current++; setQuote(null); setError(''); };
  useEffect(() => {
    let active = true;
    transport.catalog().then(data => {
      if (!active) return;
      setPlans(data.plans); setVersions(data.versions);
      setVersionId(data.versions.find(v => v.status === 'VERIFIED' && v.effectiveFrom && v.effectiveFrom <= today() && (!v.effectiveTo || v.effectiveTo >= today()))?.id || data.versions[0]?.id || '');
      const initial = data.plans.find(p => p.code === '333') || data.plans[0];
      if (initial) { setPlanCode(initial.code); setValues(Object.fromEntries(Object.entries(initial.defaults).map(([k,v]) => [k, String(k === 'accidentalCover' ? 0 : v)]))); }
    }).catch(e => active && setError(errorMessage(e))).finally(() => active && setLoading(false));
    transport.history().then(data => active && setHistory(data)).catch(() => { /* Quoting remains usable if history fails. */ });
    return () => { active = false; };
  }, [transport]);
  const selectPlan = (code: string) => {
    clearResult(); const next = plans.find(p => p.code === code)!;
    setPlanCode(code); setFrequency(next.frequencies[0]); setWaiver(false); setAccident(false); setAdvanceYears('0');
    setValues(Object.fromEntries(Object.entries(next.defaults).map(([k,v]) => [k, String(k === 'accidentalCover' ? 0 : v)])));
  };
  const calculate = async (event: React.FormEvent) => {
    event.preventDefault(); if (!plan || busy) return;
    clearResult(); const snapshot = revision.current; setBusy(true);
    try {
      const result = await transport.calculate({ planCode, versionId, frequency, quoteDate, ...Object.fromEntries(plan.fields.map(f => [f.key, values[f.key] === '' ? null : Number(values[f.key])])), withWaiver: waiver, withAccident: accident, ...(plan.supportsAdvance ? { advanceYears: Number(advanceYears) } : {}) });
      if (snapshot === revision.current) setQuote(result);
      setHistory(prev => [result, ...prev].slice(0, 30));
    } catch (e) { if (snapshot === revision.current) setError(errorMessage(e)); }
    finally { setBusy(false); }
  };
  const useBirthDate = () => {
    try {
      const ad = calendar === 'BS' && convertBs ? convertBs(birthDate) : birthDate;
      const birth = new Date(`${ad}T00:00:00Z`), asOf = new Date(`${quoteDate}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ad) || Number.isNaN(birth.getTime()) || birth.toISOString().slice(0,10) !== ad || birth > asOf) throw new Error('Enter a valid birth date on or before the quote date.');
      let age = asOf.getUTCFullYear() - birth.getUTCFullYear();
      if (asOf.getUTCMonth() < birth.getUTCMonth() || (asOf.getUTCMonth() === birth.getUTCMonth() && asOf.getUTCDate() < birth.getUTCDate())) age--;
      clearResult(); setValues(prev => ({ ...prev, age: String(age) }));
    } catch (e) { setError(errorMessage(e)); }
  };
  const downloadQuote = () => {
    if (!quote) return;
    const blob = new Blob([JSON.stringify(quote, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `LIC-${quote.planCode}-quote-${quote.id}.json`; link.click(); URL.revokeObjectURL(url);
  };
  const inputClass = 'mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
  if (loading) return <p role="status" className="p-6">Loading calculator plans…</p>;
  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-bold text-slate-900">LIC premium calculator</h1><p className="mt-2 text-slate-600">Check eligibility, compare premiums, and explain policy benefits.</p></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={calculate} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Customer and plan details</h2>
        <label className="block text-sm font-medium">Plan<select className={inputClass} value={planCode} onChange={e => selectPlan(e.target.value)}>{plans.map(p => <option key={p.code} value={p.code}>{planLabel(p.name, p.code)}</option>)}</select></label>
        {plan?.engine === 'STANDARD' ? <>
          <p className="rounded-xl border border-slate-200 p-3 text-sm">Plan rates: {plan.rateSource?.source || 'Entered by admin'} ({plan.rateSource?.status === 'VERIFIED' ? 'Verified' : 'Reference'})</p>
          {plan.rateSource?.status !== 'VERIFIED' && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">These plan rates have not been verified. You can calculate estimates, but they cannot be applied to enrollment until an admin verifies them.</p>}
        </> : <>
        <label className="block text-sm font-medium">Rate version<select className={inputClass} value={versionId} onChange={e => { clearResult(); setVersionId(e.target.value); }}>{versions.map(v => <option key={v.id} value={v.id}>{v.label} ({v.status === 'VERIFIED' ? 'Verified' : 'Reference'})</option>)}</select></label>
        {versions.find(v => v.id === versionId)?.status !== 'VERIFIED' && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Historical reference rates. You can calculate estimates, but these cannot be applied to enrollment until an admin verifies the rates and rules.</p>}
        </>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Quote date (AD)<input required type="date" className={inputClass} value={quoteDate} onChange={e => { clearResult(); setQuoteDate(e.target.value); }} /></label>
          <label className="block text-sm font-medium">Payment frequency<select className={inputClass} value={frequency} onChange={e => { clearResult(); setFrequency(e.target.value); }}>{plan?.frequencies.map(f => <option key={f} value={f}>{modeLabels[f]}</option>)}</select></label>
          {plan?.fields.map(f => <label key={f.key} className="block text-sm font-medium">{f.label}{f.options ? <select className={inputClass} value={values[f.key] || ''} onChange={e => { clearResult(); setValues(prev => ({ ...prev, [f.key]: e.target.value })); }}>{f.options.map(v => <option key={v} value={v}>{v}</option>)}</select> : <input required type="number" className={inputClass} min={f.min} max={f.max} step={f.step} value={values[f.key] ?? ''} onChange={e => { clearResult(); setValues(prev => ({ ...prev, [f.key]: e.target.value })); }} />}</label>)}
        </div>
        <details className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer text-sm font-medium">Calculate completed age from birth date</summary><div className="mt-3 flex flex-wrap items-end gap-2">
          {convertBs && <label className="text-sm">Calendar<select className={inputClass} value={calendar} onChange={e => setCalendar(e.target.value)}><option>AD</option><option>BS</option></select></label>}
          <label className="min-w-40 flex-1 text-sm">Birth date ({calendar})<input className={inputClass} type={calendar === 'AD' ? 'date' : 'text'} placeholder="YYYY-MM-DD" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></label>
          <button type="button" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" onClick={useBirthDate}>Use age</button>
        </div><p className="mt-2 text-xs text-slate-500">Uses completed years on the quote date. Confirm the insurer’s age convention before issuing a policy.</p></details>
        {plan?.supportsWaiver && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={waiver} onChange={e => { clearResult(); setWaiver(e.target.checked); }} />Include premium-waiver benefit</label>}
        {planCode === '359' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={accident} onChange={e => { clearResult(); setAccident(e.target.checked); }} />Include accidental benefit</label>}
        {plan?.supportsAdvance && <label className="block text-sm font-medium">Future yearly premiums to pay in advance<input type="number" min="0" step="1" className={inputClass} value={advanceYears} onChange={e => { clearResult(); setAdvanceYears(e.target.value); }} /><span className="mt-1 block text-xs text-slate-500">Enter 0 for no advance payment. Advance payments use yearly mode.</span></label>}
        {plan?.notes.map(note => <p key={note} className="text-sm text-slate-600">{note}</p>)}
        <button disabled={busy || !plan || !versionId} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Calculating…' : 'Calculate premium'}</button>
      </form>
      <section aria-live="polite" className="space-y-4">
        {!quote ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-600"><h2 className="font-semibold text-slate-900">Your quote will appear here</h2><p className="mt-2">Select a plan and enter the customer’s details. The system checks eligibility before calculating a premium.</p></div> : <>
          <div className="rounded-2xl bg-blue-700 p-6 text-white"><p className="text-sm">{planLabel(quote.planName, quote.planCode)}</p><h2 className="mt-2 text-3xl font-bold">Rs {amount(quote.premium)}</h2><p className="mt-1">{modeLabels[quote.frequency]} premium per payment</p><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p>Policy term: {quote.policyTerm} years</p><p>{quote.frequency === 'SINGLE' ? 'One payment at commencement' : `Pay premiums for ${quote.premiumPayingTerm} years`}</p><p>Age at policy end: {quote.maturityAge}</p><p>{quote.canUseForEnrollment ? 'Verified for quote date' : 'Reference estimate'}</p></div></div>
          {quote.warnings.map(w => <p key={w} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{w}</p>)}
          <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">Premium breakdown</h3><div className="mt-3 overflow-x-auto"><table className="w-full text-sm"><tbody>{quote.breakdown.map((item,i) => <tr key={`${item.cell}-${i}`} className="border-b border-slate-100"><td className="py-2 pr-3">{item.label}</td><td className="py-2 text-right tabular-nums">{amount(item.value)}</td></tr>)}</tbody></table></div></div>
          {quote.benefits.length > 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">Benefit illustration</h3><dl className="mt-3 space-y-3">{quote.benefits.map((b,i) => <div key={`${b.cell}-${i}`} className="flex justify-between gap-4 text-sm"><dt>{b.label}</dt><dd className="whitespace-nowrap font-medium">Rs {amount(b.value)}</dd></div>)}</dl><p className="mt-3 text-xs text-slate-500">Illustrations are separate from the premium quote. Estimated bonuses are not guaranteed.</p></div>}
          {quote.advance && <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">Advance payment illustration</h3><p className="mt-2">{quote.advance.years} future premiums: Rs {amount(quote.advance.additionalAmount)}</p><p>Including the current premium: Rs {amount(quote.advance.totalIncludingCurrentPremium)}</p><p className="mt-2 text-xs text-slate-500">Uses the workbook’s 5% annual discount assumption; confirm it with the insurer.</p></div>}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm"><p>Rate version: {quote.rateVersion.label}</p><p className="mt-1 break-words text-slate-500">Source: {quote.rateVersion.source}</p><p className="mt-1 break-all text-xs text-slate-500">Quote ID: {quote.id}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={downloadQuote} className="rounded-lg border border-slate-300 px-3 py-2">Download quote</button>{onApply && <button type="button" disabled={!quote.canUseForEnrollment} onClick={() => onApply(quote)} className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50">Use for enrollment</button>}</div></div>
        </>}
      </section>
    </div>
    {history.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Your recent quotes</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{history.map(q => <button key={q.id} type="button" onClick={() => { clearResult(); setQuote(q); }} className="rounded-xl border border-slate-200 p-3 text-left text-sm hover:bg-slate-50"><span className="block font-medium">{planLabel(q.planName, q.planCode)}</span><span className="mt-1 block">Rs {amount(q.premium)} · {modeLabels[q.frequency]}</span><span className="mt-1 block text-xs text-slate-500">{q.quoteDate} · {q.canUseForEnrollment ? 'Verified' : 'Reference'}</span></button>)}</div></section>}
  </div>;
}
