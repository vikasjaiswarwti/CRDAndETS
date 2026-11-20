import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useReportTable } from "../hooks/useReportTable";

const C = {
  white: "#ffffff",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  gray100: "#F3F4F6",
  gray400: "#9CA3AF",
  gray700: "#374151",
};

interface ReportTableProps {
  data: Record<string, unknown>[];
  onExport?: () => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, onExport }) => {
  const { Table } = useUILibrary();
  const { columns, scrollX } = useReportTable(data);

  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 20px",
          borderBottom: `1px solid ${C.borderLight}`,
        }}
      >
        <span style={{ fontSize: 13, color: C.gray400 }}>
          <strong style={{ color: C.gray700 }}>{data.length}</strong> record
          {data.length !== 1 ? "s" : ""} found
        </span>

        <button
          onClick={onExport}
          style={{
            height: 32,
            padding: "0 14px",
            borderRadius: 999,
            border: `1px solid ${C.border}`,
            background: C.white,
            color: C.gray700,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      {/* Table */}
      <Table
        columns={columns as any[]}
        dataSource={data}
        rowKey={(row) => String(data.indexOf(row))}
        size="small"
        scroll={{ x: scrollX, y: 520 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total: number) => `${total} records`,
          //   style: { padding: "12px 20px" },
        }}
        style={{ fontSize: 12 }}
      />
    </div>
  );
};

export default ReportTable;
