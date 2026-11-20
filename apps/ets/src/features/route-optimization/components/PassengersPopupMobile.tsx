// ─── components/PassengersPopup.tsx ────────────────────────────────────────
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { T } from "../constants/designTokens";
import { fmt12 } from "../utils/routeMakerHelpers";
import type { VehicleRoute, Passenger } from "../types/Routemaker.types";
import { GripVertical, MoreVertical, Users } from "lucide-react";
import {
  useDeletePaxFromRouteMutation,
  useMarkNoShowMutation,
} from "../services/routeMakerApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { DragPassenger } from "../hooks/useDragAndDrop";
import EtaEditPopover from "./EditETAPopover";

type PassengerActionMenuProps = {
  route: VehicleRoute;
  passenger: Passenger;
  color: string;
  tripType?: number;
  onSplit?: (vehicleId: number, employeeIds: number[]) => void;
  onRefetch?: () => void;
};

function PassengerActionMenu({
  route,
  passenger,
  color,
  tripType = 1,
  onSplit,
  onRefetch,
}: PassengerActionMenuProps) {
  const { message } = useUILibrary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [removeOptionsOpen, setRemoveOptionsOpen] = useState(false);
  const [confirmNoShow, setConfirmNoShow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [deletePassenger, { isLoading: isDeleting }] =
    useDeletePaxFromRouteMutation();
  const [markNoShow, { isLoading: isMarkingNoShow }] = useMarkNoShowMutation();
  const isVehicleAssigned = route.hasVehicleAssigned && route.hasDriverAssigned;

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(
      margin,
      Math.min(
        triggerRect.right - panelRect.width,
        window.innerWidth - panelRect.width - margin,
      ),
    );
    const belowTop = triggerRect.bottom + 4;
    const top =
      belowTop + panelRect.height <= window.innerHeight - margin
        ? belowTop
        : Math.max(margin, triggerRect.top - panelRect.height - 4);

    setMenuPosition({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
  }, [menuOpen, removeOptionsOpen, confirmNoShow, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen && !removeOptionsOpen && !confirmNoShow) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !panelRef.current?.contains(event.target as Node) &&
        !isDeleting &&
        !isMarkingNoShow
      ) {
        setMenuOpen(false);
        setRemoveOptionsOpen(false);
        setConfirmNoShow(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen, removeOptionsOpen, confirmNoShow, isDeleting, isMarkingNoShow]);

  async function handleRemove() {
    try {
      await deletePassenger({
        dsid: route.VehicleId,
        EmpID: passenger.empId,
      }).unwrap();
      setMenuOpen(false);
      setRemoveOptionsOpen(false);
      message.success(
        `${passenger.Firstname} removed from Trip #${route.VehicleId}.`,
      );
      onRefetch?.();
    } catch {
      message.error(
        `Failed to remove ${passenger.Firstname}. Please try again.`,
      );
    }
  }

  async function handleMarkNoShow() {
    try {
      const result = await markNoShow({
        dsId: route.VehicleId,
        empID: passenger.empId,
        tripType,
        mobileNo: route.driverMobile ?? "",
      }).unwrap();
      setMenuOpen(false);
      setConfirmNoShow(false);
      message.success(result?.message ?? result?.title ?? "Marked as No Show.");
      onRefetch?.();
    } catch {
      message.error("Failed to mark No Show. Please try again.");
    }
  }

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: menuPosition?.top ?? 0,
    left: menuPosition?.left ?? 0,
    zIndex: 2000,
    minWidth: 190,
    maxWidth: "calc(100vw - 16px)",
    padding: 4,
    background: "#fff",
    border: `1px solid ${T.border}`,
    borderRadius: T.radiusSm,
    boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
  };

  const actionStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 10px",
    border: 0,
    borderRadius: T.radiusSm,
    background: "transparent",
    fontSize: 11,
    fontWeight: 600,
    textAlign: "left",
    cursor: "pointer",
  };

  return (
    <div
      ref={menuRef}
      onClick={(event) => event.stopPropagation()}
      style={{ position: "relative", justifySelf: "end" }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${passenger.Firstname}`}
        title="Passenger actions"
        aria-expanded={menuOpen}
        onClick={() => {
          setMenuOpen((open) => !open);
          setRemoveOptionsOpen(false);
          setConfirmNoShow(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          padding: 0,
          border: `1px solid ${menuOpen ? color : T.border}`,
          borderRadius: T.radiusSm,
          background: menuOpen ? `${color}12` : "transparent",
          color: T.muted,
          cursor: "pointer",
        }}
      >
        <MoreVertical size={16} />
      </button>

      {menuOpen &&
        createPortal(
          <div
            ref={panelRef}
            onClick={(event) => event.stopPropagation()}
            style={{
              ...panelStyle,
              visibility: menuPosition ? "visible" : "hidden",
            }}
          >
            {!removeOptionsOpen && !confirmNoShow && (
              <>
                <button
                  type="button"
                  onClick={() => setRemoveOptionsOpen(true)}
                  style={{ ...actionStyle, color: T.danger }}
                >
                  Remove Employee
                </button>
                <button
                  type="button"
                  disabled={!isVehicleAssigned}
                  title={
                    isVehicleAssigned
                      ? undefined
                      : "Assign a vehicle and driver first"
                  }
                  onClick={() => {
                    if (isVehicleAssigned) setConfirmNoShow(true);
                  }}
                  style={{
                    ...actionStyle,
                    borderTop: `1px solid ${T.border}`,
                    color: isVehicleAssigned ? "#D97706" : T.muted,
                    cursor: isVehicleAssigned ? "pointer" : "not-allowed",
                    opacity: isVehicleAssigned ? 1 : 0.55,
                  }}
                >
                  Mark No Show
                </button>
              </>
            )}

            {removeOptionsOpen && (
              <>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleRemove}
                  style={{ ...actionStyle, color: T.danger }}
                >
                  {isDeleting ? "Removing…" : "Remove from trip"}
                </button>
                {onSplit && (
                  <button
                    type="button"
                    onClick={() => {
                      onSplit(route.VehicleId, [passenger.Id]);
                      setMenuOpen(false);
                      setRemoveOptionsOpen(false);
                    }}
                    style={{
                      ...actionStyle,
                      borderTop: `1px solid ${T.border}`,
                      color: "#2563EB",
                    }}
                  >
                    Split to new trip
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRemoveOptionsOpen(false)}
                  style={{
                    ...actionStyle,
                    borderTop: `1px solid ${T.border}`,
                    color: T.muted,
                  }}
                >
                  Back
                </button>
              </>
            )}

            {confirmNoShow && (
              <>
                <div
                  style={{
                    padding: "7px 9px",
                    color: T.text,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Mark {passenger.Firstname} as No Show?
                </div>
                <div style={{ display: "flex", gap: 6, padding: 4 }}>
                  <button
                    type="button"
                    onClick={() => setConfirmNoShow(false)}
                    style={{
                      ...actionStyle,
                      justifyContent: "center",
                      border: `1px solid ${T.border}`,
                      color: T.muted,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isMarkingNoShow}
                    onClick={handleMarkNoShow}
                    style={{
                      ...actionStyle,
                      justifyContent: "center",
                      background: "#D97706",
                      color: "#fff",
                      opacity: isMarkingNoShow ? 0.65 : 1,
                    }}
                  >
                    {isMarkingNoShow ? "Saving…" : "Confirm"}
                  </button>
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function MobilePassengerEta({
  passenger,
  route,
  color,
  onRefetch,
}: {
  passenger: Passenger;
  route: VehicleRoute;
  color: string;
  onRefetch?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const etaLabel = fmt12(passenger.EstimatedPickupTime) || "—";

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={`Edit ETA for ${passenger.Firstname}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        style={{
          border: 0,
          padding: 0,
          background: "transparent",
          color,
          fontSize: 10,
          fontWeight: 700,
          textDecoration: "underline",
          textDecorationStyle: "dashed",
          textUnderlineOffset: 2,
          cursor: "pointer",
          touchAction: "manipulation",
        }}
      >
        {etaLabel}
      </button>
      {isOpen && (
        <EtaEditPopover
          passenger={passenger}
          vehicleId={route.VehicleId}
          groupColor={color}
          anchorRef={anchorRef}
          mobile
          onClose={() => setIsOpen(false)}
          onAfterSave={() => {
            setIsOpen(false);
            onRefetch?.();
          }}
        />
      )}
    </>
  );
}

