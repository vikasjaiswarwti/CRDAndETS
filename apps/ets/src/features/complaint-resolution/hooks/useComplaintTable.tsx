import { useMemo } from "react";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import type { ComplaintReply } from "../types/complaint.types";

const GREEN = "#065f46";

interface Params {
  onReview: (referenceNo: number) => void;
}

/**
 * Mirrors useBookingTable's shape (columns built with col.*, every column
 * carrying an explicit width) — the complaint text itself is intentionally
 * NOT a column here, it only shows up in ComplaintDetailPanel once a row
 * is opened.
 */
export function useComplaintTable({ onReview }: Params) {
  const columns = useMemo(
    () => [
      col.text<ComplaintReply>("referenceNo", "Complaint No.", {
        width: 110,
        render: (value) => (
          <span style={{ color: GREEN, fontWeight: 600 }}>
            {value as number}
          </span>
        ),
      }),

      col.text<ComplaintReply>("userName", "Employee", {
        width: 220,
      }),

      col.text<ComplaintReply>("complainName", "Complaint Regarding", {
        width: 220,
      }),

      col.text<ComplaintReply>("complainDate", "Date", {
        width: 160,
        render: (value) => (
          <span style={{ color: "#6b7280" }}>{value as string}</span>
        ),
      }),

      col.actions<ComplaintReply>(
        [action.view<ComplaintReply>((record) => onReview(record.referenceNo))],
        { width: 90 },
      ),
    ],
    [onReview],
  );

  return { columns };
}
