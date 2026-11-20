import { useState, useCallback } from "react";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { useCreateStageVehicleMutation } from "../../vehicle-management/services/vehicleApi";

export interface VehicleDocState {
  registrationExpiryDate_Doc: string | null;
  permitExpiryDate_Doc: string | null;
  insuranceExpiryDate_Doc: string | null;
  fitnessExpiryDate_Doc: string | null;
  roadTaxExpiryDate_Doc: string | null;
  pucExpiryDate_Doc: string | null;
  firstAidKitDateExpiry_Doc: string | null;
  fireExtinguisherExp_Doc: string | null;
  allDocuments_Doc: string | null;
}

export const VEHICLE_DOC_FIELDS: {
  key: keyof VehicleDocState;
  label: string;
}[] = [
  { key: "registrationExpiryDate_Doc", label: "Registration Doc" },
  { key: "permitExpiryDate_Doc", label: "Permit Doc" },
  { key: "insuranceExpiryDate_Doc", label: "Insurance Doc" },
  { key: "fitnessExpiryDate_Doc", label: "Fitness Doc" },
  { key: "roadTaxExpiryDate_Doc", label: "Road Tax Doc" },
  { key: "pucExpiryDate_Doc", label: "PUC Doc" },
  { key: "firstAidKitDateExpiry_Doc", label: "First Aid Kit Doc" },
  { key: "fireExtinguisherExp_Doc", label: "Fire Extinguisher Doc" },
  { key: "allDocuments_Doc", label: "All Documents" },
];

// Individual-mode required docs — allDocuments_Doc is for single-PDF mode only
export const REQUIRED_INDIVIDUAL_DOCS: (keyof VehicleDocState)[] = [
  "registrationExpiryDate_Doc",
  "permitExpiryDate_Doc",
  "insuranceExpiryDate_Doc",
  "fitnessExpiryDate_Doc",
  "roadTaxExpiryDate_Doc",
  "pucExpiryDate_Doc",
  // "firstAidKitDateExpiry_Doc",
  // "fireExtinguisherExp_Doc",
];

const INITIAL_DOCS: VehicleDocState = {
  registrationExpiryDate_Doc: null,
  permitExpiryDate_Doc: null,
  insuranceExpiryDate_Doc: null,
  fitnessExpiryDate_Doc: null,
  roadTaxExpiryDate_Doc: null,
  pucExpiryDate_Doc: null,
  firstAidKitDateExpiry_Doc: null,
  fireExtinguisherExp_Doc: null,
  allDocuments_Doc: null,
};

const formatDateOnly = (value: unknown): string | null => {
  if (!value) return null;

  const date = dayjs.isDayjs(value) ? value : dayjs(value as Date);
  return date.isValid() ? date.format("YYYY-MM-DD") : null;
};

const DATE_FIELDS = [
  "gps_Installation_Date",
  "vehicle_Registration_Date",
  "vehicle_Induction_Date",
  "registration_Exp_Date",
  "permit_Expiry_Date",
  "insurance_Expiry_Date",
  "fitness_Expiry_Date",
  "road_Tax_Validity_Expiry",
  "puc_Expiry_Date",
  "firstAid_Kid_Date",
  "fire_Extinguisher_Date",
] as const;

// Fields that MUST pass before the user can advance from each step.
const STEP_REQUIRED_FIELDS: Record<number, string[]> = {
  0: [
    "locCode",
    "vehicle_Registration_No",
    "vehicleTypeCode",
    "makeYear",
    "fuelTypeCode",
  ],
  1: [
    "vehicle_Registration_Date",
    "vehicle_Induction_Date",
    "permit_Expiry_Date",
    "insurance_Expiry_Date",
    "fitness_Expiry_Date",
    "road_Tax_Validity_Expiry",
    "puc_Expiry_Date",
    "owner_Type",
    "vehicle_Status",
    "current_Status",
    "remarks",
  ],
  2: [], // document step — validated separately in handleSubmit
};

const TOTAL_STEPS = 3;

export interface UseAddVehicleStageFormOptions {
  transporterId?: number;
  onSuccess: () => void;
}

