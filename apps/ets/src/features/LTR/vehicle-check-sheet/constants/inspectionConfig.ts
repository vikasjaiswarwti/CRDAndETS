import type { InspectionItem } from "../types/checkList.types";

// ─── Vehicle Inspection Items ─────────────────────────────────────────────────
//
// captureType:
//   "expiryDate" → single expiry DatePicker; set allowUpload:true to show upload
//                  when status=1 and the date is filled
//   "remark"     → plain text remark; no upload
//
// allowUpload: true → shows Upload button when status=1 (and date filled for expiryDate items)

export const INSPECTION_ITEMS: InspectionItem[] = [
    // Documents — Yes/No + Expiry Date + Upload
    { id: 1, label: "Vehicle RC Book", type: "yesNo", captureType: "expiryDate", section: "documents", allowUpload: true },
    { id: 2, label: "Insurance", type: "yesNo", captureType: "expiryDate", section: "documents", allowUpload: true },
    { id: 3, label: "PUC", type: "yesNo", captureType: "expiryDate", section: "documents", allowUpload: true },

    // Components — Working/Not Working + Remark
    { id: 5, label: "Front Lights", type: "working", captureType: "remark", section: "components" },
    { id: 6, label: "Back Lights", type: "working", captureType: "remark", section: "components" },
    { id: 7, label: "Wiper Blades", type: "working", captureType: "remark", section: "components" },
    { id: 8, label: "Seat Belt", type: "working", captureType: "remark", section: "components" },
    { id: 9, label: "Power/Manual Window", type: "working", captureType: "remark", section: "components" },
    { id: 10, label: "Side View Mirror", type: "working", captureType: "remark", section: "components" },

    // Glass — Ok/Broken + Remark
    { id: 11, label: "Windshield Glass", type: "okBroken", captureType: "remark", section: "glass" },

    // Other — Yes/No + Remark
    { id: 12, label: "Foot Mat Set", type: "yesNo", captureType: "remark", section: "other" },
    { id: 13, label: "Spare Wheel (Stepney)", type: "yesNo", captureType: "remark", section: "other" },
    { id: 15, label: "AC Working / Cooling", type: "yesNo", captureType: "remark", section: "other" },
    { id: 16, label: "Front Horn", type: "yesNo", captureType: "remark", section: "other" },
    { id: 17, label: "Reverse Horn", type: "yesNo", captureType: "remark", section: "other" },
    { id: 18, label: "Internal Cleaning", type: "yesNo", captureType: "remark", section: "other" },
    { id: 19, label: "External Cleaning", type: "yesNo", captureType: "remark", section: "other" },
    { id: 20, label: "Fire Extinguisher", type: "yesNo", captureType: "remark", section: "other" },
    { id: 21, label: "First Aid Kit", type: "yesNo", captureType: "remark", section: "other" },
];

export const STATUS_OPTIONS: Record<
    InspectionItem["type"],
    Array<{ label: string; value: number }>
> = {
    yesNo: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }],
    working: [{ label: "Working", value: 1 }, { label: "Not Working", value: 0 }],
    okBroken: [{ label: "Ok", value: 1 }, { label: "Broken", value: 0 }],
};

// ─── Driver Compliance Items ──────────────────────────────────────────────────
//
// Uses the same InspectionItem type as vehicle inspection so both tables
// share identical config, payload shape, and rendering logic.
//
// captureType mapping:
//   "expiryDate" → Yes: date + upload, No: remark  (same as document rows)
//   "remark"     → Yes: upload only,  No: remark
//
// type is always "yesNo" for driver compliance rows.

