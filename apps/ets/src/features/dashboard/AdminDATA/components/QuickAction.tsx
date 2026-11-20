import React, { useState } from 'react';

const QUICK_ACTIONS = [
  {
    label: "Employee Approval Request",
    icon: "👤",
    bg: "#E1F5EE",
    color: "#0F6E56",
    badge: 17,
  },
  {
    label: "Driver Approval Request",
    icon: "🚗",
    bg: "#E6F1FB",
    color: "#185FA5",
    badge: null,
  },
  {
    label: "Vehicle Approval Request",
    icon: "🚛",
    bg: "#EEEDFE",
    color: "#534AB7",
    badge: null,
  },
  {
    label: "Address Change Request",
    icon: "📍",
    bg: "#FAEEDA",
    color: "#854F0B",
    badge: null,
  },
];

const QuickActionsSection: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="search-card">
      <div
        className="qa-header"
        onClick={() => setCollapsed((prev) => !prev)}
        role="button"
        aria-expanded={!collapsed}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCollapsed((prev) => !prev);
          }
        }}
      >
        <h3 className="section-title">Quick Actions</h3>
        <span className={`qa-chevron ${collapsed ? 'collapsed' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      <div className={`qa-collapse ${collapsed ? 'collapsed' : ''}`}>
        <div className="qa-collapse-inner">
          <div className="qa-grid">
            {QUICK_ACTIONS.map((item) => (
              <div key={item.label} className="qa-card">
                <div className="qa-icon-row">
                  <div
                    className="qa-icon"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="qa-badge" style={{ background: item.color }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="qa-label">{item.label}</p>
                <button className="view-btn">View Requests →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;

/* ---------- Add to your CSS ----------



------------------------------------- */