// src/features/role-menu-mapping/hooks/useRoleMenuMappingModal.ts

import { useState, useCallback } from 'react';
import type { RoleMenuMapping } from '../types/roleMenuMapping.types';

export const useRoleMenuMappingModal = () => {
    const [isOpen, setIsOpen]               = useState(false);
    const [editingRecord, setEditingRecord] = useState<RoleMenuMapping | null>(null);

    const openCreate = useCallback(() => {
        setEditingRecord(null);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((record: RoleMenuMapping) => {
        setEditingRecord(record);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setEditingRecord(null);
    }, []);

    return { isOpen, editingRecord, openCreate, openEdit, close };
};