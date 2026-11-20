import { DownOutlined } from "@ant-design/icons";
import React, { useState } from "react";

const TABS = ["Employee", "Trip", "Vehicle"];

const MOCK_EMPLOYEE = {
  name: "Wsaim Khaja Ssaich",
  role: "Admin",
  id: "MHGAL22101",
  phone: "989922212",
  pickup: ".NE, Lily Luifying, 4 mig., Mumbai-400537",
  dele: "20/50/2525",
};

const EmployeeTripSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Employee");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);       // ← collapse state

  return (
    <div className="search-card">

      {/* Header — always visible, click to toggle */}
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="section-title">Employee / Trip Search</h3>
        <DownOutlined
          style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>

      {/* Collapsible body */}
      {isOpen && (
        <>
          <div className="tab-group">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by name or ID search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="employee-result">
            <div className="result-header">
              <span className="result-label">👤 Employee</span>
            </div>
            <div className="result-name-row">
              <span className="result-name">{MOCK_EMPLOYEE.name}</span>
              <span className="badge-admin">{MOCK_EMPLOYEE.role}</span>
            </div>
            <div className="info-row"><span>Employee ID</span><span>{MOCK_EMPLOYEE.id}</span></div>
            <div className="info-row"><span>Phone</span><span>{MOCK_EMPLOYEE.phone}</span></div>
            <div className="info-row"><span>Pickup/Drop</span><span>{MOCK_EMPLOYEE.pickup}</span></div>
            <div className="info-row"><span>Dele</span><span>{MOCK_EMPLOYEE.dele}</span></div>
            <div className="result-actions">
              <a className="action-link">View Cab off</a>
              <a className="action-link">Assign New Infilcts</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeTripSearch;