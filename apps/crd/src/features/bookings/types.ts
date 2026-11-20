export type BookingStatus = "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";

export type VehicleClass = "Hatchback" | "Sedan" | "SUV" | "Tempo Traveller";

export interface Booking {
  id: string;
  pickup: string;
  drop: string;
  date: string; // ISO date
  vehicleClass: VehicleClass;
  passengers: number;
  status: BookingStatus;
  notes?: string;
}

export type NewBooking = Omit<Booking, "id" | "status">;

export interface BookingFilters {
  search: string;
  status: BookingStatus | "All";
}
