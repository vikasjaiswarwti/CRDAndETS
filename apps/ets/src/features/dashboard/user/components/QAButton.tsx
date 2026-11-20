// // interface QAButtonProps {
// //   icon: React.ReactNode;
// //   label: string;
// //   onClick: () => void;
// //   disabled?: boolean;
// //   fullWidth?: boolean;
// // }

// import { IconChevronRight } from "../../../../assets/dashboard";

// interface CardThemeTokens {
//   cardBg: string;
//   iconBg: string;
//   iconColor: string;
//   badgeBg: string;
//   badgeBorder: string;
//   badgeColor: string;
// }

// interface RowThemeTokens {
//   bg: string;
//   border: string;
//   iconBg: string;
//   iconColor: string;
//   chevron: string;
// }

// interface TextTokens {
//   title: string;
//   subtitle: string;
//   cardLabel: string;
//   cardDesc: string;
//   rowLabel: string;
//   rowDesc: string;
// }

// interface ContainerTokens {
//   bg: string;
//   border: string;
//   borderRadius: number;
// }

// interface QuickActionTheme {
//   card: Record<CardTheme, CardThemeTokens>;
//   row: Record<RowTheme, RowThemeTokens>;
//   text: TextTokens;
//   container: ContainerTokens;
// }

// type CardTheme = "blue" | "green" | "purple" | "amber";
// type RowTheme = "default" | "teal" | "danger";

// // ─── Theme config ─────────────────────────────────────────────────────────────
// const QUICK_ACTION_THEME: QuickActionTheme = {
//   card: {
//     blue: {
//       cardBg: "#EEF4FF",
//       iconBg: "#C7DAFF",
//       iconColor: "#1A4FD6",
//       badgeBg: "#fff",
//       badgeBorder: "#C7DAFF",
//       badgeColor: "#1A4FD6",
//     },
//     green: {
//       cardBg: "#EDFAF4",
//       iconBg: "#22A969",
//       iconColor: "#fff",
//       badgeBg: "#fff",
//       badgeBorder: "#9FE1CB",
//       badgeColor: "#0F6E56",
//     },
//     purple: {
//       cardBg: "#F0EFFE",
//       iconBg: "#CECBF6",
//       iconColor: "#fff",
//       badgeBg: "#fff",
//       badgeBorder: "#CECBF6",
//       badgeColor: "#534AB7",
//     },
//     amber: {
//       cardBg: "#FEF4E8",
//       iconBg: "#fcd89e",
//       iconColor: "#fff",
//       badgeBg: "#fff",
//       badgeBorder: "#FAC775",
//       badgeColor: "#854F0B",
//     },
//   },
//   row: {
//     default: {
//       bg: "#f2f7fe",
//       border: "#E5E7EB",
//       iconBg: "#d8e6fc",
//       iconColor: "#185FA5",
//       chevron: "#9CA3AF",
//     },
//     teal: {
//       bg: "#f4feff",
//       border: "#E5E7EB",
//       iconBg: "#e3feff",
//       iconColor: "#c6fcff",
//       chevron: "#9CA3AF",
//     },
//     danger: {
//       bg: "#FFF5F5",
//       border: "#E5E7EB",
//       iconBg: "#FCEBEB",
//       iconColor: "#A32D2D",
//       chevron: "#E24B4A",
//     },
//   },
//   text: {
//     title: "#111111",
//     subtitle: "#9CA3AF",
//     cardLabel: "#111111",
//     cardDesc: "#9CA3AF",
//     rowLabel: "#111111",
//     rowDesc: "#9CA3AF",
//   },
//   container: {
//     bg: "#ffffff",
//     border: "#E5E7EB",
//     borderRadius: 12,
//   },
// };

// // ─── Component prop types ─────────────────────────────────────────────────────
// interface QACardProps {
//   icon: React.ReactNode;
//   label: string;
//   desc?: string;
//   badge: string;
//   theme: CardTheme;
//   onClick: () => void;
//   disabled?: boolean;
// }

// interface QARowProps {
//   icon: React.ReactNode;
//   label: string;
//   desc?: string;
//   onClick: () => void;
//   rowTheme?: RowTheme;
//   disabled?: boolean;
// }

