import { useState, useCallback } from 'react';
import type { EhsCheck } from '../types/ehsChecks.types';

// ─── Modal open/close state ───────────────────────────────────────────────────
// Pure UI state — no data-fetching, no mutations, no side effects.

export const useEhsChecksModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EhsCheck | null>(null);

    const openCreate = useCallback(() => {
        setEditingRecord(null);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((record: EhsCheck) => {
        setEditingRecord(record);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setEditingRecord(null);
    }, []);

    return { isOpen, editingRecord, openCreate, openEdit, close };
};