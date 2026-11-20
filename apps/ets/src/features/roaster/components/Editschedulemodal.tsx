// // src/features/roster/components/EditScheduleModal.tsx
// // Atomic single-day edit — date and employee are read-only display.
// // Login shift uses pickShifts; logout/drop shift uses dropShifts.

// import React, { useEffect, useMemo, useState } from "react";
// import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
// import {
//   useGetUserShiftsQuery,
//   useGetRosterSupervisorsQuery,
// } from "../services/RosterApi";
// import { useRosterMutations } from "../hooks/useRosterMutations";
// import { COLORS } from "../constants/Rosterconstants";
// import type { ScheduleEntry } from "../types/Roster.types";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";

// dayjs.extend(customParseFormat);

// // ─── Icons ────────────────────────────────────────────────────────────────────
// const SaveSvg = () => (
//   <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//     <path
//       d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z"
//       stroke="currentColor"
//       strokeWidth="1.3"
//     />
//     <path
//       d="M11 14v-5H5v5M5 2v4h5"
//       stroke="currentColor"
//       strokeWidth="1.3"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// const InfoSvg = () => (
//   <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
//     <circle cx="7" cy="7" r="6" stroke="#0ea5e9" strokeWidth="1.3" />
//     <path
//       d="M7 6.5v3M7 4.5h.01"
//       stroke="#0ea5e9"
//       strokeWidth="1.3"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// const CalendarSvg = () => (
//   <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//     <rect
//       x="1"
//       y="2.5"
//       width="14"
//       height="12"
//       rx="2"
//       stroke={COLORS.primaryDark}
//       strokeWidth="1.3"
//     />
//     <path
//       d="M1 6.5h14M5 1v3M11 1v3"
//       stroke={COLORS.primaryDark}
//       strokeWidth="1.3"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// const ShiftSvg = () => (
//   <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//     <circle
//       cx="8"
//       cy="8"
//       r="6.5"
//       stroke={COLORS.primaryDark}
//       strokeWidth="1.3"
//     />
//     <path
//       d="M8 4.5v4l2.5 2"
//       stroke={COLORS.primaryDark}
//       strokeWidth="1.3"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// const LockSvg = () => (
//   <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
//     <rect
//       x="2"
//       y="6"
//       width="10"
//       height="7"
//       rx="1.5"
//       stroke="#9ca3af"
//       strokeWidth="1.2"
//     />
//     <path
//       d="M4.5 6V4.5a2.5 2.5 0 015 0V6"
//       stroke="#9ca3af"
//       strokeWidth="1.2"
//       strokeLinecap="round"
//     />
//   </svg>
// );

// // ─── FieldError ───────────────────────────────────────────────────────────────
// const FieldError: React.FC<{ msg?: string }> = ({ msg }) => {
//   if (!msg) return null;
//   return (
//     <div
//       style={{
//         fontSize: 11,
//         color: "#ef4444",
//         marginTop: 4,
//         display: "flex",
//         alignItems: "center",
//         gap: 4,
//       }}
//     >
//       <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//         <circle cx="6" cy="6" r="5.5" stroke="#ef4444" strokeWidth="1" />
//         <path
//           d="M6 3.5v3M6 8h.01"
//           stroke="#ef4444"
//           strokeWidth="1.2"
//           strokeLinecap="round"
//         />
//       </svg>
//       {msg}
//     </div>
//   );
// };

// // ─── ReadOnlyField ────────────────────────────────────────────────────────────
// const ReadOnlyField: React.FC<{ label: string; value: string }> = ({
//   label,
//   value,
// }) => (
//   <div
//     style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       gap: 12,
//       padding: "6px 10px",
//       border: "1px solid #E5E7EB",
//       borderRadius: 8,
//       background: "#FAFAFA",
//       minHeight: 36,
//     }}
//   >
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 4,
//         fontSize: 12,
//         color: COLORS.textMuted,
//         fontWeight: 500,
//         whiteSpace: "nowrap",
//       }}
//     >
//       <LockSvg />
//       {label}
//     </div>
//     <div
//       style={{
//         fontSize: 12,
//         fontWeight: 600,
//         color: "#374151",
//         textAlign: "right",
//       }}
//     >
//       {value || "—"}
//     </div>
//   </div>
// );

