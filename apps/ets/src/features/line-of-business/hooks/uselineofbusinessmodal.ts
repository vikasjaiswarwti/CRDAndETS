import { useState, useCallback } from "react";
import type { LineOfBusiness } from "../types/line-of-business.types";

export const useLineOfBusinessModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LineOfBusiness | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: LineOfBusiness) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
