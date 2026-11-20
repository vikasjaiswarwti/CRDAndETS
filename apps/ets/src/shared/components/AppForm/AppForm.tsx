// // src/shared/components/AppForm/AppForm.tsx
// // ─────────────────────────────────────────────────────────────────────────────
// // Fix: DatePicker.RangePicker is typed as ComponentType<any> | undefined in the
// //      UILibrary interface, so JSX will complain about it directly.
// //      Solution: extract it into a local const with a null check before rendering.
// // ─────────────────────────────────────────────────────────────────────────────

// import React, { useEffect } from "react";
// import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
// import type { FieldError } from "../../types/api-error.types";
// import dayjs from "dayjs";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";

// // ── Field definition types ────────────────────────────────────────────────────

// export type FieldType =
//   | "text"
//   | "email"
//   | "password"
//   | "number"
//   | "textarea"
//   | "select"
//   | "multiselect"
//   | "date"
//   | "daterange"
//   | "switch"
//   | "checkbox"
//   | "phone"
//   | "custom"
//   | "image" // ← NEW: image upload with preview grid
//   | "file"
//   | "upload"; // ← NEW: generic file upload with list view;

// export interface SelectOption {
//   label: string;
//   value: string | number;
//   disabled?: boolean;
// }

// export interface FormFieldDef {
//   name: string;
//   label: string;
//   type: FieldType;
//   required?: boolean;
//   disabled?: boolean;
//   placeholder?: string;
//   maxLength?: number;
//   options?: SelectOption[];
//   rules?: any[];
//   formItemProps?: Record<string, unknown>;
//   fieldProps?: Record<string, unknown>;
//   render?: (formInstance: any) => React.ReactNode;
//   span?: number;
//   hidden?: (values: Record<string, unknown>) => boolean;
//   help?: string;
//   accept?: string; // MIME types or extensions (e.g. "image/*", ".pdf,.docx")
//   multiple?: boolean; // allow picking multiple files at once (default true)
//   maxFiles?: number; // cap on total number of files
//   maxSizeMB?: number; // per-file size limit
// }

// // ── Field renderer ────────────────────────────────────────────────────────────

// interface FieldRendererProps {
//   field: FormFieldDef;
//   lib: ReturnType<typeof useUILibrary>;
//   formInstance: any;
//   value?: any; // ← add these
//   onChange?: (...args: any[]) => void;
//   checked?: boolean;
//   [key: string]: any;
// }

// const FieldRenderer: React.FC<FieldRendererProps> = ({
//   field,
//   lib,
//   formInstance,
//   value,
//   onChange,
//   checked,
// }) => {
//   const { Input, Select, DatePicker, Switch, Checkbox } = lib;

//   // ── Fix: extract RangePicker with a guard before JSX uses it ─────────────
//   // DatePicker.RangePicker is typed as ComponentType<any> | undefined.
//   // Assigning to a local const + checking avoids the TS2604/TS2786 errors.
//   const RangePicker = DatePicker?.RangePicker;

