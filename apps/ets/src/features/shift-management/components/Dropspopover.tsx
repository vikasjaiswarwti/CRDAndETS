// // shared/components/shift-grid/DropsPopover.tsx
// // ─────────────────────────────────────────────────────────────────────────────
// //  Multi-drop manager for a single login/logout shift.
// //
// //  UI:  [trigger chip] → popover with tag cloud + checkbox list → Save
// //
// //  APIs used:
// //    POST /MstShift/ShiftDropDown
// //         { locCode, lockType: "" }
// //         → returns available logout shift options (called on popover open)
// //
// //    POST /MstShift/ShiftLockUpdate
// //         { lockType, locCode, shiftID, dropShift: "18:00,18:30,19:00" }
// //         → saves the selection
// //
// //  ADD THIS ENDPOINT TO shiftManagementApi.ts:
// //  ──────────────────────────────────────────
// //  shiftDropDown: builder.mutation<
// //    Array<{ shiftTime: string; shiftId?: number } | string>,
// //    { locCode: number; lockType: string }
// //  >({
// //    query: (body) => ({
// //      url: "MstShift/ShiftDropDown",
// //      method: "POST",
// //      body,
// //    }),
// //  }),
// //  ──────────────────────────────────────────
// //  Then import useShiftDropDownMutation from shiftManagementApi
// //  and replace the inline useLazyShiftDropDown hook below.
// // ─────────────────────────────────────────────────────────────────────────────

// import { memo, useCallback, useEffect, useRef, useState } from "react";
// import ReactDOM from "react-dom";
// import { Plus, X, ChevronDown, Search, Loader2 } from "lucide-react";
// import {
//   useShiftLockUpdateMutation,
//   useShiftDropDownMutation,
// } from "../services/shiftManagementApi";
// import { C, R, SP, SH, Z, TR } from "../shift-grid/ShiftGridTokens";

// // ── Portal popover position ───────────────────────────────────────────────────
// interface PopoverPos {
//   top: number;
//   left: number;
//   width: number;
// }

// // ── Props ─────────────────────────────────────────────────────────────────────
// export interface DropsPopoverProps {
//   shiftID: number;
//   locCode: number;
//   lockType: "SHIFT" | "LOB" | "DEPARTMENT" | string;
//   currentDrops: string; // e.g. "18:00,18:30,19:00"
//   allShiftTimes?: string[]; // fallback if API unavailable
//   onSaved?: (newDrops: string) => void;
//   readonly?: boolean;
// }

// // ── Parse / join helpers ──────────────────────────────────────────────────────
// const parse = (s: string) =>
//   s
//     ? s
//         .split(",")
//         .map((t) => t.trim())
//         .filter(Boolean)
//     : [];
// const join = (arr: string[]) => arr.join(",");

// // ── Main component ────────────────────────────────────────────────────────────
// export const DropsPopover = memo<DropsPopoverProps>(
//   ({
//     shiftID,
//     locCode,
//     lockType,
//     currentDrops,
//     allShiftTimes = [],
//     onSaved,
//     readonly = false,
//   }) => {
//     const [open, setOpen] = useState(false);
//     const [pos, setPos] = useState<PopoverPos>({ top: 0, left: 0, width: 300 });
//     const [pending, setPending] = useState<string[]>([]);
//     const [filter, setFilter] = useState("");
//     const [toast, setToast] = useState<string | null>(null);
//     // Drop options fetched from API on open; falls back to allShiftTimes prop
//     const [dropOptions, setDropOptions] = useState<string[]>(allShiftTimes);

//     const triggerRef = useRef<HTMLButtonElement>(null);
//     const popoverRef = useRef<HTMLDivElement>(null);

//     const [shiftLockUpdate, { isLoading: isSaving }] =
//       useShiftLockUpdateMutation();
//     const [fetchDropOptions, { isLoading: isLoadingOptions }] =
//       useShiftDropDownMutation();

//     // Compute portal position from trigger rect
//     const openPopover = useCallback(() => {
//       if (readonly || !triggerRef.current) return;
//       const r = triggerRef.current.getBoundingClientRect();
//       const POPOVER_W = 300;
//       const left =
//         r.left + POPOVER_W > window.innerWidth - 8
//           ? r.right - POPOVER_W
//           : r.left;
//       setPos({ top: r.bottom + 6, left, width: POPOVER_W });
//       setOpen((o) => !o);
//     }, [readonly]);

