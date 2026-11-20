import { useState, useCallback } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { useCreateDriverStageMutation } from "../services/DrivercomplianceApi";

// ─── Doc fields ───────────────────────────────────────────────────────────────
// key     → passed to uploadAndGetUrl → routes to DocumentFolders.Driver
// apiKey  → field name the backend expects in POST /api/v1/DriverStages
export const DRIVER_DOC_FIELDS = [
  {
    key: "profileimage_doc",
    label: "Profile Image",
    apiKey: "profileImageDoc",
  },
  { key: "licenseexp_doc", label: "License Document", apiKey: "licenseExpDoc" },
  {
    key: "policeverificationexp_doc",
    label: "Police Verification",
    apiKey: "policeVerificationExpDoc",
  },
  { key: "govtid_doc", label: "Govt ID Proof", apiKey: "govtIdDoc" },
  {
    key: "lasttraining_doc",
    label: "Last Training Certificate",
    apiKey: "lastTrainingDoc",
  },
] as const;

export type DriverDocKey = (typeof DRIVER_DOC_FIELDS)[number]["key"];
export type DriverDocState = Record<DriverDocKey, string | null>;

const EMPTY_DOCS: DriverDocState = {
  profileimage_doc: null,
  licenseexp_doc: null,
  policeverificationexp_doc: null,
  govtid_doc: null,
  lasttraining_doc: null,
};

const formatDateOnly = (value: unknown): string | null => {
  if (!value) return null;

  const date = dayjs.isDayjs(value) ? value : dayjs(value as Date);
  return date.isValid() ? date.format("YYYY-MM-DD"): null;
};

interface UseAddDriverStageFormProps {
  transporterId?: number;
  locCode: number | undefined;
  onSuccess: () => void;
}

