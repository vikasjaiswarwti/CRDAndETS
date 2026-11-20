import { useState, useCallback } from "react";
import type { ShiftSlot } from "../types/shift.mangement.types";

export const useShiftModal = () => {
  // ── Define Shift modal (POST /DefineShift) ─────────────────────────────
  const [isDefineOpen, setIsDefineOpen] = useState(false);
  const openDefine = useCallback(() => setIsDefineOpen(true), []);
  const closeDefine = useCallback(() => setIsDefineOpen(false), []);
  const [isOpen, setIsOpen] = useState(false);
  const openShiftInterval = useCallback(() => setIsOpen(true), []);
  const closeShiftInterval = useCallback(() => setIsOpen(false), []);

  // ── Edit Slot modal (PUT /MstShift/:id) ────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ShiftSlot | null>(null);

  const openEdit = useCallback((slot: ShiftSlot) => {
    setEditingSlot(slot);
    setIsEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setIsEditOpen(false);
    setEditingSlot(null);
  }, []);

  return {
    // Define modal
    isDefineOpen,
    openDefine,
    closeDefine,
    // Edit slot modal
    isEditOpen,
    editingSlot,
    openEdit,
    closeEdit,
    // =========
    isOpen,
    openShiftInterval,
    closeShiftInterval

  };
};
