import { useState, useCallback } from "react";
import type { UserStage, ApprovedUser } from "../types/Employee.types";

export const useEmployeeModal = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Cancel Modal State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  // ------
  const [transportModalOpen, setTransportModalOpen] = useState(false);

  const [editingRecord, setEditingRecord] = useState<
    UserStage | ApprovedUser | null
  >(null);

  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);

  // ── Map Locations modal ────────────────────────────────────
  const [isMapLocationsOpen, setIsMapLocationsOpen] = useState(false);

  const openChangeRole = useCallback((record: UserStage | ApprovedUser) => {
    setEditingRecord(record);
    setIsChangeRoleOpen(true);
  }, []);

  const closeChangeRole = useCallback(() => {
    setIsChangeRoleOpen(false);
    setEditingRecord(null);
  }, []);

  const openMapLocations = useCallback((record: UserStage | ApprovedUser) => {
    setEditingRecord(record);
    setIsMapLocationsOpen(true);
  }, []);

  const closeMapLocations = useCallback(() => {
    setIsMapLocationsOpen(false);
    setEditingRecord(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    setIsRegisterOpen(true);
  }, []);

  const openEdit = useCallback((record: UserStage | ApprovedUser) => {
    setEditingRecord(record);
    setIsRegisterOpen(true);
  }, []);
  const closeRegister = useCallback(() => {
    setIsRegisterOpen(false);
    setEditingRecord(null);
  }, []);

  const openBulk = useCallback(() => setIsBulkOpen(true), []);
  const closeBulk = useCallback(() => setIsBulkOpen(false), []);

  // Cancel Modal Functions
  const openCancel = useCallback((record: UserStage | ApprovedUser) => {
    setEditingRecord(record);
    setIsCancelOpen(true);
  }, []);

  const closeCancel = useCallback(() => {
    setIsCancelOpen(false);
  }, []);
  const openTransport = (record: ApprovedUser) => {
    setEditingRecord(record);
    setTransportModalOpen(true);
  };
  const closeTransport = useCallback(() => {
    setTransportModalOpen(false);
  }, []);

  return {
    isRegisterOpen,
    isBulkOpen,
    editingRecord,
    openCreate,
    openEdit,
    closeRegister,
    openBulk,
    closeBulk,
    isCancelOpen,
    openCancel,
    closeCancel,
    transportModalOpen,
    openTransport,
    closeTransport,

    isChangeRoleOpen,
    openChangeRole,
    closeChangeRole,
    isMapLocationsOpen,
    openMapLocations,
    closeMapLocations,
  };
};
