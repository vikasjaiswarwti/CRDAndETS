// shared/components/layouts/FeaturePageLayout/FeaturePageLayout.tsx
// Reusable layout for feature pages (Shift Management, Shift Validation, etc.)
// Replaces PageContainer — handles: sticky header, scrollable body, sticky footer.
//
// Slots:
//   title / subtitle      — page heading
//   actions               — top-right buttons (e.g. "Define Shift")
//   filterBar             — the white pill row below the header (office selector etc.)
//   footer                — sticky bottom bar (save buttons, progress bar)
//   children              — main scrollable content

import React from "react";

const T = {
    green900: "#1B4332",
    green600: "#52796F",
    border: "#F3F4F6",
    bg: "#fff",
} as const;

interface FeaturePageLayoutProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    filterBar?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

export const FeaturePageLayout: React.FC<FeaturePageLayoutProps> = ({
    title,
    subtitle,
    actions,
    filterBar,
    footer,
    children,
}) => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            minHeight: 0,
            background: T.bg,
        }}>
            {/* ── Page header ──────────────────────────────────────────────── */}
            <div style={{
                flexShrink: 0,
                padding: "20px 24px 0",
                background: T.bg,
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: filterBar ? 12 : 16,
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: T.green900,
                            margin: 0,
                            lineHeight: 1.2,
                        }}>
                            {title}
                        </h1>
                        {subtitle && (
                            <p style={{
                                fontSize: 13,
                                color: T.green600,
                                margin: "4px 0 0",
                                lineHeight: 1.5,
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: 16 }}>
                            {actions}
                        </div>
                    )}
                </div>

                {/* ── Filter bar slot ────────────────────────────────────── */}
                {filterBar && (
                    <div style={{
                        background: "#fff",
                        border: `1px solid ${T.border}`,
                        borderRadius: 12,
                        padding: "10px 20px",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                    }}>
                        {filterBar}
                    </div>
                )}
            </div>

            {/* ── Scrollable content ───────────────────────────────────────── */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 24px 16px",
                minHeight: 0,
            }}>
                {children}
            </div>

            {/* ── Sticky footer slot ───────────────────────────────────────── */}
            {footer && (
                <div style={{
                    flexShrink: 0,
                    background: "#fff",
                    borderTop: `1px solid ${T.border}`,
                    padding: "10px 24px",
                    zIndex: 10,
                }}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default FeaturePageLayout;