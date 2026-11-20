// -----------------------------------------------------------------------------------------------------------

// src/shared/hooks/useTableState.ts
// ─────────────────────────────────────────────────────────────────────────────
// Manages table pagination, sort, and filter state.
// Optional: syncs to URL search params so browser back/forward works correctly.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { TableState } from "../components/AppTable/AppTable";
import { DEFAULT_TABLE_STATE } from "../components/AppTable/AppTable";

// ── Sanitization constants ────────────────────────────────────────────────────
const ALLOWED_PAGE_SIZES = [10, 20, 50];
const MAX_PAGE = 500;

interface UseTableStateOptions {
  /** Persist page / pageSize / sort to URL query params */
  syncUrl?: boolean;
  /** Initial values — merged with defaults */
  initial?: Partial<TableState>;
  /** Default page size */
  defaultPageSize?: number;
  /**
   * Pass data?.totalCount from your API response.
   * When provided, page is further clamped to the real last page.
   * e.g. useTableState({ syncUrl: true, totalCount: data?.totalCount })
   */
  totalCount?: number;
}

type SetTableState = (
  update: Partial<TableState> | ((prev: TableState) => TableState),
) => void;

export function useTableState(
  options: UseTableStateOptions = {},
): [TableState, SetTableState] {
  const {
    syncUrl = false,
    initial = {},
    defaultPageSize = 20,
    totalCount,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  // ── Sanitize raw URL values before they reach any component or API call ────
  const parseFromUrl = useCallback((): TableState => {
    const rawPage = searchParams.get("page");
    const rawPageSize = searchParams.get("pageSize");

    // pageSize: must be in allowlist
    const parsedSize = Number(rawPageSize ?? defaultPageSize);
    const safePageSize = ALLOWED_PAGE_SIZES.includes(parsedSize)
      ? parsedSize
      : defaultPageSize;

    // page: positive integer, hard ceiling MAX_PAGE, soft ceiling from totalCount
    const parsedPage = parseInt(rawPage ?? "1", 10);
    const realMax =
      totalCount && totalCount > 0
        ? Math.max(1, Math.ceil(totalCount / safePageSize))
        : MAX_PAGE;
    const safePage =
      !Number.isFinite(parsedPage) || parsedPage < 1
        ? 1
        : Math.min(parsedPage, realMax);

    return {
      page: safePage,
      pageSize: safePageSize,
      sortField: searchParams.get("sortField") ?? undefined,
      sortOrder:
        (searchParams.get("sortOrder") as TableState["sortOrder"]) ?? null,
    };
  }, [searchParams, defaultPageSize, totalCount]);

  // ── Correct the URL silently if it had invalid values ─────────────────────
  // Runs on mount and again when totalCount arrives (real last-page clamp)
  useEffect(() => {
    if (!syncUrl) return;

    const sanitized = parseFromUrl();
    const rawPage = searchParams.get("page");
    const rawPageSize = searchParams.get("pageSize");

    const needsFix =
      (rawPage !== null && String(sanitized.page) !== rawPage) ||
      (rawPageSize !== null && String(sanitized.pageSize) !== rawPageSize);

    if (needsFix) {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(sanitized.page));
      params.set("pageSize", String(sanitized.pageSize));
      setSearchParams(params, { replace: true }); // no extra history entry
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, totalCount]); // totalCount re-runs once API responds

  // ── In-memory state (non-URL mode) ────────────────────────────────────────
  const [inMemoryState, setInMemoryState] = useState<TableState>(() => ({
    ...DEFAULT_TABLE_STATE,
    pageSize: defaultPageSize,
    ...initial,
  }));

  const setState: SetTableState = useCallback(
    (update) => {
      if (syncUrl) {
        const prev = parseFromUrl();
        const next =
          typeof update === "function" ? update(prev) : { ...prev, ...update };

        // Sanitize writes too — user can't set pageSize=999 programmatically either
        const safePageSize = ALLOWED_PAGE_SIZES.includes(next.pageSize)
          ? next.pageSize
          : defaultPageSize;
        const safePage = Math.max(1, Math.min(next.page ?? 1, MAX_PAGE));

        const params = new URLSearchParams(searchParams);
        params.set("page", String(safePage));
        params.set("pageSize", String(safePageSize));
        if (next.sortField) params.set("sortField", next.sortField);
        else params.delete("sortField");
        if (next.sortOrder) params.set("sortOrder", next.sortOrder);
        else params.delete("sortOrder");
        setSearchParams(params, { replace: true });
      } else {
        setInMemoryState((prev) =>
          typeof update === "function" ? update(prev) : { ...prev, ...update },
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncUrl, searchParams, defaultPageSize],
  );

  return [syncUrl ? parseFromUrl() : inMemoryState, setState];
}

// ── Convenience: derive RTK Query args from table state ───────────────────────
export interface PaginatedQueryArgs {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export function tableStateToQueryArgs(
  state: TableState,
  extra?: Record<string, unknown>,
): PaginatedQueryArgs {
  return {
    page: state.page,
    pageSize: state.pageSize,
    sortBy: state.sortField,
    sortOrder:
      state.sortOrder === "ascend"
        ? "asc"
        : state.sortOrder === "descend"
          ? "desc"
          : undefined,
    ...extra,
  };
}
