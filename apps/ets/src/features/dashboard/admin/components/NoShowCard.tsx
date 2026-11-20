import React from 'react';

const NO_SHOW_DATA = [
  { date: 'Mar 03', val: 0 },
  { date: 'Mar 07', val: 9 },
  { date: 'Mar 14', val: 10 },
  { date: 'Mar 27', val: 5 },
  { date: 'Mar 16', val: 12 },
  { date: 'Mar 17', val: 8 },
  { date: 'Mar 18', val: 11 },
  { date: 'Apr 02', val: 16 },
  { date: 'Apr 03', val: 14 },
];

const max = Math.max(...NO_SHOW_DATA.map(d => d.val), 1);

export const NoShowCard: React.FC = () => (
  <div className="card">
    <div className="card-header-row">
      <div className="card-title">No Show</div>
      <span className="badge-low">Low</span>
    </div>
    <div className="noshow-list">
      {NO_SHOW_DATA.map(d => (
        <div key={d.date} className="noshow-row">
          <span className="noshow-date">{d.date}</span>
          <div className="noshow-bar-wrap">
            <div className="noshow-bar" style={{ width: `${(d.val / max) * 100}%` }} />
          </div>
          <span className="noshow-val">{d.val}</span>
        </div>
      ))}
    </div>
  </div>
);