//   switch (field.type) {
//     case "text":
//       return (
//         <Input
//           value={value} // ← forward explicitly
//           onChange={onChange}
//           placeholder={
//             field.placeholder ?? `Enter ${field.label.toLowerCase()}`
//           }
//           // {...rest} // <--- Spread here!
//           type={field.type}
//           // ... other props
//         />
//       );
//     case "email":
//       return (
//         <Input
//           value={value} // ← forward explicitly
//           onChange={onChange}
//           type={field.type}
//           placeholder={
//             field.placeholder ?? `Enter ${field.label.toLowerCase()}`
//           }
//           maxLength={field.maxLength}
//           disabled={field.disabled}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "password":
//       return (
//         <Input.Password
//           placeholder={field.placeholder ?? "Enter password"}
//           disabled={field.disabled}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "phone":
//       return (
//         <PhoneInput
//           country="in"
//           onlyCountries={["in"]}
//           disableDropdown
//           countryCodeEditable={false}
//           // PhoneInput needs full number with code to display correctly
//           // but form state only holds the 10-digit local number
//           value={value ? `91${value}` : ""}
//           onChange={(phone) => {
//             // phone is always "91XXXXXXXXXX" (12 chars) since country is locked
//             // slice exactly 2 chars ("91") to get the local 10-digit number
//             const localNumber = phone.slice(2);
//             onChange?.(localNumber);
//           }}
//           disabled={field.disabled}
//           inputStyle={{
//             width: "100%",
//             height: 32,
//             fontSize: 14,
//             borderRadius: 6,
//             border: "1px solid #d9d9d9",
//           }}
//           buttonStyle={{
//             borderRadius: "6px 0 0 6px",
//             border: "1px solid #d9d9d9",
//             borderRight: "none",
//             cursor: "default",
//           }}
//           containerStyle={{ width: "100%" }}
//           placeholder={field.placeholder ?? "Enter mobile number"}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "number":
//       return (
//         <Input
//           value={value} // ← forward explicitly
//           onChange={onChange}
//           // {...rest}
//           type="number"
//           placeholder={field.placeholder ?? "0"}
//           disabled={field.disabled}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "textarea":
//       return (
//         <Input.TextArea
//           // {...rest}

//           value={value} // ← forward explicitly
//           onChange={onChange}
//           placeholder={
//             field.placeholder ?? `Enter ${field.label.toLowerCase()}`
//           }
//           maxLength={field.maxLength}
//           disabled={field.disabled}
//           autoSize={{ minRows: 3, maxRows: 6 }}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "select":
//       return (
//         <Select
//           value={value} // ← forward explicitly
//           onChange={onChange}
//           placeholder={
//             field.placeholder ?? `Select ${field.label.toLowerCase()}`
//           }
//           options={field.options}
//           disabled={field.disabled}
//           allowClear
//           showSearch
//           filterOption={(input: string, option: any) =>
//             String(option?.label ?? "")
//               .toLowerCase()
//               .includes(input.toLowerCase())
//           }
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "multiselect":
//       return (
//         <Select
//           value={value} // ← forward explicitly
//           onChange={onChange} // ← forward explicitly
//           mode="multiple"
//           placeholder={
//             field.placeholder ?? `Select ${field.label.toLowerCase()}`
//           }
//           options={field.options}
//           disabled={field.disabled}
//           allowClear
//           showSearch
//           filterOption={(input: string, option: any) =>
//             String(option?.label ?? "")
//               .toLowerCase()
//               .includes(input.toLowerCase())
//           }
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "date":
//       let dateValue = value;
//       if (typeof value === "string" && value) {
//         dateValue = dayjs(value);
//         // Check if valid
//         if (!dateValue.isValid()) {
//           dateValue = null;
//         }
//       } else if (value instanceof Date) {
//         dateValue = dayjs(value);
//       } else if (value && typeof value === "object" && "isValid" in value) {
//         // Already a dayjs object, keep as is
//         dateValue = value;
//       }

//       return (
//         <DatePicker
//           value={dateValue} // ← Crucial
//           // onChange={onChange}

//           onChange={(date, dateString) => {
//             if (onChange) {
//               // Pass the dayjs object to form state
//               onChange(date, dateString);
//             }
//           }}
//           placeholder={field.placeholder ?? "Select date"}
//           disabled={field.disabled}
//           style={{ width: "100%" }}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "daterange":
//       // Guard: RangePicker may be undefined if the UILibrary adapter omits it.
//       // Fallback to two separate date pickers or a plain message.
//       if (!RangePicker) {
//         console.warn(
//           "AppForm: DatePicker.RangePicker is not available in the active UILibrary adapter.",
//         );
//         return <Input placeholder="RangePicker not available" disabled />;
//       }
//       return (
//         <RangePicker
//           disabled={field.disabled}
//           style={{ width: "100%" }}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "checkbox":
//       return (
//         <Checkbox
//           // {...rest}
//           checked={checked ?? value} // ← Checkbox uses `checked`, not `value`
//           onChange={onChange}
//           disabled={field.disabled}
//           {...(field.fieldProps ?? {})}
//         >
//           {field.placeholder ?? field.label}
//         </Checkbox>
//       );

