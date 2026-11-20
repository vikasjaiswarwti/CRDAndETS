import { memo, useState, useCallback } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { RM_COLOR, RM_FONT, RM_RADIUS, RM_SPACE } from "../Routeuiconfig";
import type { UseRouteModals } from "../hooks/useRouteModals";
import {
  resolveRouteAction,
  getTripType,
  type ShiftRow,
  type RouteActionContext,
} from "../constants/RouteActionRegistry";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

interface ActionOption {
  value: string;
  label: string;
  name: string;
}

interface StickyTableFooterProps {
  selectedCount: number;
  selectedRows: ShiftRow[]; // ← typed properly, no more `any`
  onClearSelection: () => void;
  actions: ActionOption[];
  selectedAction: string;
  onActionChange: (val: string) => void;
  modals: UseRouteModals;
  currentDate: string;
  currentShiftId: string;
  locCode: number;
  panelType: "planning" | "publishing"; // ← ADD
}

function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface ToastState {
  message: string;
  visible: boolean;
}

export const StickyTableFooter = memo(function StickyTableFooter({
  selectedCount,
  selectedRows,
  onClearSelection,
  actions,
  selectedAction,
  onActionChange,
  modals,
  currentDate,
  locCode,
  panelType,
}: StickyTableFooterProps) {
  const { Select, Button } = useUILibrary();

  const isMobile = useIsMobile();

  const [toast, setToast] = useState<ToastState>({
    message: "",
    visible: false,
  });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3500);
  }, []);

  // ── Pre-flight validation — returns error string or null ──────────────────
  const validate = useCallback(
    (def: { singleShiftOnly?: boolean; blockedOnPastDate?: boolean }, label: string): string | null => {
      if (selectedCount === 0) return "Please select at least one shift first.";

      if (def.singleShiftOnly && selectedCount > 1)
        return `Please select only one shift for "${label}".`;

      if (def.blockedOnPastDate && isDateInPast(currentDate))
        return "This action cannot be performed on a past date.";

      const row = selectedRows[0];
      if (!row?.shiftId)
        return "Shift data is incomplete. Please refresh the page.";

      return null;
    },
    [selectedCount, selectedRows, currentDate],
  );

  const handleApply = () => {
    const action = actions.find((a) => a.value === selectedAction);
    if (!action) {
      showToast("No action selected.");
      return;
    }

    // ── The one lookup that decides which modal opens — see RouteActionRegistry.ts ──
    const definition = resolveRouteAction({ id: action.value, name: action.name });
    if (!definition) {
      console.warn("[Footer] No modal mapped for action:", action);
      showToast(`Action "${action.label}" is not configured.`);
      return;
    }

    const error = validate(definition, action.label);
    if (error) {
      showToast(error);
      return;
    }

    // ── All guards passed — build context once, hand off to the definition ──
    const row0 = selectedRows[0];
    const ctx: RouteActionContext = {
      locCode,
      currentDate,
      panelType,
      row0,
      selectedRows,
      shifts: selectedRows.map((r) => ({
        shiftId: r.shiftId,
        tripType: getTripType(r),
      })),
    };

    modals.open(
      definition.resolveModalKey(ctx) as never,
      definition.buildPayload(ctx) as never,
    );
  };

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {/* ── Slide-up toast ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          right: 0,
          padding: "0 10px 6px",
          pointerEvents: "none",
          transform: toast.visible ? "translateY(0)" : "translateY(10px)",
          opacity: toast.visible ? 1 : 0,
          transition: "transform 0.22s ease, opacity 0.22s ease",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            color: "#92400E",
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 12,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: "0 -2px 10px rgba(0,0,0,0.07)",
          }}
        >
          ⚠️ {toast.message}
        </div>
      </div>

      {/* ── Footer bar ─────────────────────────────────────────────────────── */}

      {isMobile ? (
        /* ── MOBILE: two-row layout ─────────────────────────────────────── */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "10px 12px",
            borderTop: RM_COLOR.borderFooter,
            background: "rgba(249,250,251,0.95)",
          }}
        >
          {/* Row 1: selection count + clear */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontSize: RM_FONT.base,
                fontWeight: 500,
                color: RM_COLOR.gray700,
              }}
            >
              {selectedCount} shift{selectedCount !== 1 ? "s" : ""} selected
            </span>
            {selectedCount > 0 && (
              <>
                <div style={{ flex: 1 }} />
                <button
                  onClick={onClearSelection}
                  type="button"
                  style={{
                    fontSize: RM_FONT.sm,
                    fontWeight: 500,
                    color: "#047857",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                    fontFamily: "inherit",
                  }}
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Row 2: select (fills space) + apply button */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select
                value={selectedAction}
                onChange={(val: string) => onActionChange(val)}
                size="small"
                style={{ width: "100%", fontSize: RM_FONT.base }}
                options={actions.map((a) => ({
                  value: a.value,
                  label: a.label,
                }))}
              />
            </div>
            <Button
              type="primary"
              size="small"
              onClick={handleApply}
              style={{
                background: RM_COLOR.green900,
                borderColor: RM_COLOR.green900,
                fontSize: RM_FONT.md,
                fontWeight: 500,

                height: 26,
                padding: "0 12px",
                flexShrink: 0,
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: RM_SPACE.footerPad,
            borderTop: RM_COLOR.borderFooter,
            background: "rgba(249,250,251,0.95)",
          }}
        >
          <span
            style={{
              fontSize: RM_FONT.base,
              fontWeight: 500,
              color: RM_COLOR.gray700,
              whiteSpace: "nowrap",
            }}
          >
            {selectedCount} shift{selectedCount !== 1 ? "s" : ""} selected
          </span>

          {selectedCount > 0 && (
            <button
              onClick={onClearSelection}
              type="button"
              style={{
                fontSize: RM_FONT.sm,
                fontWeight: 500,
                color: "#047857",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: 2,
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              Clear
            </button>
          )}

          <div style={{ flex: 1 }} />

          <span
            style={{
              fontSize: RM_FONT.sm,
              color: RM_COLOR.gray400,
              whiteSpace: "nowrap",
            }}
          >
            Action
          </span>

          <Select
            value={selectedAction}
            onChange={(val: string) => onActionChange(val)}
            size="small"
            style={{ width: 190, fontSize: RM_FONT.base }}
            options={actions.map((a) => ({ value: a.value, label: a.label }))}
          />

          <Button
            type="primary"
            size="small"
            onClick={handleApply}
            style={{
              background: RM_COLOR.green900,
              borderColor: RM_COLOR.green900,
              fontSize: RM_FONT.md,
              fontWeight: 600,
              borderRadius: RM_RADIUS.btn,
              height: 28,
              padding: "0 14px",
            }}
          >
            Apply
          </Button>
        </div>
      )}
    </div>
  );
});
