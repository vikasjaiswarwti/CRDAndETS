import { useState, useCallback } from "react";
import type { LkpPenaltyType } from "../types/Lkppenaltytype.types";

export const useLkpPenaltyTypeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LkpPenaltyType | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: LkpPenaltyType) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