//     // Reposition on scroll / resize while open
//     useEffect(() => {
//       if (!open) return;
//       const update = () => {
//         if (!triggerRef.current) return;
//         const r = triggerRef.current.getBoundingClientRect();
//         const POPOVER_W = 300;
//         const left =
//           r.left + POPOVER_W > window.innerWidth - 8
//             ? r.right - POPOVER_W
//             : r.left;
//         setPos({ top: r.bottom + 6, left, width: POPOVER_W });
//       };
//       window.addEventListener("scroll", update, true);
//       window.addEventListener("resize", update);
//       return () => {
//         window.removeEventListener("scroll", update, true);
//         window.removeEventListener("resize", update);
//       };
//     }, [open]);

//     // On open: initialise working copy + fetch available drop options from API
//     useEffect(() => {
//       if (!open) return;
//       setPending(parse(currentDrops));
//       setFilter("");

//       // Call POST /MstShift/ShiftDropDown to get logout shift options
//       // Payload + response is logged inside shiftManagementApi.ts (queryFn)
//       fetchDropOptions({ locCode, lockType: "" })
//         .unwrap()
//         .then((data) => {
//           // ShiftDropDownItem has shiftTime as the display field
//           const times = data
//             .map((item) => item.shiftTime ?? item.shiftDesc ?? "")
//             .filter(Boolean);
//           setDropOptions(times.length > 0 ? times : allShiftTimes);
//         })
//         .catch(() => {
//           setDropOptions(allShiftTimes);
//         });
//     }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

//     // Close on outside click
//     useEffect(() => {
//       if (!open) return;
//       const handler = (e: MouseEvent) => {
//         if (
//           popoverRef.current &&
//           !popoverRef.current.contains(e.target as Node) &&
//           triggerRef.current &&
//           !triggerRef.current.contains(e.target as Node)
//         )
//           setOpen(false);
//       };
//       document.addEventListener("mousedown", handler);
//       return () => document.removeEventListener("mousedown", handler);
//     }, [open]);

//     // Auto-dismiss toast
//     useEffect(() => {
//       if (!toast) return;
//       const t = setTimeout(() => setToast(null), 2800);
//       return () => clearTimeout(t);
//     }, [toast]);

//     // Toggle a time in the working copy
//     const toggle = useCallback((time: string) => {
//       setPending((prev) =>
//         prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
//       );
//     }, []);

//     // Save → API
//     const handleSave = useCallback(async () => {
//       const dropShift = join(pending);
//       try {
//         await shiftLockUpdate({
//           lockType,
//           locCode,
//           shiftID,
//           dropShift,
//         }).unwrap();
//         onSaved?.(dropShift);
//         setToast("Drop shifts saved.");
//         setOpen(false);
//       } catch {
//         setToast("Save failed — please retry.");
//       }
//     }, [pending, lockType, locCode, shiftID, shiftLockUpdate, onSaved]);

//     const current = parse(currentDrops);
//     const hasChanges =
//       JSON.stringify([...pending].sort()) !==
//       JSON.stringify([...current].sort());

//     // ── Trigger chip ─────────────────────────────────────────────
//     const chipLabel =
//       current.length === 0
//         ? "Add drops"
//         : `${current.length} drop${current.length !== 1 ? "s" : ""}`;

//     return (
//       <div style={{ position: "relative", display: "inline-block" }}>
//         {/* Trigger */}
//         <button
//           ref={triggerRef}
//           onClick={openPopover}
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             gap: 4,
//             height: 26,
//             padding: "0 10px",
//             border: `1px solid ${current.length ? "#86EFAC" : C.border}`,
//             borderRadius: 99,
//             background: current.length ? "#F0FDF4" : C.white,
//             color: current.length ? "#14532D" : C.textMuted,
//             fontSize: 11,
//             fontWeight: current.length ? 600 : 400,
//             cursor: readonly ? "default" : "pointer",
//             transition: TR.fast,
//             whiteSpace: "nowrap",
//           }}
//           onMouseEnter={(e) => {
//             if (!readonly) e.currentTarget.style.borderColor = C.primary;
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.borderColor = current.length
//               ? "#86EFAC"
//               : C.border;
//           }}
//         >
//           {current.length === 0 ? (
//             <Plus size={11} strokeWidth={2.5} />
//           ) : (
//             <ChevronDown size={11} strokeWidth={2} />
//           )}
//           {chipLabel}
//         </button>