export const DRIVER_COMPLIANCE_ITEMS: InspectionItem[] = [
    { id: "driverAppUsage", label: "Driver App Usage", type: "yesNo", captureType: "remark", allowUpload: false },
    { id: "ddtTraining", label: "DDT Training", type: "yesNo", captureType: "expiryDate", allowUpload: true },
    { id: "wearingSafetyShoes", label: "Wearing Safety Shoes", type: "yesNo", captureType: "remark", allowUpload: true },
    { id: "reflectiveSafetyJacket", label: "Reflective Safety Jacket", type: "yesNo", captureType: "remark", allowUpload: true },
    { id: "logBookMaintained", label: "Log Book Maintained", type: "yesNo", captureType: "expiryDate", allowUpload: false },
    { id: "driveruniform", label: "Driver in uniform (T-shirt)", type: "yesNo", captureType: "remark", allowUpload: false },
];
export const staticData = {
    "checkDate": "2026-08-25",
    "siteRegion": "Haryana",
    "vehicleNumber": "UP61AM2501",
    "vehicleMake": "yamaha",
    "vehicleModel": "FZS",
    "manufacturingDate": "2026-01-25",
    "commercialPassing": "yes",
    "fuel": "Petrol",
    "bu": "ALU",
    "department": "Operations",
    "ownership": "Own",
    "vehicleDutyHours": "12",
    "vendorName": "Amit Kumar",
    "vendorPhone": "+917267033009",
    "vendorAddress": "159, part A, sector 10, gurugram",
    "vendorEmail": "amit.kumar@aaveginfotech.com",
    "inspection": [
        {
            "id": 1,
            "name": "Vehicle RC Book",
            "status": 1,
            "value": "2026-08-26",
            "uploadedFileKey": "dev-ui/Others/inspection_1/93025841-b6ec-462f-807d-999f59959d6f_form.jpeg"
        },
        {
            "id": 2,
            "name": "Insurance",
            "status": 1,
            "value": "2026-08-20",
            "uploadedFileKey": "dev-ui/Others/inspection_2/4fb24573-9dc0-40bf-b0f0-f034be027ff8_form.jpeg"
        },
        {
            "id": 3,
            "name": "PUC",
            "status": 1,
            "value": null,
            "uploadedFileKey": "dev-ui/Others/inspection_3/a1223780-69bc-4b48-a89e-02a4b46f543f_form.jpeg"
        },
        {
            "id": 5,
            "name": "Front Lights",
            "status": 1,
            "value": "Working",
            "uploadedFileKey": null
        },
        {
            "id": 6,
            "name": "Back Lights",
            "status": 1,
            "value": "Working",
            "uploadedFileKey": null
        },
        {
            "id": 7,
            "name": "Wiper Blades",
            "status": 1,
            "value": "Working",
            "uploadedFileKey": null
        },
        {
            "id": 8,
            "name": "Seat Belt",
            "status": 1,
            "value": "Working",
            "uploadedFileKey": null
        },
        {
            "id": 9,
            "name": "Power/Manual Window",
            "status": 1,
            "value": "Working",
            "uploadedFileKey": null
        },
        {
            "id": 10,
            "name": "Side View Mirror",
            "status": 1,
            "value": "Working",
            "uploadedFileKey": null
        },
        {
            "id": 11,
            "name": "Windshield Glass",
            "status": 1,
            "value": "OK",
            "uploadedFileKey": null
        },
        {
            "id": 12,
            "name": "Foot Mat Set",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        },
        {
            "id": 13,
            "name": "Tool Wheel (Stepney)",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        },
        {
            "id": 15,
            "name": "AC Working / Cooling",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        },
        {
            "id": 18,
            "name": "Internal Cleaning",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        },
        {
            "id": 19,
            "name": "External Cleaning",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        },
        {
            "id": 20,
            "name": "Fire Extinguisher",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        },
        {
            "id": 21,
            "name": "First Aid Kit",
            "status": 1,
            "value": "yes",
            "uploadedFileKey": null
        }
    ],
    "lastServiceDate": "2026-08-26",
    "lastServiceKm": 253,
    "odometerDate": "2026-08-26",
    "odometerKm": 25,
    "driverName": "Amit Kumar",
    "gatePassNo": "1",
    "aadhaarNo": "123243434534",
    "driverPNo": "9876543210",
    "driverSNo": "9876543210",
    "dlNo": "32484859376582937",
    "dlIssueDate": "2026-07-26",
    "dlExpiryDate": "2026-08-28",
    "driverCompliance": [
        {
            "id": "driverAppUsage",
            "name": "Driver App Usage",
            "status": 1,
            "value": null,
            "uploadedFileKey": null
        },
        {
            "id": "ddtTraining",
            "name": "DDT Training",
            "status": 1,
            "value": "2026-08-26",
            "uploadedFileKey": "dev-ui/Others/compliance_ddtTraining/79df7c6d-9093-4be6-920c-6f7cd1fb750c_form.jpeg"
        },
        {
            "id": "wearingSafetyShoes",
            "name": "Wearing Safety Shoes",
            "status": 1,
            "value": null,
            "uploadedFileKey": "dev-ui/Others/compliance_wearingSafetyShoes/e93787fb-5565-48ef-98e0-6749a14868ae_form.jpeg"
        },
        {
            "id": "reflectiveSafetyJacket",
            "name": "Reflective Safety Jacket",
            "status": 1,
            "value": null,
            "uploadedFileKey": "dev-ui/Others/compliance_reflectiveSafetyJacket/6825a67c-8cca-4865-bdc3-c2403478b43c_form.jpeg"
        },
        {
            "id": "logBookMaintained",
            "name": "Log Book Maintained",
            "status": 1,
            "value": "2026-08-24",
            "uploadedFileKey": "dev-ui/Others/compliance_logBookMaintained/3a1cbf13-e50c-4f4b-aa42-715add418582_form.jpeg"
        }
    ],
    "suggestions": "good"
}