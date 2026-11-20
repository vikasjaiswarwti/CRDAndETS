import type { DocumentType } from "../types/Vehiclecompliance.types";

export const APPROVAL_STATUS_MAP: Record<
  any,
  { label: string; color: string }
> = {
  Pending: { label: "Pending", color: "processing" },
  Approved: { label: "Approved", color: "success" },
  Rejected: { label: "Rejected", color: "error" },
  "Needs Attention": { label: "Needs Attention", color: "error" },
};

export interface ApprovalStatCardConfig {
  key: string;
  label: string;
  iconType: "clock" | "check" | "close" | "warning";
  iconBg: string;
  iconColor: string;
}

export const APPROVAL_STAT_CARDS: ApprovalStatCardConfig[] = [
  {
    key: "pendingReview",
    label: "Pending Review",
    iconType: "clock",
    iconBg: "#fef3c7",
    iconColor: "#f59e0b",
  },
  {
    key: "approvedToday",
    label: "Approved Today",
    iconType: "check",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
  },
  {
    key: "rejected",
    label: "Rejected",
    iconType: "close",
    iconBg: "#fee2e2",
    iconColor: "#ef4444",
  },
  {
    key: "expiringSoon",
    label: "Expiring Soon",
    iconType: "warning",
    iconBg: "#fef3c7",
    iconColor: "#f59e0b",
  },
];

export const DOCUMENT_TABS: DocumentType[] = [
  "Insurance",
  "RC",
  "Permit",
  "Fitness",
];

export const CITY_OPTIONS = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Delhi", value: "Delhi" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "Pune", value: "Pune" },
  { label: "Gurgaon", value: "Gurgaon" },
  { label: "Chennai", value: "Chennai" },
  { label: "Ahmedabad", value: "Ahmedabad" },
];

export const DOCUMENT_TYPE_OPTIONS: { label: string; value: DocumentType }[] = [
  { label: "Insurance", value: "Insurance" },
  { label: "RC", value: "RC" },
  { label: "Permit", value: "Permit" },
  { label: "Fitness", value: "Fitness" },
];
