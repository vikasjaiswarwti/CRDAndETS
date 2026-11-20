import { useState, useCallback } from "react";
import type { Menu } from "../types/menu.types";

export const useMenuModal = () => {
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Menu | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: Menu) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
