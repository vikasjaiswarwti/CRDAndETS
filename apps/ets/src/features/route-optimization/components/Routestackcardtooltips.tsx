// ─── components/RouteStackCardTooltips.tsx ────────────────────────────────────
// All hover-Popover content definitions for RouteStackCard.
// Import `buildCardTooltips` in RouteStackCard — nothing else needed.

import {
  Users,
  User,
  Building2,
  Car,
  Shield,
  Accessibility,
  Pin,
  PinOff,
  Flag,
  CheckCircle2,
  Circle,
  UserPlus,
  MapPin,
  Info,
  AlertTriangle,
  Bus,
  ClipboardList,
  Phone,
} from "lucide-react";
import type { VehicleRoute } from "../types/Routemaker.types";

export interface CardTooltipCtx {
  route: VehicleRoute;
  isFlagged: boolean;
  isApproved: boolean;
  isPinned: boolean;
  hasVendor: boolean;
  vendorName: string | undefined;
}

export type CardTooltips = Record<
  | "female"
  | "passengerCount"
  | "vendor"
  | "guard"
  | "specialNeeds"
  | "pin"
  | "flag"
  | "approve"
  | "adhoc"
  | "info",
  React.ReactNode
>;

// ── Micro helpers ─────────────────────────────────────────────────────────────

