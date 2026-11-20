import { useState, useCallback } from "react";
import type { LkpTripType } from "../types/Lkptriptype";

export const useLkpTripTypeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LkpTripType | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: LkpTripType) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
