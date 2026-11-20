import React, { useEffect, useMemo } from "react";
import { Modal, Form, Input, Select, Row, Col, Button, Divider } from "antd";
import type {
  GlobalUserProfile,
  UpdateGlobalUserProfileDto,
} from "../types/profile.types";
import { useProfileMutations } from "../hooks/useProfileMutations";

// ─── Theme ────────────────────────────────────────────────────────────────────

const T = {
  navy800: "#16314E",
  accent: "#1A5C99",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  data: GlobalUserProfile;
  onClose: () => void;
  onUpdated?: () => void;
}

interface EditFormValues {
  firstName: string | null | undefined;
  middleName: string | null | undefined;
  lastName: string | null | undefined;
  gender: string | null | undefined;
}

// const EDITABLE_KEYS: (keyof EditFormValues)[] = [
//   "firstName",
//   "middleName",
//   "lastName",
//   "gender",
// ];

// ─── Section divider ──────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Divider
    orientation={"left" as any}
    orientationMargin={0}
    style={{ margin: "8px 0 14px" }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: T.accent,
      }}
    >
      {title}
    </span>
  </Divider>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const EditProfileModal: React.FC<Props> = ({
  open,
  data,
  onClose,
  onUpdated,
}) => {
  const [form] = Form.useForm<EditFormValues>();

  const { updateState, isUpdating } = useProfileMutations({
    onUpdateSuccess: () => {
      onClose();
      onUpdated?.();
    },
  });

  // ── Initial values ────────────────────────────────────────────────────────

  const initialValues = useMemo<EditFormValues>(
    () => ({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.gender,
    }),
    [data],
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    let values: EditFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // Build the PUT body from the real profile fields (correct API casing),
    // then overwrite only the fields the user can edit in this modal.
    const payload: UpdateGlobalUserProfileDto = {
      // ── Pass-through fields (from the current profile) ────────────────────
      address: data.address,
      city: data.city,
      state: data.stateName,
      pin: data.pin,
      phoneNo: data.phoneNo,
      stateCode: data.stateCode,
      emerContactNo: data.emercontactNo,
      specialNeeds: data.special_Needs,
      empTypeId: data.empTypeId,
      employeeId: String(data.employeeId ?? ""),
      locCode: Number(data.locCode),
      depCode: data.depCode,
      lobCode: data.lobCode,
      proCode: data.proCode,
      geocodeId: data.geocodeId,
      empLat: data.emp_Lat,
      empLng: data.emp_Lng,
      locationName: data.locationName,
      supervisorName: "",
      supEmployeeId: data.supEmployeeId,
      spoc: data.spoc,
      spocEmployeeId: data.spocEmployeeId,
      supId: data.supId,
      locality: data.locality,
      actionType: null,
      regisLocation: null,
      ipAddress: null,
      emp_Lat: data.emp_Lat,
      emp_Lng: data.emp_Lng,

      // ── Updated fields (overwrite with form values) ───────────────────────
      firstName: values.firstName ?? data.firstName,
      middleName: values.middleName ?? data.middleName,
      lastName: values.lastName ?? data.lastName,
      gender: values.gender ?? data.gender,
      emailId: data.emailId,
      mobileNo: data.mobileNo,
    };

    await updateState({ userId: data.user_Id, payload });
  };
  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      title={
        <span style={{ color: T.navy800, fontWeight: 700, fontSize: 15 }}>
          Edit Profile
        </span>
      }
      open={open}
      onCancel={onClose}
      width={680}
      destroyOnClose
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isUpdating}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={isUpdating}
          onClick={handleSubmit}
          style={{ background: T.accent, borderColor: T.accent }}
        >
          Save changes
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark={false}
        style={{ marginTop: 8, fontFamily: T.font }}
      >
        {/* ══ NAME ═════════════════════════════════════════════════════════ */}
        <SectionHeader title="Name" />
        <Row gutter={14}>
          <Col span={8}>
            <Form.Item
              name="firstName"
              label="First name"
              rules={[
                { required: true, message: "First name is required" },
                { max: 50, message: "Max 50 characters" },
              ]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="middleName" label="Middle name">
              <Input placeholder="Middle name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="lastName"
              label="Last name"
              rules={[{ max: 50, message: "Max 50 characters" }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>

        {/* ══ GENDER ═══════════════════════════════════════════════════════ */}
        <SectionHeader title="Gender" />
        <Row>
          <Col span={10}>
            <Form.Item name="gender" label="Gender">
              <Select
                placeholder="Select gender"
                options={[
                  { value: "M", label: "Male" },
                  { value: "F", label: "Female" },
                  { value: "O", label: "Other" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
