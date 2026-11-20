import { useState, useCallback } from 'react';
import type { Penalty } from '../types/penalty.types';

export const usePenaltyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Penalty | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: Penalty) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};
