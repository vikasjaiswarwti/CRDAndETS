// Publicemployeesignup.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public self-signup page.
// Uses PublicEmployeeSignupForm — completely independent from the internal form.
// No import of EmployeeRegisterForm or any internal-only component.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicEmployeeSignupForm } from "./Publicemployeesignupform";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations";
import type { CreateUserStageDto } from "../types/Employee.types";

const PublicEmployeeSignup: React.FC = () => {
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);
    const [formKey, setFormKey] = useState(0);

    const { createEmployee, isCreating, createError } = useEmployeeMutations({
        onCreateSuccess: () => {
            setIsSuccess(true);
            setFormKey(k => k + 1);
            setTimeout(() => navigate("/login"), 3000);
        },
    });

    const handleSubmit = async (values: CreateUserStageDto) => {
        await createEmployee(values);
    };

    if (isSuccess) {
        return (
            <div style={{
                minHeight: "100vh",
                background: "#F8F8F8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "1px solid #B7E4C7",
                    boxShadow: "0 4px 24px rgba(27,67,50,0.10)",
                    padding: "48px 40px",
                    textAlign: "center",
                    maxWidth: 420,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                    <h2 style={{ color: "#1B4332", fontWeight: 700, margin: "0 0 8px" }}>
                        Registration Successful!
                    </h2>
                    <p style={{ color: "#52796F", fontSize: 14, margin: 0 }}>
                        Your account has been submitted for approval. Redirecting to login…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <PublicEmployeeSignupForm
            key={formKey}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/login")}
            isSubmitting={isCreating}
            serverErrors={createError?.fieldErrors}
        />
    );
};

export default PublicEmployeeSignup;