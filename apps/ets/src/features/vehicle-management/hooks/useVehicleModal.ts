// FILE 6 — hooks/useVehicleModal.ts

import { useState, useCallback } from 'react';
import type { Vehicle } from '../types/vehicle.types';

export const useVehicleModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Vehicle | null>(null);
   const [isView, setIsView] = useState<true | false>(false);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: Vehicle) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);
const openView = useCallback((record: Vehicle) => {
    setEditingRecord(record);
    setIsView(true);
  }, []);

  const closeView = useCallback(() => {
    setIsView(false);
    setEditingRecord(null);
  }, []);
  return { isOpen, editingRecord, openCreate, openEdit, close, isView, openView, closeView  };
};
export const useVehicleStageModal = () => {
  const [isOpenStage, setIsOpenStage] = useState(false);
  const [editingStageRecord, setEditingStageRecord] = useState<Vehicle | null>(null);
  // const [isApprove, setIsApprove] = useState(false)
  const [isBulkUpload, setIsBulkUpload] = useState<boolean>(false)

  const openCreateStage = useCallback(() => {
    setIsOpenStage(true);
    setEditingStageRecord(null);
  }, []);

  const openEditStage = useCallback((record: Vehicle) => {
    setIsOpenStage(true);
    setEditingStageRecord(record);
  }, []);

  const closeStage = useCallback(() => {
    setIsOpenStage(false);
    setEditingStageRecord(null);
  }, []);
  const openBulkUpload = useCallback(() => {
    setIsBulkUpload(true);
  }, []);
  const closeBulkUpload = useCallback(() => {
    setIsBulkUpload(false);
  }, []);

  return { isOpenStage, editingStageRecord, openCreateStage, openEditStage, closeStage, isBulkUpload, openBulkUpload, closeBulkUpload };
};