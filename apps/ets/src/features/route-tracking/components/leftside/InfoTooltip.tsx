import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface TooltipField {
  label: string;
  value: React.ReactNode;
}

interface InfoTooltipProps {
  // Option 1: pass structured fields
  fields?: TooltipField[];
  // Option 2: pass raw HTML/JSX
  content?: React.ReactNode;
  // Option 3: pass a custom icon
  icon?: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  iconColor?: string;
  iconSize?: number | string; // ✅ add this
}

const InfoTooltip = ({
  fields,
  content,
  icon,
  placement = "top",
  iconColor = "#3b82f6",
  iconSize = 11,
}: InfoTooltipProps) => {
  const tooltipContent =
    content ??
    (fields && (
      <div style={{ fontSize: 11, }}>
        {fields.map(({ label, value }) => (
          <div key={label}>
            <span style={{ opacity: 0.75 }}>{label}: </span>
            <strong>{value ?? "—"}</strong>
          </div>
        ))}
      </div>
    ));

  return (
    <Tooltip placement={placement} title={tooltipContent}>
      <span style={{ color: iconColor, cursor: "pointer", lineHeight: 1 }}>
        {icon ? (
          <span
            style={{ cursor: "pointer", lineHeight: 1, fontSize: iconSize }}
          >
            {icon}
          </span>
        ) : (
          <span
            style={{
              color: iconColor,
              cursor: "pointer",
              lineHeight: 1,
              fontSize: iconSize,
            }}
          >
            <InfoCircleOutlined />
          </span>
        )}
      </span>
    </Tooltip>
  );
};

export default InfoTooltip;
