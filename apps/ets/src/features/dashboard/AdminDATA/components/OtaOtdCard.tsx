import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { OTAOTDData } from '../types/admin.types';

export const OtaOtdCard: React.FC<{ data: OTAOTDData }> = ({ data }) => {
  const chartData = [
    { name: 'OTA', value: Math.min(data.Perc_OTA, 100) },
    { name: 'OTD', value: Math.min(data.Perc_OTD, 100) },
  ];
  return (
    <div className="card">
      <div className="card-title">OTA &amp; OTD</div>
      <div className="ota-labels">
        <span className="dot teal" />OTA &nbsp;
        <span className="dot blue" />OTD
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart data={chartData} barSize={28}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip formatter={(v: any) => (v == null ? '' : `${v}%`)} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            <Cell fill="#0ab3a0" />
            <Cell fill="#4a6cf7" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="ota-vals">
        <span>{data.Perc_OTA}%</span>
        <span>{data.Perc_OTD}%</span>
      </div>
    </div>
  );
};