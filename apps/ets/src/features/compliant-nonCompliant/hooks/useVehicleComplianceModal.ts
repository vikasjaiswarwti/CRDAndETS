import { useState, useCallback } from "react";
import type { VehicleCompliance } from "../types/Vehiclecompliance.types";

export function useVehicleComplianceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditing] = useState<VehicleCompliance | null>(null);

  const openEdit = useCallback((record: VehicleCompliance) => {
    setEditing(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditing(null);
  }, []);

  return { isOpen, editingRecord, openEdit, close };
}
