import { useState, useCallback } from 'react';
import type { LkpLocation } from '../types/lkpLocation.types';

export const useLkpLocationModal = () => {
  const [isOpen, setIsOpen]               = useState(false);
  const [editingRecord, setEditingRecord] = useState<LkpLocation | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: LkpLocation) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};