// // ─── QACard ───────────────────────────────────────────────────────────────────
// const QACard: React.FC<QACardProps> = ({
//   icon,
//   label,
//   badge,
//   theme,
//   onClick,
//   disabled,
// }) => {
//   const t = QUICK_ACTION_THEME.card[theme];
//   const txt = QUICK_ACTION_THEME.text;
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         background: t.cardBg,
//         border: "none",
//         borderRadius: 12,
//         padding: 10,
//         display: "flex",
//         flexDirection: "column",
//         gap: 8,
//         cursor: disabled ? "not-allowed" : "pointer",
//         opacity: disabled ? 0.5 : 1,
//         textAlign: "left",
//       }}
//     >
//       <div
//         style={{
//           width: 40,
//           height: 40,
//           borderRadius: 10,
//           background: t.iconBg,
//           color: t.iconColor,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         {icon}
//       </div>
//       <div>
//         <p
//           style={{
//             fontSize: 11,
//             fontWeight: 600,
//             color: txt.cardLabel,
//             margin: "0 0 2px",
//           }}
//         >
//           {label}
//         </p>
//         {/* <p style={{ fontSize: 11, color: txt.cardDesc, margin: 0, lineHeight: 1.4 }}>{desc}</p> */}
//       </div>
//       <span
//         style={{
//           fontSize: 9,
//           fontWeight: 500,
//           padding: "3px 10px",
//           borderRadius: 8,
//           alignSelf: "flex-start",
//           background: t.badgeBg,
//           color: t.badgeColor,
//           border: `0.5px solid ${t.badgeBorder}`,
//         }}
//       >
//         {badge}
//       </span>
//     </button>
//   );
// };

// // ─── QARow ────────────────────────────────────────────────────────────────────
// const QARow: React.FC<QARowProps> = ({
//   icon,
//   label,
//   onClick,
//   rowTheme = "default",
//   disabled,
// }) => {
//   const t = QUICK_ACTION_THEME.row[rowTheme];
//   const txt = QUICK_ACTION_THEME.text;
//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 12,
//         padding: "11px 12px",
//         borderRadius: 8,
//         border: `0.5px solid ${t.border}`,
//         background: t.bg,
//         cursor: disabled ? "not-allowed" : "pointer",
//         opacity: disabled ? 0.5 : 1,
//         width: "100%",
//         textAlign: "left",
//       }}
//     >
//       <div
//         style={{
//           width: 36,
//           height: 36,
//           borderRadius: 8,
//           flexShrink: 0,
//           background: t.iconBg,
//           color: t.iconColor,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         {icon}
//       </div>
//       <div style={{ flex: 1 }}>
//         <p
//           style={{
//             fontSize: 13,
//             fontWeight: 600,
//             color: txt.rowLabel,
//             margin: 0,
//           }}
//         >
//           {label}
//         </p>
//         {/* <p style={{ fontSize: 11, color: txt.rowDesc, margin: 0 }}>{desc}</p> */}
//       </div>
//       <IconChevronRight stroke={t.chevron} />
//     </button>
//   );
// };
// // ─── Types ────────────────────────────────────────────────────────────────────
// interface QAButtonBaseProps {
//   icon: React.ReactNode;
//   label: string;
//   desc: string;
//   onClick: () => void;
//   disabled?: boolean;
// }

// interface QACardButtonProps extends QAButtonBaseProps {
//   variant: "card";
//   theme: CardTheme;
//   badge: string;
// }

// interface QARowButtonProps extends QAButtonBaseProps {
//   variant: "row";
//   rowTheme?: RowTheme;
//   badge?: never; // prevents passing badge on row variant
// }

// type QAButtonProps = QACardButtonProps | QARowButtonProps;

// // ─── QAButton ─────────────────────────────────────────────────────────────────
// // ─── QAButton ─────────────────────────────────────────────────────────────────
// const QAButton: React.FC<QAButtonProps> = (props) => {
//   if (props.variant === "card") {
//     return (
//       <QACard
//         icon={props.icon}
//         label={props.label}
//         desc={props.desc}
//         badge={props.badge}
//         theme={props.theme}
//         onClick={props.onClick}
//         disabled={props.disabled}
//       />
//     );
//   }

//   return (
//     <QARow
//       icon={props.icon}
//       label={props.label}
//       desc={props.desc}
//       rowTheme={props.rowTheme}
//       onClick={props.onClick}
//       disabled={props.disabled}
//     />
//   );
// };
// export default QAButton;

import { IconChevronRight } from "../../../../assets/dashboard";

interface CardThemeTokens {
  cardBg: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
}

interface RowThemeTokens {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  chevron: string;
}

interface TextTokens {
  title: string;
  subtitle: string;
  cardLabel: string;
  cardDesc: string;
  rowLabel: string;
  rowDesc: string;
}

interface ContainerTokens {
  bg: string;
  border: string;
  borderRadius: number;
}

interface QuickActionTheme {
  card: Record<CardTheme, CardThemeTokens>;
  row: Record<RowTheme, RowThemeTokens>;
  text: TextTokens;
  container: ContainerTokens;
}

type CardTheme = "blue" | "green" | "purple" | "amber";
type RowTheme = "default" | "teal" | "danger";

