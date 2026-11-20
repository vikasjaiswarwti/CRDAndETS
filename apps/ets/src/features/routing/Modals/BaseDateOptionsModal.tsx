// src/features/routeManagement/modals/components/BaseDateOptionsModal.tsx
import React, { useState, useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { BaseDateOptionsPayload } from "../types/RouteTypes";

interface DayWiseAnalysis {
  pastDate: string;
  totalRoutedOnPastDate: number;
  commonEmployees: number;
  newEmployees: number;
  matchPercentage: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  payload: BaseDateOptionsPayload;
  onSelect: (date: string) => void;
  analysisData?: DayWiseAnalysis[];
  isLoading?: boolean;
}

export const BaseDateOptionsModal: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
  analysisData = [],
  isLoading = false,
}) => {
  const { Modal, Button } = useUILibrary();
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Auto-select first row when data loads
  useEffect(() => {
    if (analysisData.length > 0 && !selectedDate) {
      setSelectedDate(analysisData[0].pastDate);
    }
  }, [analysisData, selectedDate]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!open) setSelectedDate("");
  }, [open]);

  const handleSave = () => {
    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={640}
      footer={null}
      destroyOnClose
      zIndex={1100}
      title={
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1B4332" }}>
            Base Date Options
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Select a previous date to copy routes from
          </div>
        </div>
      }
      style={{ top: 50 }}
    >
      <div style={{ padding: "8px 0" }}>
        {isLoading ? (
          <div style={emptyStateStyle}>Loading base date options…</div>
        ) : analysisData.length === 0 ? (
          <div style={{ ...emptyStateStyle, fontStyle: "italic" }}>
            No previous base date options available
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              maxHeight: 420,
              border: "1px solid #E5E7EB",
              borderRadius: 8,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {/* Radio col */}
                  <th
                    style={{
                      width: 40,
                      background: "#F0FAF4",
                      borderBottom: "2px solid #B7E4C7",
                    }}
                  />
                  <Th>Past Date</Th>
                  <Th align="right">Total Routed</Th>
                  <Th align="right">Common Emp.</Th>
                  <Th align="right">New Emp.</Th>
                  <Th align="right">Match %</Th>
                </tr>
              </thead>
              <tbody>
                {analysisData.map((row, i) => {
                  const isSelected = selectedDate === row.pastDate;
                  return (
                    <tr
                      key={i}
                      style={{
                        background: isSelected
                          ? "#E9F5EE"
                          : i % 2 === 0
                            ? "#FFFFFF"
                            : "#FAFAFA",
                        cursor: "pointer",
                        borderTop: "1px solid #F3F4F6",
                        transition: "background 0.15s",
                      }}
                      onClick={() => setSelectedDate(row.pastDate)}
                    >
                      <td style={{ padding: "10px 8px", textAlign: "center" }}>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => setSelectedDate(row.pastDate)}
                          style={{ accentColor: "#1B4332", cursor: "pointer" }}
                        />
                      </td>
                      <td style={cellStyle}>{row.pastDate}</td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>
                        {row.totalRoutedOnPastDate}
                      </td>
                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {row.commonEmployees}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>
                        {row.newEmployees}
                      </td>
                      <td style={{ ...cellStyle, textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background:
                              row.matchPercentage >= 80
                                ? "#DCFCE7"
                                : row.matchPercentage >= 50
                                  ? "#FEF9C3"
                                  : "#FEE2E2",
                            color:
                              row.matchPercentage >= 80
                                ? "#166534"
                                : row.matchPercentage >= 50
                                  ? "#713F12"
                                  : "#991B1B",
                          }}
                        >
                          {row.matchPercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <Button onClick={onClose} style={{ borderRadius: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!selectedDate}
            style={{
              borderRadius: 8,
              background: "#1B4332",
              borderColor: "#1B4332",
              paddingInline: 32,
            }}
          >
            Select &amp; Use This Date
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Helpers ── */

const Th: React.FC<{ children: React.ReactNode; align?: "left" | "right" }> = ({
  children,
  align = "left",
}) => (
  <th
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#52796F",
      padding: "10px 12px",
      textAlign: align,
      background: "#F0FAF4",
      borderBottom: "2px solid #B7E4C7",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </th>
);

const cellStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
};

const emptyStateStyle: React.CSSProperties = {
  padding: "40px 20px",
  textAlign: "center",
  color: "#6B7280",
};
