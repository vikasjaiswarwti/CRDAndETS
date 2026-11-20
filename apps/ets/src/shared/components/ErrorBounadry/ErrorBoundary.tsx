// shared/components/ErrorBoundary/ErrorBoundary.tsx

import React from "react";
import type { ErrorFallbackProps } from "./ErrorFallback";

export type { ErrorFallbackProps };

interface Logger {
    error: (message: string, data?: Record<string, unknown>) => void;
    [key: string]: unknown;
}

interface Props {
    children: React.ReactNode;
    fallbackTitle?: string;
    fallback?:
    | React.ComponentType<ErrorFallbackProps>
    | ((props: ErrorFallbackProps) => React.ReactNode);
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    logger?: Logger;
    context?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        const { onError, logger, context } = this.props;
        if (onError) {
            onError(error, info);
        } else if (logger) {
            logger.error(`[${context ?? "ErrorBoundary"}] Uncaught error`, {
                error: { name: error.name, message: error.message, stack: error.stack ?? "" },
                componentStack: info.componentStack ?? "",
            });
        } else {
            console.error(`[${context ?? "ErrorBoundary"}]`, error, info.componentStack);
        }
    }

    handleReset = () => this.setState({ hasError: false, error: null });

    render() {
        if (!this.state.hasError) return this.props.children;

        const fallbackProps: ErrorFallbackProps = {
            error: this.state.error,
            resetError: this.handleReset,
        };

        if (this.props.fallback) {
            const F = this.props.fallback;
            // Function components and render functions both lack prototype.isReactComponent
            const isClassComp =
                typeof F === "function" &&
                Boolean((F.prototype as { isReactComponent?: boolean } | null)?.isReactComponent);

            if (isClassComp) {
                const C = F as React.ComponentType<ErrorFallbackProps>;
                return <C {...fallbackProps} />;
            }
            const fn = F as (p: ErrorFallbackProps) => React.ReactNode;
            return <>{fn(fallbackProps)}</>;
        }

        // ── Built-in fallback ─────────────────────────────────────────────────
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", minHeight: 320, padding: "40px 24px",
                background: "#F9FAFB", borderRadius: 16,
                border: "1px solid #E5E7EB", margin: 24,
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "#FEF2F2", border: "1px solid #FECACA",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16,
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.8" />
                        <path d="M12 7v5" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1" fill="#EF4444" />
                    </svg>
                </div>

                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 8px", textAlign: "center" }}>
                    {this.props.fallbackTitle ?? "Something went wrong"}
                </h2>

                <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 20px", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
                    This section encountered an unexpected error. The rest of the app is
                    still working. Try refreshing this section or contact support if the issue persists.
                </p>

                {this.state.error && (
                    <details style={{ marginBottom: 20, width: "100%", maxWidth: 480 }}>
                        <summary style={{ fontSize: 12, color: "#9CA3AF", cursor: "pointer", marginBottom: 6, userSelect: "none" }}>
                            Error details
                        </summary>
                        <pre style={{
                            fontSize: 11, color: "#B91C1C", background: "#FFF5F5",
                            border: "1px solid #FECACA", borderRadius: 8,
                            padding: "10px 12px", overflow: "auto",
                            whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
                        }}>
                            {this.state.error.message}
                        </pre>
                    </details>
                )}

                <button
                    onClick={this.handleReset}
                    style={{
                        padding: "9px 28px", borderRadius: 50, border: "none",
                        background: "#1B4332", color: "#fff", fontSize: 13,
                        fontWeight: 600, cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </div>
        );
    }
}

export default ErrorBoundary;