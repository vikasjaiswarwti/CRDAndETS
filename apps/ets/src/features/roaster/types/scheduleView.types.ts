// src/features/individualRoster/types/scheduleView.types.ts

export type Tab = "LOGIN" | "LOGOUT";
export type RowStatus = "Noshow" | "Cancelled" | "Scheduled";
export type ActionType = "CANCEL" | "NOSHOW";

export const TRIP_TYPE: Record<Tab, string> = { LOGIN: "1", LOGOUT: "2" };
