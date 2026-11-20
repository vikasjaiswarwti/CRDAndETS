import { useState, useCallback } from 'react';
import type {
  Driver,
  // DriverRaw,
  // DriverRaw
} from '../types/driver.types';

export const useDriverModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Driver | null>(null);
  const [isView, setIsView] = useState<true | false>(false);


  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: Driver) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);
  const openView = useCallback((record: Driver) => {
    setEditingRecord(record);
    setIsView(true);
  }, []);

  const closeView = useCallback(() => {
    setIsView(false);
    setEditingRecord(null);
  }, []);
  return { isOpen, editingRecord, openCreate, openEdit, close, isView, openView, closeView };
};
export const useDriverStageModal = () => {
  const [isOpenStage, setIsOpenStage] = useState(false);
  const [editingStageRecord, setEditingStageRecord] = useState<Driver | null>(null);
  // const [isApprove, setIsApprove] = useState(false)
  const [isBulkUpload, setIsBulkUpload] = useState<boolean>(false)

  const openCreateStage = useCallback(() => {
    setIsOpenStage(true);
    setEditingStageRecord(null);
  }, []);

  const openEditStage = useCallback((record: Driver) => {
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