// ── Expandable address (same as PassengerRow) ──────────────────────────────
function ExpandableAddress({ full }: { full?: string }) {
  const [open, setOpen] = useState(false);
  if (!full) return null;
  const short = full.split(",")[0].trim();
  return (
    <div
      style={{ fontSize: 10, color: T.muted, lineHeight: 1.4, marginTop: 1 }}
    >
      {open ? full : short}
      {full !== short && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          style={{
            marginLeft: 4,
            color: T.accent,
            cursor: "pointer",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {open ? "less" : "...more"}
        </span>
      )}
    </div>
  );
}

// ── Single passenger row — mirrors PassengerRow without drag or edit ───────
function PopupPassengerRow({
  passenger,
  color,
  route,
  tripType,
  onSplit,
  onRefetch,
}: {
  passenger: Passenger;
  color: string;
  route: VehicleRoute;
  tripType?: number;
  onSplit?: (vehicleId: number, employeeIds: number[]) => void;
  onRefetch?: () => void;
}) {
  // Runtime adapter fields not in the typedef — safe-access them
  const p = passenger as Passenger & {
    displayName?: string;
    mobileNo?: string;
    locality?: string | null;
  };

  const isFemale = p.Gender === "F";
  const badgeBg = isFemale ? "#EC4899" : color;
  const etaLabel = fmt12(p.EstimatedPickupTime) || "—";

  return (
    <div
      style={{
        display: "grid",
        // [seq+gender 40px | info 1fr | metrics 70px]
        gridTemplateColumns: "40px 1fr 70px 28px",
        alignItems: "start",
        gap: "0 6px",
        padding: "7px 10px 7px 8px",
        borderBottom: `1px solid ${T.border}`,
        background: T.card,
      }}
    >
      {/* ── Col 1: Seq badge + gender circle ── */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}
      >
        {/* Sequence */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: badgeBg,
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {p.PickupSequence}
        </div>
        {/* Gender */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: isFemale ? "#FDF2F8" : "#EFF6FF",
            border: `1.5px solid ${isFemale ? "#F9A8D4" : "#BFDBFE"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: isFemale ? "#EC4899" : "#3B82F6",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {isFemale ? "♀" : "♂"}
        </div>
      </div>

      {/* ── Col 2: Name / mobile / zone / address ── */}
      <div style={{ minWidth: 0 }}>
        {/* Name */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: T.text,
            lineHeight: 1.3,
          }}
        >
          {p.displayName ? `${p.displayName} - ` : ""}
          {p.Firstname}
        </div>

        {/* Mobile */}
        {p.mobileNo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              marginTop: 2,
            }}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span style={{ fontSize: 9, fontWeight: 600, color: T.text }}>
              {p.mobileNo}
            </span>
          </div>
        )}

        {/* Zone / locality */}
        {p.locality != null && (
          <div
            style={{
              fontSize: 10,
              color: T.muted,
              lineHeight: 1.4,
              marginTop: 1,
              fontWeight: 700,
            }}
          >
            Zone - {p.locality}
          </div>
        )}

        {/* Address (expandable) */}
        <ExpandableAddress full={p.Address} />

        {/* Late badge */}
        {p.IsLate && (
          <span
            style={{
              display: "inline-block",
              marginTop: 2,
              fontSize: 9,
              background: T.dangerBg,
              color: T.danger,
              padding: "1px 5px",
              borderRadius: 3,
              fontWeight: 700,
            }}
          >
            LATE
          </span>
        )}
      </div>

      {/* ── Col 3: Dist / ED / ETA (read-only) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "1px 4px",
          fontSize: 9.5,
          textAlign: "right",
        }}
      >
        <span style={{ color: T.text }}>Dist.</span>
        <span style={{ color: T.textSm, fontWeight: 600 }}>
          {p.routedDistanceKm != null
            ? `${p.routedDistanceKm.toFixed(1)} km`
            : "—"}
        </span>

        <span style={{ color: T.text }}>ED</span>
        <span style={{ color: T.textSm, fontWeight: 600 }}>
          {p.extraDistanceKm != null
            ? `${p.extraDistanceKm.toFixed(1)} km`
            : "—"}
        </span>

        <span style={{ color: T.text }}>ETA</span>
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: badgeBg,
          }}
        >
          {etaLabel}
        </span>
      </div>
      <PassengerActionMenu
        route={route}
        passenger={passenger}
        color={color}
        tripType={tripType}
        onSplit={onSplit}
        onRefetch={onRefetch}
      />
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────
interface PassengersPopupProps {
  route: VehicleRoute;
  color: string;
  onClose: () => void;
  tripType?: number;
  onSplit?: (vehicleId: number, employeeIds: number[]) => void;
  onRefetch?: () => void;
}

// ── Inline mobile passenger list — add inside RouteStackCard.tsx ──────────

export function InlineMobilePassengerList({
  route,
  color,
  onSplit,
  onRefetch,
  onMobilePassengerDrop,
  tripType = 1,
}: {
  route: VehicleRoute;
  color: string;
  tripType?: number;
  onSplit?: (vehicleId: number, employeeIds: number[]) => void;
  onRefetch?: () => void;
  onMobilePassengerDrop?: (
    passenger: DragPassenger,
    targetVehicleId: number,
  ) => void;
}) {
  const dragActivationDelayMs = 220;
  const dragMovementThreshold = 12;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [mobileDrag, setMobileDrag] = useState<{
    passenger: Passenger;
    targetVehicleId: number | null;
    isValidTarget: boolean;
  } | null>(null);
  const dragOverlayRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingTouchRef = useRef<{
    passenger: Passenger;
    sourceElement: HTMLElement;
    pointerId: number;
    startX: number;
    startY: number;
    timer: number;
  } | null>(null);
  const activeTouchRef = useRef<{
    passenger: Passenger;
    sourceElement: HTMLElement;
    pointerId: number;
    targetVehicleId: number | null;
    isValidTarget: boolean;
    targetElement: HTMLElement | null;
    clientX: number;
    clientY: number;
    offsetX: number;
    offsetY: number;
    bodyUserSelect: string;
    documentUserSelect: string;
  } | null>(null);
  const draggedPassengerId = mobileDrag?.passenger.Id;

  useLayoutEffect(() => {
    if (draggedPassengerId == null) return;
    const active = activeTouchRef.current;
    const overlay = dragOverlayRef.current;
    if (!active || !overlay) return;

    const sourceRect = active.sourceElement.getBoundingClientRect();
    const clone = active.sourceElement.cloneNode(true) as HTMLElement;
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("id");
    clone.querySelectorAll<HTMLElement>("*").forEach((element) => {
      element.removeAttribute("id");
      element.tabIndex = -1;
    });
    overlay.replaceChildren(clone);
    overlay.style.width = `${sourceRect.width}px`;
    overlay.style.height = `${sourceRect.height}px`;
    overlay.style.transform = `translate3d(${active.clientX - active.offsetX}px, ${active.clientY - active.offsetY}px, 0)`;

    return () => {
      overlay.replaceChildren();
    };
  }, [draggedPassengerId]);

  useEffect(() => {
    function findTargetCard(clientX: number, clientY: number) {
      const elements = document.elementsFromPoint(clientX, clientY);
      for (const element of elements) {
        const card = element.closest<HTMLElement>("[data-route-card-id]");
        if (card) return card;
      }

      // Fall back to card bounds for browsers with incomplete point hit-testing.
      for (const card of document.querySelectorAll<HTMLElement>(
        "[data-route-card-id]",
      )) {
        const rect = card.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return card;
        }
      }

      return null;
    }

    function clearDropHighlight(
      active: NonNullable<typeof activeTouchRef.current>,
    ) {
      active.targetElement?.removeAttribute("data-mobile-drop-state");
      active.targetElement = null;
      active.targetVehicleId = null;
      active.isValidTarget = false;
    }

    function updateDropTarget(
      active: NonNullable<typeof activeTouchRef.current>,
      clientX: number,
      clientY: number,
    ) {
      const targetElement = findTargetCard(clientX, clientY);
      const targetVehicleId = targetElement
        ? Number(targetElement.dataset.routeCardId)
        : null;
      const validTarget =
        targetVehicleId != null &&
        Number.isFinite(targetVehicleId) &&
        targetVehicleId !== route.VehicleId;

      if (active.targetElement !== targetElement) {
        active.targetElement?.removeAttribute("data-mobile-drop-state");
        active.targetElement = targetElement;
      }
      targetElement?.setAttribute(
        "data-mobile-drop-state",
        validTarget ? "valid" : "invalid",
      );
      active.targetVehicleId =
        targetVehicleId != null && Number.isFinite(targetVehicleId)
          ? targetVehicleId
          : null;
      active.isValidTarget = validTarget;

      setMobileDrag((current) => {
        if (
          current?.targetVehicleId === active.targetVehicleId &&
          current.isValidTarget === active.isValidTarget
        ) {
          return current;
        }
        return {
          passenger: active.passenger,
          targetVehicleId: active.targetVehicleId,
          isValidTarget: active.isValidTarget,
        };
      });
    }

    function queueOverlayPosition() {
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        const active = activeTouchRef.current;
        const overlay = dragOverlayRef.current;
        if (!active || !overlay) return;

        const maxLeft = Math.max(8, window.innerWidth - overlay.offsetWidth - 8);
        const maxTop = Math.max(8, window.innerHeight - overlay.offsetHeight - 8);
        const left = Math.min(
          maxLeft,
          Math.max(8, active.clientX - active.offsetX),
        );
        const top = Math.min(
          maxTop,
          Math.max(8, active.clientY - active.offsetY),
        );
        overlay.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      });
    }

    function handleViewportChange() {
      const active = activeTouchRef.current;
      if (!active) return;
      updateDropTarget(active, active.clientX, active.clientY);
      queueOverlayPosition();
    }

    function handlePointerMove(event: PointerEvent) {
      const pending = pendingTouchRef.current;
      const active = activeTouchRef.current;
      if (pending?.pointerId === event.pointerId && !active) {
        const movedDistance = Math.hypot(
          event.clientX - pending.startX,
          event.clientY - pending.startY,
        );
        if (movedDistance > dragMovementThreshold) {
          window.clearTimeout(pending.timer);
          pendingTouchRef.current = null;
        }
        return;
      }
      if (!active || active.pointerId !== event.pointerId) return;

      event.preventDefault();
      active.clientX = event.clientX;
      active.clientY = event.clientY;
      updateDropTarget(active, event.clientX, event.clientY);
      queueOverlayPosition();
    }

    function handlePointerEnd(event: PointerEvent) {
      const pending = pendingTouchRef.current;
      if (pending?.pointerId === event.pointerId) {
        window.clearTimeout(pending.timer);
        pendingTouchRef.current = null;
      }

      const active = activeTouchRef.current;
      if (!active || active.pointerId !== event.pointerId) return;

      if (event.type !== "pointercancel") {
        updateDropTarget(active, event.clientX, event.clientY);
      }
      if (
        event.type !== "pointercancel" &&
        active.isValidTarget &&
        active.targetVehicleId != null
      ) {
        const passengerPayload: DragPassenger = {
          passengerId: active.passenger.Id,
          passengerName: active.passenger.Firstname,
          employeeId: active.passenger.EmployeeID,
          gender: active.passenger.Gender,
          sourceVehicleId: route.VehicleId,
          sourceVehicleLabel: `Trip #${route.VehicleId}`,
          pickupSequence: active.passenger.PickupSequence,
        };
        onMobilePassengerDrop?.(passengerPayload, active.targetVehicleId);
      }
      clearDropHighlight(active);
      document.body.style.userSelect = active.bodyUserSelect;
      document.documentElement.style.userSelect = active.documentUserSelect;
      activeTouchRef.current = null;
      setMobileDrag(null);
    }

    document.addEventListener("pointermove", handlePointerMove, {
      passive: false,
      capture: true,
    });
    document.addEventListener("pointerup", handlePointerEnd, true);
    document.addEventListener("pointercancel", handlePointerEnd, true);
    window.addEventListener("resize", handleViewportChange);
    document.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove, true);
      document.removeEventListener("pointerup", handlePointerEnd, true);
      document.removeEventListener("pointercancel", handlePointerEnd, true);
      window.removeEventListener("resize", handleViewportChange);
      document.removeEventListener("scroll", handleViewportChange, true);
      if (pendingTouchRef.current) {
        window.clearTimeout(pendingTouchRef.current.timer);
        pendingTouchRef.current = null;
      }
      if (activeTouchRef.current) {
        clearDropHighlight(activeTouchRef.current);
        document.body.style.userSelect =
          activeTouchRef.current.bodyUserSelect;
        document.documentElement.style.userSelect =
          activeTouchRef.current.documentUserSelect;
        activeTouchRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [onMobilePassengerDrop, route.VehicleId]);

  function startTouchDrag(
    event: React.PointerEvent<HTMLButtonElement>,
    passenger: Passenger,
  ) {
    if (route.tripStatusCode === 9 || event.pointerType === "mouse") return;

    event.stopPropagation();
    if (pendingTouchRef.current) {
      window.clearTimeout(pendingTouchRef.current.timer);
    }
    const sourceElement =
      event.currentTarget.closest<HTMLElement>("[data-passenger-row]");
    if (!sourceElement) return;
    const pointerId = event.pointerId;
    const pending = {
      passenger,
      sourceElement,
      pointerId,
      startX: event.clientX,
      startY: event.clientY,
      timer: 0,
    };
    pending.timer = window.setTimeout(() => {
      if (pendingTouchRef.current !== pending) return;
      pendingTouchRef.current = null;
      const sourceRect = sourceElement.getBoundingClientRect();
      activeTouchRef.current = {
        passenger,
        sourceElement,
        pointerId,
        targetVehicleId: null,
        isValidTarget: false,
        targetElement: null,
        clientX: pending.startX,
        clientY: pending.startY,
        offsetX: pending.startX - sourceRect.left,
        offsetY: pending.startY - sourceRect.top,
        bodyUserSelect: document.body.style.userSelect,
        documentUserSelect: document.documentElement.style.userSelect,
      };
      document.body.style.userSelect = "none";
      document.documentElement.style.userSelect = "none";
      setMobileDrag({
        passenger,
        targetVehicleId: null,
        isValidTarget: false,
      });
      if ("vibrate" in navigator) navigator.vibrate?.(25);
    }, dragActivationDelayMs);
    pendingTouchRef.current = pending;
  }

  const sorted = [...(route.Passengers ?? [])].sort(
    (a, b) => a.PickupSequence - b.PickupSequence,
  );

  if (sorted.length === 0) {
    return (
      <div
        style={{
          padding: "12px 10px",
          textAlign: "center",
          fontSize: 11,
          color: T.muted,
        }}
      >
        No passengers
      </div>
    );
  }

  return (
    <div>
      {sorted.map((passenger) => {
        const p = passenger as typeof passenger & {
          displayName?: string;
          mobileNo?: string;
          locality?: string | null;
        };
        const isFemale = p.Gender === "F";
        const badgeBg = isFemale ? "#EC4899" : color;
        const isExpanded = expandedId === p.Id;

        const shortAddr = p.Address?.split(",")[0]?.trim();
        const hasMore = p.Address && p.Address !== shortAddr;

        return (
          <div
            key={p.Id}
            data-passenger-row
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            style={{
              borderBottom: `1px solid ${T.border}`,
              background: T.card,
            }}
          >
            {/* ── Main row ── */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "24px auto 1fr auto 28px",
                alignItems: "center",
                gap: "0 6px",
                padding: "6px 10px 6px 8px",
              }}
            >
              <button
                type="button"
                aria-label={`Drag ${p.Firstname} to another trip`}
                title="Press and hold, then drag to another trip"
                onPointerDown={(event) => startTouchDrag(event, p)}
                onClick={(event) => event.stopPropagation()}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 24,
                  height: 32,
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  color: T.muted,
                  cursor: route.tripStatusCode === 9 ? "not-allowed" : "grab",
                  touchAction: "none",
                }}
              >
                <GripVertical size={16} />
              </button>
              {/* Col 1: seq + gender stacked */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: badgeBg,
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.PickupSequence}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: isFemale ? "#EC4899" : "#3B82F6",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {isFemale ? "♀" : "♂"}
                </div>
              </div>

              {/* Col 2: name + address */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.text,
                    lineHeight: 1.3,
                  }}
                >
                  {p.displayName ? `${p.displayName} · ` : ""}
                  {p.Firstname}
                </div>

                {p.locality != null && (
                  <div
                    style={{
                      fontSize: 9,
                      color: T.muted,
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    Zone · {p.locality}
                  </div>
                )}

                {shortAddr && (
                  <div
                    style={{
                      fontSize: 9,
                      color: T.muted,
                      marginTop: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {isExpanded ? p.Address : shortAddr}
                    {hasMore && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : p.Id);
                        }}
                        style={{
                          marginLeft: 4,
                          color: T.accent,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: 9,
                        }}
                      >
                        {isExpanded ? " less" : " ...more"}
                      </span>
                    )}
                  </div>
                )}

                {p.mobileNo && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      marginTop: 2,
                    }}
                  >
                    <svg
                      width="7"
                      height="7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <span style={{ fontSize: 9, color: T.muted }}>
                      {p.mobileNo}
                    </span>
                  </div>
                )}
              </div>

              {/* Col 3: ETA + dist stacked */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{ fontSize: 8, color: T.muted, fontWeight: 600 }}
                  >
                    ETA:
                  </span>
                  <MobilePassengerEta
                    passenger={p}
                    route={route}
                    color={badgeBg}
                    onRefetch={onRefetch}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    justifyContent: "flex-end",
                    marginTop: 3,
                  }}
                >
                  <span
                    style={{ fontSize: 8, color: T.muted, fontWeight: 600 }}
                  >
                    Dist.:
                  </span>
                  <span style={{ fontSize: 8, color: T.muted }}>
                    {p.routedDistanceKm != null
                      ? `${p.routedDistanceKm.toFixed(1)} km`
                      : "—"}
                  </span>
                </div>
              </div>
              <PassengerActionMenu
                route={route}
                passenger={p}
                color={color}
                tripType={tripType}
                onSplit={onSplit}
                onRefetch={onRefetch}
              />
            </div>
          </div>
        );
      })}
      {mobileDrag &&
        createPortal(
          <>
            <style>{`
              [data-mobile-drop-state="valid"] {
                outline: 2px solid #22c55e !important;
                box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2) !important;
              }
              [data-mobile-drop-state="invalid"] {
                outline: 2px solid #ef4444 !important;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.18) !important;
              }
            `}</style>
            <div
              ref={dragOverlayRef}
              aria-hidden="true"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 3001,
                pointerEvents: "none",
                opacity: 0.96,
                filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.28))",
                willChange: "transform",
              }}
            />
            <div
              style={{
                position: "fixed",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 3002,
                padding: "9px 14px",
                borderRadius: 8,
                background: mobileDrag.isValidTarget
                  ? "#166534"
                  : mobileDrag.targetVehicleId
                    ? "#991b1b"
                    : "#1F2937",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(0,0,0,0.24)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {mobileDrag.isValidTarget && mobileDrag.targetVehicleId
                ? `Release to move or merge with Trip #${mobileDrag.targetVehicleId}`
                : mobileDrag.targetVehicleId
                  ? "Cannot drop on the source trip"
                  : `Dragging ${mobileDrag.passenger.Firstname} — drop on another trip`}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

// ── Main popup ─────────────────────────────────────────────────────────────
export default function PassengersPopup({
  route,
  color,
  onClose,
  tripType = 1,
  onSplit,
  onRefetch,
}: PassengersPopupProps) {
  const sorted: Passenger[] = [...(route.Passengers ?? [])].sort(
    (a, b) => a.PickupSequence - b.PickupSequence,
  );

  const femaleCount = sorted.filter((p) => p.Gender === "F").length;
  const maleCount = sorted.length - femaleCount;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: T.overlay,
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.panel,
          borderRadius: T.radiusLg,
          width: "100%",
          maxWidth: 400,
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: T.shadowXl,
          overflow: "hidden",
        }}
      >
        {/* ── Header — matches CabGroupPanel header style ──────────────── */}
        <div
          style={{
            padding: "10px 12px 8px",
            background: `${color}18`,
            borderBottom: `1px solid ${T.border}`,
            borderTop: `3px solid ${color}`,
          }}
        >
          {/* Trip label row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {/* Color dot */}
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 0 2px ${color}33`,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                Trip ID - {route.VehicleId}
              </span>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                borderRadius: T.radiusSm,
                cursor: "pointer",
                color: T.muted,
                fontSize: 15,
                lineHeight: 1,
                padding: "2px 7px",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Gender + total pills — same as before, below the trip label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginTop: 7,
            }}
          >
            <Users size={12} color={color} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: T.radiusFull,
                background: "#EFF6FF",
                color: "#1D4ED8",
                border: "1px solid #BFDBFE",
              }}
            >
              {maleCount}M
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: T.radiusFull,
                background: "#FDF2F8",
                color: "#BE185D",
                border: "1px solid #F9A8D4",
              }}
            >
              {femaleCount}F
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: T.radiusFull,
                background: T.accentBg,
                color: T.accent,
                border: `1px solid ${T.successBorder}`,
              }}
            >
              {sorted.length} pax
            </span>
          </div>
        </div>

        {/* ── Passenger list ───────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {sorted.length === 0 ? (
            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                fontSize: 12,
                color: T.muted,
              }}
            >
              No passengers on this trip.
            </div>
          ) : (
            sorted.map((p) => (
              <PopupPassengerRow
                key={p.Id}
                passenger={p}
                color={color}
                route={route}
                tripType={tripType}
                onSplit={onSplit}
                onRefetch={onRefetch}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
