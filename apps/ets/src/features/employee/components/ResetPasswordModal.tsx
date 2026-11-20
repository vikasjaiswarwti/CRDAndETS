import React, { useEffect, useMemo, useState } from "react";
import { Alert, Input, Modal, Progress } from "antd";
import { LockKeyhole } from "lucide-react";
import { EMPLOYEE_CONFIG } from "../config";

interface Props {
  open: boolean;
  userName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
}

type PasswordErrors = {
  newPassword?: string;
  confirmPassword?: string;
};

const getPasswordChecks = (password: string) => ({
  length: password.length >= (EMPLOYEE_CONFIG.passwordPolicy === "strong" ? 8 : 6),
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

export const ResetPasswordModal: React.FC<Props> = ({
  open,
  userName,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});

  const policy = EMPLOYEE_CONFIG.passwordPolicy;
  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const requiredChecks = policy === "strong"
    ? Object.values(checks)
    : [checks.length];
  const strength = Math.round(
    (requiredChecks.filter(Boolean).length / requiredChecks.length) * 100,
  );
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [open]);

  const validate = (): PasswordErrors => {
    const nextErrors: PasswordErrors = {};
    if (!newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (!checks.length) {
      nextErrors.newPassword = `Password must be at least ${policy === "strong" ? 8 : 6} characters.`;
    } else if (policy === "strong" && !Object.values(checks).every(Boolean)) {
      nextErrors.newPassword = "Strong password must include uppercase, lowercase, number, and special character.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm the new password.";
    } else if (!passwordsMatch) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(newPassword);
  };

  const rule = (label: string, passed: boolean) => (
    <li key={label} style={{ color: passed ? "#16745c" : "#68736f" }}>
      {passed ? "✓" : "○"} {label}
    </li>
  );

  return (
    <Modal
      open={open}
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LockKeyhole size={18} /> Reset password
        </span>
      }
      okText="Reset password"
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      <p style={{ color: "#68736f" }}>
        Set a new password for <strong>{userName}</strong>.
      </p>
      <Input.Password
        value={newPassword}
        placeholder="New password"
        status={errors.newPassword ? "error" : undefined}
        onChange={(event) => {
          setNewPassword(event.target.value);
          setErrors((previous) => ({ ...previous, newPassword: undefined }));
        }}
      />
      {errors.newPassword && <div style={{ color: "#d4380d", marginTop: 4 }}>{errors.newPassword}</div>}
      <Progress percent={strength} showInfo={false} strokeColor={strength === 100 ? "#16745c" : "#d69e2e"} style={{ margin: "8px 0 0" }} />
      <ul style={{ margin: "4px 0 16px", paddingLeft: 20, fontSize: 13 }}>
        {rule(`At least ${policy === "strong" ? 8 : 6} characters`, checks.length)}
        {policy === "strong" && rule("Uppercase letter", checks.uppercase)}
        {policy === "strong" && rule("Lowercase letter", checks.lowercase)}
        {policy === "strong" && rule("Number", checks.number)}
        {policy === "strong" && rule("Special character", checks.special)}
      </ul>
      <Input.Password
        value={confirmPassword}
        placeholder="Confirm new password"
        status={errors.confirmPassword ? "error" : undefined}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
          setErrors((previous) => ({ ...previous, confirmPassword: undefined }));
        }}
      />
      {errors.confirmPassword && <div style={{ color: "#d4380d", marginTop: 4 }}>{errors.confirmPassword}</div>}
      {confirmPassword && !passwordsMatch && !errors.confirmPassword && (
        <Alert type="warning" showIcon message="Passwords do not match." style={{ marginTop: 8 }} />
      )}
    </Modal>
  );
};
