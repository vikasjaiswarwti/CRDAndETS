// import type { ValidationModeConfig, ValidateType } from '../types/shiftValidation.types';

// export const VALIDATION_MODES: Record<ValidateType, ValidationModeConfig> = {
//   1: { validateType: 1, label: 'Normal Shift',      wiseIdLabel: null,              apiEndpoint: 'normal' },
//   2: { validateType: 2, label: 'User Wise',         wiseIdLabel: 'User ID',         apiEndpoint: 'validation' },
//   3: { validateType: 3, label: 'Department Wise',   wiseIdLabel: 'Department ID',   apiEndpoint: 'validation' },
//   4: { validateType: 4, label: 'Line of Business',  wiseIdLabel: 'LOB ID',          apiEndpoint: 'validation' },
//   5: { validateType: 5, label: 'Process Wise',      wiseIdLabel: 'Process ID',      apiEndpoint: 'validation' },
// } as const;

// export const TRIP_TYPE = { PICKUP: 1, DROP: 2 } as const;

// shiftValidationConstants.ts
import type {
  ValidationModeConfig,
  ValidateType,
} from "../types/shiftValidation.types";

export const VALIDATION_MODES: Record<ValidateType, ValidationModeConfig> = {
  1: {
    validateType: 1,
    label: "Normal Shift",
    wiseIdLabel: null,
    apiEndpoint: "normal",
  },
  2: {
    validateType: 2,
    label: "User Wise",
    wiseIdLabel: "User",
    apiEndpoint: "validation",
  },
  3: {
    validateType: 3,
    label: "Department Wise",
    wiseIdLabel: "Department",
    apiEndpoint: "validation",
  },
  4: {
    validateType: 4,
    label: "Line of Business",
    wiseIdLabel: "Line Of Business",
    apiEndpoint: "validation",
  },
  5: {
    validateType: 5,
    label: "Process Wise",
    wiseIdLabel: "Process Wise",
    apiEndpoint: "validation",
  },
} as const;

export const TRIP_TYPE = { PICKUP: 1, DROP: 2 } as const;
