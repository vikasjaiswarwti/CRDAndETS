import React from 'react';

export const Skeleton: React.FC<{ h?: number; w?: string; radius?: number }> = ({
  h = 16, w = '100%', radius = 6
}) => (
  <div className="skeleton" style={{ height: h, width: w, borderRadius: radius }} />
);

export const CardSkeleton: React.FC = () => (
  <div className="card">
    <Skeleton h={14} w="60%" />
    <div style={{ marginTop: 12 }}>
      <Skeleton h={80} />
    </div>
  </div>
);