export function useAddVehicleStageForm({
  transporterId,
  onSuccess,
}: UseAddVehicleStageFormOptions) {
  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocsState] = useState<VehicleDocState>(INITIAL_DOCS);
  const [createStageVehicle] = useCreateStageVehicleMutation();

  const setDoc = useCallback(
    (key: keyof VehicleDocState, url: string | null) => {
      setDocsState((prev) => ({ ...prev, [key]: url }));
    },
    [],
  );

  const goNext = useCallback(async () => {
    const fields = STEP_REQUIRED_FIELDS[step] ?? [];
    try {
      if (fields.length > 0) await form.validateFields(fields);
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    } catch {
      // antd renders inline errors on the offending fields
    }
  }, [form, step]);

  const goBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const reset = useCallback(() => {
    form.resetFields();
    setStep(0);
    setDocsState(INITIAL_DOCS);
  }, [form]);

  const submit = useCallback(
    async (docsOverride?: Partial<VehicleDocState>) => {
      setSubmitting(true);
      let succeeded = false;
      try {
        const rawValues = { ...form.getFieldsValue(true) } as Record<
          string,
          any
        >;

        DATE_FIELDS.forEach((field) => {
          const val = rawValues[field];
          rawValues[field] = formatDateOnly(val);
        });

        const finalDocs: VehicleDocState = { ...docs, ...docsOverride };

        const payload = {
          vehicle_Registration_No: rawValues.vehicle_Registration_No ?? null,
          vehicleTypeCode: rawValues.vehicleTypeCode ?? null,
          transporterId: rawValues.transporterId ?? transporterId ?? null,
          vehicle_Status: rawValues.vehicle_Status ?? null,
          driverId: null, //rawValues.driverId ?? null,
          locCode: rawValues.locCode ?? null,
          vehicle_Registration_Date:
            rawValues.vehicle_Registration_Date ?? null,
          vehicle_Induction_Date: rawValues.vehicle_Induction_Date ?? null,
          registration_Exp_Date: rawValues.registration_Exp_Date ?? null,
          firstAid_Kid_Date: rawValues.firstAid_Kid_Date ?? null,
          fire_Extinguisher_Date: rawValues.fire_Extinguisher_Date ?? null,
          make: rawValues.make ?? null,
          model: rawValues.model ?? null,
          chassis_No: rawValues.chassis_No ?? null,
          permit_Expiry_Date: rawValues.permit_Expiry_Date ?? null,
          insurance_Expiry_Date: rawValues.insurance_Expiry_Date ?? null,
          fitness_Expiry_Date: rawValues.fitness_Expiry_Date ?? null,
          road_Tax_Validity_Expiry: rawValues.road_Tax_Validity_Expiry ?? null,
          puc_Expiry_Date: rawValues.puc_Expiry_Date ?? null,
          owner_Name: rawValues.owner_Name ?? null,
          owner_Address: rawValues.owner_Address ?? null,
          owner_Type: rawValues.owner_Type ?? null,
          isGpsInstalled: rawValues.isGpsInstalled === true,
          gps_Installation_Date: rawValues.gps_Installation_Date ?? null,
          gpsProviderCode: rawValues.gpsProviderCode ?? null,
          fuelTypeCode: rawValues.fuelTypeCode ?? null,
          current_Status: rawValues.current_Status ?? null,
          makeYear: rawValues.makeYear
            ? `${dayjs(rawValues.makeYear).format("YYYY")}-01-01T00:00:00Z`
            : null,
          remarks: rawValues.remarks ?? null,
          registrationExpiryDate_Doc: finalDocs.registrationExpiryDate_Doc,
          permitExpiryDate_Doc: finalDocs.permitExpiryDate_Doc,
          insuranceExpiryDate_Doc: finalDocs.insuranceExpiryDate_Doc,
          fitnessExpiryDate_Doc: finalDocs.fitnessExpiryDate_Doc,
          roadTaxExpiryDate_Doc: finalDocs.roadTaxExpiryDate_Doc,
          pucExpiryDate_Doc: finalDocs.pucExpiryDate_Doc,
          firstAidKitDateExpiry_Doc:
            finalDocs.firstAidKitDateExpiry_Doc ?? null,
          fireExtinguisherExp_Doc: finalDocs.fireExtinguisherExp_Doc ?? null,
          allDocuments_Doc: finalDocs.allDocuments_Doc,
        };

        await createStageVehicle(payload as any).unwrap();

        message.success("Vehicle added successfully");
        reset();
        succeeded = true;
      } catch (err: any) {
        const msg =
          err?.data?.message ??
          err?.data?.title ??
          err?.error ??
          "Failed to add vehicle. Please try again.";
        message.error(msg);
      } finally {
        setSubmitting(false);
      }

      if (succeeded) onSuccess();
    },
    [form, docs, transporterId, createStageVehicle, reset, onSuccess],
  );

  return {
    form,
    step,
    submitting,
    docs,
    setDoc,
    goNext,
    goBack,
    reset,
    submit,
  } as const;
}
