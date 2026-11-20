// src/shared/components/ApiState/ApiStateWrapper.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fix: FetchBaseQueryError  → "@reduxjs/toolkit/query/react"
// Fix: SerializedError      → our types barrel (which re-exports from "@reduxjs/toolkit")
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { SerializedError } from "../../../shared/types/api-error.types";

import { normalizeError } from "../../utils/normalize-error";

import type { AppError } from "../../types/api-error.types";

import {
  WifiOff,
  Clock,
  Lock,
  ShieldOff,
  SearchX,
  AlertTriangle,
  ServerCrash,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

// ── Error view ────────────────────────────────────────────────────────────────

const RETRYABLE_KINDS = new Set(["network", "timeout", "server", "unknown"]);

// const ERROR_ICONS: Record<string, string> = {
//   network: "📡",
//   timeout: "⏱",
//   auth: "🔐",
//   forbidden: "🚫",
//   not_found: "🔍",
//   validation: "⚠️",
//   server: "🛠",
//   unknown: "⚠️",
// };

const ERROR_ICONS: Record<string, React.ReactNode> = {
  network: <WifiOff size={20} />,
  timeout: <Clock size={20} />,
  auth: <Lock size={20} />,
  forbidden: <ShieldOff size={20} />,
  not_found: <SearchX size={20} />,
  validation: <AlertTriangle size={20} />,
  server: <ServerCrash size={20} />,
  unknown: <AlertCircle size={20} />,
};

const ERROR_ICONS_LG: Record<string, React.ReactNode> = {
  network: <WifiOff size={40} strokeWidth={1.5} />,
  timeout: <Clock size={40} strokeWidth={1.5} />,
  auth: <Lock size={40} strokeWidth={1.5} />,
  forbidden: <ShieldOff size={40} strokeWidth={1.5} />,
  not_found: <SearchX size={40} strokeWidth={1.5} />,
  validation: <AlertTriangle size={40} strokeWidth={1.5} />,
  server: <ServerCrash size={40} strokeWidth={1.5} />,
  unknown: <AlertCircle size={40} strokeWidth={1.5} />,
};

interface ErrorViewProps {
  error: AppError;
  onRetry?: () => void;
  compact?: boolean;
}

const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry, compact }) => {
  const canRetry = RETRYABLE_KINDS.has(error.kind);

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "var(--color-background-danger)",
          border: "1px solid var(--color-border-danger)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--color-text-danger)",
        }}
      >
        {/* <span>{ERROR_ICONS[error.kind]}</span> */}

        <span style={{ flexShrink: 0, display: "flex" }}>
          {ERROR_ICONS[error.kind] ?? <AlertCircle size={20} />}
        </span>
        <span style={{ flex: 1 }}>{error.message}</span>
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: "none",
              border: "1px solid var(--color-border-danger)",
              borderRadius: 6,
              padding: "2px 10px",
              fontSize: 12,
              cursor: "pointer",
              color: "var(--color-text-danger)",
            }}
          >
            <RotateCcw size={12} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        gap: 12,
      }}
    >
      {/* <span style={{ fontSize: 36 }}>{ERROR_ICONS[error.kind]}</span> */}

      <span style={{ opacity: 0.75, color: "var(--color-text-danger)" }}>
        {ERROR_ICONS_LG[error.kind] ?? (
          <AlertCircle size={40} strokeWidth={1.5} />
        )}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        {error.message}
      </p>
      {error.fieldErrors && error.fieldErrors.length > 0 && (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            fontSize: 13,
            color: "var(--color-text-danger)",
          }}
        >
          {error.fieldErrors.map((fe, i) => (
            <li key={i}>
              {fe.field}: {fe.message}
            </li>
          ))}
        </ul>
      )}
      {canRetry && onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 8,
            padding: "8px 24px",
            background: "#00A86B",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <RotateCcw size={15} style={{ marginRight: 6 }} />
          Try again
        </button>
      )}
    </div>
  );
};

// ── Empty view ────────────────────────────────────────────────────────────────

interface EmptyViewProps {
  message?: string;
  action?: React.ReactNode;
}

const EmptyView: React.FC<EmptyViewProps> = ({
  message = "No data found",
  action,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
      gap: 12,
      color: "var(--color-text-secondary)",
    }}
  >
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.4"
      />
      <path
        d="M16 24h16M24 16v16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
    <p style={{ margin: 0, fontSize: 14 }}>{message}</p>
    {action}
  </div>
);

// ── Main wrapper ──────────────────────────────────────────────────────────────

export interface ApiStateWrapperProps {
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError | AppError | null | undefined;
  isEmpty?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  compactError?: boolean;
}

export const ApiStateWrapper: React.FC<ApiStateWrapperProps> = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  children,
  emptyMessage,
  emptyAction,
  compactError = false,
}) => {
  if (error) {
    const appError = normalizeError(error);
    return (
      <ErrorView error={appError} onRetry={onRetry} compact={compactError} />
    );
  }

  // if (isEmpty) {
  //     return <EmptyView message={emptyMessage} action={emptyAction} />;
  // }

  if (!isLoading && isEmpty) {
    // don't show empty state while still loading
    return <EmptyView message={emptyMessage} action={emptyAction} />;
  }

  return <>{children}</>;
};

export { ErrorView, EmptyView };