// // ─── SectionHeader ────────────────────────────────────────────────────────────
// const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({
//   icon,
//   title,
// }) => (
//   <div
//     style={{
//       display: "flex",
//       alignItems: "center",
//       gap: 7,
//       marginBottom: 14,
//       paddingBottom: 10,
//       borderBottom: `1px solid ${COLORS.border}`,
//     }}
//   >
//     {icon}
//     <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textBody }}>
//       {title}
//     </span>
//   </div>
// );

// // ─── FieldLabel ───────────────────────────────────────────────────────────────
// const FieldLabel: React.FC<{
//   children: React.ReactNode;
//   required?: boolean;
// }> = ({ children, required }) => (
//   <label
//     style={{
//       display: "block",
//       fontSize: 11,
//       fontWeight: 500,
//       color: COLORS.textMuted,
//       marginBottom: 5,
//     }}
//   >
//     {children}
//     {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
//   </label>
// );

// // ─── Props ────────────────────────────────────────────────────────────────────
// interface EditScheduleModalProps {
//   open: boolean;
//   record: ScheduleEntry | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// interface EditForm {
//   locCode: number;
//   pickupShift: string;
//   dropShift: string;
// }

// interface EditErrors {
//   locCode?: string;
//   pickupShift?: string;
//   dropShift?: string;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function formatDisplayDate(dateStr: string): string {
//   if (!dateStr) return "—";
//   const d = dayjs(dateStr, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
//   if (d.isValid()) return d.format("dddd, DD MMMM YYYY");
//   return dateStr;
// }

// function toIsoDate(dateStr: string): string {
//   if (!dateStr) return "";
//   const d = dayjs(dateStr, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
//   return d.isValid() ? d.format("YYYY-MM-DD") : dateStr;
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
//   open,
//   record,
//   onClose,
//   onSuccess,
// }) => {
//   const { Modal, Select } = useUILibrary();

//   // ── Office list ───────────────────────────────────────────────────────────
//   const { data: supervisors = [], isLoading: officesLoading } =
//     useGetRosterSupervisorsQuery();

//   const officeOptions = useMemo(() => {
//     const seen = new Set<number>();
//     return supervisors
//       .filter((s) => {
//         if (seen.has(s.locCode ?? 0)) return false;
//         seen.add(s.locCode ?? 0);
//         return true;
//       })
//       .map((s) => ({
//         value: String(s.locCode ?? s.empId),
//         label: s.officeName ?? s.empName ?? `Office ${s.empId}`,
//       }));
//   }, [supervisors]);

//   // ── Form state ────────────────────────────────────────────────────────────
//   const [form, setForm] = useState<EditForm>({
//     locCode: 0,
//     pickupShift: "",
//     dropShift: "",
//   });
//   const [errors, setErrors] = useState<EditErrors>({});

//   // ── Shifts — separate pick/drop, no cache ─────────────────────────────────
//   const { data: shiftData, isLoading: shiftsLoading } = useGetUserShiftsQuery(
//     form.locCode || (record?.locCode ?? 0),
//     {
//       skip: !(form.locCode || record?.locCode),
//       refetchOnMountOrArgChange: true,
//     },
//   );

//   const pickShifts = shiftData?.pickShifts ?? [];
//   const dropShifts = shiftData?.dropShifts ?? [];

//   const pickShiftOptions = useMemo(
//     () =>
//       pickShifts.map((s) => ({
//         value: String(s.shiftId),
//         label: s.shiftStart,
//       })),
//     [pickShifts],
//   );

//   const dropShiftOptions = useMemo(
//     () =>
//       dropShifts.map((s) => ({
//         value: String(s.shiftId),
//         label: s.shiftStart,
//       })),
//     [dropShifts],
//   );

//   // ── Pre-fill when record or shifts load ───────────────────────────────────
//   const shiftsKey = [...pickShifts, ...dropShifts]
//     .map((s) => s.shiftId)
//     .join(",");
//   const recordKey = record
//     ? `${record.empid ?? record.empCode}-${record.scheduleDate}-${record.locCode}`
//     : "";

//   useEffect(() => {
//     if (!record) return;

