// src/features/roster/hooks/useRosterModal.ts
import { useState, useCallback } from "react";
import type { ScheduleEntry } from "../types/Roster.types";

export function useRosterModal() {
    
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScheduleEntry | null>(
    null,
  );

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: ScheduleEntry) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
}