export function useAddDriverStageForm({
  transporterId,
  locCode,
  onSuccess,
}: UseAddDriverStageFormProps) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocsState] = useState<DriverDocState>({ ...EMPTY_DOCS });

  const [createDriverStage] = useCreateDriverStageMutation();

  const setDoc = useCallback((key: DriverDocKey, url: string | null) => {
    setDocsState((prev) => ({ ...prev, [key]: url }));
  }, []);

  // no-op — form handles its own state; hook can react here if needed
  const onValuesChange = useCallback(() => {}, []);

  const goNext = useCallback(async () => {
    try {
      await form.validateFields();
      setStep((s) => s + 1);
    } catch {
      // validation errors shown inline — do not advance
    }
  }, [form]);

  const goBack = useCallback(() => setStep((s) => s - 1), []);

  const reset = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({ currentStatus: 1 });
    setStep(0);
    setDocsState({ ...EMPTY_DOCS });
  }, [form]);

  // const submit = useCallback(async () => {
  //   let values: Record<string, any>;
  //   try {
  //     values = await form.validateFields();
  //   } catch {
  //     return; // validation errors shown inline
  //   }

  //   setSubmitting(true);
  //   try {
  //     // ── Date formatter — outputs 2026-06-21T18:30:00Z (ISO 8601 UTC) ───────
  //     const fmt = (d: any): string | null => {
  //       if (!d) return null;
  //       const iso = (dayjs.isDayjs(d) ? d.toDate() : new Date(d)).toISOString();
  //       return iso.replace(/\.\d+Z$/, "Z"); // strip milliseconds → ...T18:30:00Z
  //     };

  //     // ── Address — combine street / city / state / pincode into one string
  //     const joinAddr = (...parts: (string | undefined | null)[]) =>
  //       parts.filter(Boolean).join(", ") || null;

  //     const presentAddr = joinAddr(
  //       values.presentAddress,
  //       values.presentCity,
  //       values.presentState,
  //       values.presentPincode,
  //     );
  //     const permanentAddr = values.sameAsPresentAddress
  //       ? presentAddr
  //       : joinAddr(
  //           values.permanentAddress,
  //           values.permanentCity,
  //           values.permanentState,
  //           values.permanentPincode,
  //         );

  //     // ── Document payload — map key → apiKey ─────────────────────────────
  //     const docPayload: Record<string, string | null> = {};
  //     DRIVER_DOC_FIELDS.forEach(({ key, apiKey }) => {
  //       docPayload[apiKey] = docs[key];
  //     });

  //     // ── Full API payload matching POST /api/v1/DriverStages ─────────────
  //     const payload = {
  //       locCode: locCode ?? values.locCode ?? null,
  //       transporterId: transporterId ?? values.transporterId ?? null,
  //       driverName: values.driverName ?? "",
  //       fatherName: values.fatherName ?? null,
  //       presentAddress: presentAddr,
  //       permanentAddress: permanentAddr,
  //       dob: fmt(values.dob),
  //       gender: values.gender ?? "",
  //       mobileNo: values.mobileNo ?? "",
  //       alternateMobileNo: values.alternateMobileNo ?? null,
  //       licenseNo: values.licenseNo ?? "",
  //       licenseExpDate: fmt(values.licenseExpDate),
  //       driverLicenceAuthority: values.driverLicenceAuthority ?? "",
  //       licenseIssueDate: fmt(values.licenseIssueDate) ?? null,
  //       inductionDate: fmt(values.inductionDate),
  //       driverType: values.driverType ?? null,
  //       bloodGroup: values.bloodGroup ?? null,
  //       policeVerification: !!values.policeVerification, // Switch → boolean
  //       policeVerificationExpDate: fmt(values.policeVerificationExpiry), // form: policeVerificationExpiry
  //       govtIdProof:
  //         values.govtIdProof != null ? Number(values.govtIdProof) : null, // always number (1–5)
  //       lastInternalVerificationDate:
  //         fmt(values.lastInternalVerificationDate) ?? "2026-06-15T18:30:00Z",
  //       externalVerificationExpDate:
  //         fmt(values.externalVerificationExpDate) ?? null,
  //       externalVerificationAgency: values.externalVerificationAgency ?? null,
  //       trainingStatus: "Completed", //values.trainingStatus ?? "Completed", // Select → string
  //       currentStatus: values.currentStatus ?? null, // Select → number 1=Active 0=Inactive
  //       lastTrainingDate: fmt(values.lastTrainingDate), // DatePicker
  //       privateBGVExpDate: fmt(values.privateBGVExpDate), // DatePicker
  //       ...docPayload,
  //       remarks: values.remarks ?? null,
  //       active: true,
  //     };

  //     await createDriverStage(payload).unwrap();

  //     message.success("Driver added successfully");
  //     reset();
  //     onSuccess();
  //   } catch (err: any) {
  //     console.error("[useAddDriverStageForm] submit error:", err);

  //     // ── Parse API validation errors and surface them as readable messages ──
  //     const apiErrors = err?.data?.errors as
  //       | Record<string, string[]>
  //       | undefined;
  //     if (apiErrors) {
  //       // Field name prettifier: "$.govtIdProof" → "Govt Id Proof"
  //       const prettify = (field: string) =>
  //         field
  //           .replace(/^\$\./, "") // strip "$." prefix
  //           .replace(/([A-Z])/g, " $1") // camelCase → words
  //           .replace(/^./, (c) => c.toUpperCase())
  //           .trim();

  //       const msgs = Object.entries(apiErrors).flatMap(([field, errs]) =>
  //         errs.map((e) => `${prettify(field)}: ${e}`),
  //       );
  //       msgs.forEach((m) => message.error(m, 6));
  //     } else {
  //       message.error(
  //         err?.data?.title ??
  //           err?.error ??
  //           "Submission failed. Please try again.",
  //         5,
  //       );
  //     }
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }, [form, docs, transporterId, createDriverStage, reset, onSuccess]);

  const submit = useCallback(async () => {
    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    let succeeded = false; // ← flag

    try {
      const fmt = (d: any): string | null => {
        return formatDateOnly(d);
      };

      const joinAddr = (...parts: (string | undefined | null)[]) =>
        parts.filter(Boolean).join(", ") || null;

      const presentAddr = joinAddr(
        values.presentAddress,
        values.presentCity,
        values.presentState,
        values.presentPincode,
      );
      const permanentAddr = values.sameAsPresentAddress
        ? presentAddr
        : joinAddr(
            values.permanentAddress,
            values.permanentCity,
            values.permanentState,
            values.permanentPincode,
          );

      const docPayload: Record<string, string | null> = {};
      DRIVER_DOC_FIELDS.forEach(({ key, apiKey }) => {
        docPayload[apiKey] = docs[key];
      });

      const payload = {
        locCode: locCode ?? values.locCode ?? null,
        transporterId: transporterId ?? values.transporterId ?? null,
        driverName: values.driverName ?? "",
        fatherName: values.fatherName ?? null,
        presentAddress: presentAddr,
        permanentAddress: permanentAddr,
        dob: fmt(values.dob),
        gender: values.gender ?? "",
        mobileNo: values.mobileNo ?? "",
        alternateMobileNo: values.alternateMobileNo ?? null,
        licenseNo: values.licenseNo ?? "",
        licenseExpDate: fmt(values.licenseExpDate),
        driverLicenceAuthority: values.driverLicenceAuthority ?? "",
        licenseIssueDate: fmt(values.licenseIssueDate) ?? null,
        inductionDate: fmt(values.inductionDate),
        driverType: values.driverType ?? null,
        bloodGroup: values.bloodGroup ?? null,
        policeVerification: !!values.policeVerification,
        policeVerificationExpDate: fmt(values.policeVerificationExpiry),
        govtIdProof:
          values.govtIdProof != null ? Number(values.govtIdProof) : null,
        lastInternalVerificationDate:
          fmt(values.lastInternalVerificationDate) ?? "2026-06-15T18:30:00Z",
        externalVerificationExpDate:
          fmt(values.externalVerificationExpDate) ?? null,
        externalVerificationAgency: values.externalVerificationAgency ?? null,
        trainingStatus: "Completed",
        currentStatus: values.currentStatus ?? null,
        lastTrainingDate: fmt(values.lastTrainingDate),
        privateBGVExpDate: fmt(values.privateBGVExpDate),
        ...docPayload,
        remarks: values.remarks ?? null,
        active: true,
      };

      await createDriverStage(payload).unwrap();
      message.success("Driver added successfully");
      reset();
      succeeded = true; // ← mark success
    } catch (err: any) {
      console.error("[useAddDriverStageForm] submit error:", err);

      const apiErrors = err?.data?.errors as
        | Record<string, string[]>
        | undefined;
      if (apiErrors) {
        const prettify = (field: string) =>
          field
            .replace(/^\$\./, "")
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (c) => c.toUpperCase())
            .trim();
        const msgs = Object.entries(apiErrors).flatMap(([field, errs]) =>
          errs.map((e) => `${prettify(field)}: ${e}`),
        );
        msgs.forEach((m) => message.error(m, 6));
      } else {
        message.error(
          err?.data?.title ??
            err?.error ??
            "Submission failed. Please try again.",
          5,
        );
      }
    } finally {
      setSubmitting(false);
    }

    if (succeeded) onSuccess(); // ← outside try/catch
  }, [form, docs, transporterId, locCode, createDriverStage, reset, onSuccess]);

  return {
    form,
    step,
    submitting,
    docs,
    setDoc,
    onValuesChange,
    goNext,
    goBack,
    reset,
    submit,
  };
}
