import React from "react";
import { SearchOutlined } from "@ant-design/icons";

export const commonFieldStyle: React.CSSProperties = {
  borderRadius: 8,
  fontSize: 13,
};
export const commonBackgroundStyle: React.CSSProperties = {
  backgroundColor: "#f8f9fa",
  border: "1.2px solid #777",
};

export const searchInputStyle: React.CSSProperties = {
  ...commonFieldStyle,
  ...commonBackgroundStyle,
  padding: "6px 8px",
};

export const searchIcon = <SearchOutlined style={{ color: "#9ca3af" }} />;

export const selectStyle: React.CSSProperties = {
  ...commonFieldStyle,
  ...commonBackgroundStyle,
  width: "100%",
};
export const searchFilterWrapperStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap:"wrap",
  alignItems: "center",
  marginBottom: 20,
  marginInline: 24,
};
