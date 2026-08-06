import { useState, useEffect, useMemo, useCallback } from 'react';

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50];

export interface UsePaginationResult<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pageItems: T[];
  /** 1-based index of the first item on the current page (0 when empty). */
  startIndex: number;
  /** 1-based index of the last item on the current page (0 when empty). */
  endIndex: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
}

/**
 * Client-side pagination for an already-filtered array.
 *
 * Renders only one page worth of rows at a time, which keeps large data tables
 * responsive (no more rendering thousands of rows on a single page). Search and
 * filtering stay where they already are — this hook just slices the result.
 *
 * The page automatically clamps back into range when the underlying list shrinks
 * (e.g. after applying a filter or deleting rows).
 */
export function usePagination<T>(
  items: T[],
  initialPageSize: number = DEFAULT_PAGE_SIZE,
): UsePaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Keep the current page within range when the list size changes.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setPageSize = useCallback((s: number) => {
    setPageSizeState(s);
    setPage(1);
  }, []);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return {
    page,
    pageSize,
    total,
    totalPages,
    pageItems,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
  };
}

export default usePagination;
