// src/shared/components/ContentContainer/ContentContainer.tsx
import type { ReactNode, CSSProperties } from 'react';

interface ContentContainerProps {
    children: ReactNode;
    background?: string;
    style?: CSSProperties;
    fullBleed?: boolean;        // Removes padding when true (for dashboards)
}

export const ContentContainer = ({
    children,
    background = "var(--color-bg-card)",
    style,
    // fullBleed = false,
}: ContentContainerProps) => {
    return (
        <div
            style={{
                minHeight: "100vh",
                background,
                // borderRadius: fullBleed ? 0 : 12,
                padding: "12px",
                ...style,
            }}
        >
            {children}
        </div>
    );
};