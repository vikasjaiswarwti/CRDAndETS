// src/features/routeManagement/components/ModalBreadcrumb.tsx
import React from "react";
import { RM_FONT } from "../Routeuiconfig"; // adjust path if needed

interface Props {
  crumbs: string[];
}

export function ModalBreadcrumb({ crumbs }: Props) {
  if (!crumbs || crumbs.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "6px",
        padding: "5px 8px",
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 10,

        fontSize: RM_FONT.sm || 13,
      }}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <React.Fragment key={`${crumb}-${index}`}>
            <span
              style={{
                fontWeight: isLast ? 600 : 500,
                color: isLast ? "#065F46" : "#64748B",
                padding: "2px 8px",
                borderRadius: 6,
                background: isLast ? "#F0FDF4" : "transparent",
                transition: "all 0.2s ease",
              }}
            >
              {crumb}
            </span>

            {!isLast && (
              <span
                style={{
                  color: "#94A3B8",
                  fontSize: "15px",
                  fontWeight: 400,
                  margin: "0 2px",
                  userSelect: "none",
                }}
              >
                
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
