import { useEffect, useRef, useState } from "react";
import { useShellNav } from "./navContext";
import type { MenuItem } from "./menu.types";
import { createPortal } from "react-dom";

const FLYOUT_MAX_HEIGHT = 260;
const FLYOUT_ITEM_HEIGHT = 36;

interface CollapsedMenuPopoverProps {
  item: MenuItem;
  children: React.ReactNode;
}

const CollapsedMenuPopover: React.FC<CollapsedMenuPopoverProps> = ({
  item,
  children: trigger,
}) => {
  const { navigate, pathname } = useShellNav();
  const location = { pathname };
  const [open, setOpen] = useState(false);

  // ── Added triggerCenterY so the arrow always points at the hovered item ──
  const [pos, setPos] = useState({ top: 0, left: 0, triggerCenterY: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedChildren = [...(item.children ?? [])]
    .filter((c) => c.isAssigned && c.isShow)
    .sort((a, b) => a.orderNo - b.orderNo);

  const isActive = (url: string) => !!url && location.pathname === url;

  const openPopover = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedH =
      Math.min(sortedChildren.length, 6) * FLYOUT_ITEM_HEIGHT + 48;
    const viewH = window.innerHeight;

    const top =
      rect.top + estimatedH > viewH - 16
        ? Math.max(8, viewH - estimatedH - 16)
        : rect.top;

    setPos({
      top,
      left: rect.right + 8,
      triggerCenterY: rect.top + rect.height / 2, // ← center of the hovered row
    });
    setOpen(true);
  };

  const closePopover = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const cancelClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Arrow tip points at the vertical center of whichever sidebar row was hovered,
  // regardless of whether the popover clamped upward/downward.
  const arrowTop = Math.max(20, pos.triggerCenterY - pos.top - 8);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={openPopover}
        onMouseLeave={closePopover}
      >
        {trigger}
      </div>

      {open &&
        createPortal(
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={closePopover}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              minWidth: 180,
              maxWidth: 240,
              // No overflow:hidden here — arrow must bleed outside the box
            }}
          >
            {/* ── Arrow: outer layer (border colour) ── */}
            <div
              style={{
                position: "absolute",
                left: -9,
                top: arrowTop,
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: "8px solid var(--color-border)",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            {/* ── Arrow: inner layer (fill colour, 1px offset covers border) ── */}
            <div
              style={{
                position: "absolute",
                left: -8,
                top: arrowTop,
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: "8px solid var(--color-bg-sidebar)",
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* ── Popover content box ── */}
            <div
              style={{
                background: "var(--color-bg-sidebar)",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                boxShadow: "0 8px 28px rgba(0,0,0,0.13)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "8px 14px",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                }}
              >
                {item.menuName}
              </div>

              {/* Children list */}
              <div
                className="scrollbar-thin"
                style={{
                  maxHeight: FLYOUT_MAX_HEIGHT,
                  overflowY: "auto",
                  padding: "4px",
                  maskImage:
                    sortedChildren.length > 6
                      ? "linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)"
                      : undefined,
                  WebkitMaskImage:
                    sortedChildren.length > 6
                      ? "linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)"
                      : undefined,
                }}
              >
                {sortedChildren.map((child) => {
                  const active = isActive(child.routeUrl);
                  return (
                    <button
                      key={child.menuId}
                      type="button"
                      onClick={() => {
                        navigate(child.routeUrl);
                        setOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 10px",
                        border: "none",
                        borderRadius: 6,
                        background: active
                          ? "var(--color-brand-subtle)"
                          : "transparent",
                        color: active
                          ? "var(--color-brand-primary)"
                          : "var(--color-text-primary)",
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          e.currentTarget.style.background =
                            "rgba(0, 0, 0, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: active
                            ? "var(--color-brand-primary)"
                            : "var(--color-border)",
                          transition: "background 0.15s",
                        }}
                      />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {child.menuName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Overflow footer */}
              {sortedChildren.length > 6 && (
                <div
                  style={{
                    padding: "4px 14px 8px",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    textAlign: "center",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  Scroll to see all {sortedChildren.length} items
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default CollapsedMenuPopover;
