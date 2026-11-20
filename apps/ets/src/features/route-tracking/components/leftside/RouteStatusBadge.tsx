
// ============================================================
// components/RouteStatusBadge.tsx
// ============================================================

import React from "react";
import type { RouteStatusBadgeProps } from "../../types/tracking.types";
import { routeStatusStyle } from "../../style/styles";

const RouteStatusBadge: React.FC<RouteStatusBadgeProps> = ({ status }) => {
  const style = routeStatusStyle[status];
  return (
    <span
      style={{
        ...style,
        borderRadius: 4,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
};

export default RouteStatusBadge;