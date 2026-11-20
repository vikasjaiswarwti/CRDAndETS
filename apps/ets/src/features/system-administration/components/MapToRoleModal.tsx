// components/MapToRoleModal.tsx
import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { Role } from "../types/SystemRolePermission.types";

interface MapToRoleModalProps {
    open: boolean;
    onClose: () => void;
    menuName: string;
    roles: Role[];
    currentRoleId: string | null; // already-selected role, pre-checked
    isSubmitting: boolean;
    statusMessage?: string | null;
    onConfirm: (selectedRoleIds: string[]) => Promise<void>;
}

const MapToRoleModal: React.FC<MapToRoleModalProps> = ({
    open, onClose, menuName, roles, currentRoleId,
    isSubmitting, statusMessage, onConfirm,
}) => {
    const { Modal } = useUILibrary();
    const [checkedIds, setCheckedIds] = useState<Set<string>>(
        () => new Set(currentRoleId ? [currentRoleId] : [])
    );

    const toggle = (roleId: string) => {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            next.has(roleId) ? next.delete(roleId) : next.add(roleId);
            return next;
        });
    };

    const handleConfirm = async () => {
        await onConfirm(Array.from(checkedIds));
    };

    // Reset checkboxes when modal reopens
    React.useEffect(() => {
        if (open) {
            setCheckedIds(new Set(currentRoleId ? [currentRoleId] : []));
        }
    }, [open, currentRoleId]);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={
                <span style={{ fontSize: 17, fontWeight: 700, color: "#1B4332" }}>
                    Map Menu to Roles
                </span>
            }
            width={420}
            destroyOnClose
            footer={null}
            styles={{
                header: { borderBottom: "none", paddingBottom: 0 },
                mask: { background: "rgba(0, 60, 30, 0.35)" },
            }}
            style={{ borderRadius: 16, top: 40 }}
        >
            {/* Menu name banner */}
            <div style={{
                background: "#F0FAF4", border: "1px solid #B7E4C7",
                borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 10,
            }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="9" rx="2"
                        stroke="#1B4332" strokeWidth="1.2" />
                    <path d="M4 3V2a1 1 0 011-1h4a1 1 0 011 1v1"
                        stroke="#1B4332" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <div>
                    <div style={{ fontSize: 11, color: "#52796F", fontWeight: 500 }}>Menu</div>
                    <div style={{ fontSize: 13, color: "#1B4332", fontWeight: 700 }}>{menuName}</div>
                </div>
            </div>

            <p style={{ fontSize: 13, color: "#52796F", margin: "0 0 14px" }}>
                Select the roles this menu should be accessible to:
            </p>

            {/* Role checkboxes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {roles.map((role) => {
                    const checked = checkedIds.has(role.id);
                    const isCurrentRole = role.id === currentRoleId;
                    return (
                        <div
                            key={role.id}
                            onClick={() => toggle(role.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "10px 14px", borderRadius: 10,
                                border: `1.5px solid ${checked ? "#1B4332" : "#E5E7EB"}`,
                                background: checked ? "#F0FAF4" : "#fff",
                                cursor: "pointer", transition: "all 0.15s",
                            }}
                        >
                            {/* Custom checkbox */}
                            <div style={{
                                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                border: checked ? "none" : "1.5px solid #B7E4C7",
                                background: checked ? "#1B4332" : "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                            }}>
                                {checked && (
                                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                        <path d="M1 4L4 7L10 1" stroke="#fff"
                                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <span style={{
                                flex: 1, fontSize: 14,
                                color: checked ? "#1B4332" : "#374151",
                                fontWeight: checked ? 600 : 400,
                            }}>
                                {role.roleName}
                            </span>
                            {isCurrentRole && (
                                <span style={{
                                    fontSize: 10, color: "#52796F",
                                    background: "#E8F5EE", borderRadius: 4,
                                    padding: "2px 7px", letterSpacing: 0.3,
                                }}>
                                    CURRENT
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status message */}
            {statusMessage && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    color: "#52796F", fontSize: 13, marginBottom: 16,
                }}>
                    <svg width="16" height="16" viewBox="0 0 16 16"
                        style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <circle cx="8" cy="8" r="6" stroke="#B7E4C7" strokeWidth="2" fill="none" />
                        <path d="M8 2a6 6 0 016 6" stroke="#1B4332" strokeWidth="2"
                            strokeLinecap="round" fill="none" />
                    </svg>
                    {statusMessage}
                </div>
            )}

            {/* Footer buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                        padding: "8px 20px", borderRadius: 50,
                        border: "1.5px solid #B7E4C7", background: "#fff",
                        color: "#1B4332", fontSize: 13, fontWeight: 500,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={isSubmitting || checkedIds.size === 0}
                    style={{
                        padding: "8px 20px", borderRadius: 50,
                        border: "none",
                        background: isSubmitting || checkedIds.size === 0 ? "#6B9E85" : "#1B4332",
                        color: "#fff", fontSize: 13, fontWeight: 600,
                        cursor: isSubmitting || checkedIds.size === 0 ? "not-allowed" : "pointer",
                        transition: "background 0.2s",
                    }}
                >
                    {isSubmitting ? "Mapping…" : `Map to ${checkedIds.size} Role${checkedIds.size !== 1 ? "s" : ""}`}
                </button>
            </div>
        </Modal>
    );
};

export default MapToRoleModal;