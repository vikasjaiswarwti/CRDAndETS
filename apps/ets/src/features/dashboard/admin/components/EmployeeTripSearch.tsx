import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
  CarOutlined,
  SwapOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import { useEntitySearch, type SearchTab } from "../hooks/useEntitySearch";
import type { EmployeeDetails, VehicleDetails } from "../types/admin.types";
import EntityDetailModal from "./EntityDetailModal";
import { useIsMobile } from "../../../../shared/customHooks/useIsMobile";
// import { useNavigate } from "react-router-dom";

const TABS: SearchTab[] = ["Employee", "Trip", "Vehicle"];

const TAB_ICONS: Record<SearchTab, React.ReactNode> = {
  Employee: <UserOutlined />,
  Trip: <SwapOutlined />,
  Vehicle: <CarOutlined />,
};

interface EmployeeTripSearchProps {
  onClose?: () => void;
}

const EmployeeTripSearch: React.FC<EmployeeTripSearchProps> = ({ onClose }) => {
  // const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>("Employee");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeDetails | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetails | null>(
    null,
  );
  // inside component
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEntity, setModalEntity] = useState<{
    type: "Employee" | "Vehicle";
    id: string | number;
  } | null>(null);
  const openDetails = (type: "Employee" | "Vehicle", id: string | number) => {
    setModalEntity({ type, id });
    setModalOpen(true);
    onClose?.(); // ← add this
  };

  const wrapRef = useRef<HTMLDivElement>(null);

  const { search, employees, trip, vehicles, isFetching, isError } =
    useEntitySearch(activeTab);

  const isSelectionRef = useRef(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!query.trim()) {
      setShowSuggestions(false);
      return;
    }

    // If query was set by a selection, skip searching
    if (isSelectionRef.current) {
      isSelectionRef.current = false;
      return;
    }

    const t = setTimeout(() => {
      search(query);
      setShowSuggestions(true);
    }, 400);
    return () => clearTimeout(t);
  }, [query, activeTab, search]);

  // close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resetForTab = (tab: SearchTab) => {
    setActiveTab(tab);
    setQuery("");
    setShowSuggestions(false);
    setSelectedEmployee(null);
    setSelectedVehicle(null);
  };

  const handleSelectEmployee = (emp: EmployeeDetails) => {
    isSelectionRef.current = true; // ← flag it first
    setSelectedEmployee(emp);
    setQuery(emp.empName);
    setShowSuggestions(false);
  };

  const handleSelectVehicle = (v: VehicleDetails) => {
    isSelectionRef.current = true; // ← flag it first
    setSelectedVehicle(v);
    setQuery(v.registrationNo);
    setShowSuggestions(false);
  };

  const placeholder =
    activeTab === "Employee"
      ? "Search by name..."
      : activeTab === "Trip"
        ? "Search by Trip ID..."
        : "Search by registration no...";

  // ---------- suggestions dropdown ----------

  const renderSuggestions = () => {
    if (!showSuggestions || activeTab === "Trip") return null;

    let content: React.ReactNode;

    if (isFetching) {
      content = (
        <div className="suggestion-status">
          <LoadingOutlined /> Searching...
        </div>
      );
    } else if (isError) {
      content = <div className="suggestion-status error">No Found</div>;
    } else if (activeTab === "Employee") {
      content = employees.length ? (
        // suggestion item
        employees.map((emp) => (
          <div
            className="suggestion-item"
            key={emp.empID}
            onClick={() => handleSelectEmployee(emp)}
          >
            <span className="suggestion-name">{emp.empName}</span>
            <span className="suggestion-sub">
              {emp.mobileno ? ` · ${emp.mobileno}` : ""}
            </span>
          </div>
        ))
      ) : (
        <div className="suggestion-status">No employees found</div>
      );
    } else {
      content = vehicles.length ? (
        vehicles.map((v) => (
          <div
            className="suggestion-item"
            key={v.registrationNo}
            onClick={() => handleSelectVehicle(v)}
          >
            <span className="suggestion-name">{v.registrationNo}</span>
          </div>
        ))
      ) : (
        <div className="suggestion-status">No vehicles found</div>
      );
    }

    return <div className="suggestion-dropdown">{content}</div>;
  };

  // ---------- detail cards ----------
  const renderEmployeeDetail = (emp: EmployeeDetails) => (
    <div className="employee-result">
      <div className="result-header">
        <span className="result-label">
          <UserOutlined /> Employee
        </span>
      </div>
      <div className="result-name-row">
        <span className="result-name">{emp.empName}</span>
      </div>
      <div className="info-row">
        <span>Emp ID</span>
        <span>{emp.empID}</span>
      </div>
      <div className="info-row">
        <span>Phone</span>
        <span>{emp.mobileno || "-"}</span>
      </div>
      <div className="info-row">
        <span>Email</span>
        <span>{emp.emailId || "-"}</span>
      </div>
      <div className="info-row flex gap-2">
        <span>Address {}</span>
        <span>{emp.address || "-"}</span>
      </div>
      {emp.userId && (
        <button
          className="view-details-btn"
          onClick={() => openDetails("Employee", emp?.userId)}
        >
          <EyeOutlined /> View Details
        </button>
      )}
    </div>
  );

  const VEHICLE_STATUS: Record<number, string> = {
    1: "Active",
    0: "Inactive",
  };

  const renderVehicleDetail = (v: VehicleDetails) => (
    <div className="employee-result">
      <div className="result-header">
        <span className="result-label">
          {" "}
          <CarOutlined /> Vehicle
        </span>
      </div>
      <div className="info-row">
        <span>Reg No</span>
        <span>{v.registrationNo}</span>
      </div>
      <div className="info-row">
        <span>Vendor</span>
        <span>{v.vendorName || "-"}</span>
      </div>
      <div className="info-row">
        <span>Driver</span>
        <span>{v.driverName || "-"}</span>
      </div>
      <div className="info-row">
        <span>Status</span>
        <span>{VEHICLE_STATUS[v.currentStatus] ?? v.currentStatus}</span>
      </div>
      <button
        className="view-details-btn"
        onClick={() => openDetails("Vehicle", v.vehicle_Id)}
      >
        <EyeOutlined /> View Details
      </button>
    </div>
  );

  const renderTripResult = () => {
    if (!query.trim()) return null;
    if (isFetching)
      return (
        <div className="search-status">
          <LoadingOutlined /> Searching...
        </div>
      );
    if (isError)
      return (
        <div className="search-status error">
          Something went wrong. Try again.
        </div>
      );
    if (!trip) return <div className="search-status">No trip found</div>;
    // tripStatusCode: number;
    // locationName: string;
    // tripTypeCode: number;
    // tripTypeDesc: string;
    // schStartTime: string;
    // schEndTime: string;
    // pickShift: string;
    // dropShift: string;
    // source: string;
    // destination: string;
    return (
      <div className="employee-result">
        <div className="result-header">
          <span className="result-label">🚐 Trip</span>
        </div>
        <div className="info-row">
          <span>Trip ID</span>
          <span>{trip.tripID}</span>
        </div>
        <div className="info-row">
          <span>Trip Type</span>
          <span>{trip.tripTypeDesc ?? "-"}</span>
        </div>
        <div className="info-row">
          <span>Total Pax</span>
          <span>{trip.totalPax ?? "-"}</span>
        </div>
        {/* "tripID": 5408 */}
        <button
          className="view-details-btn"
          onClick={() => {
              window.open(
                `/routing/route-tracking?dsId=${trip.tripID}`,
                "_blank",
              );
              onClose?.();
            }
            // navigate(`/routing/route-tracking?dsId=${trip.tripID}`)
          }
        >
          <EyeOutlined /> View Details
        </button>
      </div>
    );
  };

  const renderDetail = () => {
    if (activeTab === "Employee" && selectedEmployee)
      return renderEmployeeDetail(selectedEmployee);
    if (activeTab === "Vehicle" && selectedVehicle)
      return renderVehicleDetail(selectedVehicle);
    if (activeTab === "Trip") return renderTripResult();
    return null;
  };

  return (
    <div className="search-card">
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        {!isMobile && (
          <>
            <h3 className="section-title">Employee / Trip Search</h3>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: "transform 0.25s ease",
                transform: !isOpen ? "rotate(-90deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            {/* <DownOutlined
              style={{
                transition: "transform 0.2s",
                transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            /> */}
          </>
        )}
      </div>

      {isOpen && (
        <>
          <div className="tab-group">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => resetForTab(tab)}
              >
                {TAB_ICONS[tab]} {tab}
              </button>
            ))}
          </div>

          {/* input + suggestions anchored together */}
          <div
            className="search-input-wrap"
            ref={wrapRef}
            style={{ position: "relative" }}
          >
            <span className="search-icon">
              <SearchOutlined />
            </span>
            <input
              className="search-input"
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // typing again invalidates current selection
                // setSelectedEmployee(null);
                // setSelectedVehicle(null);
              }}
              onFocus={() => {
                if (query.trim() && !selectedEmployee && !selectedVehicle)
                  setShowSuggestions(true);
              }}
            />
            {renderSuggestions()}
          </div>
          {renderDetail()}
        </>
      )}
      <EntityDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entityType={modalEntity?.type ?? null}
        entityId={modalEntity?.id ?? null}
      />
    </div>
  );
};

export default EmployeeTripSearch;
