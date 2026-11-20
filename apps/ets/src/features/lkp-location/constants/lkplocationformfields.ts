// import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// const indianStates = [
//   { label: "Andhra Pradesh", value: "Andhra Pradesh" },
//   { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
//   { label: "Assam", value: "Assam" },
//   { label: "Bihar", value: "Bihar" },
//   { label: "Chhattisgarh", value: "Chhattisgarh" },
//   { label: "Goa", value: "Goa" },
//   { label: "Gujarat", value: "Gujarat" },
//   { label: "Haryana", value: "Haryana" },
//   { label: "Himachal Pradesh", value: "Himachal Pradesh" },
//   { label: "Jharkhand", value: "Jharkhand" },
//   { label: "Karnataka", value: "Karnataka" },
//   { label: "Kerala", value: "Kerala" },
//   { label: "Madhya Pradesh", value: "Madhya Pradesh" },
//   { label: "Maharashtra", value: "Maharashtra" },
//   { label: "Manipur", value: "Manipur" },
//   { label: "Meghalaya", value: "Meghalaya" },
//   { label: "Mizoram", value: "Mizoram" },
//   { label: "Nagaland", value: "Nagaland" },
//   { label: "Odisha", value: "Odisha" },
//   { label: "Punjab", value: "Punjab" },
//   { label: "Rajasthan", value: "Rajasthan" },
//   { label: "Sikkim", value: "Sikkim" },
//   { label: "Tamil Nadu", value: "Tamil Nadu" },
//   { label: "Telangana", value: "Telangana" },
//   { label: "Tripura", value: "Tripura" },
//   { label: "Uttar Pradesh", value: "Uttar Pradesh" },
//   { label: "Uttarakhand", value: "Uttarakhand" },
//   { label: "West Bengal", value: "West Bengal" },
//   // Union Territories (commonly needed)
//   {
//     label: "Andaman and Nicobar Islands",
//     value: "Andaman and Nicobar Islands",
//   },
//   { label: "Chandigarh", value: "Chandigarh" },
//   {
//     label: "Dadra and Nagar Haveli and Daman and Diu",
//     value: "Dadra and Nagar Haveli and Daman and Diu",
//   },
//   { label: "Delhi", value: "Delhi" },
//   { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
//   { label: "Ladakh", value: "Ladakh" },
//   { label: "Lakshadweep", value: "Lakshadweep" },
//   { label: "Puducherry", value: "Puducherry" },
// ];

// export const getLkpLocationFormFields = (
//   cityZoneOptions: { label: string; value: string | number }[] = [],
// ): FormFieldDef[] => [
//   // Row 1: Code | City Zone | Location Group
//   {
//     name: "locCode",
//     label: "Office Code",
//     type: "number",
//     span: 8,
//     placeholder: "Enter code",
//     rules: [{ required: true, message: "Office Code is required" }],
//   },

//   {
//     name: "locName",
//     label: "Office Name",
//     type: "text",
//     span: 8,
//     placeholder: "Enter Office name",
//     rules: [{ required: true, message: "Office Name is required" }],
//   },
//   {
//     name: "dispName",
//     label: "Display Name",
//     type: "text",
//     span: 8,
//     placeholder: "Enter display name",
//   },

//   {
//     name: "locGroup",
//     label: "Office Group",
//     type: "text",
//     span: 8,
//     placeholder: "Enter group",
//   },
//   {
//     name: "cityZone",
//     label: "City Zone",
//     type: "select",
//     span: 8,
//     placeholder: "Select city zone",
//     options: cityZoneOptions,
//     rules: [{ required: true, message: "City Zone is required" }],
//   },

//   {
//     name: "city",
//     label: "City",
//     type: "text",
//     span: 8,
//     placeholder: "Enter city",
//   },

//   // Row 2: Location Name | Display Name | State

//   {
//     name: "state",
//     label: "State",
//     type: "select", // Changed to select
//     span: 8,
//     placeholder: "Select state",
//     options: indianStates, // Static list here
//     rules: [{ required: true, message: "State is required" }], // Made required (optional: remove if not needed)
//   },