const QUICK_ACTION_THEME: QuickActionTheme = {
  card: {
    blue: {
      cardBg: "#ffffff",
      iconBg: "#E6F1FB",
      iconColor: "#185FA5",
      badgeBg: "#E6F1FB",
      badgeBorder: "#B5D4F4",
      badgeColor: "#185FA5",
    },
    green: {
      cardBg: "#ffffff",
      iconBg: "#E1F5EE",
      iconColor: "#0F6E56",
      badgeBg: "#E1F5EE",
      badgeBorder: "#9FE1CB",
      badgeColor: "#0F6E56",
    },
    purple: {
      cardBg: "#ffffff",
      iconBg: "#EEEDFE",
      iconColor: "#534AB7",
      badgeBg: "#EEEDFE",
      badgeBorder: "#CECBF6",
      badgeColor: "#534AB7",
    },
    amber: {
      cardBg: "#ffffff",
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
      badgeBg: "#FAEEDA",
      badgeBorder: "#FAC775",
      badgeColor: "#854F0B",
    },
  },
  row: {
    default: {
      bg: "#ffffff",
      border: "#e5e7eb",
      iconBg: "#E6F1FB",
      iconColor: "#185FA5",
      chevron: "#9CA3AF",
    },
    teal: {
      bg: "#ffffff",
      border: "#e5e7eb",
      iconBg: "#E1F5EE",
      iconColor: "#0F6E56",
      chevron: "#9CA3AF",
    },
    danger: {
      bg: "#ffffff",
      border: "#e5e7eb",
      iconBg: "#FCEBEB",
      iconColor: "#A32D2D",
      chevron: "#E24B4A",
    },
  },
  text: {
    title: "#111827",
    subtitle: "#6B7280",
    cardLabel: "#111827",
    cardDesc: "#6B7280",
    rowLabel: "#111827",
    rowDesc: "#6B7280",
  },
  container: {
    bg: "#ffffff",
    border: "#e5e7eb",
    borderRadius: 12,
  },
};

interface QACardProps {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  badge: string;
  theme: CardTheme;
  onClick: () => void;
  disabled?: boolean;
}

interface QARowProps {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  onClick: () => void;
  rowTheme?: RowTheme;
  disabled?: boolean;
}

const QACard: React.FC<QACardProps> = ({
  icon,
  label,
  badge,
  theme,
  onClick,
  disabled,
}) => {
  const t = QUICK_ACTION_THEME.card[theme];
  const txt = QUICK_ACTION_THEME.text;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: t.cardBg,
        border: "0.5px solid #e5e7eb",
        borderRadius: 12,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        textAlign: "left",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        !disabled && (e.currentTarget.style.borderColor = "#d1d5db")
      }
      onMouseLeave={(e) =>
        !disabled && (e.currentTarget.style.borderColor = "#e5e7eb")
      }
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: t.iconBg,
          color: t.iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: txt.cardLabel,
            margin: "0 0 2px",
          }}
        >
          {label}
        </p>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          padding: "3px 12px",
          borderRadius: 8,
          alignSelf: "flex-start",
          background: t.badgeBg,
          color: t.badgeColor,
          border: `0.5px solid ${t.badgeBorder}`,
        }}
      >
        {badge}
      </span>
    </button>
  );
};

const QARow: React.FC<QARowProps> = ({
  icon,
  label,
  onClick,
  rowTheme = "default",
  disabled,
}) => {
  const t = QUICK_ACTION_THEME.row[rowTheme];
  const txt = QUICK_ACTION_THEME.text;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 10,
        border: `0.5px solid ${t.border}`,
        background: t.bg,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        width: "100%",
        textAlign: "left",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        !disabled && (e.currentTarget.style.borderColor = "#d1d5db")
      }
      onMouseLeave={(e) =>
        !disabled && (e.currentTarget.style.borderColor = t.border)
      }
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          flexShrink: 0,
          background: t.iconBg,
          color: t.iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: txt.rowLabel,
            margin: 0,
          }}
        >
          {label}
        </p>
      </div>
      <IconChevronRight stroke={t.chevron} />
    </button>
  );
};

interface QAButtonBaseProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}

interface QACardButtonProps extends QAButtonBaseProps {
  variant: "card";
  theme: CardTheme;
  badge: string;
}

interface QARowButtonProps extends QAButtonBaseProps {
  variant: "row";
  rowTheme?: RowTheme;
  badge?: never;
}

type QAButtonProps = QACardButtonProps | QARowButtonProps;

const QAButton: React.FC<QAButtonProps> = (props) => {
  if (props.variant === "card") {
    return (
      <QACard
        icon={props.icon}
        label={props.label}
        desc={props.desc}
        badge={props.badge}
        theme={props.theme}
        onClick={props.onClick}
        disabled={props.disabled}
      />
    );
  }

  return (
    <QARow
      icon={props.icon}
      label={props.label}
      desc={props.desc}
      rowTheme={props.rowTheme}
      onClick={props.onClick}
      disabled={props.disabled}
    />
  );
};

export default QAButton;