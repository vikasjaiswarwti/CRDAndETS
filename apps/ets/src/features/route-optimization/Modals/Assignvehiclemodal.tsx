// ─── components/AssignVehicleModal.tsx ────────────────────────────────────────
// Centered modal popup for assigning a vendor/vehicle to a route.
// Completely isolated — no dependency on route state beyond vehicleId prop.
//
// Usage:
//   <AssignVehicleModal
//     open={!!assignTarget}
//     routeId={assignTarget?.routeId ?? ''}
//     onClose={() => setAssignTarget(null)}
//     onAssign={(routeId, vendor, vehicleNo) => handleAssign(routeId, vendor, vehicleNo)}
//   />

import { useState, useEffect } from "react";
import { T } from "../constants/designTokens";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AssignVehicleModalProps {
  open: boolean;
  routeId: number;
  onClose: () => void;
  onAssign: (routeId: number, vendor: string, vehicleNo: string) => void;
}

// ─── Mock vendor + vehicle data (replace with RTK Query when API is ready) ────

const VENDORS = [
  { id: "wti", name: "WTI CABS" },
  { id: "meru", name: "Meru Cabs" },
  { id: "ola", name: "Ola Corporate" },
  { id: "uber", name: "Uber Business" },
];

const VEHICLES: Record<string, { no: string; type: string; seats: number }[]> =
  {
    wti: [
      { no: "MH12AB1234", type: "Innova", seats: 6 },
      { no: "MH12CD5678", type: "Sedan", seats: 4 },
    ],
    meru: [
      { no: "MH14EF9012", type: "Swift Dzire", seats: 4 },
      { no: "MH14GH3456", type: "Ertiga", seats: 6 },
    ],
    ola: [{ no: "MH01IJ7890", type: "Sedan", seats: 4 }],
    uber: [{ no: "MH02KL2345", type: "SUV", seats: 6 }],
  };

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignVehicleModal({
  open,
  routeId,
  onClose,
  onAssign,
}: AssignVehicleModalProps) {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedVendor("");
      setSelectedVehicle("");
      setSearch("");
    }
  }, [open]);

  if (!open) return null;

  const vehicles = selectedVendor ? (VEHICLES[selectedVendor] ?? []) : [];
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.no.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConfirm = () => {
    if (!selectedVendor || !selectedVehicle) return;
    const vendor =
      VENDORS.find((v) => v.id === selectedVendor)?.name ?? selectedVendor;
    onAssign(routeId, vendor, selectedVehicle);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 300,
          background: T.overlay,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          zIndex: 301,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 480,
          background: T.panel,
          borderRadius: T.radiusLg,
          boxShadow: T.shadowXl,
          display: "flex",
          flexDirection: "column",
          maxHeight: "80vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: T.fontLg,
                fontWeight: 700,
                color: T.text,
              }}
            >
              Assign Vehicle
            </h2>
            <p
              style={{ margin: "2px 0 0", fontSize: T.fontSm, color: T.muted }}
            >
              Route ID: {routeId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: T.muted,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Step 1: Vendor selection */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: T.fontSm,
                fontWeight: 600,
                color: T.textSm,
                display: "block",
                marginBottom: 8,
              }}
            >
              Select Vendor
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {VENDORS.map((v) => {
                const active = selectedVendor === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVendor(v.id);
                      setSelectedVehicle("");
                    }}
                    style={{
                      padding: "10px 14px",
                      borderRadius: T.radius,
                      cursor: "pointer",
                      border: `1.5px solid ${active ? T.accent : T.border}`,
                      background: active ? T.accentBg : T.panel,
                      color: active ? T.accent : T.textSm,
                      fontWeight: active ? 700 : 400,
                      fontSize: T.fontSm,
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Vehicle selection */}
          {selectedVendor && (
            <div>
              <label
                style={{
                  fontSize: T.fontSm,
                  fontWeight: 600,
                  color: T.textSm,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Select Vehicle
              </label>
              {/* Search */}
              <div style={{ position: "relative", marginBottom: 10 }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.muted}
                  strokeWidth="2"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by plate or type…"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 12px 8px 32px",
                    border: `1.5px solid ${T.border}`,
                    borderRadius: T.radius,
                    fontSize: T.fontSm,
                    color: T.text,
                    background: T.bg,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredVehicles.length === 0 && (
                  <p
                    style={{
                      color: T.muted,
                      fontSize: T.fontSm,
                      textAlign: "center",
                      padding: 16,
                    }}
                  >
                    No vehicles found
                  </p>
                )}
                {filteredVehicles.map((v) => {
                  const active = selectedVehicle === v.no;
                  return (
                    <button
                      key={v.no}
                      onClick={() => setSelectedVehicle(v.no)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: T.radius,
                        cursor: "pointer",
                        border: `1.5px solid ${active ? T.accent : T.border}`,
                        background: active ? T.accentBg : T.panel,
                        transition: "all 0.15s",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: T.fontBase,
                            fontWeight: 600,
                            color: active ? T.accent : T.text,
                          }}
                        >
                          {v.no}
                        </div>
                        <div style={{ fontSize: T.fontXs, color: T.muted }}>
                          {v.type}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: T.fontXs,
                          fontWeight: 600,
                          color: T.muted,
                          background: T.bg,
                          padding: "3px 8px",
                          borderRadius: T.radiusFull,
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        {v.seats} seats
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px 0",
              border: `1.5px solid ${T.border}`,
              background: T.panel,
              borderRadius: T.radius,
              fontSize: T.fontBase,
              fontWeight: 600,
              color: T.textSm,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVendor || !selectedVehicle}
            style={{
              flex: 2,
              padding: "9px 0",
              border: "none",
              background: selectedVehicle ? T.accent : T.border,
              borderRadius: T.radius,
              fontSize: T.fontBase,
              fontWeight: 700,
              color: selectedVehicle ? T.inverse : T.muted,
              cursor: selectedVehicle ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </>
  );
}
