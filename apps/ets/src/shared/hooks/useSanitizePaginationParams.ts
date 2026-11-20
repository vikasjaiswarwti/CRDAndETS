import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// sanitizePaginationParams
//
// Drop this ONE hook into your existing useTableState (or wherever you read
// URL params).  Nothing else in your codebase needs to change.
//
// What it does:
//   • pageSize must be in the allowlist  → else reset to defaultPageSize
//   • page must be a positive integer    → else reset to 1
//   • page must be ≤ MAX_PAGE            → else clamp to MAX_PAGE
//   • After API responds, page is also clamped against real totalCount
//
// Usage — add ONE line inside your existing useTableState hook:
//
//   useSanitizePaginationParams({ totalCount: data?.totalCount });
//
// That's it. All 100+ features get the fix automatically via useTableState.
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_PAGE_SIZES = [10, 20, 50];
const MAX_PAGE = 500;

interface Options {
  /** Pass data?.totalCount once the API responds — further clamps page to real max */
  totalCount?: number;
  /** Defaults to 10 */
  defaultPageSize?: number;
}

export function useSanitizePaginationParams({
  totalCount,
  defaultPageSize = 10,
}: Options = {}) {
    
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {

    const rawPage = searchParams.get("page");
    const rawPageSize = searchParams.get("pageSize");

    let changed = false;
    const next = new URLSearchParams(searchParams);

    // ── pageSize: must be in allowlist ──────────────────────────────────────
    if (rawPageSize !== null) {
      const n = Number(rawPageSize);
      if (!ALLOWED_PAGE_SIZES.includes(n)) {
        next.set("pageSize", String(defaultPageSize));
        changed = true;
      }
    }

    // ── page: must be a positive integer ≤ MAX_PAGE ─────────────────────────
    if (rawPage !== null) {
      const n = parseInt(rawPage, 10);
      const safePageSize = ALLOWED_PAGE_SIZES.includes(
        Number(next.get("pageSize")),
      )
        ? Number(next.get("pageSize"))
        : defaultPageSize;

      // Compute real max: use totalCount if available, else fall back to MAX_PAGE
      const realMax =
        totalCount && totalCount > 0
          ? Math.max(1, Math.ceil(totalCount / safePageSize))
          : MAX_PAGE;

      const clamped = !Number.isFinite(n) || n < 1 ? 1 : Math.min(n, realMax);

      if (String(clamped) !== rawPage) {
        next.set("page", String(clamped));
        changed = true;
      }
    }

    // Only push a history entry if something actually changed
    if (changed) {
      setSearchParams(next, { replace: true }); // replace = no extra back-button entry
    }
    // Re-run when totalCount arrives (clamps page against real data)
  }, [totalCount]); // eslint-disable-line react-hooks/exhaustive-deps
}
