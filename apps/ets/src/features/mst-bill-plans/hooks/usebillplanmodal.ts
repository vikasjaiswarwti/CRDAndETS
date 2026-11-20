import { useState, useCallback } from 'react';
import type { MstBillPlan } from '../types/bill-plan.types';

export const useBillPlanModal = () => {
  const [isOpen, setIsOpen]               = useState(false);
  const [editingRecord, setEditingRecord] = useState<MstBillPlan | null>(null);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((record: MstBillPlan) => {
    setEditingRecord(record);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingRecord(null);
  }, []);

  return { isOpen, editingRecord, openCreate, openEdit, close };
};