function Row({
  icon,
  label,
  sub,
  iconColor = "#6B7280",
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  sub?: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 5,
        padding: "3px 0",
        borderBottom: "1px solid #F9FAFB",
      }}
    >
      <span
        style={{
          color: iconColor,
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </span>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#111827",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 9,
              color: "#6B7280",
              marginTop: 1,
              lineHeight: 1.4,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function Wrap({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 200, padding: "1px 0" }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#9CA3AF",
          letterSpacing: "0.06em",
          marginBottom: 4,
          textTransform: "uppercase" as const,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildCardTooltips(ctx: CardTooltipCtx): CardTooltips {
  const { route, isFlagged, isApproved, isPinned, hasVendor, vendorName } = ctx;
  const pax = route.TotalSeatUsed ?? 0;

  return {
    // ── ♀ Female badge ──────────────────────────────────────────────────────
    female: (
      <Wrap title="Female Trip">
        <Row
          icon={<User size={11} />}
          iconColor="#EC4899"
          label="This is female- trip"
          sub="All passengers are female employees. Special safety protocols may apply."
        />
        <Row
          icon={<Bus size={11} />}
          iconColor="#EC4899"
          label={`${pax} female passenger${pax === 1 ? "s" : ""} assigned`}
          sub="Escort or female supervisor may be required by policy."
        />
      </Wrap>
    ),

    // ── Passenger count pill ────────────────────────────────────────────────
    passengerCount: (
      <Wrap title="Passengers">
        <Row
          icon={<Users size={11} />}
          iconColor="#6366F1"
          label={`${pax} passenger${pax !== 1 ? "s" : ""} on this trip`}
          sub={
            route.Passengers?.map((p) => p.Firstname).join(", ") ||
            "No names available."
          }
        />
        {hasVendor ? (
          <Row
            icon={<Building2 size={11} />}
            iconColor="#10B981"
            label={`Vendor: ${vendorName}`}
            sub="This vendor is responsible for the vehicle and driver on this route."
          />
        ) : (
          <Row
            icon={<AlertTriangle size={11} />}
            iconColor="#F59E0B"
            label="No vendor assigned yet"
            sub="Click 'Assign' to assign a vendor, vehicle, and driver."
          />
        )}
      </Wrap>
    ),

    // ── Vendor name / Assign button ─────────────────────────────────────────
    vendor: (
      <Wrap title="Vendor Assignment">
        {hasVendor ? (
          <>
            <Row
              icon={<CheckCircle2 size={11} />}
              iconColor="#10B981"
              label={`Assigned to: ${vendorName}`}
              sub="Vendor is confirmed. Use the Assign Vendor button in the header to reassign."
            />
            {route.vehicleRegNo && (
              <Row
                icon={<Car size={11} />}
                iconColor="#6366F1"
                label={`Vehicle: ${route.vehicleRegNo}`}
              />
            )}
            {route.driverName && (
              <Row
                icon={<User size={11} />}
                iconColor="#6366F1"
                label={`Driver: ${route.driverName}`}
                sub={route.driverMobile ?? undefined}
              />
            )}
          </>
        ) : (
          <>
            <Row
              icon={<AlertTriangle size={11} />}
              iconColor="#F59E0B"
              label="No vendor assigned"
              sub="Click 'Assign' to open the vendor allocation wizard and lock in a vendor, vehicle, and driver."
            />
            <Row
              icon={<ClipboardList size={11} />}
              iconColor="#6B7280"
              label="What happens after assigning?"
              sub="The vendor is notified and vehicle + driver details are linked to this trip."
            />
          </>
        )}
      </Wrap>
    ),

    // ── Guard badge ─────────────────────────────────────────────────────────
    guard: (
      <Wrap title="Guard Allocated">
        <Row
          icon={<Shield size={11} />}
          iconColor="#7C3AED"
          label="A guard / escort is allocated"
          sub="This trip has a security guard or female escort — typically required for night or female-only routes."
        />
      </Wrap>
    ),

    // ── Special needs ───────────────────────────────────────────────────────
    specialNeeds: (
      <Wrap title="Special Needs">
        <Row
          icon={<Accessibility size={11} />}
          iconColor="#F59E0B"
          label="Passenger with special needs"
          sub="At least one employee requires special assistance. Ensure the vehicle is accessibility-friendly."
        />
      </Wrap>
    ),

    // ── Pin button ──────────────────────────────────────────────────────────
    pin: (
      <Wrap title="Pin Trip">
        {isPinned ? (
          <Row
            icon={<PinOff size={11} />}
            iconColor="#F59E0B"
            label="This trip is pinned"
            sub="Pinned trips always appear at the top of the Route Stack. Click to unpin."
          />
        ) : (
          <Row
            icon={<Pin size={11} />}
            iconColor="#6B7280"
            label="Click to pin this trip"
            sub="Keeps this trip at the top during large sessions. Up to 5 sessions are remembered."
          />
        )}
      </Wrap>
    ),

    // ── Flag button ─────────────────────────────────────────────────────────
    flag: (
      <Wrap title="Flag Trip">
        {isFlagged ? (
          <Row
            icon={<Flag size={11} />}
            iconColor="#EF4444"
            label="This trip is flagged"
            sub="Flagged trips are marked for review or attention. Click to unflag."
          />
        ) : (
          <Row
            icon={<Flag size={11} />}
            iconColor="#6B7280"
            label="Click to flag this trip"
            sub="Flags mark trips that need review or follow-up. Use the Flag filter to find all flagged trips."
          />
        )}
      </Wrap>
    ),

    // ── Approve button ──────────────────────────────────────────────────────
    approve: (
      <Wrap title="Trip Approval">
        {isApproved ? (
          <Row
            icon={<CheckCircle2 size={11} />}
            iconColor="#10B981"
            label="This trip is approved"
            sub="Route confirmed and ready for dispatch. Click to revoke approval."
          />
        ) : (
          <>
            <Row
              icon={<Circle size={11} />}
              iconColor="#6B7280"
              label="Click to approve this trip"
              sub="Approving confirms the route is correct and ready for dispatch to the vendor."
            />
            {!hasVendor && (
              <Row
                icon={<AlertTriangle size={11} />}
                iconColor="#F59E0B"
                label="Vendor not assigned"
                sub="Consider assigning a vendor before approving."
              />
            )}
          </>
        )}
      </Wrap>
    ),

    // ── Adhoc add (+) button ────────────────────────────────────────────────
    adhoc: (
      <Wrap title="Add Adhoc Passenger">
        <Row
          icon={<UserPlus size={11} />}
          iconColor="#10B981"
          label="Add an adhoc passenger"
          sub="Opens the adhoc modal to add a new employee to this trip. The route will be recalculated."
        />
        <Row
          icon={<MapPin size={11} />}
          iconColor="#6366F1"
          label="Route will update"
          sub="Distance, duration, and ETA stats refresh after the new pickup point is added."
        />
      </Wrap>
    ),

    // ── Info (ℹ) button ─────────────────────────────────────────────────────
    info: (
      <Wrap title="Trip Details">
        <Row
          icon={<Info size={11} />}
          iconColor="#6366F1"
          label="Click to view full trip details"
          sub="Shows vendor, vehicle reg, driver name & contact, allocation status, special needs, flap number."
        />
        {route.vendorName && (
          <Row
            icon={<Building2 size={11} />}
            iconColor="#10B981"
            label={`Vendor: ${route.vendorName}`}
          />
        )}
        {route.vehicleRegNo && (
          <Row
            icon={<Car size={11} />}
            iconColor="#6366F1"
            label={`Vehicle: ${route.vehicleRegNo}`}
          />
        )}
        {route.driverName && (
          <Row
            icon={<User size={11} />}
            iconColor="#6366F1"
            label={`Driver: ${route.driverName}`}
          />
        )}
        {route.driverMobile && (
          <Row
            icon={<Phone size={11} />}
            iconColor="#6B7280"
            label={route.driverMobile}
          />
        )}
      </Wrap>
    ),
  };
}
