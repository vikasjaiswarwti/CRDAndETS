import { useCallback, useState } from "react";
import type { MasterWeeklyScheduleItem } from "../types/masterWeeklySchedule.types";

export const useMasterWeeklyScheduleModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<MasterWeeklyScheduleItem | null>(null);

  const openEdit = useCallback((record: MasterWeeklyScheduleItem) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openEdit, close };
};