//         {/* Popover — rendered via portal so it escapes overflow:hidden on the table */}
//         {open &&
//           ReactDOM.createPortal(
//             <div
//               ref={popoverRef}
//               style={{
//                 position: "fixed",
//                 top: pos.top,
//                 left: pos.left,
//                 width: pos.width, // 300px
//                 zIndex: Z.popover,
//                 background: C.white,
//                 border: `1px solid ${C.border}`,
//                 borderRadius: R["2xl"],
//                 boxShadow: SH.popover,
//                 overflow: "hidden",
//               }}
//             >
//               {/* Header */}
//               <div
//                 style={{
//                   padding: `${SP[2.5]}px ${SP[3]}px ${SP[2]}px`,
//                   borderBottom: `1px solid ${C.border}`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
//                   Drop Shifts
//                 </span>
//                 <button
//                   onClick={() => setOpen(false)}
//                   style={{
//                     border: "none",
//                     background: "none",
//                     cursor: "pointer",
//                     color: C.textMuted,
//                     padding: 2,
//                   }}
//                 >
//                   <X size={13} />
//                 </button>
//               </div>

//               {/* Filter input */}
//               <div
//                 style={{
//                   padding: `${SP[2]}px ${SP[3]}px ${SP[1]}px`,
//                   borderBottom: `1px solid #F3F4F6`,
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                     border: `1px solid ${C.border}`,
//                     borderRadius: R.lg,
//                     padding: "4px 8px",
//                     background: "#F9FAFB",
//                   }}
//                 >
//                   <Search size={11} color={C.textMuted} strokeWidth={2} />
//                   <input
//                     value={filter}
//                     onChange={(e) => setFilter(e.target.value)}
//                     placeholder="Filter times…"
//                     style={{
//                       border: "none",
//                       background: "none",
//                       outline: "none",
//                       fontSize: 11,
//                       color: C.text,
//                       width: "100%",
//                     }}
//                   />
//                   {filter && (
//                     <button
//                       onClick={() => setFilter("")}
//                       style={{
//                         border: "none",
//                         background: "none",
//                         cursor: "pointer",
//                         padding: 0,
//                         color: C.textMuted,
//                         display: "flex",
//                       }}
//                     >
//                       <X size={10} />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               {/* Time chip grid — tap to select/deselect */}
//               <div
//                 style={{
//                   padding: `${SP[2]}px ${SP[3]}px`,
//                   display: "flex",
//                   flexWrap: "wrap",
//                   gap: 6,
//                   height: 180,
//                   overflowY: "auto",
//                   alignContent: "flex-start",
//                   position: "relative",
//                 }}
//               >
//                 {isLoadingOptions ? (
//                   /* Loading state while API fetches drop options */
//                   <div
//                     style={{
//                       position: "absolute",
//                       inset: 0,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       flexDirection: "column",
//                       gap: 6,
//                     }}
//                   >
//                     <Loader2
//                       size={18}
//                       color={C.primary}
//                       style={{ animation: "spin 0.8s linear infinite" }}
//                     />
//                     <span style={{ fontSize: 11, color: C.textMuted }}>
//                       Loading shifts…
//                     </span>
//                   </div>
//                 ) : dropOptions.filter((t) => !filter || t.includes(filter))
//                     .length === 0 ? (
//                   <span style={{ fontSize: 11, color: C.textMuted }}>
//                     {dropOptions.length === 0
//                       ? "No logout shifts available"
//                       : "No matches"}
//                   </span>
//                 ) : (
//                   dropOptions
//                     .filter((t) => !filter || t.includes(filter))
//                     .map((time) => {
//                       const selected = pending.includes(time);
//                       return (
//                         <button
//                           key={time}
//                           onClick={() => toggle(time)}
//                           style={{
//                             height: 28,
//                             padding: "0 11px",
//                             border: `1.5px solid ${selected ? "#16A34A" : C.border}`,
//                             borderRadius: 99,
//                             background: selected ? "#DCFCE7" : C.white,
//                             color: selected ? "#14532D" : C.textSub,
//                             fontSize: 11,
//                             fontWeight: selected ? 700 : 400,
//                             cursor: "pointer",
//                             transition: TR.fast,
//                             whiteSpace: "nowrap",
//                           }}
//                           onMouseEnter={(e) => {
//                             if (!selected)
//                               e.currentTarget.style.background = "#F9FAFB";
//                           }}
//                           onMouseLeave={(e) => {
//                             e.currentTarget.style.background = selected
//                               ? "#DCFCE7"
//                               : C.white;
//                           }}
//                         >
//                           {time}
//                         </button>
//                       );
//                     })
//                 )}
//               </div>
//               <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

