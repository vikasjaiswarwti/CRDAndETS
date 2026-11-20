import type {
  ShiftSlot,
  ShiftBoolKey,
  ShiftNumKey,
  ShiftStringKey,
} from "../types/shift.mangement.types";

// ShiftGridTypes.ts
export interface ShiftGridLayoutProps {
  slots: ShiftSlot[];
  isLoading?: boolean; // ← add
  onToggle?: (slotIndex: number, key: ShiftBoolKey) => void;
  onNumChange?: (slotIndex: number, key: ShiftNumKey, value: number) => void;
  onStrChange?: (slotIndex: number, key: ShiftStringKey, value: string) => void;
  onEdit?: (slot: ShiftSlot) => void;
  readonly?: boolean;
  maxHeight?: number | string;
}
