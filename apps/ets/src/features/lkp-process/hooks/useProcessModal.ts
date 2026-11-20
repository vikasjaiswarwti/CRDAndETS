import { useState, useCallback } from "react";
import type { Process } from "../types/process.types";

export const useProcessModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Process | null>(null);
  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);
  const openEdit = useCallback((r: Process) => {
    setEditingRecord(r);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);
  return { isOpen, editingRecord, openCreate, openEdit, close };
};
