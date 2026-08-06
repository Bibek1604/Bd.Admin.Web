import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '../../hooks/usePagination';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

/** Build a compact list of page numbers with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20 */
function buildPageList(current: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'gap')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);
  if (left > 2) pages.push('gap');
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < totalPages - 1) pages.push('gap');
  pages.push(totalPages);
  return pages;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = '',
}) => {
  if (total === 0) return null;

  const pages = buildPageList(page, totalPages);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      className={`mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/60 bg-white px-5 py-4 matte-shadow ${className}`}
    >
      {/* Range + page size */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm font-bold text-slate-500">
        <span>
          Showing <span className="text-slate-800">{startIndex.toLocaleString()}</span>–
          <span className="text-slate-800">{endIndex.toLocaleString()}</span> of{' '}
          <span className="text-slate-800">{total.toLocaleString()}</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none rounded-lg border border-slate-100 bg-slate-50 py-1.5 pl-3 pr-7 text-[13px] font-bold text-slate-600 outline-none hover:bg-white focus:border-brand-500/50 transition-all cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="px-1.5 text-slate-300 font-black select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-[13px] font-bold transition-all ${
                p === page
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-100'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
