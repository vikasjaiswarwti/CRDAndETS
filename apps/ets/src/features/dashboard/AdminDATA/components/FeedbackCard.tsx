import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { FeedbackData } from '../types/admin.types';

const FEEDBACK_DATA = [
  { name: 'Excellent', pct: 52, color: '#0ab3a0' },
  { name: 'Good', pct: 15, color: '#4a6cf7' },
  { name: 'Average', pct: 25, color: '#f59e0b' },
  { name: 'Poor', pct: 7, color: '#ef4444' },
  { name: 'Very Poor', pct: 1, color: '#8b5cf6' },
];

export const FeedbackCard: React.FC<{ data: FeedbackData }> = ({ data }) => {
  const rating = data.TotalFeedbacks > 0 ? 4.2 : 0;
  return (
    <div className="card">
      <div className="card-title">Feedback</div>
      <div className="feedback-body">
        <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie data={FEEDBACK_DATA.map(d => ({ value: d.pct }))} cx="50%" cy="50%"
                innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
                {FEEDBACK_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="feedback-center">
            <strong>{rating > 0 ? rating.toFixed(1) : 'N/A'}</strong>
            <small>Avg</small>
          </span>
        </div>
        <ul className="feedback-legend">
          {FEEDBACK_DATA.map(d => (
            <li key={d.name}>
              <span className="dot" style={{ background: d.color }} />
              {d.name} <strong>{d.pct}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};