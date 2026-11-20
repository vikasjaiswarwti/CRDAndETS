
// src/shared/components/navigation/SidebarSkeleton.tsx

const SkShimmer = ({ w = '100%', h = 12, radius = 6 }: { w?: string; h?: number; radius?: number }) => (
    <div
        style={{
            width: w,
            height: h,
            borderRadius: radius,
            background: 'linear-gradient(90deg, rgba(52,168,83,0.10) 0%, rgba(52,168,83,0.25) 50%, rgba(52,168,83,0.10) 100%)',
            backgroundSize: '200% 100%',
            animation: 'navsk-slide 1.8s ease-in-out infinite',
            flexShrink: 0,
        }}
    />
);

// Matches top-level MenuButton exactly:
// paddingLeft=10, paddingRight=10, paddingV=10, minHeight=42, gap=10, icon=18x18
const SkTopItem = ({ delay = '0s', widths = '65%' }: { delay?: string; widths?: string }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingRight: 10,
            minHeight: 42,
            borderRadius: 6,
            marginBottom: 1,
            opacity: 0,
            animation: 'navsk-fadein 0.35s ease forwards',
            animationDelay: delay,
        }}
    >
        {/* Icon placeholder — 18x18 matches MenuIcon size */}
        <SkShimmer w="18px" h={18} radius={4} />
        {/* Label placeholder */}
        <SkShimmer w={widths} h={12} />
    </div>
);

// Matches sub-level MenuButton:
// paddingLeft=14, paddingV=8, minHeight=36, no icon, vertical accent line on left
const SkSubItem = ({ delay = '0s', widths = '50%' }: { delay?: string; widths?: string }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 14,
            paddingRight: 10,
            minHeight: 36,
            borderRadius: 6,
            marginBottom: 1,
            position: 'relative',
            opacity: 0,
            animation: 'navsk-fadein 0.35s ease forwards',
            animationDelay: delay,
        }}
    >
        {/* Vertical connector line — matches depth > 0 ul::before */}
        <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'var(--color-border)',
            borderRadius: 1,
        }} />
        <SkShimmer w={widths} h={10} />
    </div>
);

// Matches the sub-menu wrapper ul: padding '0 4px 0 1px'
const SkSubGroup = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding: '0 4px 0 1px', position: 'relative', marginTop: 1 }}>
        {children}
    </div>
);

export const SidebarSkeleton = () => (
    <>
        <style>{`
            @keyframes navsk-slide {
                0%   { background-position: 200% center; }
                100% { background-position: -200% center; }
            }
            @keyframes navsk-fadein {
                from { opacity: 0; transform: translateX(-4px); }
                to   { opacity: 1; transform: translateX(0); }
            }
        `}</style>

        {/* Matches SidebarMenu ul: padding '0 16px', marginTop 4px */}
        <ul style={{ listStyle: 'none', marginTop: 4, padding: '0 16px' }}>

            {/* Top-level items with varied label widths for realism */}
            <li><SkTopItem delay="0.05s" widths="55%" /></li>

            <li>
                <SkTopItem delay="0.10s" widths="70%" />
                {/* Expanded sub-group — mirrors the animated div wrapper */}
                <SkSubGroup>
                    <SkSubItem delay="0.13s" widths="60%" />
                    <SkSubItem delay="0.16s" widths="48%" />
                    <SkSubItem delay="0.19s" widths="54%" />
                </SkSubGroup>
            </li>

            <li><SkTopItem delay="0.22s" widths="62%" /></li>

            <li>
                <SkTopItem delay="0.26s" widths="75%" />
                <SkSubGroup>
                    <SkSubItem delay="0.29s" widths="52%" />
                    <SkSubItem delay="0.32s" widths="45%" />
                </SkSubGroup>
            </li>

            <li><SkTopItem delay="0.35s" widths="58%" /></li>
            <li><SkTopItem delay="0.38s" widths="66%" /></li>
            <li><SkTopItem delay="0.41s" widths="50%" /></li>

        </ul>
    </>
);