import React, { useMemo, useState } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import AppModal, { DetailGroup, DetailRow, ModalField, ModalGrid, ModalInput, ModalSelect, ModalTextarea } from '../../../components/ui/AppModal';
import { extractMessage } from '../../../utils/formErrors';
import {
  FREQUENCY_LABELS, ROUNDING_LABELS, parseRateTable, rateTableToText,
  type Engine, type FieldLimit, type Frequency, type Plan, type PlanCatalog, type PlanInput, type Rounding,
} from './planService';

const CATEGORIES = ['Endowment', 'Money Back', 'Child', 'Pension', 'Term', 'Whole Life', 'Single Premium', 'Joint Life', 'Other'];
const STANDARD_FREQUENCIES: Frequency[] = ['ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY'];
const SAMPLE_TABLE = 'Age \\ Term\t10\t15\t20\n18\t95.5\t62.1\t45.3\n19\t95.7\t62.3\t45.5';
type Mode = 'create' | 'edit' | 'details';
type Tier = { minSumAssured: string; perThousand: string };
const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v));
const optNum = (v: string) => (v.trim() === '' ? undefined : Number(v));

interface Props {
  isOpen: boolean; onClose: () => void; mode: Mode; plan: Plan | null; catalog: PlanCatalog | null;
  insurers: { id: string; name: string }[];
  onSubmit: (data: PlanInput) => Promise<void>;
}

const sectionTitle = 'mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wide text-slate-500 first:mt-0';
const checkboxRow = 'flex items-center gap-2 text-sm text-slate-700';

// Form values for a plan (edit/details) or a new configurable plan (create).
function initialValues(plan: Plan | null, templates: PlanCatalog['workbookTemplates']) {
  const v = {
    engine: 'STANDARD' as Engine, code: '', name: '', category: 'Endowment', description: '', status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE', notes: '',
    frequencies: STANDARD_FREQUENCIES as Frequency[],
    limits: { age: { min: '', max: '' }, sumAssured: { min: '100000', max: '100000000', step: '1000' }, term: { min: '', max: '' } } as Record<string, Record<string, string>>,
    termOptions: '', rateText: '', loadings: { ANNUAL: '1', SEMI_ANNUAL: '1.02', QUARTERLY: '1.028' },
    tiers: [{ minSumAssured: '200000', perThousand: '2' }] as Tier[], abEnabled: true, abRate: '1', abMinAge: '18', abMaxCover: '7500000',
    rounding: 'INSTALMENT' as Rounding, bonus: '', maxMaturity: '70',
    rateStatus: 'REFERENCE' as 'REFERENCE' | 'VERIFIED', rateSourceText: '', companyId: '', effectiveFrom: '', effectiveTo: '', verificationNote: '',
  };
  if (!plan) return v;
  Object.assign(v, { engine: plan.engine, code: plan.code, name: plan.name, category: plan.category, description: plan.description || '', status: plan.status, notes: (plan.notes || []).join('\n'), frequencies: plan.frequencies });
  if (plan.engine === 'WORKBOOK') {
    const t = templates.find(x => x.code === plan.code);
    v.limits = Object.fromEntries((t?.fields || []).map(f => { const l: FieldLimit = plan.limits?.[f.key] || {}; return [f.key, { min: str(l.min ?? f.min), max: str(l.max ?? f.max), step: str(l.step ?? f.step), options: (l.options ?? f.options ?? []).join(', ') }]; }));
  } else if (plan.formula) {
    const l = plan.limits || {}, f = plan.formula, r = plan.rateSource;
    Object.assign(v, {
      limits: { age: { min: str(l.age?.min), max: str(l.age?.max) }, sumAssured: { min: str(l.sumAssured?.min), max: str(l.sumAssured?.max), step: str(l.sumAssured?.step) }, term: { min: str(l.term?.min), max: str(l.term?.max) } },
      termOptions: (l.term?.options || []).join(', '), rateText: rateTableToText(f.rateTable),
      loadings: { ANNUAL: str(f.modeLoadings.ANNUAL), SEMI_ANNUAL: str(f.modeLoadings.SEMI_ANNUAL), QUARTERLY: str(f.modeLoadings.QUARTERLY) },
      tiers: f.discountTiers.map(t => ({ minSumAssured: str(t.minSumAssured), perThousand: str(t.perThousand) })),
      abEnabled: f.accidentBenefit.enabled, abRate: str(f.accidentBenefit.ratePerThousand ?? 1), abMinAge: str(f.accidentBenefit.minAge ?? 18), abMaxCover: str(f.accidentBenefit.maxCover ?? 7500000),
      rounding: f.rounding, bonus: str(f.bonusPerThousand), maxMaturity: str(f.maxMaturityAge),
      rateStatus: r?.status || 'REFERENCE', rateSourceText: r?.source || '', companyId: r?.company_id || '', effectiveFrom: r?.effectiveFrom || '', effectiveTo: r?.effectiveTo || '', verificationNote: r?.verificationNote || '',
    });
  }
  return v;
}