//               {/* Selected summary */}
//               <div
//                 style={{
//                   padding: `${SP[1.5]}px ${SP[3]}px`,
//                   borderTop: `1px solid #F3F4F6`,
//                   minHeight: 30,
//                   fontSize: 11,
//                 }}
//               >
//                 {pending.length > 0 ? (
//                   <span style={{ color: "#15803D", fontWeight: 600 }}>
//                     Will be added as drop shifts: {pending.join(", ")}
//                   </span>
//                 ) : (
//                   <span style={{ color: C.textMuted }}>
//                     No drop shifts selected
//                   </span>
//                 )}
//               </div>

//               {/* Footer */}
//               <div
//                 style={{
//                   padding: `${SP[2]}px ${SP[3]}px`,
//                   borderTop: `1px solid ${C.border}`,
//                   display: "flex",
//                   gap: SP[1.5],
//                   justifyContent: "flex-end",
//                   alignItems: "center",
//                 }}
//               >
//                 {toast && (
//                   <span
//                     style={{
//                       fontSize: 11,
//                       color: toast.includes("failed") ? "#EF4444" : "#16A34A",
//                       flex: 1,
//                     }}
//                   >
//                     {toast}
//                   </span>
//                 )}
//                 <button
//                   onClick={() => setOpen(false)}
//                   style={{
//                     height: 26,
//                     padding: "0 12px",
//                     border: `1px solid ${C.border}`,
//                     borderRadius: R.lg,
//                     background: C.white,
//                     color: C.textSub,
//                     fontSize: 11,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={!hasChanges || isSaving}
//                   style={{
//                     height: 26,
//                     padding: "0 14px",
//                     border: "none",
//                     borderRadius: R.lg,
//                     background: hasChanges && !isSaving ? C.primary : "#D1D5DB",
//                     color: hasChanges && !isSaving ? C.white : "#9CA3AF",
//                     fontSize: 11,
//                     fontWeight: 600,
//                     cursor: hasChanges && !isSaving ? "pointer" : "not-allowed",
//                     transition: TR.fast,
//                   }}
//                 >
//                   {isSaving ? "Saving…" : "Save"}
//                 </button>
//               </div>
//             </div>,
//             document.body,
//           )}
//       </div>
//     );
//   },
// );

// DropsPopover.displayName = "DropsPopover";
// export default DropsPopover;

// shared/components/components/Dropspopover.tsx
// ─────────────────────────────────────────────────────────────────────────────
//  CHANGES: DropsPopover response parsing fixed.
//
//  Problem: fetchDropOptions returns various shapes depending on the API:
//    • Array of { shiftTime, shiftDesc, ... }
//    • Array of strings
//    • { result: [...] }  ← common wrapper pattern
//    • { data: [...] }
//
//  Fix: normaliseDropOptions() strips any wrapper object and tries multiple
//  field names before falling back to allShiftTimes prop.
//
//  Everything else (portal, filter, save) is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Plus, X, ChevronDown, Search, Loader2 } from "lucide-react";
import {
  useShiftLockUpdateMutation,
  useShiftDropDownMutation,
} from "../services/shiftManagementApi"; // ← replace with your actual import path
import { C, R, SH, Z, TR } from "../shift-grid/ShiftGridTokens";

// NOTE: replace the import above with wherever your mutations live, e.g.:
// import { useShiftLockUpdateMutation, useShiftDropDownMutation } from "../../services/shiftManagementApi";

// ── Props ─────────────────────────────────────────────────────────────────────
export interface DropsPopoverProps {
  shiftID: number;
  locCode: number;
  lockType: "SHIFT" | "LOB" | "DEPARTMENT" | string;
  currentDrops: string;
  allShiftTimes?: string[];
  onSaved?: (newDrops: string) => void;
  readonly?: boolean;
}

