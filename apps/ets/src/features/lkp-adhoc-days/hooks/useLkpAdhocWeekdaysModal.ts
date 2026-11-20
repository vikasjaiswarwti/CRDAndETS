import { useState, useCallback } from "react";
import type { LkpAdhocWeekDay } from "../types/Lkpadhocweekdays.types";

export const useLkpAdhocWeekDaysModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LkpAdhocWeekDay | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: LkpAdhocWeekDay) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
