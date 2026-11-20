// shared/components/ErrorBoundary/ErrorFallback.ts
// Single source of truth for the props shape passed to all fallback components.
// Import from here in AppErrorFallback, FeatureErrorFallback, etc.

export interface ErrorFallbackProps {
    error: Error | null;
    resetError: () => void;
}