import { useState, useCallback } from "react";
import type { LkpBillPlanType } from "../types/bill-plan-type";

export const useBillPlanTypeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LkpBillPlanType | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);
  const openEdit = useCallback((record: LkpBillPlanType) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