//   // Row 3: City | Latitude | Longitude

//   {
//     name: "lat",
//     label: "Latitude",
//     type: "number",
//     span: 8,
//     placeholder: "e.g. 28.6139",
//     // rules: [
//     //   {
//     //     type: "number",
//     //     min: -90,
//     //     max: 90,
//     //     message: "Must be between -90 and 90",
//     //     transform: Number,
//     //   },
//     // ],
//   },
//   {
//     name: "lng",
//     label: "Longitude",
//     type: "number",
//     span: 8,
//     placeholder: "e.g. 77.2090",
//     // rules: [
//     //   {
//     //     type: "number",
//     //     min: -180,
//     //     max: 180,
//     //     message: "Must be between -180 and 180",
//     //     transform: Number,
//     //   },
//     // ],
//   },

//   // Row 4: Address (full width)
//   {
//     name: "address",
//     label: "Address",
//     type: "textarea",
//     span: 24,
//     placeholder: "Enter full address",
//   },

//   // Row 5: Help Desk | SOS | Driver IVR
//   {
//     name: "helpDeskContactNumber",
//     label: "Help Desk Contact",
//     type: "text",
//     span: 8,
//     placeholder: "10-digit number",
//     rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
//     fieldProps: { maxLength: 10 },
//   },
//   {
//     name: "sosContactNumber",
//     label: "SOS Contact",
//     type: "text",
//     span: 8,
//     placeholder: "10-digit number",
//     rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
//     fieldProps: { maxLength: 10 },
//   },
//   {
//     name: "driverAppIvrNumber",
//     label: "Driver App IVR",
//     type: "text",
//     span: 8,
//     placeholder: "10-digit number",
//     rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
//     fieldProps: { maxLength: 10 },
//   },

//   // Row 6: User IVR | Active | Auto Penalty
//   {
//     name: "userAppIvrNumber",
//     label: "User App IVR",
//     type: "text",
//     span: 8,
//     placeholder: "10-digit number",
//     rules: [{ pattern: /^\d{10}$/, message: "Must be exactly 10 digits" }],
//     fieldProps: { maxLength: 10 },
//   },
//   { name: "active", label: "Availability Status", type: "switch", span: 8 },
//   { name: "isAutoPenalty", label: "Auto Penalty", type: "switch", span: 8 },
// ];

import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// ── Regex helpers ──────────────────────────────────────────────────────────────
// Only letters (incl. accented), spaces, hyphens, dots — no digits or specials
const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s.\-']+$/;
// Only digits
const DIGITS_ONLY = /^\d+$/;