//     case "switch":
//       return (
//         <Switch
//           // {...rest}
//           checked={checked ?? value} // ← Switch uses `checked`, not `value`
//           onChange={onChange}
//           disabled={field.disabled}
//           {...(field.fieldProps ?? {})}
//         />
//       );

//     case "custom":
//       return field.render ? <>{field.render(formInstance)}</> : null;

//     default:
//       return (
//         <Input
//           placeholder={field.placeholder}
//           disabled={field.disabled}
//           {...(field.fieldProps ?? {})}
//         />
//       );
//   }
// };

// // ── AppForm props ─────────────────────────────────────────────────────────────

// export interface AppFormProps {
//   fields: FormFieldDef[];
//   initialValues?: Record<string, unknown>;
//   onSubmit: (values: any) => Promise<void> | void; // Changed to any
//   onCancel?: () => void;
//   serverErrors?: FieldError[] | null | undefined;
//   isSubmitting?: boolean;
//   submitLabel?: string;
//   cancelLabel?: string;
//   showCancel?: boolean;
//   layout?: "vertical" | "horizontal" | "inline";
//   // twoColumn?: boolean;
//   columns?: 1 | 2 | 3;
//   style?: React.CSSProperties;
//   hideSubmit?: boolean;
//   resetOnSuccess?: boolean;
//   isApprovalButton?: boolean;
//   isApprovedFunction?: () => void;
// }

// // ── AppForm ───────────────────────────────────────────────────────────────────

// export const AppForm: React.FC<AppFormProps> = ({
//   fields,
//   initialValues,
//   onSubmit,
//   onCancel,
//   serverErrors,
//   isSubmitting = false,
//   submitLabel = "Submit",
//   cancelLabel = "Cancel",
//   showCancel = false,
//   layout = "vertical",
//   // twoColumn = false,
//   columns = 1,
//   style,
//   hideSubmit = false,
//   resetOnSuccess = false,

//   isApprovalButton = false,
//   isApprovedFunction = () => {},
// }) => {
//   const lib = useUILibrary();
//   const { Form, FormItem, Button } = lib;

//   // Form.useForm is exposed as a static method on the Form component via the adapter
//   // Cast needed because the UILibrary type declares it as optional
//   const [form] = (Form as any).useForm();

//   // Wire server-side field errors onto the correct form fields
//   useEffect(() => {
//     if (!serverErrors || serverErrors.length === 0) return;
//     form.setFields(
//       serverErrors.map((fe) => ({ name: fe.field, errors: [fe.message] })),
//     );
//   }, [serverErrors, form]);

//   // Sync initialValues when switching between create / edit
//   useEffect(() => {
//     if (initialValues) {
//       form.setFieldsValue(initialValues);
//     }
//   }, [initialValues, form]);

//   const handleFinish = async (values: Record<string, unknown>) => {
//     const finalPayload = {
//       ...initialValues,
//       ...values,
//     };
//     await onSubmit(finalPayload);

//     // console.log('values in my ', values);

//     // await onSubmit(values);
//     if (resetOnSuccess) form.resetFields();
//   };

//   const currentValues: Record<string, unknown> = form.getFieldsValue?.() ?? {};

//   // ── Grid column helper ────────────────────────────────────────────────────
//   // field.span uses 24-unit system (like Ant Design):
//   //   span 8  = 1/3 width  (use with columns=3)
//   //   span 12 = 1/2 width  (use with columns=2 or 3)
//   //   span 16 = 2/3 width
//   //   span 24 = full width (always)
//   const getGridSpan = (fieldSpan?: number): number => {
//     if (!fieldSpan || columns === 1) return columns; // full width
//     // Convert 24-unit span to CSS grid column span
//     // columns=2: each col = 12 units → span = fieldSpan / 12
//     // columns=3: each col = 8 units  → span = fieldSpan / 8
//     const unitSize = 24 / columns;
//     const cssSpan = Math.round(fieldSpan / unitSize);
//     return Math.min(Math.max(cssSpan, 1), columns); // clamp between 1 and columns
//   };

