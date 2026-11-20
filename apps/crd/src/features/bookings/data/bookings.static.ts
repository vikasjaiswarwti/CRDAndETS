import type { Booking } from "../types";

// Static dataset standing in for CrdCore until its APIs exist.
// services/bookingsApi.ts serves this through RTK Query, so swapping in the real
// API later only changes that one file.
export const STATIC_BOOKINGS: Booking[] = [
  { id: "BK-1001", pickup: "Gurugram Sector 44", drop: "IGI Airport T3", date: "2026-11-21", vehicleClass: "Sedan", passengers: 2, status: "Confirmed" },
  { id: "BK-1002", pickup: "Noida Sector 62", drop: "Connaught Place", date: "2026-11-22", vehicleClass: "Hatchback", passengers: 1, status: "Pending" },
  { id: "BK-1003", pickup: "Cyber Hub", drop: "Jaipur", date: "2026-11-24", vehicleClass: "SUV", passengers: 4, status: "In Progress" },
  { id: "BK-1004", pickup: "Okhla Phase 2", drop: "Agra", date: "2026-11-18", vehicleClass: "Tempo Traveller", passengers: 9, status: "Completed" },
  { id: "BK-1005", pickup: "Dwarka Sector 21", drop: "Faridabad", date: "2026-11-20", vehicleClass: "Sedan", passengers: 3, status: "Cancelled" },
  { id: "BK-1006", pickup: "Saket", drop: "Chandigarh", date: "2026-11-27", vehicleClass: "SUV", passengers: 5, status: "Confirmed" },
  { id: "BK-1007", pickup: "Rohini", drop: "Meerut", date: "2026-11-25", vehicleClass: "Hatchback", passengers: 2, status: "Pending" },
];
