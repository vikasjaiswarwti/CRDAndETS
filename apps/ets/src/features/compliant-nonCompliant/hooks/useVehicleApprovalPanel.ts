import { useState, useCallback } from "react";
import type {
  VehicleApproval,
  DocumentType,
} from "../types/Vehiclecompliance.types";

export interface UseVehicleApprovalPanelReturn {
  selectedRecord: VehicleApproval | null;
  activeDocTab: DocumentType;
  remarks: string;
  selectRecord: (record: VehicleApproval) => void;
  setActiveDocTab: (tab: DocumentType) => void;
  setRemarks: (val: string) => void;
  clearPanel: () => void;
}

export function useVehicleApprovalPanel(): UseVehicleApprovalPanelReturn {
  const [selectedRecord, setSelectedRecord] = useState<VehicleApproval | null>(
    null,
  );
  const [activeDocTab, setActiveDocTab] = useState<DocumentType>("Insurance");
  const [remarks, setRemarks] = useState("");

  const selectRecord = useCallback((record: VehicleApproval) => {
    setSelectedRecord(record);
    setActiveDocTab("Insurance");
    setRemarks("");
  }, []);

  const clearPanel = useCallback(() => {
    setSelectedRecord(null);
    setRemarks("");
  }, []);

  return {
    selectedRecord,
    activeDocTab,
    remarks,
    selectRecord,
    setActiveDocTab,
    setRemarks,
    clearPanel,
  };
}