//     const matchPick = pickShifts.find(
//       (s) =>
//         s.shiftStart === record.pickShift || s.shiftName === record.pickShift,
//     );
//     const matchDrop = dropShifts.find(
//       (s) =>
//         s.shiftStart === record.dropShift || s.shiftName === record.dropShift,
//     );

//     setForm({
//       locCode: record.locCode ?? 0,
//       pickupShift: matchPick ? String(matchPick.shiftId) : "",
//       dropShift: matchDrop ? String(matchDrop.shiftId) : "",
//     });
//     setErrors({});
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [recordKey, shiftsKey]);

//   // ── Mutations ─────────────────────────────────────────────────────────────
//   const { updateSchedules, isCreating } = useRosterMutations({
//     onCreateSuccess: () => {
//       onSuccess();
//       onClose();
//     },
//   });

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const clearError = (field: keyof EditErrors) =>
//     setErrors((prev) => ({ ...prev, [field]: undefined }));

//   const validate = (): boolean => {
//     const e: EditErrors = {};
//     if (!form.locCode) e.locCode = "Office is required.";
//     if (!form.pickupShift) e.pickupShift = "Pickup shift is required.";
//     if (!form.dropShift) e.dropShift = "Drop shift is required.";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   // ── Save — atomic: FromDate === ToDate === single row date ────────────────
//   const handleSave = () => {
//     if (!validate() || !record) return;

//     const pickShift = pickShifts.find(
//       (s) => String(s.shiftId) === form.pickupShift,
//     );
//     const dropShift = dropShifts.find(
//       (s) => String(s.shiftId) === form.dropShift,
//     );
//     if (!pickShift || !dropShift) return;

//     const singleDate = toIsoDate(record.scheduleDate);

//     updateSchedules({
//       ScheduleUpdateVersion: "WEB",
//       LocCode: form.locCode,
//       FromDate: singleDate,
//       ToDate: singleDate,
//       ShiftStart: pickShift.shiftStart,
//       ShiftEnd: dropShift.shiftStart,
//       WeekOffs: "",
//       User_Empids: record.empCode ?? String(record.empid ?? ""),
//     });
//   };

