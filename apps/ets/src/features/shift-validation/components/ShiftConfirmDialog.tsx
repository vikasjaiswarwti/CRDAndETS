import React from 'react';
import type { ShiftItem } from '../types/shiftValidation.types';

interface ShiftConfirmDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    /** Shifts as they were BEFORE user made changes (original state from API) */
    originalPickup: ShiftItem[];
    originalDrop?: ShiftItem[];
    /** Shifts as they are NOW (user's pending changes) */
    pendingPickup: ShiftItem[];
    pendingDrop?: ShiftItem[];
    officeName?: string;
    /** true = only show pickup (normal shift page) */
    singleGrid?: boolean;
}

interface DiffResult {
    closing: ShiftItem[];
    opening: ShiftItem[];
}

function computeDiff(original: ShiftItem[], pending: ShiftItem[]): DiffResult {
    const closing = original.filter(
        (o) => o.Active && !pending.find((p) => p.ControlId === o.ControlId)?.Active,
    );
    const opening = pending.filter(
        (p) => p.Active && !original.find((o) => o.ControlId === p.ControlId)?.Active,
    );
    return { closing, opening };
}

const ChipList: React.FC<{ items: ShiftItem[]; color: string; bg: string }> = ({
    items,
    color,
    bg,
}) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
        {items.map((s) => (
            <span
                key={s.ControlId}
                style={{
                    padding: '3px 12px',
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 600,
                    background: bg,
                    color,
                }}
            >
                {s.shifttime}
            </span>
        ))}
    </div>
);

const ShiftConfirmDialog: React.FC<ShiftConfirmDialogProps> = ({
    open,
    onConfirm,
    onCancel,
    isLoading,
    originalPickup,
    originalDrop = [],
    pendingPickup,
    pendingDrop = [],
    officeName,
    singleGrid = false,
}) => {
    if (!open) return null;

    const pickupDiff = computeDiff(originalPickup, pendingPickup);
    const dropDiff = singleGrid ? { closing: [], opening: [] } : computeDiff(originalDrop, pendingDrop);

    const currentlyOpenPickup = originalPickup.filter((s) => s.Active);
    const currentlyOpenDrop = originalDrop.filter((s) => s.Active);

    const totalClosing = pickupDiff.closing.length + dropDiff.closing.length;
    const totalOpening = pickupDiff.opening.length + dropDiff.opening.length;
    const noChange = totalClosing === 0 && totalOpening === 0;

    return (
        /* Faux viewport so fixed/absolute doesn't collapse iframe */
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 60, 30, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    width: 520,
                    maxWidth: '95vw',
                    boxShadow: '0 20px 60px rgba(27, 67, 50, 0.2)',
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Shift update confirmation"
            >
                {/* Header */}
                <div
                    style={{
                        background: '#1B4332',
                        padding: '18px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                        }}
                    >
                        ⚠
                    </div>
                    <div>
                        <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 16 }}>
                            Confirm Shift Update
                        </div>
                        {officeName && (
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                                Office: {officeName}
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {noChange ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '24px 0',
                                color: '#52796F',
                                fontSize: 14,
                            }}
                        >
                            No changes detected. The shift configuration is identical to the current state.
                        </div>
                    ) : (
                        <>
                            {/* Summary bar */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 12,
                                    marginBottom: 20,
                                }}
                            >
                                <div
                                    style={{
                                        background: '#FEF2F2',
                                        border: '1px solid #FECACA',
                                        borderRadius: 10,
                                        padding: '12px 14px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>
                                        {totalClosing}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#991B1B', fontWeight: 500 }}>
                                        Shift{totalClosing !== 1 ? 's' : ''} closing
                                    </div>
                                </div>
                                <div
                                    style={{
                                        background: '#F0FAF4',
                                        border: '1px solid #B7E4C7',
                                        borderRadius: 10,
                                        padding: '12px 14px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1B4332' }}>
                                        {totalOpening}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#166534', fontWeight: 500 }}>
                                        Shift{totalOpening !== 1 ? 's' : ''} opening
                                    </div>
                                </div>
                            </div>

                            {/* Pickup section */}
                            <Section
                                label="Pickup Shifts"
                                accentColor="#1B4332"
                                currentlyOpen={currentlyOpenPickup}
                                closing={pickupDiff.closing}
                                opening={pickupDiff.opening}
                            />

                            {/* Drop section (only on validation page) */}
                            {!singleGrid && (
                                <Section
                                    label="Drop Shifts"
                                    accentColor="#D32F2F"
                                    currentlyOpen={currentlyOpenDrop}
                                    closing={dropDiff.closing}
                                    opening={dropDiff.opening}
                                />
                            )}

                            <div
                                style={{
                                    marginTop: 16,
                                    padding: '10px 14px',
                                    background: '#FFFBEB',
                                    border: '1px solid #FDE68A',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    color: '#92400E',
                                    lineHeight: 1.5,
                                }}
                            >
                                ⚠ This action will immediately affect all active bookings linked to the
                                shifts being closed. Please verify before confirming.
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '14px 24px',
                        borderTop: '1px solid #E8F5E9',
                        display: 'flex',
                        gap: 10,
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{
                            padding: '9px 24px',
                            borderRadius: 50,
                            border: '1.5px solid #B7E4C7',
                            background: 'transparent',
                            color: '#52796F',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    {!noChange && (
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            style={{
                                padding: '9px 28px',
                                borderRadius: 50,
                                border: 'none',
                                background: '#1B4332',
                                color: '#FFFFFF',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                            }}
                        >
                            {isLoading ? 'Updating...' : 'Confirm Update'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{
    label: string;
    accentColor: string;
    currentlyOpen: ShiftItem[];
    closing: ShiftItem[];
    opening: ShiftItem[];
}> = ({ label, accentColor, currentlyOpen, closing, opening }) => (
    <div style={{ marginBottom: 16 }}>
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
            }}
        >
            <div
                style={{ width: 3, height: 16, borderRadius: 2, background: accentColor }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1B2B24' }}>{label}</span>
            <span style={{ fontSize: 12, color: '#52796F' }}>
                ({currentlyOpen.length} currently active)
            </span>
        </div>

        {closing.length > 0 && (
            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, marginBottom: 4 }}>
                    Closing ({closing.length})
                </div>
                <ChipList items={closing} color="#991B1B" bg="#FEE2E2" />
            </div>
        )}

        {opening.length > 0 && (
            <div>
                <div style={{ fontSize: 12, color: '#166534', fontWeight: 600, marginBottom: 4 }}>
                    Opening ({opening.length})
                </div>
                <ChipList items={opening} color="#166534" bg="#DCFCE7" />
            </div>
        )}

        {closing.length === 0 && opening.length === 0 && (
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>No changes for this section</div>
        )}
    </div>
);

export default ShiftConfirmDialog;