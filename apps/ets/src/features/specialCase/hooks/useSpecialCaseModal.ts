import { useState, useCallback } from 'react';
import type { SpecialCase } from '../types/specialCase.types';

export const useSpecialCaseModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<SpecialCase | null>(null);

    const openCreate = useCallback(() => { setEditingRecord(null); setIsOpen(true); }, []);
    const openEdit = useCallback((record: SpecialCase) => { setEditingRecord(record); setIsOpen(true); }, []);
    const close = useCallback(() => { setIsOpen(false); setEditingRecord(null); }, []);

    return { isOpen, editingRecord, openCreate, openEdit, close };
};