const PlanModal: React.FC<Props> = ({ isOpen, onClose, mode, plan, catalog, insurers, onSubmit }) => {
  const templates = catalog?.workbookTemplates || [];
  const freeTemplates = templates.filter(t => !t.inUse);
  // The page remounts this modal (via `key`) for each plan, so the form initialises once here.
  const [init] = useState(() => initialValues(plan, templates));
  const [engine, setEngine] = useState<Engine>(init.engine);
  const [code, setCode] = useState(init.code), [name, setName] = useState(init.name), [category, setCategory] = useState(init.category);
  const [description, setDescription] = useState(init.description), [status, setStatus] = useState(init.status), [notes, setNotes] = useState(init.notes);
  const [frequencies, setFrequencies] = useState<Frequency[]>(init.frequencies);
  const [limits, setLimits] = useState(init.limits);
  const [termOptions, setTermOptions] = useState(init.termOptions);
  const [rateText, setRateText] = useState(init.rateText), [loadings, setLoadings] = useState(init.loadings);
  const [tiers, setTiers] = useState<Tier[]>(init.tiers);
  const [abEnabled, setAbEnabled] = useState(init.abEnabled), [abRate, setAbRate] = useState(init.abRate), [abMinAge, setAbMinAge] = useState(init.abMinAge), [abMaxCover, setAbMaxCover] = useState(init.abMaxCover);
  const [rounding, setRounding] = useState<Rounding>(init.rounding), [bonus, setBonus] = useState(init.bonus), [maxMaturity, setMaxMaturity] = useState(init.maxMaturity);
  const [rateStatus, setRateStatus] = useState(init.rateStatus), [rateSourceText, setRateSourceText] = useState(init.rateSourceText);
  const [companyId, setCompanyId] = useState(init.companyId), [effectiveFrom, setEffectiveFrom] = useState(init.effectiveFrom), [effectiveTo, setEffectiveTo] = useState(init.effectiveTo), [verificationNote, setVerificationNote] = useState(init.verificationNote);
  const [error, setError] = useState(''), [loading, setLoading] = useState(false);

  const template = templates.find(t => t.code === code);
  const workbookFields = engine === 'WORKBOOK' ? template?.fields || [] : [];

  const loadTemplate = (tplCode: string) => {
    const t = templates.find(x => x.code === tplCode);
    setCode(tplCode);
    if (!t) return;
    setName(t.name); setCategory(t.category); setNotes(t.notes.join('\n')); setFrequencies(t.frequencies);
    setLimits(Object.fromEntries(t.fields.map(f => [f.key, { min: str(f.min), max: str(f.max), step: str(f.step), options: (f.options || []).join(', ') }])));
  };


  const tablePreview = useMemo(() => {
    if (engine !== 'STANDARD' || !rateText.trim()) return null;
    try { const t = parseRateTable(rateText); return { ok: true as const, text: `${t.ages.length} ages (${t.ages[0]}–${t.ages[t.ages.length - 1]}) × ${t.terms.length} terms (${t.terms[0]}–${t.terms[t.terms.length - 1]})` }; }
    catch (e) { return { ok: false as const, text: e instanceof Error ? e.message : 'Invalid rate table.' }; }
  }, [engine, rateText]);

  const setLimit = (key: string, part: string, value: string) => setLimits(prev => ({ ...prev, [key]: { ...prev[key], [part]: value } }));
  const toggleFrequency = (f: Frequency) => setFrequencies(prev => (prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]));

  const buildPayload = (): PlanInput => {
    const base: PlanInput = { name, category, description, status, notes: notes.split('\n').map(n => n.trim()).filter(Boolean), frequencies };
    if (mode === 'create') Object.assign(base, { engine, code: code.trim() });
    if (engine === 'WORKBOOK') {
      base.limits = Object.fromEntries(workbookFields.map(f => {
        const l = limits[f.key] || {};
        if (f.options) return [f.key, { options: (l.options || '').split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && String(n) !== '') }];
        return [f.key, { min: Number(l.min), max: Number(l.max), ...(f.key === 'sumAssured' ? { step: Number(l.step) } : {}) }];
      }));
      return base;
    }
    // Blank cells travel as 0 ("not offered"): the API's request sanitizer drops nulls from arrays.
    const parsed = parseRateTable(rateText);
    const rateTable = { ...parsed, rates: parsed.rates.map(row => row.map(r => r ?? 0)) };
    const opts = termOptions.split(',').map(s => s.trim()).filter(Boolean).map(Number);
    base.limits = {
      age: { min: optNum(limits.age?.min || ''), max: optNum(limits.age?.max || '') },
      sumAssured: { min: Number(limits.sumAssured?.min), max: Number(limits.sumAssured?.max), step: Number(limits.sumAssured?.step || 1) },
      term: { min: optNum(limits.term?.min || ''), max: optNum(limits.term?.max || ''), ...(opts.length ? { options: opts } : {}) },
    };
    base.formula = {
      rateTable, modeLoadings: { ANNUAL: Number(loadings.ANNUAL), SEMI_ANNUAL: Number(loadings.SEMI_ANNUAL), QUARTERLY: Number(loadings.QUARTERLY) },
      discountTiers: tiers.filter(t => t.minSumAssured !== '' || t.perThousand !== '').map(t => ({ minSumAssured: Number(t.minSumAssured), perThousand: Number(t.perThousand) })),
      accidentBenefit: abEnabled ? { enabled: true, ratePerThousand: Number(abRate), minAge: Number(abMinAge), maxCover: Number(abMaxCover) } : { enabled: false },
      rounding, bonusPerThousand: bonus.trim() === '' ? null : Number(bonus), maxMaturityAge: maxMaturity.trim() === '' ? null : Number(maxMaturity),
    };
    base.rateSource = { status: rateStatus, source: rateSourceText, verificationNote, effectiveFrom: effectiveFrom || null, effectiveTo: effectiveTo || null, company_id: companyId || null };
    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (loading) return;
    setError('');
    if (engine === 'WORKBOOK' && mode === 'create' && !template) { setError('Choose the workbook plan to recreate.'); return; }
    if (!frequencies.length) { setError('Choose at least one payment mode.'); return; }
    let payload: PlanInput;
    try { payload = buildPayload(); } catch (err) { setError(err instanceof Error ? err.message : 'Check the rate table.'); return; }
    setLoading(true);
    try { await onSubmit(payload); onClose(); }
    catch (err) { setError(extractMessage(err, 'Could not save the plan.')); }
    finally { setLoading(false); }
  };

  const allowedFrequencies: Frequency[] = engine === 'WORKBOOK' ? (template?.frequencies || []) : STANDARD_FREQUENCIES;
  const title = mode === 'create' ? 'New LIC plan' : mode === 'edit' ? `Edit ${plan?.name} (${plan?.code})` : `${plan?.name} (${plan?.code})`;

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={title} mode={mode} onSubmit={handleSubmit} loading={loading}
      submitLabel={mode === 'create' ? 'Create plan' : 'Save changes'} maxWidth="max-w-3xl"
      subtitle={engine === 'WORKBOOK' ? 'Calculated with the workbook (Excel) formulas' : 'Calculated with the configurable premium formula'}>
      {mode === 'details' && plan ? (
        <>
          <DetailGroup title="Plan">
            <DetailRow label="Name" value={`${plan.name} (${plan.code})`} />
            <DetailRow label="Category" value={plan.category} />
            <DetailRow label="Status" value={plan.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
            <DetailRow label="Calculation" value={plan.engine === 'WORKBOOK' ? 'Workbook (Excel) formulas' : 'Configurable formula'} />
            <DetailRow label="Payment modes" value={plan.frequencies.map(f => FREQUENCY_LABELS[f]).join(', ')} />
            <DetailRow label="Revision" value={String(plan.revision)} />
          </DetailGroup>
          {plan.description && <DetailGroup title="Description"><p className="text-sm text-slate-700">{plan.description}</p></DetailGroup>}
          {plan.notes.length > 0 && <DetailGroup title="Notes shown to agents"><ul className="list-inside list-disc space-y-1 text-sm text-slate-700">{plan.notes.map(n => <li key={n}>{n}</li>)}</ul></DetailGroup>}
          {plan.formula && (
            <DetailGroup title="Formula">
              <DetailRow label="Rate table" value={`${plan.formula.rateTable.ages.length} ages × ${plan.formula.rateTable.terms.length} terms`} />
              <DetailRow label="Mode loadings" value={`${plan.formula.modeLoadings.ANNUAL} / ${plan.formula.modeLoadings.SEMI_ANNUAL} / ${plan.formula.modeLoadings.QUARTERLY}`} />
              <DetailRow label="Discount tiers" value={plan.formula.discountTiers.map(t => `≥ ${t.minSumAssured.toLocaleString('en-IN')}: ${t.perThousand}`).join('; ') || 'None'} />
              <DetailRow label="Accident benefit" value={plan.formula.accidentBenefit.enabled ? `${plan.formula.accidentBenefit.ratePerThousand} per 1,000 from age ${plan.formula.accidentBenefit.minAge}` : 'Not offered'} />
              <DetailRow label="Rates" value={`${plan.rateSource?.status === 'VERIFIED' ? 'Verified' : 'Reference'}${plan.rateSource?.source ? ` · ${plan.rateSource.source}` : ''}`} />
            </DetailGroup>
          )}
        </>
      ) : (
        <>
          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}

          <h3 className={sectionTitle}>Plan details</h3>
          <ModalGrid>
            {mode === 'create' && (
              <ModalField label="Calculation method *">
                <ModalSelect value={engine} onChange={e => { const next = e.target.value as Engine; setEngine(next); setCode(''); if (next === 'STANDARD') setFrequencies(STANDARD_FREQUENCIES); }}>
                  <option value="STANDARD">Configurable formula (new plan)</option>
                  <option value="WORKBOOK" disabled={!freeTemplates.length}>Workbook formulas (recreate a deleted workbook plan)</option>
                </ModalSelect>
              </ModalField>
            )}
            {mode === 'create' && engine === 'WORKBOOK' ? (
              <ModalField label="Workbook plan *">
                <ModalSelect value={code} onChange={e => loadTemplate(e.target.value)}>
                  <option value="">Choose a plan</option>
                  {freeTemplates.map(t => <option key={t.code} value={t.code}>{t.name} ({t.code})</option>)}
                </ModalSelect>
              </ModalField>
            ) : (
              <ModalField label="Plan code *">
                <ModalInput value={code} disabled={mode !== 'create'} maxLength={20} placeholder="e.g. 945" onChange={e => setCode(e.target.value)} />
              </ModalField>
            )}
            <ModalField label="Plan name *"><ModalInput value={name} maxLength={100} onChange={e => setName(e.target.value)} /></ModalField>
            <ModalField label="Category *">
              <ModalSelect value={CATEGORIES.includes(category) ? category : 'Other'} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </ModalSelect>
            </ModalField>
            <ModalField label="Status *">
              <ModalSelect value={status} onChange={e => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}>
                <option value="ACTIVE">Active (agents can quote it)</option>
                <option value="INACTIVE">Inactive (hidden from agents)</option>
              </ModalSelect>
            </ModalField>
            <ModalField label="Description" fullWidth><ModalInput value={description} maxLength={500} placeholder="Short summary shown on the LIC Plans page" onChange={e => setDescription(e.target.value)} /></ModalField>
            <ModalField label="Notes shown to agents (one per line)" fullWidth><ModalTextarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></ModalField>
          </ModalGrid>

          <h3 className={sectionTitle}>Payment modes</h3>
          <div className="flex flex-wrap gap-4">
            {allowedFrequencies.map(f => <label key={f} className={checkboxRow}><input type="checkbox" checked={frequencies.includes(f)} onChange={() => toggleFrequency(f)} />{FREQUENCY_LABELS[f]}</label>)}
          </div>

          <h3 className={sectionTitle}>Eligibility limits</h3>
          {engine === 'WORKBOOK' ? (
            workbookFields.length ? (
              <>
                <p className="mb-2 text-xs text-slate-500">Limits can be narrowed but not widened beyond the workbook rate tables.</p>
                <ModalGrid>
                  {workbookFields.map(f => f.options ? (
                    <ModalField key={f.key} label={`${f.label}: options (from ${f.options.join(', ')})`} fullWidth>
                      <ModalInput value={limits[f.key]?.options || ''} onChange={e => setLimit(f.key, 'options', e.target.value)} />
                    </ModalField>
                  ) : (
                    <ModalField key={f.key} label={`${f.label} (${f.min.toLocaleString('en-IN')}–${f.max.toLocaleString('en-IN')})`}>
                      <div className="flex gap-2">
                        <ModalInput type="number" aria-label={`${f.label} minimum`} value={limits[f.key]?.min || ''} onChange={e => setLimit(f.key, 'min', e.target.value)} />
                        <ModalInput type="number" aria-label={`${f.label} maximum`} value={limits[f.key]?.max || ''} onChange={e => setLimit(f.key, 'max', e.target.value)} />
                        {f.key === 'sumAssured' && <ModalInput type="number" aria-label="Sum assured increment" title="Increment" value={limits[f.key]?.step || ''} onChange={e => setLimit(f.key, 'step', e.target.value)} />}
                      </div>
                    </ModalField>
                  ))}
                </ModalGrid>
              </>
            ) : <p className="text-sm text-slate-500">Choose a workbook plan first.</p>
          ) : (
            <ModalGrid>
              <ModalField label="Entry age (min / max; blank = rate table range)">
                <div className="flex gap-2"><ModalInput type="number" aria-label="Minimum age" value={limits.age?.min || ''} onChange={e => setLimit('age', 'min', e.target.value)} /><ModalInput type="number" aria-label="Maximum age" value={limits.age?.max || ''} onChange={e => setLimit('age', 'max', e.target.value)} /></div>
              </ModalField>
              <ModalField label="Policy term (min / max; blank = rate table range)">
                <div className="flex gap-2"><ModalInput type="number" aria-label="Minimum term" value={limits.term?.min || ''} onChange={e => setLimit('term', 'min', e.target.value)} /><ModalInput type="number" aria-label="Maximum term" value={limits.term?.max || ''} onChange={e => setLimit('term', 'max', e.target.value)} /></div>
              </ModalField>
              <ModalField label="Sum assured (min / max / increment) *" fullWidth>
                <div className="flex gap-2"><ModalInput type="number" aria-label="Minimum sum assured" value={limits.sumAssured?.min || ''} onChange={e => setLimit('sumAssured', 'min', e.target.value)} /><ModalInput type="number" aria-label="Maximum sum assured" value={limits.sumAssured?.max || ''} onChange={e => setLimit('sumAssured', 'max', e.target.value)} /><ModalInput type="number" aria-label="Sum assured increment" value={limits.sumAssured?.step || ''} onChange={e => setLimit('sumAssured', 'step', e.target.value)} /></div>
              </ModalField>
              <ModalField label="Allowed terms only (optional, e.g. 10, 15, 20)"><ModalInput value={termOptions} onChange={e => setTermOptions(e.target.value)} /></ModalField>
              <ModalField label="Maximum age at maturity (optional)"><ModalInput type="number" value={maxMaturity} onChange={e => setMaxMaturity(e.target.value)} /></ModalField>
            </ModalGrid>
          )}

          {engine === 'STANDARD' && (
            <>
              <h3 className={sectionTitle}>Rate table (per 1,000 sum assured)</h3>
              <p className="mb-2 text-xs text-slate-500">Paste from Excel or type it: the first row lists the terms, each next row starts with the age followed by its rates. Leave a cell blank where that age and term is not offered.</p>
              <ModalTextarea rows={7} className="font-mono text-xs" placeholder={SAMPLE_TABLE} value={rateText} onChange={e => setRateText(e.target.value)} aria-label="Rate table" />
              {tablePreview && <p className={`mt-1.5 text-xs ${tablePreview.ok ? 'text-brand-700' : 'text-rose-600'}`}>{tablePreview.text}</p>}

              <h3 className={sectionTitle}>Premium formula</h3>
              <ModalGrid cols={3}>
                <ModalField label="Yearly loading"><ModalInput type="number" step="any" value={loadings.ANNUAL} onChange={e => setLoadings(p => ({ ...p, ANNUAL: e.target.value }))} /></ModalField>
                <ModalField label="Half-yearly loading"><ModalInput type="number" step="any" value={loadings.SEMI_ANNUAL} onChange={e => setLoadings(p => ({ ...p, SEMI_ANNUAL: e.target.value }))} /></ModalField>
                <ModalField label="Quarterly loading"><ModalInput type="number" step="any" value={loadings.QUARTERLY} onChange={e => setLoadings(p => ({ ...p, QUARTERLY: e.target.value }))} /></ModalField>
              </ModalGrid>
              <div className="mt-3">
                <p className="mb-1.5 text-sm font-medium text-slate-700">Sum-assured discount (reduction per 1,000; the highest tier reached applies)</p>
                <div className="space-y-2">
                  {tiers.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <ModalInput type="number" aria-label={`Tier ${i + 1} minimum sum assured`} placeholder="Sum assured from" value={t.minSumAssured} onChange={e => setTiers(p => p.map((x, j) => (j === i ? { ...x, minSumAssured: e.target.value } : x)))} />
                      <ModalInput type="number" step="any" aria-label={`Tier ${i + 1} discount per 1,000`} placeholder="Discount per 1,000" value={t.perThousand} onChange={e => setTiers(p => p.map((x, j) => (j === i ? { ...x, perThousand: e.target.value } : x)))} />
                      <button type="button" aria-label={`Remove tier ${i + 1}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setTiers(p => p.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
                    </div>
                  ))}
                  <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline" onClick={() => setTiers(p => [...p, { minSumAssured: '', perThousand: '' }])}><Plus size={14} />Add discount tier</button>
                </div>
              </div>
              <label className={`${checkboxRow} mt-4`}><input type="checkbox" checked={abEnabled} onChange={e => setAbEnabled(e.target.checked)} />Offer accidental benefit</label>
              {abEnabled && (
                <ModalGrid cols={3} className="mt-2">
                  <ModalField label="Yearly rate per 1,000 cover"><ModalInput type="number" step="any" value={abRate} onChange={e => setAbRate(e.target.value)} /></ModalField>
                  <ModalField label="Minimum age"><ModalInput type="number" value={abMinAge} onChange={e => setAbMinAge(e.target.value)} /></ModalField>
                  <ModalField label="Maximum cover"><ModalInput type="number" value={abMaxCover} onChange={e => setAbMaxCover(e.target.value)} /></ModalField>
                </ModalGrid>
              )}
              <ModalGrid className="mt-3">
                <ModalField label="Rounding *">
                  <ModalSelect value={rounding} onChange={e => setRounding(e.target.value as Rounding)}>
                    {(Object.keys(ROUNDING_LABELS) as Rounding[]).map(r => <option key={r} value={r}>{ROUNDING_LABELS[r]}</option>)}
                  </ModalSelect>
                </ModalField>
                <ModalField label="Illustrative bonus per 1,000 per year (optional)"><ModalInput type="number" step="any" value={bonus} onChange={e => setBonus(e.target.value)} /></ModalField>
              </ModalGrid>

              <h3 className={sectionTitle}>Rate source and verification</h3>
              <ModalGrid>
                <ModalField label="Rate status *">
                  <ModalSelect value={rateStatus} onChange={e => setRateStatus(e.target.value as 'REFERENCE' | 'VERIFIED')}>
                    <option value="REFERENCE">Reference (estimates only)</option>
                    <option value="VERIFIED">Verified (eligible for enrollment)</option>
                  </ModalSelect>
                </ModalField>
                <ModalField label="Insurer">
                  <ModalSelect value={companyId} onChange={e => setCompanyId(e.target.value)}>
                    <option value="">Not assigned</option>
                    {insurers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </ModalSelect>
                </ModalField>
                <ModalField label="Source document or URL" fullWidth><ModalInput value={rateSourceText} maxLength={500} onChange={e => setRateSourceText(e.target.value)} /></ModalField>
                <ModalField label="Effective from"><ModalInput type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} /></ModalField>
                <ModalField label="Effective to (optional)"><ModalInput type="date" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} /></ModalField>
                <ModalField label="Review note (required when verified)" fullWidth><ModalTextarea rows={2} value={verificationNote} onChange={e => setVerificationNote(e.target.value)} /></ModalField>
              </ModalGrid>
            </>
          )}
        </>
      )}
    </AppModal>
  );
};

export default PlanModal;