//   const displayDate = record ? formatDisplayDate(record.scheduleDate) : "—";
//   const employeeName = record
//     ? (record.userName ?? record.empCode ?? String(record.empid ?? "—"))
//     : "—";

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       title={
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: 9,
//               background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               flexShrink: 0,
//             }}
//           >
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//               <rect
//                 x="2"
//                 y="3"
//                 width="20"
//                 height="18"
//                 rx="3"
//                 fill={COLORS.primaryDark}
//               />
//               <path
//                 d="M7 8h10M7 12h10M7 16h6"
//                 stroke="#fff"
//                 strokeWidth="1.5"
//                 strokeLinecap="round"
//               />
//             </svg>
//           </div>
//           <div>
//             <div
//               style={{
//                 fontSize: 14,
//                 fontWeight: 700,
//                 color: COLORS.primaryDark,
//               }}
//             >
//               Modify Schedule
//             </div>
//             <div
//               style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}
//             >
//               Single-day update · {displayDate}
//             </div>
//           </div>
//         </div>
//       }
//       width={520}
//       destroyOnClose
//       footer={null}
//       styles={{
//         mask: { background: "rgba(0, 60, 30, 0.32)" },
//         content: { borderRadius: 16 },
//         header: {
//           paddingBottom: 12,
//           borderBottom: `1px solid ${COLORS.border}`,
//         },
//       }}
//       style={{ top: 30 }}
//     >
//       <div style={{ padding: "16px 0 4px" }}>
//         {/* ── Info banner ─────────────────────────────────────────── */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "flex-start",
//             gap: 8,
//             background: "#f0f9ff",
//             border: "1px solid #bae6fd",
//             borderRadius: 8,
//             padding: "9px 13px",
//             marginBottom: 16,
//           }}
//         >
//           <div style={{ marginTop: 1, flexShrink: 0 }}>
//             <InfoSvg />
//           </div>
//           <div style={{ fontSize: 12, color: "#0369a1", lineHeight: 1.5 }}>
//             This edit applies <strong>only to {displayDate}</strong>. To mark
//             this day as non-working, use the <strong>Cancel</strong> action
//             instead.
//           </div>
//         </div>

//         {/* ── Read-only info ───────────────────────────────────────── */}
//         <div
//           style={{
//             background: "#fff",
//             border: `1px solid ${COLORS.border}`,
//             borderRadius: 10,
//             padding: "10px 12px",
//             marginBottom: 10,
//           }}
//         >
//           <SectionHeader
//             icon={<CalendarSvg />}
//             title="Record Info (read-only)"
//           />
//           <div
//             style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
//           >
//             <ReadOnlyField label="Employee" value={employeeName} />
//             <ReadOnlyField label="Date" value={record?.scheduleDate ?? "—"} />
//             <ReadOnlyField label="Day" value={record?.weekDays ?? "—"} />
//             <ReadOnlyField
//               label="Current Pickup"
//               value={record?.pickShift ?? "—"}
//             />
//           </div>
//         </div>

//         {/* ── Office ──────────────────────────────────────────────── */}
//         <div
//           style={{
//             background: "#fff",
//             border: `1px solid ${COLORS.border}`,
//             borderRadius: 12,
//             padding: "14px 16px",
//             marginBottom: 12,
//           }}
//         >
//           <SectionHeader icon={<CalendarSvg />} title="Office" />
//           <FieldLabel required>Office / Location</FieldLabel>
//           <Select
//             value={form.locCode ? String(form.locCode) : undefined}
//             onChange={(v: string) => {
//               setForm((p) => ({
//                 ...p,
//                 locCode: Number(v),
//                 pickupShift: "",
//                 dropShift: "",
//               }));
//               clearError("locCode");
//             }}
//             options={officeOptions}
//             placeholder={officesLoading ? "Loading…" : "Select office"}
//             loading={officesLoading}
//             showSearch
//             style={{ width: "100%" }}
//           />
//           <FieldError msg={errors.locCode} />
//           {form.locCode &&
//             record?.locCode &&
//             form.locCode !== record.locCode && (
//               <div
//                 style={{
//                   fontSize: 11,
//                   color: "#f59e0b",
//                   marginTop: 6,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 4,
//                 }}
//               >
//                 <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                   <path
//                     d="M6 1L11 10H1L6 1z"
//                     stroke="#f59e0b"
//                     strokeWidth="1.1"
//                     strokeLinejoin="round"
//                   />
//                   <path
//                     d="M6 5v2.5M6 9h.01"
//                     stroke="#f59e0b"
//                     strokeWidth="1.1"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//                 Office changed — shifts below reflect the new office
//               </div>
//             )}
//         </div>

//         {/* ── Shifts ──────────────────────────────────────────────── */}
//         <div
//           style={{
//             background: "#fff",
//             border: `1px solid ${COLORS.border}`,
//             borderRadius: 12,
//             padding: "14px 16px",
//             marginBottom: 20,
//           }}
//         >
//           <SectionHeader icon={<ShiftSvg />} title="Shift Timings" />
//           <div
//             style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
//           >
//             <div>
//               <FieldLabel required>Login Shift</FieldLabel>
//               <Select
//                 value={form.pickupShift || undefined}
//                 onChange={(v: string) => {
//                   setForm((p) => ({ ...p, pickupShift: v }));
//                   clearError("pickupShift");
//                 }}
//                 options={pickShiftOptions}
//                 placeholder={shiftsLoading ? "Loading…" : "Select login shift"}
//                 loading={shiftsLoading}
//                 style={{ width: "100%" }}
//               />
//               <FieldError msg={errors.pickupShift} />
//             </div>
//             <div>
//               <FieldLabel required>Logout Shift</FieldLabel>
//               <Select
//                 value={form.dropShift || undefined}
//                 onChange={(v: string) => {
//                   setForm((p) => ({ ...p, dropShift: v }));
//                   clearError("dropShift");
//                 }}
//                 options={dropShiftOptions}
//                 placeholder={shiftsLoading ? "Loading…" : "Select logout shift"}
//                 loading={shiftsLoading}
//                 style={{ width: "100%" }}
//               />
//               <FieldError msg={errors.dropShift} />
//             </div>
//           </div>
//         </div>

//         {/* ── Actions ─────────────────────────────────────────────── */}
//         <div style={{ display: "flex", gap: 10 }}>
//           <button
//             type="button"
//             onClick={onClose}
//             style={{
//               flex: 1,
//               padding: "10px 0",
//               borderRadius: 50,
//               border: `1.5px solid ${COLORS.border}`,
//               background: "#fff",
//               color: COLORS.textMuted,
//               fontSize: 13,
//               fontWeight: 600,
//               cursor: "pointer",
//               fontFamily: "inherit",
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={isCreating}
//             style={{
//               flex: 2,
//               padding: "10px 0",
//               borderRadius: 50,
//               border: "none",
//               background: isCreating ? COLORS.primaryMid : COLORS.primaryDark,
//               color: "#fff",
//               fontSize: 13,
//               fontWeight: 700,
//               cursor: isCreating ? "not-allowed" : "pointer",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 8,
//               fontFamily: "inherit",
//               opacity: isCreating ? 0.8 : 1,
//               transition: "opacity 0.15s",
//             }}
//           >
//             <SaveSvg />
//             {isCreating ? "Saving…" : "Save Changes"}
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default EditScheduleModal;

// src/features/roster/components/EditScheduleModal.tsx
// Single-day shift edit — employee, date, office are read-only.

import React, { useEffect, useMemo, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGetUserShiftsQuery } from "../services/RosterApi";
import { useRosterMutations } from "../hooks/useRosterMutations";
import { COLORS } from "../constants/Rosterconstants";
import type { ScheduleEntry } from "../types/Roster.types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toIsoDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = dayjs(dateStr, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d.format("YYYY-MM-DD") : dateStr;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = dayjs(dateStr, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d.format("DD MMM YYYY") : dateStr;
}

