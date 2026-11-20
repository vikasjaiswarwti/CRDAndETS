import { useState, useCallback } from "react";
import type { Escort } from "../types/Escort.types";

export const useEscortModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Escort | null>(null);
   const [isBulkUpload, setIsBulkUpload] = useState<boolean>(false)

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: Escort) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);
   const openBulkUpload = useCallback(() => {
      setIsBulkUpload(true);
    }, []);
    const closeBulkUpload = useCallback(() => {
      setIsBulkUpload(false);
    }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close, isBulkUpload, openBulkUpload, closeBulkUpload };
};