// Letters, digits, spaces, hyphens — for group/zone names
// const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s\-]+$/;
// Latitude: -90 to 90
const LAT_REGEX = /^-?([0-8]?\d(\.\d+)?|90(\.0+)?)$/;
// Longitude: -180 to 180
const LNG_REGEX = /^-?(1[0-7]\d(\.\d+)?|180(\.0+)?|\d{1,2}(\.\d+)?)$/;
// Address: letters, digits, spaces, commas, hyphens, dots, slashes, #
const ADDRESS_REGEX = /^[a-zA-Z0-9\s,.\-/#]+$/;
// 10-digit phone
const PHONE_10 = /^\d{10}$/;

const indianStates = [
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
  { label: "Assam", value: "Assam" },
  { label: "Bihar", value: "Bihar" },
  { label: "Chhattisgarh", value: "Chhattisgarh" },
  { label: "Goa", value: "Goa" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Haryana", value: "Haryana" },
  { label: "Himachal Pradesh", value: "Himachal Pradesh" },
  { label: "Jharkhand", value: "Jharkhand" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Manipur", value: "Manipur" },
  { label: "Meghalaya", value: "Meghalaya" },
  { label: "Mizoram", value: "Mizoram" },
  { label: "Nagaland", value: "Nagaland" },
  { label: "Odisha", value: "Odisha" },
  { label: "Punjab", value: "Punjab" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Sikkim", value: "Sikkim" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Telangana", value: "Telangana" },
  { label: "Tripura", value: "Tripura" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Uttarakhand", value: "Uttarakhand" },
  { label: "West Bengal", value: "West Bengal" },
  {
    label: "Andaman and Nicobar Islands",
    value: "Andaman and Nicobar Islands",
  },
  { label: "Chandigarh", value: "Chandigarh" },
  {
    label: "Dadra and Nagar Haveli and Daman and Diu",
    value: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { label: "Delhi", value: "Delhi" },
  { label: "Jammu and Kashmir", value: "Jammu and Kashmir" },
  { label: "Ladakh", value: "Ladakh" },
  { label: "Lakshadweep", value: "Lakshadweep" },
  { label: "Puducherry", value: "Puducherry" },
];

export const getLkpLocationFormFields = (
  // cityZoneOptions: { label: string; value: string | number }[] = [],
): FormFieldDef[] => [
  // ── Row 1: Code | Name | Display Name ──────────────────────────────────────
  {
    name: "locCode",
    label: "Office Code",
    type: "number",
    span: 8,
    placeholder: "e.g. 101",
    rules: [
      { required: true, message: "Office Code is required" },
      {
        validator: (_: any, value: any) => {
          if (!value && value !== 0) return Promise.resolve();
          const n = Number(value);
          if (!Number.isInteger(n) || n <= 0)
            return Promise.reject("Code must be a positive integer");
          if (n > 99999) return Promise.reject("Code cannot exceed 99999");
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { min: 1, max: 99999, step: 1 },
  },

  {
    name: "locName",
    label: "Office Name",
    type: "text",
    span: 8,
    placeholder: "e.g. Delhi HQ",
    rules: [
      { required: true, message: "Office Name is required" },
      { min: 2, message: "Minimum 2 characters required" },
      { max: 100, message: "Maximum 100 characters allowed" },
      {
        pattern: /^[a-zA-Z0-9\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      },
    ],
    fieldProps: { maxLength: 100 },
  },

  {
    name: "dispName",
    label: "Display Name",
    type: "text",
    span: 8,
    placeholder: "e.g. Delhi Office",
    rules: [
      { max: 100, message: "Maximum 100 characters allowed" },
      {
        pattern: /^[a-zA-Z0-9\u00C0-\u024F\s.\-']*$/,
        message: "No special characters allowed",
      },
    ],
    fieldProps: { maxLength: 100 },
  },

  // ── Row 2: Group | City Zone | City ────────────────────────────────────────
  // {
  //   name: "locGroup",
  //   label: "Office Group",
  //   type: "text",
  //   span: 8,
  //   placeholder: "e.g. North Zone",
  //   rules: [
  //     { max: 50, message: "Maximum 50 characters allowed" },
  //     {
  //       pattern: ALPHANUMERIC_REGEX,
  //       message: "Only letters, digits, spaces and hyphens allowed",
  //     },
  //   ],
  //   fieldProps: { maxLength: 50 },
  // },

  // {
  //   name: "cityZone",
  //   label: "City Zone",
  //   type: "select",
  //   span: 8,
  //   // ↓ placeholder forces the user to actively choose — no auto-selection
  //   placeholder: "— Select city zone —",
  //   options: cityZoneOptions,
  //   rules: [{ required: true, message: "City Zone is required" }],
  //   fieldProps: {
  //     // showSearch lets users filter but they must still pick
  //     showSearch: true,
  //     allowClear: true,
  //     // Never pre-select the first option
  //     defaultActiveFirstOption: false,
  //   },
  // },

  {
    name: "city",
    label: "City",
    type: "text",
    span: 8,
    placeholder: "e.g. New Delhi",
    rules: [
      { max: 60, message: "Maximum 60 characters allowed" },
      {
        pattern: NAME_REGEX,
        message: "City name must contain only letters, spaces and hyphens",
      },
    ],
    fieldProps: { maxLength: 60 },
  },

  // ── Row 3: State | Latitude | Longitude ────────────────────────────────────
  {
    name: "state",
    label: "State",
    type: "select",
    span: 8,
    placeholder: "— Select state —",
    options: indianStates,
    rules: [{ required: true, message: "State is required" }],
    fieldProps: {
      showSearch: true,
      allowClear: true,
      defaultActiveFirstOption: false,
    },
  },

  {
    name: "lat",
    label: "Latitude",
    type: "text", // keep as text so we can apply regex rule
    span: 8,
    placeholder: "e.g. 28.6139",
    rules: [
      {
        validator: (_: any, value: any) => {
          if (!value && value !== 0) return Promise.resolve();
          const str = String(value).trim();
          if (!LAT_REGEX.test(str))
            return Promise.reject(
              "Latitude must be a number between -90 and 90",
            );
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { maxLength: 12 },
  },

  {
    name: "lng",
    label: "Longitude",
    type: "text",
    span: 8,
    placeholder: "e.g. 77.2090",
    rules: [
      {
        validator: (_: any, value: any) => {
          if (!value && value !== 0) return Promise.resolve();
          const str = String(value).trim();
          if (!LNG_REGEX.test(str))
            return Promise.reject(
              "Longitude must be a number between -180 and 180",
            );
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { maxLength: 13 },
  },

  // ── Row 4: Address (full width) ─────────────────────────────────────────────
  {
    name: "address",
    label: "Address",
    type: "textarea",
    span: 24,
    placeholder:
      "Flat / Building, Street, Area, City — no special characters like @ $ % ^ &",
    rules: [
      { max: 300, message: "Maximum 300 characters allowed" },
      {
        pattern: ADDRESS_REGEX,
        message:
          "Address can contain letters, digits, spaces, commas, . - / # only",
      },
    ],
    fieldProps: { maxLength: 300, showCount: true },
  },

  // ── Row 5: Help Desk | SOS | Driver IVR ────────────────────────────────────
  {
    name: "helpDeskContactNumber",
    label: "Help Desk Contact",
    type: "text",
    span: 8,
    placeholder: "10-digit number",
    rules: [
      {
        validator: (_: any, value: any) => {
          if (!value) return Promise.resolve();
          if (!DIGITS_ONLY.test(value))
            return Promise.reject("Only digits are allowed");
          if (!PHONE_10.test(value))
            return Promise.reject("Must be exactly 10 digits");
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { maxLength: 10 },
  },

  {
    name: "sosContactNumber",
    label: "SOS Contact",
    type: "text",
    span: 8,
    placeholder: "10-digit number",
    rules: [
      {
        validator: (_: any, value: any) => {
          if (!value) return Promise.resolve();
          if (!DIGITS_ONLY.test(value))
            return Promise.reject("Only digits are allowed");
          if (!PHONE_10.test(value))
            return Promise.reject("Must be exactly 10 digits");
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { maxLength: 10 },
  },

  {
    name: "driverAppIvrNumber",
    label: "Driver App IVR",
    type: "text",
    span: 8,
    placeholder: "10-digit number",
    rules: [
      {
        validator: (_: any, value: any) => {
          if (!value) return Promise.resolve();
          if (!DIGITS_ONLY.test(value))
            return Promise.reject("Only digits are allowed");
          if (!PHONE_10.test(value))
            return Promise.reject("Must be exactly 10 digits");
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { maxLength: 10 },
  },

  // ── Row 6: User IVR | Active | Auto Penalty ────────────────────────────────
  {
    name: "userAppIvrNumber",
    label: "User App IVR",
    type: "text",
    span: 8,
    placeholder: "10-digit number",
    rules: [
      {
        validator: (_: any, value: any) => {
          if (!value) return Promise.resolve();
          if (!DIGITS_ONLY.test(value))
            return Promise.reject("Only digits are allowed");
          if (!PHONE_10.test(value))
            return Promise.reject("Must be exactly 10 digits");
          return Promise.resolve();
        },
      },
    ],
    fieldProps: { maxLength: 10 },
  },

  { name: "active", label: "Availability Status", type: "switch", span: 8 },
  { name: "isAutoPenalty", label: "Auto Penalty", type: "switch", span: 8 },
];