// ─── Small components ─────────────────────────────────────────────────────────
const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? (
    <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{msg}</div>
  ) : null;

const InfoChip: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <div
      style={{
        fontSize: 10,
        color: COLORS.textMuted,
        fontWeight: 500,
        marginBottom: 2,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.textBody,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value || "—"}
    </div>
  </div>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface EditScheduleModalProps {
  open: boolean;
  record: ScheduleEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditForm {
  pickupShift: string;
  dropShift: string;
}
interface EditErrors {
  pickupShift?: string;
  dropShift?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const { Modal, Select } = useUILibrary();

  const [form, setForm] = useState<EditForm>({
    pickupShift: "",
    dropShift: "",
  });
  const [errors, setErrors] = useState<EditErrors>({});

  // Shifts for the record's fixed office
  const { data: shiftData, isLoading: shiftsLoading } = useGetUserShiftsQuery(
    record?.locCode ?? 0,
    { skip: !record?.locCode, refetchOnMountOrArgChange: true },
  );

  const pickShifts = shiftData?.pickShifts ?? [];
  const dropShifts = shiftData?.dropShifts ?? [];

  const pickShiftOptions = useMemo(
    () =>
      pickShifts.map((s) => ({
        value: String(s.shiftId),
        label: s.shiftStart,
      })),
    [pickShifts],
  );
  const dropShiftOptions = useMemo(
    () =>
      dropShifts.map((s) => ({
        value: String(s.shiftId),
        label: s.shiftStart,
      })),
    [dropShifts],
  );

  // Pre-fill shifts when record + shift list are ready
  const shiftsKey = [...pickShifts, ...dropShifts]
    .map((s) => s.shiftId)
    .join(",");
  const recordKey = record
    ? `${record.empid ?? record.empCode}-${record.scheduleDate}`
    : "";

  useEffect(() => {
    if (!record) return;
    const matchPick = pickShifts.find(
      (s) =>
        s.shiftStart === record.pickShift || s.shiftName === record.pickShift,
    );
    const matchDrop = dropShifts.find(
      (s) =>
        s.shiftStart === record.dropShift || s.shiftName === record.dropShift,
    );
    setForm({
      pickupShift: matchPick ? String(matchPick.shiftId) : "",
      dropShift: matchDrop ? String(matchDrop.shiftId) : "",
    });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordKey, shiftsKey]);

  const { updateSchedules, isCreating } = useRosterMutations({
    onCreateSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.pickupShift) e.pickupShift = "Required";
    if (!form.dropShift) e.dropShift = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !record) return;
    const pickShift = pickShifts.find(
      (s) => String(s.shiftId) === form.pickupShift,
    );
    const dropShift = dropShifts.find(
      (s) => String(s.shiftId) === form.dropShift,
    );
    if (!pickShift || !dropShift) return;

    updateSchedules({
      ScheduleUpdateVersion: "WEB",
      LocCode: record.locCode ?? 0,
      FromDate: toIsoDate(record.scheduleDate),
      ToDate: toIsoDate(record.scheduleDate),
      ShiftStart: pickShift.shiftStart,
      ShiftEnd: dropShift.shiftStart,
      WeekOffs: "",
      User_Empids: record.empCode ?? String(record.empid ?? ""),
    });
  };

  const employeeName = record
    ? (record.userName ?? record.empCode ?? String(record.empid ?? "—"))
    : "—";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: COLORS.lightBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke={COLORS.primaryDark}
                strokeWidth="1.3"
              />
              <path
                d="M8 4.5v4l2.5 2"
                stroke={COLORS.primaryDark}
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: 13, fontWeight: 700, color: COLORS.textBody }}
            >
              Edit Shift
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {formatDate(record?.scheduleDate ?? "")}
            </div>
          </div>
        </div>
      }
      width={440}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0,0,0,0.25)" },
        content: { borderRadius: 14, padding: 0 },
        header: {
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${COLORS.border}`,
        },
        body: { padding: "14px 16px 16px" },
      }}
      style={{ top: 60 }}
    >
      {/* ── Employee / Date / Day info strip ──────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "10px 12px",
          background: COLORS.lightBg,
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          marginBottom: 16,
        }}
      >
        <InfoChip label="Employee" value={employeeName} />
        <div style={{ width: 1, background: COLORS.border, flexShrink: 0 }} />
        <InfoChip label="Date" value={formatDate(record?.scheduleDate ?? "")} />
        <div style={{ width: 1, background: COLORS.border, flexShrink: 0 }} />
        <InfoChip label="Day" value={record?.weekDays ?? "—"} />
      </div>

      {/* ── Shift selects ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {/* Login shift */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: COLORS.textMuted,
              marginBottom: 5,
            }}
          >
            Login Shift <span style={{ color: "#ef4444" }}>*</span>
          </div>
          <Select
            value={form.pickupShift || undefined}
            onChange={(v: string) => {
              setForm((p) => ({ ...p, pickupShift: v }));
              setErrors((p) => ({ ...p, pickupShift: undefined }));
            }}
            options={pickShiftOptions}
            placeholder={shiftsLoading ? "Loading…" : "Select"}
            loading={shiftsLoading}
            showSearch
            filterOption={(
              input: string,
              option: { label: string; value: string },
            ) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
          />
          <FieldError msg={errors.pickupShift} />
        </div>

        {/* Logout shift */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: COLORS.textMuted,
              marginBottom: 5,
            }}
          >
            Logout Shift <span style={{ color: "#ef4444" }}>*</span>
          </div>
          <Select
            value={form.dropShift || undefined}
            onChange={(v: string) => {
              setForm((p) => ({ ...p, dropShift: v }));
              setErrors((p) => ({ ...p, dropShift: undefined }));
            }}
            options={dropShiftOptions}
            placeholder={shiftsLoading ? "Loading…" : "Select"}
            loading={shiftsLoading}
            showSearch
            filterOption={(
              input: string,
              option: { label: string; value: string },
            ) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%" }}
          />
          <FieldError msg={errors.dropShift} />
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "9px 0",
            borderRadius: 50,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.textMuted,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isCreating}
          style={{
            flex: 2,
            padding: "9px 0",
            borderRadius: 50,
            border: "none",
            background: isCreating ? COLORS.primaryMid : COLORS.primaryDark,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: isCreating ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontFamily: "inherit",
            opacity: isCreating ? 0.8 : 1,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M11 14v-5H5v5M5 2v4h5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {isCreating ? "Saving…" : "Modify Changes"}
        </button>
      </div>
    </Modal>
  );
};

export default EditScheduleModal;
