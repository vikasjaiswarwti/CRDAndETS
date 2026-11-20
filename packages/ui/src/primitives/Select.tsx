// components/ui/Select.tsx
import React, { useEffect, useRef, useCallback } from "react";
import { useUILibrary } from "../ui-lib/ui-library-context";
import type { SelectProps } from "../ui-lib/types";

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options = [],
  autoSelectFirst = true,
  isEditMode = false,
  placeholder = "Please select",
  ...restProps
}) => {
  const library = useUILibrary();
  const AntSelect = library.Select;

  const hasAutoSelected = useRef(false);
  const prevOptionsLength = useRef(0);

  const handleChange = useCallback(
    (newValue: any, option: any | any[]) => {
      hasAutoSelected.current = true;
      onChange?.(newValue, option);
    },
    [onChange],
  );

  // Auto-select first option - Improved for Redux + Async options
  useEffect(() => {
    if (!autoSelectFirst) return;
    if (isEditMode) return;
    if (value != null && value !== "") return; // Has valid value
    if (!options?.length) return;
    if (hasAutoSelected.current) return;

    const firstValue = options[0]?.value;

    if (firstValue !== undefined && firstValue !== null) {
      const timer = setTimeout(() => {
        onChange?.(firstValue, options[0]);
        hasAutoSelected.current = true;
      }, 50); // Slightly higher delay for async lookups

      return () => clearTimeout(timer);
    }
  }, [options, value, isEditMode, autoSelectFirst, onChange]);

  // Reset auto-select flag when options change significantly (async data load)
  useEffect(() => {
    if (options.length !== prevOptionsLength.current) {
      // Reset only if current value is empty
      if (value == null || value === "") {
        hasAutoSelected.current = false;
      }
      prevOptionsLength.current = options.length;
    }
  }, [options.length, value]);

  return (
    <AntSelect
      value={value}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      {...restProps}
    />
  );
};

Select.displayName = "AutoSelectSelect";
