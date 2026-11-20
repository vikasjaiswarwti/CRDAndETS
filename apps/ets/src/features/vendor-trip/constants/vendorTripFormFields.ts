import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';
import {
  TRIP_TYPE_OPTIONS,
  SHIFT_OPTIONS,
} from './vendorTripConstants';

// ─── Dynamic form fields (ShiftId and TripType need backend-supplied options) ──
// Keep at MODULE level — never inline inside a component or hook.

export interface VendorTripFormFieldOptions {
  shiftOptions?: { label: string; value: string }[];
  tripTypeOptions?: { label: string; value: string }[];
  locationOptions?: { label: string; value: string }[];
  vendorOptions?: { label: string; value: string }[];
}

export function getVendorTripFormFields(
  opts: VendorTripFormFieldOptions = {}
): FormFieldDef[] {
  const {
    shiftOptions = SHIFT_OPTIONS as unknown as { label: string; value: string }[],
    tripTypeOptions = TRIP_TYPE_OPTIONS as unknown as { label: string; value: string }[],
    locationOptions = [],
    vendorOptions = [],
  } = opts;

  return [
    // ── Row 1: Vendor + Vehicle ───────────────────────────────────────────────
    {
      name: 'vendorId',
      label: 'Vendor',
      type: 'select',
      span: 12,
      required: true,
      placeholder: 'Select vendor',
      options: vendorOptions,
    },
    {
      name: 'vehicleNo',
      label: 'Vehicle Number',
      type: 'text',
      span: 12,
      required: true,
      placeholder: 'e.g. MH12AB1234',
    },

    // ── Row 2: Driver Info ────────────────────────────────────────────────────
    {
      name: 'driverName',
      label: 'Driver Name',
      type: 'text',
      span: 12,
      required: true,
      placeholder: 'Full driver name',
    },
    {
      name: 'driverMobile',
      label: 'Driver Mobile',
      type: 'text',
      span: 12,
      required: true,
      placeholder: '10-digit mobile number',
    },

    // ── Row 3: Shift + Trip Type ──────────────────────────────────────────────
    {
      name: 'shiftId',
      label: 'Shift',
      type: 'select',
      span: 12,
      required: true,
      placeholder: 'Select shift',
      options: shiftOptions,
    },
    {
      name: 'tripType',
      label: 'Trip Type',
      type: 'select',
      span: 12,
      required: true,
      placeholder: 'Select trip type',
      options: tripTypeOptions,
    },

    // ── Row 4: Location + Trip Date ───────────────────────────────────────────
    {
      name: 'locCode',
      label: 'Location',
      type: 'select',
      span: 12,
      required: true,
      placeholder: 'Select location',
      options: locationOptions,
    },
    {
      name: 'tripDate',
      label: 'Trip Date',
      type: 'date',
      span: 12,
      required: true,
      placeholder: 'Select date',
    },

    // ── Row 5: Reporting Time (full width) ────────────────────────────────────
    {
      name: 'reportingTime',
      label: 'Reporting Time',
      type: 'text',
      span: 12,
      required: true,
      placeholder: 'e.g. 08:00 AM',
    },

    // ── isActive toggle ───────────────────────────────────────────────────────
    {
      name: 'isActive',
      label: 'Availability Status',
      type: 'switch',
      span: 12,
    },
  ];
}