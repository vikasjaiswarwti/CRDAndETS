import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;       // keep for backward compat
  variant?: 'fullscreen' | 'content' | 'inline';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  variant,
}) => {
  // Resolve variant — explicit variant wins, then legacy fullScreen prop
  const resolved = variant ?? (fullScreen ? 'fullscreen' : 'inline');

  const sizeMap = {
    sm: { spinner: 'h-4 w-4', text: 'text-xs' },
    md: { spinner: 'h-8 w-8', text: 'text-sm' },
    lg: { spinner: 'h-10 w-10', text: 'text-sm' },
  };

  const spinnerEl = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full ${sizeMap[size].spinner}`}
        style={{
          border: '3px solid #e5e7eb',           // gray track (all sides)
          borderTopColor: '#16a34a',              // green-600 on top only — always wins
        }}
        role="status"
        aria-label="loading"
      />
      <span className={`text-green-700 font-medium ${sizeMap[size].text}`}>
        Loading…
      </span>
    </div>
  );

  // fullscreen — used in RouteGenerator (outside MainLayout)
  // fills entire viewport, centered
  if (resolved === 'fullscreen') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-9999"
        style={{ background: 'var(--color-bg-sidebar)' }}  // ← not bg-white
      >
        {spinnerEl}
      </div>
    );
  }

  // content — used inside ProtectedRoute / page content areas
  // fills the available height of its parent (MainLayout content area)
  if (resolved === 'content') {
    return (
      <div className="flex items-center justify-center w-full"
        style={{ minHeight: 'calc(100vh - 64px)' }}>
        {spinnerEl}
      </div>
    );
  }

  // inline — used inside Suspense fallbacks within components
  return (
    <div className="flex items-center justify-center w-full py-12">
      {spinnerEl}
    </div>
  );
};