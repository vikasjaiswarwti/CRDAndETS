// src/features/route-maker/Modals/AddEmployeeModal.tsx
import { useState } from "react";
import { T } from "../../constants/designTokens";
import type { AvailableEmployee } from "../../types/Shuttleapitypes";

interface Props {
  dsId: number;
  employees: AvailableEmployee[];
  isLoading: boolean;
  onAdd: (empId: number) => void;
  onClose: () => void;
}

export default function AddEmployeeModal({
  dsId,
  employees,
  isLoading,
  onAdd,
  onClose,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  const filtered = employees.filter(
    (e) =>
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      e.nodalPointName.toLowerCase().includes(search.toLowerCase()) ||
      String(e.empId).includes(search),
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          width: 420,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
              Add Employee to Trip
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              Trip #{dsId}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.muted,
              fontSize: 40,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: "12px 20px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <input
            autoFocus
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px",
              borderRadius: 6,
              border: `1px solid ${T.border}`,
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                color: T.muted,
                fontSize: 12,
                padding: 24,
              }}
            >
              Loading available employees…
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: T.muted,
                fontSize: 12,
                padding: 24,
              }}
            >
              No employees found
            </div>
          ) : (
            filtered.map((emp) => {
              const isSel = selectedEmpId === emp.empId;
              const isFemale = emp.gender === "F";
              return (
                <div
                  key={emp.empId}
                  onClick={() =>
                    setSelectedEmpId((p) =>
                      p === emp.empId ? null : emp.empId,
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    marginBottom: 4,
                    background: isSel ? "#EFF6FF" : "transparent",
                    border: `1.5px solid ${isSel ? "#3B82F6" : "transparent"}`,
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: isFemale ? "#FDF2F8" : "#EFF6FF",
                      border: `1.5px solid ${isFemale ? "#F9A8D4" : "#BFDBFE"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: isFemale ? "#BE185D" : "#1D4ED8",
                    }}
                  >
                    {isFemale ? "F" : "M"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: T.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.employeeName}
                    </div>
                    <div style={{ fontSize: 10, color: T.muted }}>
                      {`EMP-${emp.empId}`} · {emp.mobileNumber}
                    </div>
                  </div>
                  {isSel && (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#3B82F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#fff",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              border: `1px solid ${T.border}`,
              background: "#fff",
              color: T.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => selectedEmpId && onAdd(selectedEmpId)}
            disabled={!selectedEmpId || isLoading}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              border: "none",
              background: selectedEmpId && !isLoading ? T.accent : "#e5e7eb",
              color: selectedEmpId && !isLoading ? "#fff" : T.muted,
              fontSize: 12,
              fontWeight: 600,
              cursor: selectedEmpId && !isLoading ? "pointer" : "not-allowed",
            }}
          >
            {isLoading ? "Adding…" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
