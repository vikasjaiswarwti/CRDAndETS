import React, { useState } from "react";
import { Form, Input, Select, Modal } from "antd";
import {
  useCreateUserByRoleMutation,
  useGetAllRolesQuery,
} from "../services/Employeeapi";
import { useLookups } from "../../lookups";
import { T } from "../../../styles/tokens";
import { CloseOutlined, SafetyOutlined } from "@ant-design/icons";

interface CreateAdminRoleModalProps {
  open: boolean;
  onClose: () => void;
}

const InputCSS: React.CSSProperties = {
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
};

export const CreateAdminRoleModal: React.FC<CreateAdminRoleModalProps> = ({
  open,
  onClose,
}) => {
  const [antForm] = Form.useForm();
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdName, setCreatedName] = useState("");

  const { locationOptions, isLoading: locLoading } = useLookups({
    only: ["locationOptions"],
  });
  const { data: allRoles = [], isLoading: rolesLoading } = useGetAllRolesQuery(
    undefined,
    { skip: !open },
  );
  const [createUserByRole, { isLoading: saving }] =
    useCreateUserByRoleMutation();

  const handleSubmit = async () => {
    try {
      const values = await antForm.validateFields();
      setCreatedName(`${values.firstName} ${values.lastName}`);
      await createUserByRole(values).unwrap();
      setResult("success");
    } catch (err: any) {
      if (err?.data || err?.status) {
        setErrorMsg(
          err?.data?.message ?? err?.message ?? "Something went wrong.",
        );
        setResult("error");
      }
    }
  };

  const handleClose = () => {
    antForm.resetFields();
    setResult(null);
    setErrorMsg("");
    setCreatedName("");
    onClose();
  };

  const roleOptions = allRoles.map((r) => ({
    label: r.roleName,
    value: r.roleName,
  }));

  const label = (text: string, required?: boolean) => (
    <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
      {text}
      {required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </span>
  );

  const G3: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0 14px",
  };

  const itemStyle: React.CSSProperties = { marginBottom: 14 };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={640}
      style={{ top: 40 }}
      title={null}
      closable={false}
      destroyOnClose
    >
      {/* Header */}
      <div
        style={{
          padding: "18px",
          borderBottom: `1px solid ${T.formcss.greyBorder}`,
          // background: "linear-gradient(135deg, #064E3B 0%, #065f46 100%)",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: T.formcss.greyBorder,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            <SafetyOutlined />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              Create Admin User
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: T.quickaction.headingColor,
                marginTop: 2,
              }}
            >
              Register a new user and assign a system role
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.25)",
            background: T.formcss.greyBorder,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <CloseOutlined />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px 0" }}>
        {/* Success */}
        {result === "success" && (
          <div style={{ textAlign: "center", padding: "36px 0 28px" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#ecfdf5",
                border: "2px solid #6ee7b7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              User Created Successfully
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              <strong style={{ color: "#065f46" }}>"{createdName}"</strong> has
              been added to the system.
            </div>
            <button
              onClick={handleClose}
              style={{
                marginTop: 24,
                padding: "9px 32px",
                borderRadius: 8,
                border: "none",
                background: "#064E3B",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        )}

        {/* Error */}
        {result === "error" && (
          <div style={{ textAlign: "center", padding: "32px 0 28px" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#fef2f2",
                border: "2px solid #fca5a5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                margin: "0 auto 14px",
              }}
            >
              ✕
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Failed to Create User
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#dc2626",
                marginTop: 6,
                maxWidth: 340,
                margin: "8px auto 0",
                lineHeight: 1.6,
              }}
            >
              {errorMsg}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 24,
              }}
            >
              <button
                onClick={() => setResult(null)}
                style={{
                  padding: "9px 22px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: "9px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {result === null && (
          <Form
            form={antForm}
            layout="vertical"
            requiredMark={false}
            style={{ paddingBottom: 4 }}
          >
            {/* Section: Personal Info */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#065f46",
                borderBottom: `1px solid ${T.formcss.greyBorder}`,
                paddingBottom: 5,
                marginBottom: 12,
              }}
            >
              Personal Information
            </div>

            <div style={G3}>
              <Form.Item
                name="firstName"
                label={label("First Name", true)}
                rules={[{ required: true, message: "Required" }]}
                style={itemStyle}
              >
                <Input
                  placeholder="First Name"
                  size="middle"
                  style={{ ...InputCSS }}
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label={label("Last Name", true)}
                rules={[{ required: true, message: "Required" }]}
                style={itemStyle}
              >
                <Input
                  placeholder="Last Name"
                  size="middle"
                  style={{ ...InputCSS }}
                />
              </Form.Item>

              <Form.Item
                name="mobileNo"
                label={label("Mobile No.", true)}
                rules={[
                  { required: true, message: "Required" },
                  {
                    pattern: /^[6-9]\d{9}$/,
                    message: "Enter valid 10-digit number",
                  },
                ]}
                style={itemStyle}
              >
                <Input
                  placeholder="Mobile No."
                  maxLength={10}
                  size="middle"
                  style={{ ...InputCSS }}
                />
              </Form.Item>
            </div>

            {/* Section: Account Details */}
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "#065f46",
                borderBottom: `1px solid ${T.formcss.greyBorder}`,
                paddingBottom: 5,
                marginBottom: 12,
                marginTop: 4,
              }}
            >
              Account &amp; Access
            </div>

            <div style={G3}>
              <Form.Item
                name="emailId"
                label={label("Email ID", true)}
                rules={[
                  { required: true, message: "Required" },
                  { type: "email", message: "Enter a valid email" },
                ]}
                style={{ ...itemStyle, gridColumn: "span 2" }}
              >
                <Input
                  placeholder="rahul@company.com"
                  size="middle"
                  style={{ ...InputCSS }}
                />
              </Form.Item>

              <Form.Item
                name="roleName"
                label={label("Role", true)}
                rules={[{ required: true, message: "Required" }]}
                style={itemStyle}
              >
                <Select
                  placeholder="Select role"
                  loading={rolesLoading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  size="middle"
                  options={roleOptions}
                  style={{ width: "100%", ...InputCSS }}
                />
              </Form.Item>
            </div>

            <div style={{ ...G3, gridTemplateColumns: "1fr" }}>
              <Form.Item
                name="locCode"
                label={label("Office Location", true)}
                rules={[{ required: true, message: "Required" }]}
                style={{ marginBottom: 4 }}
              >
                <Select
                  placeholder="Select office location"
                  loading={locLoading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  size="middle"
                  options={locationOptions.map((o) => ({
                    label: o.label,
                    value: Number(o.value),
                  }))}
                  style={{ width: "100%", ...InputCSS }}
                />
              </Form.Item>
            </div>
          </Form>
        )}
      </div>

      {/* Footer */}
      {result === null && (
        <div
          style={{
            padding: "14px 24px 18px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 16,
            borderRadius: "0 0 8px 8px",
          }}
        >
          <button
            onClick={handleClose}
            disabled={saving}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #a7f3d0",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#065f46",
              cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              border: "none",
              background: saving ? "#6ee7b7" : "#064E3B",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 140,
              justifyContent: "center",
            }}
          >
            {saving ? (
              <>
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    display: "inline-block",
                    animation: "role-spin 0.8s linear infinite",
                  }}
                />
                Creating…
              </>
            ) : (
              <span>
                <SafetyOutlined /> Create User
              </span>
            )}
          </button>
        </div>
      )}
      <style>{`@keyframes role-spin { to { transform: rotate(360deg); } }`}</style>
    </Modal>
  );
};

export default CreateAdminRoleModal;
