
// ── FIX 3: Full corrected MapPanel interface and component ────────────────────
//
// Replace the existing MapPanel interface and component in Employeeregisterform.tsx
// with the version below.

import React from "react";
import { T } from "../../../styles/tokens";

// Corrected MapPanel props — use the nullable ref types that useGoogleMap returns
interface MapPanelProps {
    // FIXED: was RefObject<HTMLInputElement> — now accepts the null variant
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    // FIXED: was RefObject<HTMLDivElement> — now accepts the null variant
    mapRef: React.RefObject<HTMLDivElement | null>;
    isLoaded: boolean;
    isGeocoding: boolean;
    // Spin is passed as a component from useUILibrary
    Spin: React.ComponentType<any>;
    showLabel? : boolean;
}

const FIELD_STYLE_LOCAL: React.CSSProperties = {
    backgroundColor: T.formcss.inputBg,
    borderRadius: 8,
    fontSize: 12,
};

const LABEL_STYLE_LOCAL: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#52796F",
    marginBottom: 2,
    display: "block",
};

const SECTION_TITLE_LOCAL: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: "#4B4B4B",
    marginBottom: 2,
};

export const MapPanel: React.FC<MapPanelProps> = ({
    searchInputRef,
    mapRef,
    isLoaded,
    isGeocoding,
    Spin,
    showLabel=true,
}) => (
    <div className="flex flex-col gap-1">
      {showLabel &&  <div style={SECTION_TITLE_LOCAL}>
            {/* EnvironmentOutlined icon — import from @ant-design/icons in the host file */}
            🗺 Home / Pickup Address
        </div>}

        {/* Search bar */}
        <div style={{ marginBottom: 10, position: "relative" }}>
            <label style={LABEL_STYLE_LOCAL}>Search Location</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/*
          Cast is required here because the native <input> ref prop expects
          RefObject<HTMLInputElement> (non-nullable), but useGoogleMap returns
          the nullable variant. The cast is safe — useGoogleMap always
          attaches the ref to a real DOM node once the component mounts.
        */}
                <input
                    ref={searchInputRef as React.RefObject<HTMLInputElement>}
                    type="text"
                    placeholder="Search your address on map..."
                    style={{
                        ...FIELD_STYLE_LOCAL,
                        width: "100%",
                        padding: "8px 12px",
                        outline: "none",
                        fontFamily: "inherit",
                        border: `1px solid ${T.formcss.greyBorder}`,
                    }}
                />
                {isGeocoding && <Spin size="small" />}
            </div>
            <div style={{ fontSize: 11, color: "#52796F", marginTop: 4 }}>
                💡 Drag the marker or click anywhere on the map to set exact location
            </div>
        </div>

        {/* Map canvas */}
        <div
            style={{
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${T.formcss.greyBorder}`,
                marginBottom: 14,
                position: "relative",
                height: 350,
                backgroundColor: "#e8f5e9",
            }}
        >
            {/*
        Same cast for the div ref — React.RefObject<HTMLDivElement | null>
        vs the DOM's expected RefObject<HTMLDivElement>.
      */}
            <div
                ref={mapRef as React.RefObject<HTMLDivElement>}
                style={{ width: "100%", height: "100%" }}
            />
            {!isLoaded && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: T.formcss.inputBg,
                        color: "#52796F",
                        fontSize: 13,
                    }}
                >
                    <Spin /> &nbsp; Loading map…
                </div>
            )}
        </div>
    </div>
);

export default MapPanel;

// ── SUMMARY OF CHANGES TO APPLY IN Employeeregisterform.tsx ──────────────────
//
// 1. Replace MapPanelProps interface:
//      searchInputRef: React.RefObject<HTMLInputElement | null>   (was non-nullable)
//      mapRef:         React.RefObject<HTMLDivElement | null>      (was non-nullable)
//
// 2. Inside MapPanel render, add casts on the ref props:
//      ref={searchInputRef as React.RefObject<HTMLInputElement>}
//      ref={mapRef as React.RefObject<HTMLDivElement>}
//
// 3. Replace the gender AntD <Button> block with native <button> elements
//    (see Fix 2 above) — onClick={() => set("gender", value)} works without casts.
//
// That's it. No other changes needed.