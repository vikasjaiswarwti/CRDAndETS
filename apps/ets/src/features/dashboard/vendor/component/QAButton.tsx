import React from "react";
import { T } from "../../../../styles/tokens";

interface QAButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  popupData?: number;
}
const RADII = {
  container: 12,
  card: 12,
  badge: 9999,
};
 
const FONT = {
  heading: { fontSize: 16, fontWeight: 700 },
  label: { fontSize: 11, fontWeight: 500, lineHeight: 1.4 },
  badge: { fontSize: 10, fontWeight: 700 },
};
// export const QAButton: React.FC<QAButtonProps> = ({
//   icon,
//   label,
//   onClick,
//   disabled,
//   fullWidth,
//   popupData = 0,
// }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     style={{
//       position:"relative",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       gap: 6,
//       padding: fullWidth ? "11px 8px" : "14px 8px",
//       border: "1px solid #E8F5EE",
//       borderRadius: 10,
//       background: "#E6F3ED",
//       cursor: disabled ? "not-allowed" : "pointer",
//       opacity: disabled ? 0.5 : 1,
//       flex: fullWidth ? undefined : 1,
//       width: fullWidth ? "100%" : undefined,
//       transition: "border-color 0.15s",
//     }}
//     onMouseEnter={(e) => {
//       if (!disabled)
//         (e.currentTarget as HTMLElement).style.borderColor = "#1B4332";
//     }}
//     onMouseLeave={(e) => {
//       (e.currentTarget as HTMLElement).style.borderColor = "#E8F5EE";
//     }}
//   >
//     {popupData && <span className="absolute right-2 top-2 bg-orange-300 h-5 w-5 text-white text-[10px] flex items-center justify-center rounded-full font-bold">{popupData}</span>}
//     <div
//       style={{
//         width: 32,
//         height: 32,
//         border: "1px solid #E8F5EE",
//         borderRadius: 8,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       {icon}
//     </div>
//     <span
//       style={{
//         fontSize: 10,
//         color: "#1B4332",
//         fontWeight: 500,
//         textAlign: "center",
//         lineHeight: 1.35,
//       }}
//     >
//       {label}
//     </span>
//   </button>
// );
 
// ─── QAButton ─────────────────────────────────────────────────────────────────
export const QAButton: React.FC<QAButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
  popupData = 0,
}) => {
  const [hovered, setHovered] = React.useState(false);
 
  const borderColor = hovered ? T.quickaction.cardBorderSelected : T.quickaction.cardBorder;
 
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "20px 10px 16px",
        border: `1.5px solid ${borderColor}`,
        borderRadius: RADII.card,
        background: T.quickaction.cardBg,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow:
           hovered
            ? "0 0 0 1px #1B433220"
            : "none",
        width: "100%",
        minHeight: 110,
      }}
    >
      {/* Badge */}
      {popupData > 0 && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: T.quickaction.badgeBg,
            color: T.quickaction.badgeText,
            height: 20,
            minWidth: 20,
            padding: "0 4px",
            borderRadius: RADII.badge,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...FONT.badge,
          }}
        >
          {popupData}
        </span>
      )}
 
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color: T.quickaction.iconStroke,
        }}
      >
        {icon}
      </div>
 
      {/* Label */}
      <span
        style={{
          color: T.quickaction.labelColor,
          textAlign: "center",
          ...FONT.label,
        }}
      >
        {label}
      </span>
    </button>
  );
};