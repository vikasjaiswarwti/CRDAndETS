import { useState, useCallback } from 'react';
import type { AddressChange } from '../types/addressChanges.types';

export const useAddressChangesModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AddressChange | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: AddressChange) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};