import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { AdhocRequestData } from '../types/admin.types';

export const AdhocRequestCard: React.FC<{ data: AdhocRequestData }> = ({ data }) => {
  const filled = data.AdhocRequests_Total;
  const remaining = Math.max(0, 10 - filled);
  const pct = Math.round((filled / (filled + remaining || 1)) * 100);

  return (
    <div className="card">
      <div className="card-title">Adhoc Request</div>
      <div className="adhoc-body">
        <div className="gauge-wrap">
          <ResponsiveContainer width={90} height={90}>
            <PieChart>
              <Pie data={[{ v: filled }, { v: remaining }]} cx="50%" cy="50%"
                startAngle={90} endAngle={-270} innerRadius={28} outerRadius={40}
                dataKey="v" strokeWidth={0}>
                <Cell fill="#0ab3a0" />
                <Cell fill="#e8f5f3" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="gauge-label">{pct}%<br /><small>Total</small></span>
        </div>
        <div className="adhoc-stats">
          <div><label>Sorts</label><span>{data.AdhocRequests_Pickup.toLocaleString()}</span></div>
          <div><label>Coupled</label><span>{data.AdhocRequests_Drop}</span></div>
        </div>
      </div>
    </div>
  );
};