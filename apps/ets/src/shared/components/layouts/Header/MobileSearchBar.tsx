import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../app/store/index";
import { selectVisibleMenus } from "../../../../features/navigation/slices/navigationSlice";
import type { MenuItem } from "../../../../shared/types/menu.types";

const flatten = (items: MenuItem[]): MenuItem[] =>
  items.flatMap((i) => [i, ...(i.children ? flatten(i.children) : [])]);

export const MobileSearchBar: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const menuItems = useAppSelector(selectVisibleMenus);
  const [term, setTerm] = useState("");

  const results = useMemo(() => {
    if (!term.trim()) return [];
    const q = term.trim().toLowerCase();
    return flatten(menuItems)
      .filter((i) => i.routeUrl && i.menuName?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [term, menuItems]);

  return (
    <div
      style={{
        padding: "10px 12px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg-header)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search menu..."
          style={{
            width: "90%",
            height: 38,
            padding: "0 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border-input)",
            outline: "none",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={onClose}
          aria-label="Close search"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="var(--color-text-danger)"
              strokeWidth="2"
            />
            <path
              d="M9 9L15 15M15 9L9 15"
              stroke="var(--color-text-danger)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {results.map((r) => (
            <button
              key={r.menuId}
              onClick={() => {
                navigate(r.routeUrl!);
                setTerm("");
                onClose();
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-text-primary)",
              }}
            >
              {r.menuName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
