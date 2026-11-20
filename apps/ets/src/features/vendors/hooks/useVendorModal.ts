import { useState, useCallback } from 'react';
import type { Vendor } from '../types/vendor.types';

export const useVendorModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Vendor | null>(null);
  const [isMapLocationsOpen, setIsMapLocationsOpen] = useState(false);
  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: Vendor) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);
  const openMapLocations = useCallback((record: Vendor) => {
    setEditingRecord(record);
    setIsMapLocationsOpen(true);
  }, []);

  const closeMapLocations = useCallback(() => {
    setIsMapLocationsOpen(false);
    setEditingRecord(null);
  }, []);

  return {
    isOpen, editingRecord, openCreate, openEdit, close,
    isMapLocationsOpen,
    openMapLocations,
    closeMapLocations,
  };
};