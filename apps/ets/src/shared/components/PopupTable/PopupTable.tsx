// src/shared/components/AppTable/AppTable.tsx
import React from "react";

export interface AppTableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: number | string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface AppTableProps<T, K extends string | number = string | number> {
  columns: AppTableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string | number);

  // Selection
  selectable?: boolean;
  selectedKeys?: Set<K>;
  onToggleRow?: (key: K) => void;
  onToggleAll?: () => void;

  // Display
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  maxHeight?: number | string;
  striped?: boolean;

  // Row interaction
  onRowClick?: (row: T, index: number) => void;
  rowHighlight?: (row: T) => boolean;
}

const TH_STYLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#52796F",
  padding: "10px 12px",
  textAlign: "left",
  background: "#F0FAF4",
  borderBottom: "2px solid #B7E4C7",
  whiteSpace: "nowrap",
  letterSpacing: "0.04em",
  userSelect: "none",
};

const TD_STYLE: React.CSSProperties = {
  padding: "11px 12px",
  fontSize: 13,
  color: "#1B4332",
  borderBottom: "1px solid #E9F5EE",
  verticalAlign: "middle",
};

function getRowKey<T>(
  row: T,
  rowKey: keyof T | ((row: T) => string | number),
): string | number {
  return typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as any);
}

export function AppTable<T>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys,
  onToggleRow,
  onToggleAll,
  loading = false,
  loadingText = "Loading…",
  emptyText = "No data available",
  maxHeight = 420,
  striped = true,
  onRowClick,
  rowHighlight,
}: AppTableProps<T>) {
  const allSelected =
    selectable && selectedKeys && data.length > 0
      ? selectedKeys.size === data.length
      : false;

  const someSelected =
    selectable && selectedKeys
      ? selectedKeys.size > 0 && selectedKeys.size < data.length
      : false;

  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxHeight,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
          }}
        >
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr>
              {selectable && (
                <th style={{ ...TH_STYLE, width: 44, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onToggleAll}
                    style={{ accentColor: "#1B4332", cursor: "pointer" }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...TH_STYLE,
                    textAlign: col.align ?? "left",
                    width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{
                    ...TD_STYLE,
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#6B7280",
                    fontStyle: "italic",
                  }}
                >
                  {loadingText}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  style={{
                    ...TD_STYLE,
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#6B7280",
                    fontStyle: "italic",
                  }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const key = getRowKey(row, rowKey);
                const isSelected = selectable
                  ? (selectedKeys?.has(key) ?? false)
                  : false;
                const isHighlighted = rowHighlight ? rowHighlight(row) : false;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, i)}
                    style={{
                      background: isHighlighted
                        ? "#E9F5EE"
                        : isSelected
                          ? "#F0FAF4"
                          : striped && i % 2 !== 0
                            ? "#FAFAFA"
                            : "#FFFFFF",
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick)
                        (e.currentTarget as HTMLElement).style.background =
                          "#E9F5EE";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        isHighlighted
                          ? "#E9F5EE"
                          : isSelected
                            ? "#F0FAF4"
                            : striped && i % 2 !== 0
                              ? "#FAFAFA"
                              : "#FFFFFF";
                    }}
                  >
                    {selectable && (
                      <td style={{ ...TD_STYLE, textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleRow?.(key)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ accentColor: "#1B4332", cursor: "pointer" }}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          ...TD_STYLE,
                          textAlign: col.align ?? "left",
                          width: col.width,
                        }}
                      >
                        {col.render
                          ? col.render((row as any)[col.key], row, i)
                          : ((row as any)[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AppTable;
