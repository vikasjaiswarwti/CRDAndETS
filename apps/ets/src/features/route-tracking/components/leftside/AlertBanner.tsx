// ============================================================
// components/AlertBanner.tsx
// ============================================================

import React from "react";
import type { AlertBannerProps } from "../../types/tracking.types";
import { colors } from "../../style/styles";
// import { InfoOutlined } from "@ant-design/icons";

const AlertBanner: React.FC<AlertBannerProps> = ({ message }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "4px 8px",
      background: colors.warningLight,
      border: `1px solid ${colors.warningBorder}`,
      borderRadius: 20,
      fontSize: 11,
    }}
  >
    {/* Icon circle */}
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: colors.danger,
        color:"#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize:11,
      }}
    >
     i{/* <InfoOutlined /> */}
    </div>

    <span style={{ fontWeight: 600, color: colors.danger }}>{message}</span>
  </div>
);

export default AlertBanner;