// ── Parse / join ──────────────────────────────────────────────────────────────
const parse = (s: string) =>
  s
    ? s
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
const join = (arr: string[]) => arr.join(",");

// ── Response normaliser ───────────────────────────────────────────────────────
// Handles:  string[]  |  object[]  |  { result: [] }  |  { data: [] }
function normaliseDropOptions(raw: unknown, fallback: string[]): string[] {
  // Unwrap common wrapper shapes
  let list: unknown = raw;
  if (list !== null && typeof list === "object" && !Array.isArray(list)) {
    list =
      (list as any).result ?? (list as any).data ?? (list as any).items ?? raw;
  }
  if (!Array.isArray(list)) return fallback;

  const times = (list as unknown[])
    .map((item) => {
      if (typeof item === "string") return item;
      if (item !== null && typeof item === "object") {
        return (
          (item as any).shiftTime ??
          (item as any).shiftDesc ??
          (item as any).time ??
          (item as any).value ??
          ""
        );
      }
      return "";
    })
    .filter(Boolean) as string[];

  return times.length > 0 ? times : fallback;
}

// ── Portal position ───────────────────────────────────────────────────────────
interface PopoverPos {
  top: number;
  left: number;
  width: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const DropsPopover = memo<DropsPopoverProps>(
  ({
    shiftID,
    locCode,
    lockType,
    currentDrops,
    allShiftTimes = [],
    onSaved,
    readonly = false,
  }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState<PopoverPos>({ top: 0, left: 0, width: 300 });
    const [pending, setPending] = useState<string[]>([]);
    const [filter, setFilter] = useState("");
    const [toast, setToast] = useState<string | null>(null);
    const [dropOptions, setDropOptions] = useState<string[]>(allShiftTimes);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const [shiftLockUpdate, { isLoading: isSaving }] =
      useShiftLockUpdateMutation();
    const [fetchDropOptions, { isLoading: isLoadingOptions }] =
      useShiftDropDownMutation();

    const POPOVER_W = 300;

    const calcPos = () => {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const left =
        r.left + POPOVER_W > window.innerWidth - 8
          ? r.right - POPOVER_W
          : r.left;
      setPos({ top: r.bottom + 6, left, width: POPOVER_W });
    };

    const openPopover = useCallback(() => {
      if (readonly || !triggerRef.current) return;
      calcPos();
      setOpen((o) => !o);
    }, [readonly]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!open) return;
      window.addEventListener("scroll", calcPos, true);
      window.addEventListener("resize", calcPos);
      return () => {
        window.removeEventListener("scroll", calcPos, true);
        window.removeEventListener("resize", calcPos);
      };
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // On open: init pending selection + fetch drop options from API
    useEffect(() => {
      if (!open) return;
      setPending(parse(currentDrops));
      setFilter("");

      fetchDropOptions({ locCode, lockType: "" })
        .unwrap()
        .then((data) => {
          setDropOptions(normaliseDropOptions(data, allShiftTimes));
        })
        .catch(() => {
          setDropOptions(allShiftTimes);
        });
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // Outside-click to close
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        )
          setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Auto-dismiss toast
    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }, [toast]);

    const toggle = useCallback((time: string) => {
      setPending((prev) =>
        prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
      );
    }, []);

    const handleSave = useCallback(async () => {
      const dropShift = join(pending);
      try {
        await shiftLockUpdate({
          lockType,
          locCode,
          shiftID,
          dropShift,
        }).unwrap();
        onSaved?.(dropShift);
        setToast("Drop shifts saved.");
        setOpen(false);
      } catch {
        setToast("Save failed — please retry.");
      }
    }, [pending, lockType, locCode, shiftID, shiftLockUpdate, onSaved]);

    const current = parse(currentDrops);
    const hasChanges =
      JSON.stringify([...pending].sort()) !==
      JSON.stringify([...current].sort());

    const chipLabel =
      current.length === 0
        ? "Add drops"
        : `${current.length} drop${current.length !== 1 ? "s" : ""}`;

    const filteredOptions = dropOptions.filter(
      (t) => !filter || t.toLowerCase().includes(filter.toLowerCase()),
    );

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Trigger */}
        <button
          ref={triggerRef}
          onClick={openPopover}
          data-no-row-click // prevents row-click from firing
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            height: 26,
            padding: "0 10px",
            border: `1px solid ${current.length ? "#86EFAC" : C.border}`,
            borderRadius: 99,
            background: current.length ? "#F0FDF4" : C.white,
            color: current.length ? "#14532D" : C.textMuted,
            fontSize: 11,
            fontWeight: current.length ? 600 : 400,
            cursor: readonly ? "default" : "pointer",
            transition: TR.fast,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!readonly) e.currentTarget.style.borderColor = C.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = current.length
              ? "#86EFAC"
              : C.border;
          }}
        >
          {current.length === 0 ? (
            <Plus size={11} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={11} strokeWidth={2} />
          )}
          {chipLabel}
        </button>

        {/* Portal popover */}
        {open &&
          ReactDOM.createPortal(
            <div
              ref={popoverRef}
              data-no-row-click
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: pos.width,
                zIndex: Z.popover,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: R["2xl"],
                boxShadow: SH.popover,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: `10px 12px 8px`,
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                  Drop Shifts
                </span>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: C.textMuted,
                    padding: 2,
                  }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Filter */}
              <div
                style={{
                  padding: `8px 12px 6px`,
                  borderBottom: `1px solid #F3F4F6`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    border: `1px solid ${C.border}`,
                    borderRadius: R.lg,
                    padding: "4px 8px",
                    background: "#F9FAFB",
                  }}
                >
                  <Search size={11} color={C.textMuted} strokeWidth={2} />
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter times…"
                    style={{
                      border: "none",
                      background: "none",
                      outline: "none",
                      fontSize: 11,
                      color: C.text,
                      width: "100%",
                    }}
                  />
                  {filter && (
                    <button
                      onClick={() => setFilter("")}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: C.textMuted,
                        display: "flex",
                      }}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Option chips */}
              <div
                style={{
                  padding: "8px 12px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  height: 180,
                  overflowY: "auto",
                  alignContent: "flex-start",
                  position: "relative",
                }}
              >
                {isLoadingOptions ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <Loader2
                      size={18}
                      color={C.primary}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />
                    <span style={{ fontSize: 11, color: C.textMuted }}>
                      Loading shifts…
                    </span>
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    {dropOptions.length === 0
                      ? "No logout shifts available"
                      : "No matches"}
                  </span>
                ) : (
                  filteredOptions.map((time) => {
                    const selected = pending.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => toggle(time)}
                        style={{
                          height: 28,
                          padding: "0 11px",
                          border: `1.5px solid ${selected ? "#16A34A" : C.border}`,
                          borderRadius: 99,
                          background: selected ? "#DCFCE7" : C.white,
                          color: selected ? "#14532D" : C.textSub,
                          fontSize: 11,
                          fontWeight: selected ? 700 : 400,
                          cursor: "pointer",
                          transition: TR.fast,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {time}
                      </button>
                    );
                  })
                )}
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              {/* Selected summary */}
              <div
                style={{
                  padding: "6px 12px",
                  borderTop: `1px solid #F3F4F6`,
                  minHeight: 30,
                  fontSize: 11,
                }}
              >
                {pending.length > 0 ? (
                  <span style={{ color: "#15803D", fontWeight: 600 }}>
                    {pending.join(", ")}
                  </span>
                ) : (
                  <span style={{ color: C.textMuted }}>
                    No drop shifts selected
                  </span>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "8px 12px",
                  borderTop: `1px solid ${C.border}`,
                  display: "flex",
                  gap: 6,
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                {toast && (
                  <span
                    style={{
                      fontSize: 11,
                      color: toast.includes("failed") ? "#EF4444" : "#16A34A",
                      flex: 1,
                    }}
                  >
                    {toast}
                  </span>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    height: 26,
                    padding: "0 12px",
                    border: `1px solid ${C.border}`,
                    borderRadius: R.lg,
                    background: C.white,
                    color: C.textSub,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  style={{
                    height: 26,
                    padding: "0 14px",
                    border: "none",
                    borderRadius: R.lg,
                    background: hasChanges && !isSaving ? C.primary : "#D1D5DB",
                    color: hasChanges && !isSaving ? C.white : "#9CA3AF",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: hasChanges && !isSaving ? "pointer" : "not-allowed",
                    transition: TR.fast,
                  }}
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

DropsPopover.displayName = "DropsPopover";
export default DropsPopover;
