import React, { useEffect, useRef, useState } from "react";
import { Send, ChevronDown, CheckCircle2 } from "lucide-react";

const GREEN = "#065f46";
const GREEN_DARK = "#064e3b";

interface Props {
  onSend: () => void;
  onResolve: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

export const SendResolveSplitButton: React.FC<Props> = ({
  onSend,
  onResolve,
  disabled = false,
  isSubmitting = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const isDisabled = disabled || isSubmitting;

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-flex" }}>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${GREEN}`,
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        {/* Main action: Send */}
        <button
          onClick={onSend}
          disabled={isDisabled}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            border: "none",
            background: GREEN,
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          <Send size={14} />
          {isSubmitting ? "Sending…" : "Send"}
        </button>

        {/* Chevron toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={isDisabled}
          aria-label="More actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 8px",
            border: "none",
            borderLeft: "1px solid rgba(255,255,255,0.3)",
            background: GREEN_DARK,
            color: "#fff",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 4px)",
            right: 0,
            minWidth: 180,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => {
              setOpen(false);
              onResolve();
            }}
            disabled={isDisabled}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              border: "none",
              background: "#fff",
              color: "#111827",
              fontSize: 13,
              fontWeight: 500,
              cursor: isDisabled ? "not-allowed" : "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f0fdf4")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <CheckCircle2 size={14} color={GREEN} />
            Resolve / Close
          </button>
        </div>
      )}
    </div>
  );
};