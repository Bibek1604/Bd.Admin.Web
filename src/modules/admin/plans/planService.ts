import api from '../../../api/axiosInstance';

export type Frequency = 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY' | 'SINGLE';
export type Engine = 'WORKBOOK' | 'STANDARD';
export type Rounding = 'INSTALMENT' | 'YEARLY_THEN_INSTALMENT';

export interface FieldLimit { min?: number; max?: number; step?: number; options?: number[] }
export interface PlanFormula {
  rateTable: { ages: number[]; terms: number[]; rates: (number | null)[][] };
  modeLoadings: { ANNUAL: number; SEMI_ANNUAL: number; QUARTERLY: number };
  discountTiers: { minSumAssured: number; perThousand: number }[];
  accidentBenefit: { enabled: boolean; ratePerThousand?: number; minAge?: number; maxCover?: number };
  rounding: Rounding;
  bonusPerThousand: number | null;
  maxMaturityAge: number | null;
}
export interface RateSource {
  status: 'REFERENCE' | 'VERIFIED'; source: string; verificationNote?: string;
  effectiveFrom: string | null; effectiveTo: string | null; company_id: string | null;
}
export interface Plan {
  id: string; code: string; engine: Engine; name: string; category: string; description: string;
  status: 'ACTIVE' | 'INACTIVE'; notes: string[]; frequencies: Frequency[]; limits: Record<string, FieldLimit>;
  formula?: PlanFormula; rateSource?: RateSource; revision: number; seeded?: boolean; created_at: string; updated_at: string;
}
export interface WorkbookTemplate {
  code: string; name: string; category: string; sheet: string; frequencies: Frequency[]; notes: string[]; inUse: boolean;
  fields: { key: string; label: string; min: number; max: number; step: number; options?: number[] }[];
}
export interface PlanCatalog { plans: Plan[]; workbookTemplates: WorkbookTemplate[]; frequencies: Frequency[]; rounding: Rounding[] }
export type PlanInput = Partial<Omit<Plan, 'id' | 'revision' | 'seeded' | 'created_at' | 'updated_at'>>;

const BASE = '/api/admin/calculator/plans';
export const planService = {
  list: async (): Promise<PlanCatalog> => (await api.get(BASE)).data.data,
  create: async (data: PlanInput): Promise<Plan> => (await api.post(BASE, data)).data.data,
  update: async (id: string, data: PlanInput): Promise<Plan> => (await api.put(`${BASE}/${encodeURIComponent(id)}`, data)).data.data,
  remove: async (id: string): Promise<void> => { await api.delete(`${BASE}/${encodeURIComponent(id)}`); },
  insurers: async (): Promise<{ id: string; name: string }[]> => {
    const data = (await api.get('/api/admin/companies')).data?.data;
    const rows = Array.isArray(data) ? data : data?.companies || data?.items || data?.results || [];
    return rows.map((row: { id: string; name?: string; company_name?: string }) => ({ id: row.id, name: row.name || row.company_name || row.id }));
  },
};

export const FREQUENCY_LABELS: Record<Frequency, string> = { ANNUAL: 'Yearly', SEMI_ANNUAL: 'Half-yearly', QUARTERLY: 'Quarterly', SINGLE: 'Single premium' };
export const ROUNDING_LABELS: Record<Rounding, string> = {
  INSTALMENT: 'Split into instalments, then round (like 333 Endowment)',
  YEARLY_THEN_INSTALMENT: 'Round the yearly premium, then split and round (like 340 Bal Mamata)',
};

// Rate table <-> pasteable text. First row: label, then terms. Each next row: age, then rates.
// Tabs (pasted from Excel) or commas both work; a blank cell means "not offered".
export function rateTableToText(t: PlanFormula['rateTable']): string {
  return [['Age \\ Term', ...t.terms].join('\t'), ...t.ages.map((age, i) => [age, ...t.rates[i].map(r => (r === null ? '' : r))].join('\t'))].join('\n');
}
export function parseRateTable(text: string): PlanFormula['rateTable'] {
  const lines = text.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim() !== '');
  if (lines.length < 2) throw new Error('Paste a header row of terms and at least one row of rates.');
  const split = (line: string) => line.split(line.includes('\t') ? '\t' : ',').map(c => c.trim());
  const num = (cell: string, what: string) => { const n = Number(cell.replace(/,/g, '')); if (cell === '' || !Number.isFinite(n)) throw new Error(`${what} "${cell}" is not a number.`); return n; };
  const terms = split(lines[0]).slice(1).filter(c => c !== '').map(c => num(c, 'Term'));
  const ages: number[] = [], rates: (number | null)[][] = [];
  for (const line of lines.slice(1)) {
    const cells = split(line);
    ages.push(num(cells[0], 'Age'));
    if (cells.length - 1 > terms.length) throw new Error(`Row for age ${cells[0]} has more rates than there are terms.`);
    rates.push(terms.map((_, j) => (cells[j + 1] === undefined || cells[j + 1] === '' ? null : num(cells[j + 1], `Rate for age ${cells[0]}`))));
  }
  return { ages, terms, rates };
}
