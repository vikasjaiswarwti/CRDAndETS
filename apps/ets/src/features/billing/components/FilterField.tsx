import React from "react";

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

const FilterField: React.FC<FilterFieldProps> = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

export default FilterField;