//   const formItems = fields
//     .filter((f) => !f.hidden?.(currentValues))
//     .map((field) => {
//       const rules: any[] = field.rules ? [...field.rules] : [];

//       if (field.required && !rules.some((r) => r.required)) {
//         rules.unshift({
//           required: true,
//           message: `${field.label} is required`,
//         });
//       }
//       if (field.type === "email") {
//         rules.push({ type: "email", message: "Enter a valid email address" });
//       }

//       const valuePropName =
//         field.type === "switch" || field.type === "checkbox"
//           ? "checked"
//           : "value";

//       // console.log(rules, "rules285");

//       return (
//         <div
//           key={field.name}
//           // style={twoColumn ? { gridColumn: `span ${(field.span ?? 12) === 24 ? 2 : 1}` } : undefined}
//           style={
//             columns > 1
//               ? { gridColumn: `span ${getGridSpan(field.span)}` }
//               : undefined
//           }
//         >
//           <FormItem
//             name={field.name}
//             label={field.label}
//             rules={rules}
//             valuePropName={valuePropName}
//             help={field.help}
//             {...(field.formItemProps ?? {})}
//           >
//             <FieldRenderer field={field} lib={lib} formInstance={form} />
//           </FormItem>
//         </div>
//       );
//     });

//   return (
//     <Form
//       form={form}
//       layout={layout}
//       initialValues={initialValues}
//       onFinish={handleFinish}
//       style={style}
//       disabled={isSubmitting}
//       scrollToFirstError
//     >
//       {/* {twoColumn ? (
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 23px" }}>
//                     {formItems}
//                 </div>
//             ) : (
//                 formItems
//             )} */}

//       {columns > 1 ? (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: `repeat(${columns}, 1fr)`,
//             gap: "0 24px",
//           }}
//         >
//           {formItems}
//         </div>
//       ) : (
//         formItems
//       )}

//       {isApprovalButton && (
//         <Button
//           variant="secondary"
//           htmlType="submit"
//           // loading={isApprovalLoading}
//           // disabled={isApprovalLoading}
//           onClick={isApprovedFunction}
//         >
//           Approved
//         </Button>
//       )}

//       {!hideSubmit && (
//         <FormItem style={{ marginTop: 4, marginBottom: 0 }}>
//           <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
//             {showCancel && onCancel && (
//               <Button
//                 variant="secondary"
//                 onClick={onCancel}
//                 disabled={isSubmitting}
//               >
//                 {cancelLabel}
//               </Button>
//             )}
//             <Button
//               variant="primary"
//               htmlType="submit"
//               loading={isSubmitting}
//               disabled={isSubmitting}
//             >
//               {submitLabel}
//             </Button>
//           </div>
//         </FormItem>
//       )}
//     </Form>
//   );
// };

// src/shared/components/AppForm/AppForm.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Production-level upgrades applied:
//   • DatePicker → inputReadOnly (keyboard entry blocked, calendar-only)
//   • "number" type → strips non-digit input at the onKeyDown level
//   • "text" type    → blocks a minimal set of definitely-harmful specials
//   • "textarea"     → maxLength forwarded + showCount enabled
//   • Select         → defaultActiveFirstOption: false (no auto-selection)
//   • All fieldProps are still forwarded so callers can override anything.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { useUILibrary } from "../../lib/ui-lib/ui-library-context";
import type { FieldError } from "../../types/api-error.types";
import dayjs from "dayjs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// ── Char-level guards ─────────────────────────────────────────────────────────

