import React from "react";

// ─── Design tokens (matches your global COLORS contract) ──────────────────────
const SECTION_CARD_TOKENS = {
    background: "#ffffff",
    border: "#B7E4C7",       // Light Green Border
    borderRadius: 12,              // Card radius
    padding: "20px 24px",
    titleColor: "#1B4332",       // Primary Dark Green
    titleSize: 15,
    titleWeight: 600,
    iconColor: "#1B4332",
    gap: 10,              // icon ↔ title gap
    sectionGap: 20,              // title row ↔ children gap
    marginBottom: 16,
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SectionCardProps {
    /** Small icon rendered to the left of the title */
    icon?: React.ReactNode;
    /** Section heading */
    title: string;
    /** Optional subtitle rendered below the title */
    subtitle?: string;
    /** Card body */
    children: React.ReactNode;
    /** Override card-level styles (e.g. marginBottom: 0 for last card) */
    style?: React.CSSProperties;
    /** Override body styles */
    bodyStyle?: React.CSSProperties;
    /** Override header row styles */
    headerStyle?: React.CSSProperties;
    /** Slot for optional right-aligned header action (e.g. a toggle or button) */
    headerAction?: React.ReactNode;
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

export const SectionCard: React.FC<SectionCardProps> = ({
    icon,
    title,
    subtitle,
    children,
    style,
    bodyStyle,
    headerStyle,
    headerAction,
}) => (
    <div
        style={{
            background: SECTION_CARD_TOKENS.background,
            border: `1px solid ${SECTION_CARD_TOKENS.border}`,
            borderRadius: SECTION_CARD_TOKENS.borderRadius,
            padding: SECTION_CARD_TOKENS.padding,
            marginBottom: SECTION_CARD_TOKENS.marginBottom,
            ...style,
        }}
    >
        {/* ── Header row ───────────────────────────────────────────────────── */}
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: SECTION_CARD_TOKENS.sectionGap,
                ...headerStyle,
            }}
        >
            {/* Left: icon + title + subtitle */}
            <div style={{ display: "flex", alignItems: "center", gap: SECTION_CARD_TOKENS.gap }}>
                {icon && (
                    <span
                        style={{
                            color: SECTION_CARD_TOKENS.iconColor,
                            display: "flex",
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </span>
                )}
                <div>
                    <h3
                        style={{
                            fontSize: SECTION_CARD_TOKENS.titleSize,
                            fontWeight: SECTION_CARD_TOKENS.titleWeight,
                            color: SECTION_CARD_TOKENS.titleColor,
                            margin: 0,
                            lineHeight: 1.4,
                        }}
                    >
                        {title}
                    </h3>
                    {subtitle && (
                        <p
                            style={{
                                fontSize: 12,
                                color: "#52796F",   // Primary Mid Green
                                margin: "2px 0 0",
                                fontWeight: 400,
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: optional header action slot */}
            {headerAction && (
                <div style={{ flexShrink: 0 }}>
                    {headerAction}
                </div>
            )}
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div style={bodyStyle}>
            {children}
        </div>
    </div>
);

export default SectionCard;