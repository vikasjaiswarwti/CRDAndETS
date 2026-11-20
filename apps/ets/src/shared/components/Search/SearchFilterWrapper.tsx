import React from "react";
import { searchFilterWrapperStyle } from "./searchCSS";
const SearchFilterWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={searchFilterWrapperStyle}>{children}</div>;
};

export default React.memo(SearchFilterWrapper);