/**
 * Characters that are *never* meaningful in any plain-text / name / address
 * field and are almost always a sign of an injection or formatting mistake.
 * We block them in "text" fields by intercepting onKeyDown.
 * Note: we do NOT block on "textarea" fields (address) or "email" because
 * those legitimately need @ + / # etc.
 */
const BLOCKED_SPECIALS_RE = /[<>{}[\]\\|^`~$%*!?;="]/;

const blockSpecialCharsOnKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  // Allow: control keys (Backspace, Tab, Arrow*, Delete, Home, End)
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length > 1) return; // non-printable keys are fine
  if (BLOCKED_SPECIALS_RE.test(e.key)) {
    e.preventDefault();
  }
};

/** For numeric fields: only allow digits, one leading minus, one decimal point */
const blockNonNumericOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length > 1) return;
  // Allow: digit, minus (for negatives), dot (for decimals)
  if (!/[\d.\-]/.test(e.key)) {
    e.preventDefault();
  }
};

// ── Field definition types ────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "date"
  | "daterange"
  | "switch"
  | "checkbox"
  | "phone"
  | "custom"
  | "image"
  | "file"
  | "upload";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface FormFieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: SelectOption[];
  rules?: any[];
  formItemProps?: Record<string, unknown>;
  fieldProps?: Record<string, unknown>;
  render?: (formInstance: any) => React.ReactNode;
  span?: number;
  hidden?: (values: Record<string, unknown>) => boolean;
  help?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

// ── Field renderer ────────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormFieldDef;
  lib: ReturnType<typeof useUILibrary>;
  formInstance: any;
  value?: any;
  onChange?: (...args: any[]) => void;
  checked?: boolean;
  [key: string]: any;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  lib,
  formInstance,
  value,
  onChange,
  checked,
}) => {
  const { Input, Select, DatePicker, Switch, Checkbox } = lib;
  const RangePicker = DatePicker?.RangePicker;

  switch (field.type) {
    // ── text ─────────────────────────────────────────────────────────────────
    case "text":
      return (
        <Input
          value={value}
          onChange={onChange}
          onKeyDown={blockSpecialCharsOnKeyDown}
          placeholder={
            field.placeholder ?? `Enter ${field.label.toLowerCase()}`
          }
          maxLength={field.maxLength}
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── email ─────────────────────────────────────────────────────────────────
    case "email":
      return (
        <Input
          value={value}
          onChange={onChange}
          type="email"
          placeholder={
            field.placeholder ?? `Enter ${field.label.toLowerCase()}`
          }
          maxLength={field.maxLength ?? 254} // RFC 5321 max
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── password ──────────────────────────────────────────────────────────────
    case "password":
      return (
        <Input.Password
          placeholder={field.placeholder ?? "Enter password"}
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── phone (react-phone-input-2, India only) ───────────────────────────────
    case "phone":
      return (
        <PhoneInput
          country="in"
          onlyCountries={["in"]}
          disableDropdown
          countryCodeEditable={false}
          value={value ? `91${value}` : ""}
          onChange={(phone) => {
            const localNumber = phone.slice(2);
            onChange?.(localNumber);
          }}
          disabled={field.disabled}
          inputStyle={{
            width: "100%",
            height: 32,
            fontSize: 14,
            borderRadius: 6,
            border: "1px solid #d9d9d9",
          }}
          buttonStyle={{
            borderRadius: "6px 0 0 6px",
            border: "1px solid #d9d9d9",
            borderRight: "none",
            cursor: "default",
          }}
          containerStyle={{ width: "100%" }}
          placeholder={field.placeholder ?? "Enter mobile number"}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── number ────────────────────────────────────────────────────────────────
    case "number":
      return (
        <Input
          value={value}
          onChange={onChange}
          // Block non-numeric keystrokes at the DOM level
          onKeyDown={blockNonNumericOnKeyDown}
          // Prevent scroll-wheel accidentally changing the value
          onWheel={(e: any) => (e.target as HTMLElement).blur()}
          type="number"
          placeholder={field.placeholder ?? "0"}
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── textarea ──────────────────────────────────────────────────────────────
    case "textarea":
      return (
        <Input.TextArea
          value={value}
          onChange={onChange}
          placeholder={
            field.placeholder ?? `Enter ${field.label.toLowerCase()}`
          }
          // showCount renders a live character counter in the bottom-right corner
          showCount
          maxLength={field.maxLength ?? 500}
          disabled={field.disabled}
          autoSize={{ minRows: 3, maxRows: 6 }}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── select ────────────────────────────────────────────────────────────────
    case "select":
      return (
        <Select
          value={value}
          onChange={onChange}
          placeholder={
            field.placeholder ?? `— Select ${field.label.toLowerCase()} —`
          }
          options={field.options}
          disabled={field.disabled}
          allowClear
          showSearch
          // ↓ Critical: never auto-highlight the first item in the dropdown
          defaultActiveFirstOption={false}
          filterOption={(input: string, option: any) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          {...(field.fieldProps ?? {})}
        />
      );

    // ── multiselect ───────────────────────────────────────────────────────────
    case "multiselect":
      return (
        <Select
          value={value}
          onChange={onChange}
          mode="multiple"
          placeholder={
            field.placeholder ?? `— Select ${field.label.toLowerCase()} —`
          }
          options={field.options}
          disabled={field.disabled}
          allowClear
          showSearch
          defaultActiveFirstOption={false}
          filterOption={(input: string, option: any) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          {...(field.fieldProps ?? {})}
        />
      );

    // ── date ──────────────────────────────────────────────────────────────────
    case "date": {
      let dateValue = value;
      if (typeof value === "string" && value) {
        dateValue = dayjs(value);
        if (!dateValue.isValid()) dateValue = null;
      } else if (value instanceof Date) {
        dateValue = dayjs(value);
      }

      return (
        <DatePicker
          value={dateValue}
          onChange={(date: any, dateString: any) => {
            onChange?.(date, dateString);
          }}
          placeholder={field.placeholder ?? "Select date"}
          disabled={field.disabled}
          style={{ width: "100%" }}
          // ↓ Blocks keyboard entry — calendar-click is the only way to pick
          inputReadOnly
          {...(field.fieldProps ?? {})}
        />
      );
    }

    // ── daterange ─────────────────────────────────────────────────────────────
    case "daterange":
      if (!RangePicker) {
        console.warn("AppForm: DatePicker.RangePicker is not available.");
        return <Input placeholder="RangePicker not available" disabled />;
      }
      return (
        <RangePicker
          disabled={field.disabled}
          style={{ width: "100%" }}
          // ↓ Blocks keyboard entry on both inputs
          inputReadOnly
          {...(field.fieldProps ?? {})}
        />
      );

    // ── checkbox ──────────────────────────────────────────────────────────────
    case "checkbox":
      return (
        <Checkbox
          checked={checked ?? value}
          onChange={onChange}
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        >
          {field.placeholder ?? field.label}
        </Checkbox>
      );

    // ── switch ────────────────────────────────────────────────────────────────
    case "switch":
      return (
        <Switch
          checked={checked ?? value}
          onChange={onChange}
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        />
      );

    // ── custom ────────────────────────────────────────────────────────────────
    case "custom":
      return field.render ? <>{field.render(formInstance)}</> : null;

    default:
      return (
        <Input
          placeholder={field.placeholder}
          disabled={field.disabled}
          {...(field.fieldProps ?? {})}
        />
      );
  }
};

// ── AppForm props ─────────────────────────────────────────────────────────────

export interface AppFormProps {
  fields: FormFieldDef[];
  initialValues?: Record<string, unknown>;
  onSubmit: (values: any) => Promise<void> | void;
  onCancel?: () => void;
  serverErrors?: FieldError[] | null | undefined;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  layout?: "vertical" | "horizontal" | "inline";
  columns?: 1 | 2 | 3;
  style?: React.CSSProperties;
  hideSubmit?: boolean;
  resetOnSuccess?: boolean;
  isApprovalButton?: boolean;
  isApprovedFunction?: () => void;
}

// ── AppForm ───────────────────────────────────────────────────────────────────

export const AppForm: React.FC<AppFormProps> = ({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  serverErrors,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = false,
  layout = "vertical",
  columns = 1,
  style,
  hideSubmit = false,
  resetOnSuccess = false,
  isApprovalButton = false,
  isApprovedFunction = () => {},
}) => {
  const lib = useUILibrary();
  const { Form, FormItem, Button } = lib;

  const [form] = (Form as any).useForm();

  // Wire server-side field errors
  useEffect(() => {
    if (!serverErrors || serverErrors.length === 0) return;
    form.setFields(
      serverErrors.map((fe) => ({ name: fe.field, errors: [fe.message] })),
    );
  }, [serverErrors, form]);

  // Sync initialValues when switching create / edit
  // useEffect(() => {
  //   if (initialValues) {
  //     form.setFieldsValue(initialValues);
  //   }
  // }, [initialValues, form]);

  // const handleFinish = async (values: Record<string, unknown>) => {
  //   const finalPayload = { ...initialValues, ...values };
  //   await onSubmit(finalPayload);
  //   if (resetOnSuccess) form.resetFields();
  // };

  // ✅ Fix — values from onFinish already has everything
  const handleFinish = async (values: Record<string, unknown>) => {
    await onSubmit(values);
    if (resetOnSuccess) form.resetFields();
  };

  const currentValues: Record<string, unknown> = form.getFieldsValue?.() ?? {};

  // ── Grid column span helper ───────────────────────────────────────────────
  const getGridSpan = (fieldSpan?: number): number => {
    if (!fieldSpan || columns === 1) return columns;
    const unitSize = 24 / columns;
    const cssSpan = Math.round(fieldSpan / unitSize);
    return Math.min(Math.max(cssSpan, 1), columns);
  };

  const formItems = fields
    .filter((f) => !f.hidden?.(currentValues))
    .map((field) => {
      const rules: any[] = field.rules ? [...field.rules] : [];

      if (field.required && !rules.some((r) => r.required)) {
        rules.unshift({
          required: true,
          message: `${field.label} is required`,
        });
      }

      // Email type automatically gets a format rule
      if (field.type === "email") {
        const hasEmailRule = rules.some(
          (r) => r.type === "email" || r.pattern?.toString().includes("@"),
        );
        if (!hasEmailRule) {
          rules.push({
            pattern: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
            message: "Enter a valid email address",
          });
        }
      }

      const valuePropName =
        field.type === "switch" || field.type === "checkbox"
          ? "checked"
          : "value";

      return (
        <div
          key={field.name}
          style={
            columns > 1
              ? { gridColumn: `span ${getGridSpan(field.span)}` }
              : undefined
          }
        >
          <FormItem
            name={field.name}
            label={field.label}
            rules={rules}
            valuePropName={valuePropName}
            help={field.help}
            {...(field.formItemProps ?? {})}
          >
            <FieldRenderer field={field} lib={lib} formInstance={form} />
          </FormItem>
        </div>
      );
    });

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onFinish={handleFinish}
      style={style}
      disabled={isSubmitting}
      scrollToFirstError
    >
      {columns > 1 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "0 24px",
          }}
        >
          {formItems}
        </div>
      ) : (
        formItems
      )}

      {isApprovalButton && (
        <Button
          variant="secondary"
          type="primary"
          htmlType="submit"
          onClick={isApprovedFunction}
          style={{ border: "1px solid transparent" }}
        >
          Approved
        </Button>
      )}

      {!hideSubmit && (
        <FormItem style={{ marginTop: 4, marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            {showCancel && onCancel && (
              <Button
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                style={{ border: "1px solid #d1fae5" }}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
               style={{ border: "1px solid transparent", background:"#1D9E75" }}
            >
              {submitLabel}
            </Button>
          </div>
        </FormItem>
      )}
    </Form>
  );
};
