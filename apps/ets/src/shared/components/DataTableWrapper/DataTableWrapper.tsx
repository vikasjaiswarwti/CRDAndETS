// src/shared/components/DataTableWrapper/DataTableWrapper.tsx
//
// ─── PURPOSE ─────────────────────────────────────────────────────────────────
//  Thin layout shell that sits between PageContainer and the table.
//  Handles:
//    • Optional search bar (green-accented Input.Search)
//    • Optional custom pagination slot (pass null to let AppTable handle its own)
//    • White card surface with rounded corners + subtle shadow
//    • Overflow hidden so table header sticks cleanly inside the card
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode, CSSProperties } from "react";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";

interface DataTableWrapperProps {
  /** Show / hide the search bar */
  showSearch?: boolean;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Called when the user types or submits a search */
  onSearch?: (value: string) => void;
  /** Current controlled search value */
  searchValue?: string;
  /**
   * Custom pagination element.
   * Pass `null` to hide the pagination row entirely
   * (use when AppTable handles its own built-in pagination).
   */
  pagination?: ReactNode | null;
  /** Extra elements rendered in the search row (e.g. filter dropdowns) */
  searchRowExtra?: ReactNode;
  /** Main content: ApiStateWrapper > AppTable */
  children: ReactNode;
  /** Override card style */
  style?: CSSProperties;
}

/**
 * DataTableWrapper
 *
 * Wraps every table in a white rounded card. Optionally renders a
 * search bar above the table. Pagination is either external (pass a node)
 * or handled internally by AppTable (pass null or omit).
 */
export const DataTableWrapper = ({
  showSearch = false,
  searchPlaceholder = "Search…",
  onSearch,
  searchValue,
  searchRowExtra,
  children,
  style,
}: DataTableWrapperProps) => {
  const { Input } = useUILibrary();
  const { Search } = Input as any; // antd Input.Search via adapter

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, ...style }}
    >
      {/* ── Optional search + extra controls row ──────────────────────────── */}
      {(showSearch || searchRowExtra) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {showSearch && Search && (
            <Search
              placeholder={
                searchPlaceholder || "Search by registration no, make, ..."
              }
              //   allowClear
              value={searchValue}
              // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              //   onSearch?.(e.target.value)
              // }
              // onSearch={onSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;

                // Update state (if you're controlling it outside)
                if (value.length > 2) {
                  onSearch?.(value);
                } else if (value.length === 0) {
                  // Optional: reset search when cleared
                  onSearch?.("");
                }
              }}
              onSearch={(value:string) => {
                if (value.length > 2) {
                  onSearch?.(value);
                }
              }}
              style={{
                width: 420, // Increased width to look more natural
                borderRadius: 0,
                backgroundColor: "#f0fdf4", // Light green background
              }}
              className="dt-search"
            />
          )}
          {searchRowExtra}
        </div>
      )}

      {/* ── Table card surface ────────────────────────────────────────────── */}
      <div>{children}</div>
    </div>
  );
};

export default DataTableWrapper;
