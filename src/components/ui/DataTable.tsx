import React from 'react';
import { cn } from '../../utils/cn';

export interface Column<T> {
  /** Column heading. */
  header: string;
  /** Cell renderer. */
  cell: (row: T) => React.ReactNode;
  /** Right-align (use for the actions column). */
  align?: 'left' | 'right';
  /** Hide below the lg breakpoint to keep narrow screens readable. */
  hideBelowLg?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

/**
 * One table for every list page. Rows are plain <tr>s — the old per-page tables
 * animated each row in on scroll, which made long lists flicker on filter.
 */
export function DataTable<T>({ columns, rows, rowKey, onRowClick }: DataTableProps<T>) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-200 bg-surface-50">
              {columns.map((col) => (
                <th
                  key={col.header}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-medium text-slate-500 first:pl-5 last:pr-5',
                    col.align === 'right' && 'text-right',
                    col.hideBelowLg && 'hidden lg:table-cell',
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'transition-colors hover:bg-surface-50',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={cn(
                      'px-4 py-3 align-middle text-sm text-slate-700 first:pl-5 last:pr-5',
                      col.align === 'right' && 'text-right',
                      col.hideBelowLg && 'hidden lg:table-cell',
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Name + secondary line, the leftmost cell on every list page. */
export const PrimaryCell: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  avatar?: React.ReactNode;
}> = ({ title, subtitle, avatar }) => (
  <div className="flex items-center gap-3">
    {avatar}
    <div className="min-w-0">
      <div className="truncate font-medium text-slate-900">{title}</div>
      {subtitle && <div className="truncate text-xs text-slate-500">{subtitle}</div>}
    </div>
  </div>
);

/** Neutral monogram avatar — no gradients, no status dots. */
export const Monogram: React.FC<{ text: string }> = ({ text }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-100 text-xs font-medium text-slate-600">
    {text.slice(0, 2).toUpperCase()}
  </span>
);

/** Icon-only action button used in the trailing actions cell. */
export const RowAction: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }
> = ({ label, danger, className, ...props }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    {...props}
    className={cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] text-slate-400 transition-colors',
      danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-surface-100 hover:text-slate-700',
      className,
    )}
  />
);

export default DataTable;
