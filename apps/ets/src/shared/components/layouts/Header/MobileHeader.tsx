import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommutrLogoFull from "../../../../assets/commutr.svg";
import { MobileSearchBar } from "./MobileSearchBar";

export const MobileHeader: React.FC<{
  onMenuClick: () => void;
  onActionsClick: () => void;
}> = ({ onMenuClick, onActionsClick }) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 98,
        background: "var(--color-bg-header)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: "var(--header-height)" as unknown as number,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
        }}
      >
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          style={iconBtnStyle}
        >
          <HamburgerIcon />
        </button>
        <img
          src={CommutrLogoFull}
          alt="COMMUTR"
          style={{ height: 22, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Search"
            style={iconBtnStyle}
          >
            <SearchIcon />
          </button>
          <button
            onClick={onActionsClick}
            aria-label="Open account menu"
            style={iconBtnStyle}
          >
            <MoreIcon />
          </button>
        </div>
      </div>
      <div style={{ borderBottom: "1px solid var(--color-border)" }} />
      {searchOpen && <MobileSearchBar onClose={() => setSearchOpen(false)} />}
    </header>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 8,
  cursor: "pointer",
  color: "var(--color-text-tertiary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const HamburgerIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const MoreIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);
