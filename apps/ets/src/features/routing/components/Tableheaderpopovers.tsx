// src/features/routeManagement/components/TableHeaderPopovers.tsx
import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { LIGHT_POPOVER } from "../Routeuiconfig";

// ─────────────────────────────────────────────────────────────────────────────
// Base wrapper — hover info circle that opens a popover
// ─────────────────────────────────────────────────────────────────────────────

const InfoCircle = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke="#9CA3AF" strokeWidth="1.2" />
    <path
      d="M6 5v4M6 3.5v.5"
      stroke="#9CA3AF"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export const HeaderInfoPopover: React.FC<{ content: React.ReactNode }> = ({
  content,
}) => {
  const { Popover } = useUILibrary();
  return (
    <Popover
      {...LIGHT_POPOVER}
      content={content}
      title={null}
      trigger="hover"
      placement="top"
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginLeft: 4,
          cursor: "default",
          verticalAlign: "middle",
        }}
      >
        <InfoCircle />
      </span>
    </Popover>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Route Planning panel — column header popovers
// ─────────────────────────────────────────────────────────────────────────────

export const ShiftHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 210,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Shifts
        </div>
        All open shifts for this date where employees have filled the roster and
        are ready for route planning.
      </div>
    }
  />
);

export const EmployeesHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 210,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Employees
        </div>
        Click the count to view all employees registered in this shift's roster.
      </div>
    }
  />
);

export const VehicleVendorRoutePlanningHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 230,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Vehicle / Vendor / Route
        </div>
        <div
          style={{
            display: "inline-flex",
            gap: 6,
            fontWeight: 700,
            color: "#0F172A",
            background: "#F1F5F9",
            borderRadius: 6,
            padding: "2px 10px",
            marginBottom: 6,
            fontSize: 13,
          }}
        >
          1 / 1 / 3
        </div>
        <div>
          <strong>1</strong> vehicle and <strong>1</strong> vendor have been
          assigned across <strong>3</strong> routes for this shift.
        </div>
      </div>
    }
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// Trip Publishing panel — column header popovers
// ─────────────────────────────────────────────────────────────────────────────

export const TotalEmpHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 210,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Total Employees
        </div>
        Total number of employees included in trip sheets for this shift,
        including adhoc bookings.
      </div>
    }
  />
);

export const OccupancyHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 210,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Occupancy
        </div>
        Average seat occupancy across all vehicles in this shift — shows how
        efficiently cab capacity is being used.
      </div>
    }
  />
);

export const VehicleVendorTripsheetHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 230,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Vehicle / Vendor / Tripsheet
        </div>
        <div
          style={{
            display: "inline-flex",
            gap: 6,
            fontWeight: 700,
            color: "#0F172A",
            background: "#F1F5F9",
            borderRadius: 6,
            padding: "2px 10px",
            marginBottom: 6,
            fontSize: 13,
          }}
        >
          1 / 1 / 3
        </div>
        <div>
          <strong>1</strong> vehicle assigned, <strong>1</strong> vendor
          assigned, <strong>3</strong> trip sheets generated for this shift.
        </div>
      </div>
    }
  />
);

export const GuardHeaderPopover = () => (
  <HeaderInfoPopover
    content={
      <div
        style={{
          maxWidth: 200,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 3 }}>
          Male / Female / Guard
        </div>
        Breakdown of guard trips assigned for this shift by gender category.
      </div>
    }
  />
);
