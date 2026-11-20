// features/shift-management/components/Shifttimefilter.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";

interface Props {
    onFilter: (term: string) => void;
    windowMinutes?: number;
}

function parseMinutes(t: string): number | null {
    const cleaned = t.replace(/[\s.]/g, ":");
    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/) ?? cleaned.match(/^(\d{2})(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
}

function autoColon(raw: string): string {
    let v = raw.replace(/[^0-9:]/g, "");
    if (v.length === 4 && !v.includes(":")) {
        v = v.slice(0, 2) + ":" + v.slice(2);
    }
    return v.slice(0, 5);
}

const TOKEN = {
    green900: "#1B4332",
    greenBorder: "#B7E4C7",
    greenBg: "#F0FAF4",
};

export const ShiftTimeFilter: React.FC<Props> = ({ onFilter, windowMinutes = 30 }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [hint, setHint] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = autoColon(e.target.value);
            setValue(raw);

            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                if (!raw) { setHint(null); onFilter(""); return; }
                const mins = parseMinutes(raw);
                if (mins === null) { setHint("Use HH:MM"); onFilter(raw); return; }
                const lo = Math.max(0, mins - windowMinutes);
                const hi = Math.min(23 * 60 + 59, mins + windowMinutes);
                const fmt = (m: number) =>
                    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
                setHint(`${fmt(lo)} – ${fmt(hi)}`);
                onFilter(raw);
            }, 250);
        },
        [onFilter, windowMinutes]
    );

    const clear = () => {
        setValue("");
        setHint(null);
        onFilter("");
        if (debounceRef.current) clearTimeout(debounceRef.current);
    };

    const handleIconClick = () => {
        if (open && value) { clear(); setOpen(false); }
        else setOpen((v) => !v);
    };

    useEffect(() => () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
    }, []);

    const isActive = value.length > 0;

    // Triangle size — keep in sync with the CSS below
    const TIP = 7; // px half-width of triangle

    return (
        <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>

            {/* ── Search / clear icon button ───────────────────────────────── */}
            <button
                onClick={handleIconClick}
                title={open ? "Close filter" : "Filter by time"}
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `1px solid ${isActive ? TOKEN.green900 : TOKEN.greenBorder}`,
                    background: isActive ? TOKEN.green900 : TOKEN.greenBg,
                    color: isActive ? "#fff" : TOKEN.green900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                    transition: "all 0.15s",
                }}
            >
                {isActive ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <circle cx="4.5" cy="4.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M7.5 7.5L9.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                )}
            </button>

            {/* ── Floating popover with origin triangle ───────────────────── */}
            {open && (
                <div style={{
                    position: "absolute",
                    // Panel sits BELOW the button; triangle tip points UP toward button
                    bottom: "calc(100% + 10px)", // if u want to flip the box then change to bottom
                    left: "50%",
                    transform: "translateX(-16%)",
                    zIndex: 100,

                }}>
                    {/* ── Triangle tip ────────────────────────────────────────
                        Two layered triangles: border triangle behind, fill triangle in front.
                        Together they simulate a bordered arrow pointing upward.          */}
                    <div style={{
                        position: "absolute",

                        bottom: -(TIP + 1),
                        left: "15%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,

                        borderLeft: `${TIP}px solid transparent`,
                        borderRight: `${TIP}px solid transparent`,
                        borderTop: `${TIP}px solid ${TOKEN.greenBorder}`, // 👈 flipped
                    }}>


                    </div>

                    {/* <div style={{
                        position: "absolute",
                        // top: 1,
                        // left: -TIP + 1,
                        width: 0,
                        height: 0,
                        // borderLeft: `${TIP - 1}px solid transparent`,
                        // borderRight: `${TIP - 1}px solid transparent`,
                        // borderBottom: `${TIP - 1}px solid #fff`,
                        borderLeft: `${TIP - 1}px solid transparent`,
                        borderRight: `${TIP - 1}px solid transparent`,
                        borderTop: `${TIP - 1}px solid #fff`, // 👈 flipped
                    }} /> */}

                    {/* ── Panel body ──────────────────────────────────────── */}
                    <div style={{
                        background: "#fff",
                        border: `1px solid ${TOKEN.greenBorder}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        boxShadow: "0 4px 16px rgba(27,67,50,0.12)",
                        minWidth: 160,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <svg
                                width="12" height="12" viewBox="0 0 12 12" fill="none"
                                style={{ position: "absolute", left: 7, color: "#9CA3AF", flexShrink: 0 }}
                            >
                                <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M8 8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={handleChange}
                                placeholder="HH:MM"
                                maxLength={5}
                                style={{
                                    height: 28,
                                    width: 140,
                                    paddingLeft: 24,
                                    paddingRight: value ? 24 : 8,
                                    border: `1px solid ${TOKEN.greenBorder}`,
                                    borderRadius: 6,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: TOKEN.green900,
                                    background: TOKEN.greenBg,
                                    outline: "none",
                                    letterSpacing: "0.03em",
                                }}
                            />
                            {value && (
                                <button
                                    onClick={clear}
                                    style={{
                                        position: "absolute",
                                        right: 6,
                                        width: 14,
                                        height: 14,
                                        borderRadius: "50%",
                                        border: "none",
                                        background: "#D1D5DB",
                                        color: "#6B7280",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 9,
                                        padding: 0,
                                        lineHeight: 1,
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {hint && (
                            <span style={{
                                fontSize: 10,
                                color: hint === "Use HH:MM" ? "#E24B4A" : "#52796F",
                                fontWeight: 500,
                                paddingLeft: 2,
                            }}>
                                {hint}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};