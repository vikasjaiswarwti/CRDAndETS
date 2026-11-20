import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { VehicleUtilizationItem } from '../types/admin.types';

export const VehicleUtilizationCard: React.FC<{ data: VehicleUtilizationItem[] }> = ({ data }) => {
  const overallPct = data.find(d => d.ReportType === 'VUI %')?.Total ?? 0;
  return (
    <div className="card">
      <div className="card-header-row">
        <div className="card-title">Vehicle Utilization</div>
        <span className="badge-pct">{overallPct}%</span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data.map(d => ({ name: d.ReportType, value: d.Total }))}>
          <defs>
            <linearGradient id="vuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ab3a0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ab3a0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip formatter={(v) => v != null ? `${v}%` : ''} />
          <Area type="monotone" dataKey="value" stroke="#0ab3a0" strokeWidth={2}
            fill="url(#vuGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};