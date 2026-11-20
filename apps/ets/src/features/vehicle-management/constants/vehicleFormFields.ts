// FILE 5 — constants/vehicleFormFields.ts
// Dynamic because vehicleTypeCode, transporterId, driverId, locCode options come from backend

import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

export const getVehicleUploadFormField: FormFieldDef[] = [
  {
    name: 'upload',
    label: 'Upload Excel',
    type: 'upload',
    required: true,
    placeholder: 'e.g. forma',
  }
];
export const getExcelDownload = {
  fileName: "Vehicle_Template.xlsx",
  sheetName: "Vehicle",
  data: [
    {
      // ── Vehicle Identity ──────────────────────────────────────────
      "Vehicle Registration Number": "DL21CH3487",
      "Vehicle Type Code": 3,
      // "Location Code": 183,
      // "Transporter ID": 1,
      Make: "TATA",
      Model: "Nissan",
      "Chassis Number": "1ZVBP8JZ8H1234567",
      "Fuel Type Code": 2,
      "Make Year": "YYYY-MM-DD",   // serial 44911 → 16-Dec-2022
      "Driver ID": "",
      Remarks: "remarks",

      // ── Owner Info ────────────────────────────────────────────────
      "Owner Name": "Vikas",
      "Owner Address": "dwarka",
      "Owner Type": "Own",

      // ── GPS ───────────────────────────────────────────────────────
      "GPS Installed": "Yes",
      "GPS Provider Code": 1,
      "GPS Installation Date": "YYYY-MM-DD",   // serial 46007 → 15-Dec-2025

      // ── Registration & Validity Dates ─────────────────────────────
      "Registration Date": "YYYY-MM-DD",   // serial 45997 → 05-Dec-2025
      "Induction Date": "YYYY-MM-DD",   // serial 45997
      "Registration Expiry Date": "YYYY-MM-DD",   // serial 46737 → 15-Dec-2027
      "Permit Expiry Date": "YYYY-MM-DD",
      "Insurance Expiry Date": "YYYY-MM-DD",
      "Fitness Expiry Date": "YYYY-MM-DD",
      "Road Tax Validity Expiry": "YYYY-MM-DD",
      "PUC Expiry Date": "YYYY-MM-DD",
      "First Aid Kit Date": "YYYY-MM-DD",
      "Fire Extinguisher Date": "YYYY-MM-DD",
    },
  ],
}