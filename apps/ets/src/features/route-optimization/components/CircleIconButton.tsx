// components/shuttle/CircleIconButton.tsx

import React from "react";
import type { LucideProps } from "lucide-react";

type CircleIconButtonVariant = "danger" | "success" | "info" | "warning";

const VARIANT_STYLES: Record<
  CircleIconButtonVariant,
  { background: string; color: string; hover: string }
> = {
  danger:  { background: "#fee2e2", color: "#dc2626", hover: "#fecaca" },
  success: { background: "#dcfce7", color: "#16a34a", hover: "#bbf7d0" },
  info:    { background: "#dbeafe", color: "#1d4ed8", hover: "#bfdbfe" },
  warning: { background: "#fef3c7", color: "#d97706", hover: "#fde68a" },
};

interface CircleIconButtonProps {
  variant: CircleIconButtonVariant;
  icon: React.ElementType<LucideProps>;  // Lucide icon component
  onClick?: () => void;
  title?: string;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
}

export function CircleIconButton({
  variant,
  icon: Icon,                            // rename to Icon so JSX works
  onClick,
  title,
  size = 26,
  iconSize = 13,
  disabled = false,
}: CircleIconButtonProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        // backgroundColor: styles.background,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
        padding: 0,
        opacity: disabled ? 0.5 : 1,
        transition: "background-color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = styles.hover;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = styles.background;
      }}
    >
      <Icon
        size={iconSize}
        color={styles.color}
        strokeWidth={2.5}
      />
    </button>
  );
}