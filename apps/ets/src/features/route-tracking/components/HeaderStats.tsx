import React, { memo, useState, type FC, type SVGProps } from "react";
import { Button } from "antd";
type IconType = FC<SVGProps<SVGSVGElement>>;

import { colors } from "../style/styles";
import { FileTextOutlined, MoreOutlined } from "@ant-design/icons";
import { useLazyGetIvrRecordingsQuery } from "../services/routeTrackingApi";
import IvrRecordingsModal from "./IvrRecordingsModal";

import {
  IconCapacity,
  IconBoarded,
  IconsYetToBoard,
  IconSeat,
  IconPlanned,
  IconSignIn,
  IconRNoShow,
  IconAdhoc,
} from "../../../assets/dashboard/index";
import type { TripPassenger, TripResponse } from "../types/tracking.types";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { selectRoles } from "../../navigation/slices/navigationSlice";
import { useSelector } from "react-redux";

export const statIcons: Record<string, IconType> = {
  capacity: IconCapacity,
  boarded: IconBoarded,
  yetToBoard: IconsYetToBoard,
  seat: IconSeat,
  planned: IconPlanned,
  signin: IconSignIn,
  noshow: IconRNoShow,
  adhoc: IconAdhoc,
};

// ── StatChip ─────────────────────────────────────────────────
interface statProp {
  key?: string;
  label: string;
  value: string | number;
  icon: string;
}

interface StatsRowProps {
  stats: statProp[];
}

const StatChip: React.FC<statProp> = memo(({ label, value, icon = "" }) => {
  const IconStat: IconType = statIcons[icon];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        background: colors.white,
        borderRadius: 6,
        fontSize: 12,
        whiteSpace: "nowrap",
      }}
    >
      <span className="max-md:hidden">
        <IconStat width={13} height={13} />
      </span>
      <span style={{ color: colors.gray600, fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 600, color: colors.success }}>{value}</span>
    </div>
  );
});

const Pipe = () => <span style={{ fontSize: 11, color: "#E8E8E8" }}>|</span>;

// ── HeaderStats ───────────────────────────────────────────────
const HeaderStats: React.FC<{
  data: TripResponse;
  employeeAttendenceOpen: () => void;
  isDrop: boolean;
  passengers: TripPassenger[];
}> = ({ data, employeeAttendenceOpen, isDrop = false, passengers }) => {
  const isMobile = useIsMobile();
  const roles = useSelector(selectRoles);
  const isEmployee = roles.includes("employee");

  const totalPassengers = passengers.length;

  const [ivrOpen, setIvrOpen] = useState(false);
  const [triggerIvr, { data: ivrData = [], isFetching: ivrLoading }] =
    useLazyGetIvrRecordingsQuery();

  const openIvrModal = () => {
    setIvrOpen(true);
    triggerIvr({ dsId: data.dsId });
  };

  const signInCount = passengers.filter((p) => p.empSigninTime !== null).length;
  const signOutCount = passengers.filter(
    (p) => p.empSignOutTime !== null,
  ).length;
  const noShowCount = passengers.filter((p) => p.noShow === true).length;

  // ── Desktop: two full rows ────────────────────────────────────
  const topStats = [
    {
      key: "capacity",
      label: "Capacity",
      value: data.cabCapacity,
      icon: "capacity",
    },
    {
      key: "boarded",
      label: "Boarded",
      value: data.boardedCount,
      icon: "boarded",
    },
    {
      key: "yetToBoard",
      label: isDrop ? "Yet to deboard" : "Yet to board",
      value: isDrop
        ? totalPassengers - signOutCount
        : totalPassengers - signInCount - noShowCount,
      icon: "yetToBoard",
    },
    {
      key: "spareSeat",
      label: "Spare seat",
      value: data.spareSeatCount,
      icon: "seat",
    },
  ];

  const bottomStats = [
    {
      key: "planned",
      label: "Planned",
      value: totalPassengers,
      icon: "planned",
    },
    {
      key: "signIn",
      label: isDrop ? "Sign out" : "Sign in",
      value: isDrop ? signOutCount : signInCount,
      icon: "signin",
    },
    { key: "noShow", label: "No Show", value: noShowCount, icon: "noshow" },
    { key: "adhoc", label: "Adhoc", value: data.adhocCount, icon: "adhoc" },
  ];

  // ── Mobile: single condensed row — key fields only ────────────
  const mobileStats = [
    {
      key: "capacity",
      label: "Capacity",
      value: data.cabCapacity,
      icon: "capacity",
    },
    {
      key: "planned",
      label: "Planned",
      value: totalPassengers,
      icon: "planned",
    },
    {
      key: "signIn",
      label: isDrop ? "Sign out" : "Sign in",
      value: isDrop ? signOutCount : signInCount,
      icon: "signin",
    },
    { key: "noShow", label: "No Show", value: noShowCount, icon: "noshow" },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 6 : 8,
          padding: "10px 0px",
          flexWrap: isMobile ? "nowrap" : "wrap",
          flexShrink: 0,
        }}
      >
        {isMobile ? (
          // ── Mobile: scrollable condensed row + IVR button only ──
          <>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
              }}
            >
              <StatsRow stats={mobileStats} />
            </div>

            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                padding: 0,
                borderRadius: 6,
                border: `1px solid ${colors.gray200}`,
                background: colors.white,
                flexShrink: 0,
              }}
              onClick={openIvrModal}
            />
          </>
        ) : (
          // ── Desktop: two full stat rows + IVR + attendance link ──
          <>
            <StatsRow stats={topStats} />
            <StatsRow stats={bottomStats} />
            {!isEmployee && (
              <>
                <Button
                  type="text"
                  icon={<MoreOutlined style={{ fontSize: 16 }} />}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    padding: 0,
                    borderRadius: 6,
                    border: `1px solid ${colors.gray200}`,
                    background: colors.white,
                    flexShrink: 0,
                  }}
                  onClick={openIvrModal}
                />

                <button
                  onClick={employeeAttendenceOpen}
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 6,
                    fontSize: 12,
                    color: colors.success,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <FileTextOutlined />
                  Employee Attendance Report
                </button>
              </>
            )}
          </>
        )}
      </div>

      <IvrRecordingsModal
        open={ivrOpen}
        onClose={() => setIvrOpen(false)}
        recordings={ivrData}
        loading={ivrLoading}
        passengers={passengers}
      />
    </>
  );
};

// ── StatsRow ──────────────────────────────────────────────────
const StatsRow = ({ stats }: StatsRowProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: colors.white,
        border: `1px solid ${colors.gray200}`,
        borderRadius: 6,
        width: "max-content",
      }}
    >
      {stats.map((s, index) => (
        <React.Fragment key={s.label}>
          <StatChip {...s} />
          {index !== stats.length - 1 && <Pipe />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default HeaderStats;
