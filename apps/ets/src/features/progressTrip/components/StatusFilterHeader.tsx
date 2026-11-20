import React, { useCallback } from "react";
import { Checkbox, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { FilterFilled } from "@ant-design/icons";
import { getStatusStyle } from "../hooks/useTripsInProgressTable";

// ── Status filter option groups ───────────────────────────────────────────────
export const STATUS_FILTER_OPTIONS: { label: string; codes: number[] }[] = [
  // { label: "Route Created",             codes: [1] },
  { label: "Published Not Yet Started", codes: [2] },
  { label: "Started",                   codes: [3] },
  // { label: "Completed",                 codes: [4, 5, 6] },
  // { label: "Cancelled",                 codes: [7, 9] },
];

export interface StatusFilterHeaderProps {
  selectedCodes: number[];
  onChange: (codes: number[]) => void;
}

const StatusFilterHeader: React.FC<StatusFilterHeaderProps> = ({
  selectedCodes,
  onChange,
}) => {
  const isActive = selectedCodes.length > 0;

  const toggleGroup = useCallback(
    (codes: number[], checked: boolean) => {
      const next = checked
        ? [...new Set([...selectedCodes, ...codes])]
        : selectedCodes.filter((c) => !codes.includes(c));
      onChange(next);
    },
    [selectedCodes, onChange],
  );

  const menuItems: MenuProps["items"] = [
    {
      key: "__header__",
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 6,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            Filter by Status
          </span>
          {isActive && (
            <span
              style={{ fontSize: 11, color: "#1D4ED8", cursor: "pointer", fontWeight: 500 }}
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
            >
              Clear all
            </span>
          )}
        </div>
      ),
      disabled: true,
    },

    ...STATUS_FILTER_OPTIONS.map((opt) => {
      const allChecked  = opt.codes.every((c) => selectedCodes.includes(c));
      const someChecked = !allChecked && opt.codes.some((c) => selectedCodes.includes(c));
      const { color, backgroundColor } = getStatusStyle(opt.codes[0]);

      return {
        key: opt.label,
        label: (
          <div
            style={{ display: "flex", alignItems: "center", gap: 4 }}
            onClick={(e) => { e.stopPropagation(); toggleGroup(opt.codes, !allChecked); }}
          >
            <Checkbox
              checked={allChecked}
              indeterminate={someChecked}
              onChange={(e) => {
                e.nativeEvent.stopImmediatePropagation();
                toggleGroup(opt.codes, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <span
              style={{
                fontSize: 10,
                color,
                backgroundColor,
                padding: "2px 6px",
                borderRadius: 10,
                fontWeight: 500,
              }}
            >
              {opt.label}
            </span>
          </div>
        ),
      };
    }),
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 13 }}>Trip Status</span>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomLeft"
        overlayStyle={{ minWidth: 248 }}
      >
        <FilterFilled
          style={{
            fontSize: 12,
            cursor: "pointer",
            color: isActive ? "#1D4ED8" : "#9CA3AF",
            transition: "color 0.15s",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
};

export default StatusFilterHeader;