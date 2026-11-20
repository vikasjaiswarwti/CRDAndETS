import { useState, useCallback } from "react";
import type { VehicleType } from "../types/vehicType.types";

export const useVehicleTypeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VehicleType | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);
  const openEdit = useCallback((record: VehicleType) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
